export type PurineStatus = "low" | "mid" | "high" | "unknown";

type PurineGuide = {
  label: string;
  summary: string;
  dietAdvice: string;
  suitability: string;
};

export const PURINE_GUIDE: Record<PurineStatus, PurineGuide> = {
  low: {
    label: "能吃",
    summary: "嘌呤含量较低，整体风险不大。",
    dietAdvice: "控制总热量即可，可与高纤维蔬菜和水果搭配。",
    suitability: "高尿酸或痛风人群一般可适量摄入。"
  },
  mid: {
    label: "少吃",
    summary: "嘌呤含量中等，需注意摄入总量。",
    dietAdvice: "建议控制份量、少油烹调，并多喝水帮助代谢。",
    suitability: "高尿酸人群建议偶尔少量品尝，并监测身体反应。"
  },
  high: {
    label: "别吃",
    summary: "嘌呤含量偏高，易诱发高尿酸问题。",
    dietAdvice: "建议选择低嘌呤替代品，避免与含酒精饮料同食。",
    suitability: "痛风或高尿酸患者应尽量避免食用。"
  },
  unknown: {
    label: "待确认",
    summary: "数据库暂无该食物信息。",
    dietAdvice: "建议手动查询或咨询医生后再决定是否食用。",
    suitability: "高尿酸人群暂不建议大量尝试。"
  }
};

export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB

// 嘌呤级别标准 (mg/100g)
export const PURINE_THRESHOLDS = {
  LOW: 50,      // 低嘌呤: ≤ 50 mg/100g
  HIGH: 150     // 高嘌呤: > 150 mg/100g (中嘌呤: 50-150 mg/100g)
} as const;

// 根据嘌呤含量计算嘌呤级别
export function getPurineLevel(purineMg: number | null | undefined): PurineStatus {
  if (purineMg === null || purineMg === undefined || purineMg < 0) {
    return "unknown";
  }

  if (purineMg <= PURINE_THRESHOLDS.LOW) {
    return "low";
  } else if (purineMg <= PURINE_THRESHOLDS.HIGH) {
    return "mid";
  } else {
    return "high";
  }
}

// 获取嘌呤级别描述
export function getPurineLevelDescription(level: PurineStatus): string {
  switch (level) {
    case "low":
      return "低嘌呤 (≤ 50 mg/100g)";
    case "mid":
      return "中嘌呤 (50-150 mg/100g)";
    case "high":
      return "高嘌呤 (> 150 mg/100g)";
    case "unknown":
      return "待确认";
  }
}
