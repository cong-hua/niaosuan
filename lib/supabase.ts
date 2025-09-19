import { createClient, PostgrestError } from "@supabase/supabase-js";
import type { PurineStatus } from "@/lib/purine";
import { getPurineLevel } from "@/lib/purine";
import { expandFoodKeywords, normalizeFoodName } from "@/lib/synonyms";

export type FoodRisk = {
  id?: string;
  name: string;
  category?: string | null;
  purine_level: PurineStatus;
  purine_mg?: number | null;
  description?: string | null;
};

export type User = {
  id: string;
  email: string;
  username?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
};

export type UricAcidRecord = {
  id: string;
  user_id: string;
  value: number;
  measurement_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type CreateUserRequest = {
  email: string;
  password: string;
  username?: string;
  phone?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type CreateUricAcidRecordRequest = {
  value: number;
  measurement_date?: string;
  notes?: string;
};

export type UpdateUricAcidRecordRequest = {
  value: number;
  measurement_date?: string;
  notes?: string;
};

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function assertEnv() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error("Supabase 环境变量缺失，请配置 SUPABASE_URL 与 SUPABASE_SERVICE_ROLE_KEY。");
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
  // 使用实际嘌呤含量计算级别，而不是依赖数据库中存储的级别
  const calculatedLevel = getPurineLevel(row.purine_mg);

  return {
    name: row.name_cn,
    category: row.category ?? null,
    purine_level: calculatedLevel,
    purine_mg: row.purine_mg ?? null,
    description: row.description ?? null
  };
}

export async function createUser(userData: CreateUserRequest): Promise<User> {
  assertEnv();

  const client = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!, {
    auth: {
      persistSession: false
    }
  });

  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.hash(userData.password, 10);

  const { data, error } = await client
    .from('users')
    .insert({
      email: userData.email,
      password_hash: passwordHash,
      username: userData.username,
      phone: userData.phone
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('邮箱已被注册');
    }
    throw new SupabaseQueryError('用户注册失败', error);
  }

  return {
    id: data.id,
    email: data.email,
    username: data.username,
    phone: data.phone,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
}

export async function loginUser(loginData: LoginRequest): Promise<User> {
  assertEnv();

  const client = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!, {
    auth: {
      persistSession: false
    }
  });

  const { data: user, error } = await client
    .from('users')
    .select('id, email, password_hash, username, phone')
    .eq('email', loginData.email)
    .single();

  if (error || !user) {
    throw new Error('邮箱或密码错误');
  }

  const bcrypt = await import('bcryptjs');
  const isPasswordValid = await bcrypt.compare(loginData.password, user.password_hash);

  if (!isPasswordValid) {
    throw new Error('邮箱或密码错误');
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    phone: user.phone,
    created_at: (user as any).created_at || new Date().toISOString(),
    updated_at: (user as any).updated_at || new Date().toISOString()
  };
}

export async function createUricAcidRecord(userId: string, recordData: CreateUricAcidRecordRequest): Promise<UricAcidRecord> {
  assertEnv();

  const client = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!, {
    auth: {
      persistSession: false
    }
  });

  const { data, error } = await client
    .from('uric_acid_records')
    .insert({
      user_id: userId,
      value: recordData.value,
      measurement_date: recordData.measurement_date || new Date().toISOString(),
      notes: recordData.notes
    })
    .select()
    .single();

  if (error) {
    throw new SupabaseQueryError('创建尿酸记录失败', error);
  }

  return {
    id: data.id,
    user_id: data.user_id,
    value: data.value,
    measurement_date: data.measurement_date,
    notes: data.notes,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
}

export async function getUricAcidRecords(userId: string, limit: number = 50): Promise<UricAcidRecord[]> {
  assertEnv();

  const client = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!, {
    auth: {
      persistSession: false
    }
  });

  const { data, error } = await client
    .from('uric_acid_records')
    .select('*')
    .eq('user_id', userId)
    .order('measurement_date', { ascending: false })
    .limit(limit);

  if (error) {
    throw new SupabaseQueryError('获取尿酸记录失败', error);
  }

  return data.map(record => ({
    id: record.id,
    user_id: record.user_id,
    value: record.value,
    measurement_date: record.measurement_date,
    notes: record.notes,
    created_at: record.created_at,
    updated_at: record.updated_at
  }));
}

export async function updateUricAcidRecord(recordId: string, recordData: UpdateUricAcidRecordRequest): Promise<UricAcidRecord> {
  assertEnv();

  const client = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!, {
    auth: {
      persistSession: false
    }
  });

  const { data, error } = await client
    .from('uric_acid_records')
    .update({
      value: recordData.value,
      measurement_date: recordData.measurement_date || new Date().toISOString(),
      notes: recordData.notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', recordId)
    .select()
    .single();

  if (error) {
    throw new SupabaseQueryError('更新尿酸记录失败', error);
  }

  return {
    id: data.id,
    user_id: data.user_id,
    value: data.value,
    measurement_date: data.measurement_date,
    notes: data.notes,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
}

export async function deleteUricAcidRecord(recordId: string): Promise<void> {
  assertEnv();

  const client = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!, {
    auth: {
      persistSession: false
    }
  });

  const { error } = await client
    .from('uric_acid_records')
    .delete()
    .eq('id', recordId);

  if (error) {
    throw new SupabaseQueryError('删除尿酸记录失败', error);
  }
}

// Food search related functions
export async function getAllFoods(limit: number = 1000, offset: number = 0): Promise<FoodRisk[]> {
  assertEnv();

  const client = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!, {
    auth: {
      persistSession: false
    }
  });

  const { data, error } = await client
    .from("food_library")
    .select("id, name_cn, category, purine_level, purine_mg, description")
    .order('category', { ascending: true })
    .order('name_cn', { ascending: true });

  if (error) {
    throw new SupabaseQueryError("获取食物数据失败", error);
  }

  return data.map(row => ({
    id: row.id,
    name: row.name_cn,
    category: row.category,
    purine_level: getPurineLevel(row.purine_mg),
    purine_mg: row.purine_mg,
    description: row.description
  }));
}

export async function searchFoods(query: string, limit: number = 50): Promise<FoodRisk[]> {
  assertEnv();

  const client = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!, {
    auth: {
      persistSession: false
    }
  });

  const searchPattern = `%${query.toLowerCase()}%`;

  const { data, error } = await client
    .from("food_library")
    .select("id, name_cn, category, purine_level, purine_mg, description")
    .ilike("name_cn", searchPattern)
    .order('name_cn', { ascending: true })
    .limit(limit);

  if (error) {
    throw new SupabaseQueryError("搜索食物失败", error);
  }

  return data.map(row => ({
    id: row.id,
    name: row.name_cn,
    category: row.category,
    purine_level: getPurineLevel(row.purine_mg),
    purine_mg: row.purine_mg,
    description: row.description
  }));
}

export async function getFoodsByCategory(category: string, limit: number = 200): Promise<FoodRisk[]> {
  assertEnv();

  const client = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!, {
    auth: {
      persistSession: false
    }
  });

  const { data, error } = await client
    .from("food_library")
    .select("id, name_cn, category, purine_level, purine_mg, description")
    .eq('category', category)
    .order('name_cn', { ascending: true })
    .limit(limit);

  if (error) {
    throw new SupabaseQueryError("获取分类食物失败", error);
  }

  return data.map(row => ({
    id: row.id,
    name: row.name_cn,
    category: row.category,
    purine_level: getPurineLevel(row.purine_mg),
    purine_mg: row.purine_mg,
    description: row.description
  }));
}

export async function getFoodCategories(): Promise<string[]> {
  assertEnv();

  const client = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!, {
    auth: {
      persistSession: false
    }
  });

  const { data, error } = await client
    .from("food_library")
    .select("category")
    .order('category', { ascending: true });

  if (error) {
    throw new SupabaseQueryError("获取食物分类失败", error);
  }

  // 去重并返回分类列表
  const categorySet = new Set(data.map(item => item.category));
  const categories = Array.from(categorySet);
  return categories;
}

function mapPurineLevel(level: string): PurineStatus {
  switch (level) {
    case "low":
      return "low";
    case "medium":
    case "mid":
      return "mid";
    case "high":
      return "high";
    case "very_high":
      return "high";
    default:
      return "unknown";
  }
}

// 扩展 FoodRisk 类型以包含 id
export type FoodRiskWithId = FoodRisk & {
  id: string;
};

class SupabaseQueryError extends Error {
  constructor(message: string, public original: PostgrestError) {
    super(message);
    this.name = "SupabaseQueryError";
  }
}
