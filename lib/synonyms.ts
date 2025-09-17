export const FOOD_SYNONYMS: Record<string, string[]> = {
  "鸡翅": ["鸡翅中", "烤鸡翅", "炸鸡翅", "鸡翅膀", "翅中"],
  "虾仁": ["鲜虾", "虾", "基围虾", "白灼虾", "虾仁炒蛋"],
  "牛肉": ["牛肉片", "牛肉串", "牛腱", "牛排"],
  "羊肉": ["羊肉卷", "羊肉串", "烤羊肉", "羊腿", "羊排"],
  "猪肉": ["五花肉", "猪五花片", "烤肉", "回锅肉"],
  "鸡腿": ["鸡腿排", "烤鸡腿", "炸鸡腿"],
  "鸡胸": ["鸡胸肉", "鸡胸", "鸡柳"],
  "米饭": ["白米饭", "米饭", "米饭配菜"],
  "红薯": ["烤红薯", "紫薯", "红薯泥"],
  "啤酒": ["啤酒", "黑啤酒", "白啤"],
  "豆腐": ["北豆腐", "南豆腐", "豆腐干", "炸豆腐"],
  "菠菜": ["菠菜叶", "凉拌菠菜"],
  "西兰花": ["西兰花", "蒸西兰花"],
  "蘑菇": ["香菇", "金针菇", "杏鲍菇", "蘑菇汤"],
  "鸡蛋": ["煎蛋", "炒鸡蛋", "鸡蛋羹"],
  "奶茶": ["奶茶", "奶香茶", "珍珠奶茶"],
  "可乐": ["可口可乐", "无糖可乐", "百事可乐"],
  "鱼": ["鳕鱼", "三文鱼", "带鱼", "清蒸鱼", "红烧鱼"],
  "牛肚": ["毛肚", "牛百叶"],
  "鸭血": ["鸭血"],
  "香肠": ["香肠", "烤香肠", "台湾香肠"],
  "培根": ["培根", "煎培根"],
  "火腿": ["火腿", "火腿片"],
  "午餐肉": ["午餐肉", "午餐肉罐头"],
  "豆浆": ["豆浆", "热豆浆"],
  "豆干": ["豆腐干", "香干"],
  "鸡爪": ["凤爪", "卤鸡爪"],
  "鸡皮": ["烤鸡皮", "鸡皮串"],
  "牛舌": ["牛舌", "烤牛舌"],
  "肝": ["猪肝", "鸡肝", "牛肝"],
  "肾": ["猪肾"],
  "肚": ["牛肚", "毛肚"],
  "虾": ["虾", "虾仁", "鲜虾", "虾干"]
};

export function expandFoodKeywords(keyword: string): string[] {
  const base = keyword.trim();
  if (!base) return [];

  const results = new Set<string>();
  results.add(base);

  // 添加常见同义词
  for (const [canonical, synonyms] of Object.entries(FOOD_SYNONYMS)) {
    if (canonical.includes(base) || base.includes(canonical) || synonyms.some((s) => s.includes(base) || base.includes(s))) {
      results.add(canonical);
      synonyms.forEach((s) => results.add(s));
    }
  }

  return Array.from(results);
}

export function buildSearchPatterns(keyword: string): string[] {
  const tokens = expandFoodKeywords(keyword);
  if (tokens.length === 0) {
    return [];
  }

  return tokens
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => ({
      exact: token,
      like: `%${token}%`
    }))
    .flatMap((pattern) => [pattern.exact, pattern.like]);
}

export function normalizeFoodName(name: string): string {
  return name.replace(/【|】|（|）|\(|\)|\s+/g, "");
}
