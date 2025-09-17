import { NextResponse } from "next/server";
import { getFoodRiskByName } from "@/lib/supabase";
import { PURINE_GUIDE } from "@/lib/purine";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name")?.trim();
  const label = searchParams.get("label")?.trim();

  if (!name) {
    return NextResponse.json({ message: "缺少必要的 name 参数" }, { status: 400 });
  }

  try {
    const data = await getFoodRiskByName(name);

    if (!data) {
      const guide = PURINE_GUIDE.unknown;
      return NextResponse.json({
      name: label ?? name,
      purine_level: "unknown",
      purine_mg: null,
      summary: `${label ?? name} 暂未收录，数据库火速更新中。`,
        diet_advice: guide.dietAdvice,
        suitability: guide.suitability,
        badge_label: guide.label
      });
    }

    const guide = PURINE_GUIDE[data.purine_level];
    const purineMg = data.purine_mg ?? null;
    const rounded = typeof purineMg === "number" ? Math.round(purineMg) : null;
    const summary = rounded
      ? `嘌呤含量约 ${rounded} mg/100g，属于“${guide.label}”级别。`
      : `属于“${guide.label}”级别。`;

    return NextResponse.json({
      name: data.name,
      display_name: label ?? data.name,
      category: data.category ?? null,
      purine_level: data.purine_level,
      purine_mg: purineMg,
      summary,
      diet_advice: data.description ?? guide.dietAdvice,
      suitability: guide.suitability,
      badge_label: guide.label
    });
  } catch (error) {
    console.error("purine query error", error);
    const message = error instanceof Error ? error.message : "查询失败，请稍后再试";
    return NextResponse.json({ message }, { status: 502 });
  }
}
