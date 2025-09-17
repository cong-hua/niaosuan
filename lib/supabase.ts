import { createClient, PostgrestError } from "@supabase/supabase-js";
import type { PurineStatus } from "@/lib/purine";
import { expandFoodKeywords, normalizeFoodName } from "@/lib/synonyms";

export type FoodRisk = {
  name: string;
  category?: string | null;
  purine_level: PurineStatus;
  purine_mg?: number | null;
  description?: string | null;
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

function assertEnv() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error("Supabase 环境变量缺失，请配置 SUPABASE_URL 与 SUPABASE_SERVICE_KEY。");
  }
}

export async function getFoodRiskByName(name: string): Promise<FoodRisk | null> {
  assertEnv();

  const client = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!, {
    auth: {
      persistSession: false
    }
  });

  const normalized = normalizeFoodName(name);
  if (!normalized) {
    return null;
  }

  const keywords = expandFoodKeywords(normalized);
  const candidates: FoodRisk[] = [];

  for (const keyword of keywords) {
    const { data, error } = await client
      .from("food_library")
      .select("name_cn, category, purine_level, purine_mg, description")
      .ilike("name_cn", keyword)
      .limit(1)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw new SupabaseQueryError("查询 Supabase 失败", error);
    }

    if (data) {
      candidates.push(mapRowToRisk(data));
      break;
    }
  }

  if (candidates.length > 0) {
    return candidates[0];
  }

  // 再尝试模糊匹配
  for (const keyword of keywords) {
    const likePattern = `%${keyword}%`;
    const { data, error } = await client
      .from("food_library")
      .select("name_cn, category, purine_level, purine_mg, description")
      .ilike("name_cn", likePattern)
      .limit(1)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw new SupabaseQueryError("查询 Supabase 失败", error);
    }

    if (data) {
      return mapRowToRisk(data);
    }
  }

  return null;
}

function mapRowToRisk(row: {
  name_cn: string;
  category?: string | null;
  purine_level: string;
  purine_mg?: number | null;
  description?: string | null;
}): FoodRisk {
  const fallback: PurineStatus = ["low", "mid", "high"].includes(row.purine_level) ? (row.purine_level as PurineStatus) : "unknown";

  return {
    name: row.name_cn,
    category: row.category ?? null,
    purine_level: fallback,
    purine_mg: row.purine_mg ?? null,
    description: row.description ?? null
  };
}

class SupabaseQueryError extends Error {
  constructor(message: string, public original: PostgrestError) {
    super(message);
    this.name = "SupabaseQueryError";
  }
}
