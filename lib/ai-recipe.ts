// Using Web Crypto API for Edge Runtime compatibility

const DEFAULT_ENDPOINT = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";
const TIMEOUT_MS = 90000; // 90秒超时，食谱生成需要更长时间
const MAX_RETRIES = 2; // 最大重试次数

import type { Recipe, DailyMenu, RecipeGenerationRequest, Ingredient, NutritionInfo } from "@/lib/recipe";

class AiRecipeError extends Error {
  constructor(message: string, public status?: number, public details?: unknown) {
    super(message);
    this.name = "AiRecipeError";
  }
}

export async function generateRecipe(request: RecipeGenerationRequest): Promise<Recipe> {
  const apiKey = process.env.ALIYUN_API_KEY;
  const endpoint = process.env.ALIYUN_TEXT_ENDPOINT ?? DEFAULT_ENDPOINT;

  if (!apiKey) {
    throw new AiRecipeError("缺少通义千问 API Key，请在环境变量中配置 ALIYUN_API_KEY。");
  }

  const { generateRecipePrompt } = await import("@/lib/recipe");
  const prompt = generateRecipePrompt(request);

  const payload = {
    model: "qwen-turbo",
    input: {
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    },
    parameters: {
      result_format: "message",
      temperature: 0.7,
      max_tokens: 2000
    }
  };

  // 重试机制
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      console.log(`食谱生成 API 调用尝试 ${attempt}/${MAX_RETRIES + 1}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await safeJson(response);
        throw new AiRecipeError(
          `食谱生成失败（${response.status}）`,
          response.status,
          errorBody
        );
      }

      const data = await response.json();
      const rawText = extractTextFromResponse(data);

      console.log(`食谱生成 API 返回的原始文本长度: ${rawText?.length || 0}`);

      if (!rawText) {
        console.log("食谱生成失败，模型输出为空");
        console.log("模型原始输出片段:", JSON.stringify(data?.output ?? {}, null, 2));
        throw new AiRecipeError("AI 模型未能生成食谱内容，请稍后再试。", response.status, data);
      }

      // 尝试解析 JSON
      const recipeData = parseRecipeJson(rawText);

      if (!recipeData) {
        console.log(`JSON 解析失败，原始文本: "${rawText.substring(0, 500)}..."`);
        throw new AiRecipeError("AI 生成的食谱格式不正确，请稍后再试。", response.status, data);
      }

      // 补充必要字段
      const recipe: Recipe = {
        id: generateId(),
        name: recipeData.name || "未知食谱",
        description: recipeData.description || "",
        category: request.category || 'lunch',
        ingredients: recipeData.ingredients || [],
        steps: recipeData.steps || [],
        nutrition: recipeData.nutrition || {
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0,
          fiber: 0,
          sodium: 0
        },
        purineScore: recipeData.purineScore || 'low',
        cookingTime: recipeData.cookingTime || 30,
        servings: recipeData.servings || 1,
        difficulty: recipeData.difficulty || 'easy',
        tags: recipeData.tags || [],
        suitableFor: recipeData.suitableFor || request.userLevel,
        createdAt: new Date().toISOString()
      };

      console.log(`食谱生成成功: ${recipe.name} (尝试 ${attempt})`);
      return recipe;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`食谱生成尝试 ${attempt} 失败:`, lastError.message);

      // 如果是网络错误或超时，且还有重试机会，则等待后重试
      if (attempt <= MAX_RETRIES &&
          (lastError.message.includes("fetch") ||
           lastError.message.includes("timeout") ||
           lastError.message.includes("网络") ||
           lastError.message.includes("AbortError"))) {

        const waitTime = attempt * 1000; // 递增等待时间
        console.log(`等待 ${waitTime}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        break; // 不再重试
      }
    }
  }

  // 所有重试都失败
  throw lastError || new AiRecipeError("食谱生成服务暂时不可用，请稍后再试");
}

export async function generateDailyMenu(request: RecipeGenerationRequest): Promise<DailyMenu> {
  const apiKey = process.env.ALIYUN_API_KEY;
  const endpoint = process.env.ALIYUN_TEXT_ENDPOINT ?? DEFAULT_ENDPOINT;

  if (!apiKey) {
    throw new AiRecipeError("缺少通义千问 API Key，请在环境变量中配置 ALIYUN_API_KEY。");
  }

  const { generateDailyMenuPrompt } = await import("@/lib/recipe");
  const prompt = generateDailyMenuPrompt(request);

  const payload = {
    model: "qwen-turbo",
    input: {
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    },
    parameters: {
      result_format: "message",
      temperature: 0.7,
      max_tokens: 4000
    }
  };

  // 重试机制
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      console.log(`每日菜单生成 API 调用尝试 ${attempt}/${MAX_RETRIES + 1}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await safeJson(response);
        throw new AiRecipeError(
          `每日菜单生成失败（${response.status}）`,
          response.status,
          errorBody
        );
      }

      const data = await response.json();
      const rawText = extractTextFromResponse(data);

      console.log(`每日菜单生成 API 返回的原始文本长度: ${rawText?.length || 0}`);

      if (!rawText) {
        console.log("每日菜单生成失败，模型输出为空");
        console.log("模型原始输出片段:", JSON.stringify(data?.output ?? {}, null, 2));
        throw new AiRecipeError("AI 模型未能生成菜单内容，请稍后再试。", response.status, data);
      }

      // 尝试解析 JSON
      const menuData = parseMenuJson(rawText);

      if (!menuData) {
        console.log(`JSON 解析失败，原始文本: "${rawText.substring(0, 500)}..."`);
        throw new AiRecipeError("AI 生成的菜单格式不正确，请稍后再试。", response.status, data);
      }

      // 补充必要字段并构建 DailyMenu
      const dailyMenu: DailyMenu = {
        date: new Date().toISOString().split('T')[0], // 今天的日期
        breakfast: menuData.breakfast ? createRecipeFromData(menuData.breakfast, 'breakfast', request.userLevel) : null,
        lunch: menuData.lunch ? createRecipeFromData(menuData.lunch, 'lunch', request.userLevel) : null,
        dinner: menuData.dinner ? createRecipeFromData(menuData.dinner, 'dinner', request.userLevel) : null,
        snack: menuData.snack ? createRecipeFromData(menuData.snack, 'snack', request.userLevel) : null,
        totalPurineScore: menuData.totalPurineScore || 'low',
        totalNutrition: menuData.totalNutrition || {
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0,
          fiber: 0,
          sodium: 0
        }
      };

      const diversityIssues = evaluateMenuDiversity(dailyMenu);
      if (diversityIssues.length > 0) {
        const issueMessage = `AI 生成的菜单存在重复菜品或食材: ${diversityIssues.join("; ")}`;
        console.warn(issueMessage);
        throw new AiRecipeError(issueMessage, response.status, menuData);
      }

      const completenessIssues = evaluateMenuCompleteness(dailyMenu);
      if (completenessIssues.length > 0) {
        const issueMessage = `AI 生成的菜单信息不完整: ${completenessIssues.join("; ")}`;
        console.warn(issueMessage);
        throw new AiRecipeError(issueMessage, response.status, menuData);
      }

      console.log(`每日菜单生成成功 (尝试 ${attempt})`);
      return dailyMenu;

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      lastError = err;
      console.error(`每日菜单生成尝试 ${attempt} 失败:`, err.message);

      const shouldRetry =
        attempt <= MAX_RETRIES &&
        (
          err.message.includes("fetch") ||
          err.message.includes("timeout") ||
          err.message.includes("网络") ||
          err.message.includes("AbortError") ||
          err.message.includes("重复菜品") ||
          err.message.includes("食材重复") ||
          err.message.includes("信息不完整") ||
          err.message.includes("缺少食材") ||
          err.message.includes("缺少步骤")
        );

      if (shouldRetry) {
        const waitTime = attempt * 1000; // 递增等待时间
        console.log(`等待 ${waitTime}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        break; // 不再重试
      }
    }
  }

  // 所有重试都失败
  throw lastError || new AiRecipeError("每日菜单生成服务暂时不可用，请稍后再试");
}

function evaluateMenuDiversity(menu: DailyMenu): string[] {
  const issues: string[] = [];
  const recipes = [
    menu.breakfast,
    menu.lunch,
    menu.dinner,
    menu.snack
  ].filter(Boolean) as Recipe[];

  const normalize = (value: string) =>
    value
      .replace(/\s+/g, "")
      .replace(/[（(].*?[)）]/g, "")
      .toLowerCase();

  const seenNames = new Map<string, string>();
  const seenIngredientCombos = new Map<string, string>();

  for (const recipe of recipes) {
    const normalizedName = recipe.name ? normalize(recipe.name) : "";
    if (normalizedName) {
      if (seenNames.has(normalizedName)) {
        const existing = seenNames.get(normalizedName) ?? "";
        issues.push(`菜品名称重复：${existing} 与 ${recipe.name}`);
      } else {
        seenNames.set(normalizedName, recipe.name);
      }
    }

    const ingredientNames = (recipe.ingredients || [])
      .map(item => item.name?.trim())
      .filter(Boolean)
      .map(name => name!.replace(/\s+/g, "").toLowerCase());

    if (ingredientNames.length > 0) {
      const primaryIngredients = ingredientNames.slice(0, 3).sort().join("|");
      if (primaryIngredients) {
        if (seenIngredientCombos.has(primaryIngredients)) {
          const existing = seenIngredientCombos.get(primaryIngredients) ?? "";
          issues.push(`主要食材组合重复：${existing} 与 ${recipe.name}`);
        } else {
          seenIngredientCombos.set(primaryIngredients, recipe.name);
        }
      }
    }
  }

  return issues;
}

function evaluateMenuCompleteness(menu: DailyMenu): string[] {
  const issues: string[] = [];
  const meals: Array<{ category: 'breakfast' | 'lunch' | 'dinner' | 'snack'; recipe: Recipe | null }> = [
    { category: 'breakfast', recipe: menu.breakfast },
    { category: 'lunch', recipe: menu.lunch },
    { category: 'dinner', recipe: menu.dinner },
    { category: 'snack', recipe: menu.snack }
  ];

  for (const { category, recipe } of meals) {
    if (!recipe) continue;
    issues.push(...validateRecipeCompleteness(recipe, category));
  }

  ensureTotalNutrition(menu, meals);

  const nutrition = menu.totalNutrition;
  if (nutrition) {
    const totalValues = [
      nutrition.calories,
      nutrition.protein,
      nutrition.fat,
      nutrition.carbs,
      nutrition.fiber,
      nutrition.sodium
    ];
    if (totalValues.every(value => !value || Number.isNaN(value))) {
      issues.push("全天营养汇总缺少有效数值");
    }
  }

  return issues;
}

function validateRecipeCompleteness(recipe: Recipe, category: 'breakfast' | 'lunch' | 'dinner' | 'snack'): string[] {
  const issues: string[] = [];
  const mealNameMap: Record<typeof category, string> = {
    breakfast: "早餐",
    lunch: "午餐",
    dinner: "晚餐",
    snack: "加餐"
  };

  const label = mealNameMap[category];

  if (!recipe.ingredients || recipe.ingredients.length < 3) {
    issues.push(`${label} 缺少完整的食材列表（至少 3 项）`);
  } else {
    const incompleteIngredient = recipe.ingredients.find(item => !item.name || !item.amount);
    if (incompleteIngredient) {
      issues.push(`${label} 的食材信息存在空白项目`);
    }
  }

  if (!recipe.steps || recipe.steps.length < 4) {
    issues.push(`${label} 缺少详细制作步骤（至少 4 步）`);
  }

  const nutrition = recipe.nutrition;
  if (!nutrition) {
    issues.push(`${label} 缺少营养信息`);
  } else {
    const values = [
      nutrition.calories,
      nutrition.protein,
      nutrition.fat,
      nutrition.carbs,
      nutrition.fiber,
      nutrition.sodium
    ];
    if (values.every(value => !value || Number.isNaN(value))) {
      issues.push(`${label} 的营养信息无有效数值`);
    }
  }

  return issues;
}

const NUTRITION_KEYS: Array<keyof NutritionInfo> = ['calories', 'protein', 'fat', 'carbs', 'fiber', 'sodium'];

function ensureNutritionDefaults(nutrition: NutritionInfo, category: 'breakfast' | 'lunch' | 'dinner' | 'snack'): NutritionInfo {
  const defaults: Record<typeof category, NutritionInfo> = {
    breakfast: { calories: 360, protein: 20, fat: 12, carbs: 45, fiber: 8, sodium: 320 },
    lunch: { calories: 580, protein: 32, fat: 18, carbs: 68, fiber: 10, sodium: 520 },
    dinner: { calories: 520, protein: 28, fat: 16, carbs: 60, fiber: 9, sodium: 460 },
    snack: { calories: 220, protein: 10, fat: 8, carbs: 26, fiber: 5, sodium: 180 }
  };

  const baseline = { ...nutrition };
  const fallback = defaults[category];

  for (const key of NUTRITION_KEYS) {
    const value = baseline[key];
    if (!value || Number.isNaN(value) || value <= 0) {
      baseline[key] = fallback[key];
    }
  }

  return baseline;
}

function ensureTotalNutrition(
  menu: DailyMenu,
  meals: Array<{ category: 'breakfast' | 'lunch' | 'dinner' | 'snack'; recipe: Recipe | null }>
): void {
  let total = menu.totalNutrition;

  const hasValidTotal = total && NUTRITION_KEYS.some(key => {
    const value = total[key];
    return Boolean(value && !Number.isNaN(value) && value > 0);
  });

  if (!hasValidTotal) {
    const summed: NutritionInfo = {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: 0,
      sodium: 0
    };

    let mealCount = 0;

    for (const { recipe } of meals) {
      if (!recipe) continue;
      mealCount += 1;
      for (const key of NUTRITION_KEYS) {
        const value = recipe.nutrition?.[key];
        if (value && !Number.isNaN(value)) {
          summed[key] += value;
        }
      }
    }

    const hasSummed = NUTRITION_KEYS.some(key => summed[key] > 0);

    if (!total) {
      total = { ...summed };
    }

    if (hasSummed) {
      for (const key of NUTRITION_KEYS) {
        total[key] = summed[key];
      }
    } else if (mealCount > 0) {
      for (const { recipe, category } of meals) {
        if (!recipe) continue;
        const defaults = ensureNutritionDefaults({
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0,
          fiber: 0,
          sodium: 0
        }, category);
        for (const key of NUTRITION_KEYS) {
          total[key] = (total[key] || 0) + defaults[key];
        }
      }
    }

    menu.totalNutrition = total;
  }
}

function extractTextFromResponse(data: any): string {
  const content = data?.output?.choices?.[0]?.message?.content;
  if (typeof content === "string" && content.trim()) {
    return content.trim();
  }

  const text = data?.output?.text;
  if (typeof text === "string" && text.trim()) {
    return text.trim();
  }

  const choiceText = data?.output?.choices?.[0]?.text;
  if (typeof choiceText === "string" && choiceText.trim()) {
    return choiceText.trim();
  }

  return "";
}

function parseRecipeJson(rawText: string): any {
  try {
    // 尝试直接解析 JSON
    return JSON.parse(rawText);
  } catch (error) {
    // 尝试提取 JSON 代码块
    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("JSON 代码块解析失败:", e);
      }
    }

    // 尝试提取 { ... } 中的内容
    const braceMatch = rawText.match(/\{[\s\S]*\}/);
    if (braceMatch) {
      try {
        return JSON.parse(braceMatch[0]);
      } catch (e) {
        console.error("大括号内容解析失败:", e);
      }
    }

    return null;
  }
}

function parseMenuJson(rawText: string): any {
  return parseRecipeJson(rawText); // 使用相同的解析逻辑
}

function createRecipeFromData(data: any, category: 'breakfast' | 'lunch' | 'dinner' | 'snack', userLevel: string): Recipe {
  const nutrition = ensureNutritionDefaults(normalizeNutrition(data.nutrition), category);

  return {
    id: generateId(),
    name: sanitizeText(data.name) || "低嘌呤营养餐",
    description: sanitizeText(data.description) || "AI 为您推荐的低嘌呤菜品，营养均衡、制作简单。",
    category,
    ingredients: normalizeIngredients(data.ingredients),
    steps: normalizeSteps(data.steps),
    nutrition,
    purineScore: normalizePurineLevel(data.purineScore),
    cookingTime: sanitizeNumber(data.cookingTime, 30),
    servings: sanitizeNumber(data.servings, 1),
    difficulty: normalizeDifficulty(data.difficulty),
    tags: Array.isArray(data.tags) ? data.tags.filter(Boolean) : [],
    suitableFor: normalizeSuitableFor(data.suitableFor, userLevel),
    createdAt: new Date().toISOString()
  };
}

function sanitizeText(value: unknown): string {
  if (typeof value === "string") {
    return value.trim();
  }
  return "";
}

function sanitizeNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === "string") {
    const numeric = parseFloat(value.replace(/[^0-9.\-]/g, ""));
    if (!Number.isNaN(numeric)) {
      return numeric;
    }
  }
  return fallback;
}

function normalizeNutrition(value: any): NutritionInfo {
  if (typeof value === "string") {
    return extractNutritionFromText(value);
  }

  if (Array.isArray(value)) {
    const merged = value.map((item: any) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        return Object.values(item).join(" ");
      }
      return "";
    }).join(" ");

    if (merged.trim()) {
      return extractNutritionFromText(merged);
    }
  }

  const source = value && typeof value === "object" ? value : {};
  return {
    calories: sanitizeNumber(source.calories, 0),
    protein: sanitizeNumber(source.protein, 0),
    fat: sanitizeNumber(source.fat, 0),
    carbs: sanitizeNumber(source.carbs, 0),
    fiber: sanitizeNumber(source.fiber, 0),
    sodium: sanitizeNumber(source.sodium, 0)
  };
}

function normalizePurineLevel(value: unknown): 'low' | 'mid' | 'high' {
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized.includes("high") || normalized.includes("高")) {
      return 'high';
    }
    if (normalized.includes("mid") || normalized.includes("中")) {
      return 'mid';
    }
    if (normalized.includes("low") || normalized.includes("低")) {
      return 'low';
    }
  }
  return 'low';
}

function normalizeDifficulty(value: unknown): 'easy' | 'medium' | 'hard' {
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized.includes("hard") || normalized.includes("困难")) {
      return 'hard';
    }
    if (normalized.includes("medium") || normalized.includes("中")) {
      return 'medium';
    }
    if (normalized.includes("easy") || normalized.includes("简")) {
      return 'easy';
    }
  }
  return 'easy';
}

function normalizeSuitableFor(value: unknown, fallback: string): 'normal' | 'high' | 'veryHigh' {
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized.includes("very") || normalized.includes("严重") || normalized.includes("过高")) {
      return 'veryHigh';
    }
    if (normalized.includes("high") || normalized.includes("偏高")) {
      return 'high';
    }
    if (normalized.includes("normal") || normalized.includes("正常")) {
      return 'normal';
    }
  }
  return (['normal', 'high', 'veryHigh'] as const).includes(fallback as any)
    ? (fallback as 'normal' | 'high' | 'veryHigh')
    : 'normal';
}

function normalizeIngredients(value: unknown): Ingredient[] {
  let items: unknown[] = [];

  if (Array.isArray(value)) {
    items = value;
  } else if (value && typeof value === "object") {
    const source = value as Record<string, unknown>;
    const possibleList = source.list ?? source.items ?? Object.values(source);
    if (Array.isArray(possibleList)) {
      items = possibleList;
    }
  } else if (typeof value === "string" && value.trim()) {
    items = splitTextList(value);
  }

  return items
    .map((item, index) => normalizeIngredientItem(item, index))
    .filter((item): item is Ingredient => Boolean(item));
}

function normalizeSteps(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map(step => sanitizeText(step))
      .filter(Boolean);
  }

  if (value && typeof value === "object") {
    const source = value as Record<string, unknown>;
    const possibleList = source.list ?? source.items ?? Object.values(source);
    if (Array.isArray(possibleList)) {
      return possibleList
        .map(step => sanitizeText(step))
        .filter(Boolean);
    }
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[\n；;。]+/)
      .map(step => step.trim())
      .filter(Boolean);
  }

  return [];
}

function extractNutritionFromText(text: string): NutritionInfo {
  const normalized = text.replace(/\s+/g, "");
  return {
    calories: matchNumber(normalized, /(热量|能量|calories|卡路里)[:：]?\D*([0-9]+(?:\.[0-9]+)?)/i),
    protein: matchNumber(normalized, /(蛋白质|protein)[:：]?\D*([0-9]+(?:\.[0-9]+)?)/i),
    fat: matchNumber(normalized, /(脂肪|fat)[:：]?\D*([0-9]+(?:\.[0-9]+)?)/i),
    carbs: matchNumber(normalized, /(碳水|carb|碳水化合物)[:：]?\D*([0-9]+(?:\.[0-9]+)?)/i),
    fiber: matchNumber(normalized, /(膳食纤维|纤维|fiber)[:：]?\D*([0-9]+(?:\.[0-9]+)?)/i),
    sodium: matchNumber(normalized, /(钠|sodium|盐)[:：]?\D*([0-9]+(?:\.[0-9]+)?)/i)
  };
}

function matchNumber(text: string, pattern: RegExp): number {
  const match = text.match(pattern);
  if (match && match[2]) {
    const value = parseFloat(match[2]);
    if (!Number.isNaN(value)) {
      return value;
    }
  }
  return 0;
}

function splitTextList(text: string): string[] {
  return text
    .split(/[、，,；;。\n]/)
    .map(item => item.trim())
    .filter(Boolean);
}

function normalizeIngredientItem(item: unknown, index: number): Ingredient | null {
  if (typeof item === "string") {
    return buildIngredientFromText(item, index);
  }

  if (item && typeof item === "object") {
    const source = item as Record<string, unknown>;
    const name = sanitizeText(source.name ?? source.ingredient ?? source.item ?? source.title);
    const amount = sanitizeText(source.amount ?? source.quantity ?? source.portion ?? source.dosage ?? source.value);
    const purineLevel = normalizePurineLevel(source.purineLevel ?? source.purine ?? source.level);

    return {
      name: name || `食材${index + 1}`,
      amount: amount || '适量',
      purineLevel
    };
  }

  return null;
}

function buildIngredientFromText(text: string, index: number): Ingredient | null {
  const cleaned = text.replace(/^[•\-\d\.]+\s*/, "").trim();
  if (!cleaned) {
    return null;
  }

  const parts = cleaned.split(/[:：\-—]/).map(part => part.trim()).filter(Boolean);
  const name = parts[0] || `食材${index + 1}`;
  const amountPart = parts.slice(1).join(" ");

  let amount = amountPart;
  if (!amount) {
    const match = cleaned.match(/([0-9]+(?:\.[0-9]+)?\s*(?:g|克|ml|毫升|个|片|匙|杯))/i);
    amount = match ? match[0] : "";
  }

  return {
    name,
    amount: amount || '适量',
    purineLevel: inferPurineLevelByName(name)
  };
}

function inferPurineLevelByName(name: string): 'low' | 'mid' | 'high' {
  const lower = name.toLowerCase();

  const highKeywords = ['肝', '肾', '腰', '牡蛎', '蛤蜊', '沙丁鱼', '凤爪', '鳗鱼', '火锅底料'];
  const midKeywords = ['牛肉', '羊肉', '猪肉', '虾', '蟹', '蘑菇', '菠菜', '花菜', '菜花', '豆腐', '豆干'];
  const lowKeywords = ['燕麦', '鸡蛋', '鸡胸', '牛奶', '酸奶', '白菜', '黄瓜', '苹果', '米饭', '面条', '南瓜', '胡萝卜', '西兰花', '西蓝花'];

  if (highKeywords.some(keyword => lower.includes(keyword))) {
    return 'high';
  }

  if (midKeywords.some(keyword => lower.includes(keyword))) {
    return 'mid';
  }

  if (lowKeywords.some(keyword => lower.includes(keyword))) {
    return 'low';
  }

  return 'low';
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

async function safeJson(response: Response) {
  try {
    return await response.json();
  } catch (error) {
    return { error: "Failed to parse JSON", raw: await response.text() };
  }
}
