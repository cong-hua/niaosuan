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
          err.message.includes("食材重复")
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
  return {
    id: generateId(),
    name: sanitizeText(data.name) || "低嘌呤营养餐",
    description: sanitizeText(data.description) || "AI 为您推荐的低嘌呤菜品，营养均衡、制作简单。",
    category,
    ingredients: normalizeIngredients(data.ingredients),
    steps: normalizeSteps(data.steps),
    nutrition: normalizeNutrition(data.nutrition),
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
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const name = sanitizeText(item.name ?? item.ingredient ?? item.item);
      const amount = sanitizeText(item.amount ?? item.quantity ?? item.portion ?? item.dosage);
      const purineLevel = normalizePurineLevel(item.purineLevel ?? item.purine ?? item.level);

      return {
        name: name || `食材${index + 1}`,
        amount: amount || '适量',
        purineLevel
      };
    })
    .filter((item): item is Ingredient => Boolean(item));
}

function normalizeSteps(value: unknown): string[] {
  if (!Array.isArray(value)) {
    if (typeof value === "string" && value.trim()) {
      return value
        .split(/[\n；;。]+/)
        .map(step => step.trim())
        .filter(Boolean);
    }
    return [];
  }

  return value
    .map(step => sanitizeText(step))
    .filter(Boolean);
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
