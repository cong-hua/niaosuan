// 食谱相关的类型定义和工具函数

export interface Ingredient {
  name: string;
  amount: string;
  purineLevel: 'low' | 'mid' | 'high';
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  sodium: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ingredients: Ingredient[];
  steps: string[];
  nutrition: NutritionInfo;
  purineScore: 'low' | 'mid' | 'high';
  cookingTime: number; // 分钟
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  suitableFor: 'normal' | 'high' | 'veryHigh';
  image?: string;
  createdAt: string;
}

export interface DailyMenu {
  date: string;
  breakfast: Recipe | null;
  lunch: Recipe | null;
  dinner: Recipe | null;
  snack: Recipe | null;
  totalPurineScore: 'low' | 'mid' | 'high';
  totalNutrition: NutritionInfo;
}

export interface RecipeGenerationRequest {
  userLevel: 'normal' | 'high' | 'veryHigh';
  gender?: 'male' | 'female';
  preferences?: string[]; // 饮食偏好，如素食、低盐等
  allergies?: string[]; // 过敏食物
  category?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calorieTarget?: number;
}

export interface RecipeRecommendationRequest extends RecipeGenerationRequest {
  count?: number; // 推荐数量，默认3个
}

// 根据尿酸值判断用户等级
export function getUricAcidLevel(value: number, gender?: 'male' | 'female'): 'normal' | 'high' | 'veryHigh' {
  const threshold = gender === 'female' ? 360 : 420;

  if (value < threshold) return 'normal';
  if (value < 900) return 'high'; // 9.0 mmol/L = 900 μmol/L
  return 'veryHigh';
}

// 计算食谱总嘌呤风险
export function calculateRecipePurineScore(ingredients: Ingredient[]): 'low' | 'mid' | 'high' {
  let highCount = 0;
  let midCount = 0;

  for (const ingredient of ingredients) {
    if (ingredient.purineLevel === 'high') highCount++;
    else if (ingredient.purineLevel === 'mid') midCount++;
  }

  // 如果有任何高嘌呤食材，直接评为高风险
  if (highCount > 0) return 'high';
  // 如果中嘌呤食材超过2个，评为中风险
  if (midCount > 2) return 'mid';
  // 否则为低风险
  return 'low';
}

// 计算每日菜单总营养
export function calculateDailyNutrition(menu: DailyMenu): NutritionInfo {
  const meals = [menu.breakfast, menu.lunch, menu.dinner, menu.snack].filter(Boolean) as Recipe[];

  return meals.reduce((total, recipe) => ({
    calories: total.calories + recipe.nutrition.calories,
    protein: total.protein + recipe.nutrition.protein,
    fat: total.fat + recipe.nutrition.fat,
    carbs: total.carbs + recipe.nutrition.carbs,
    fiber: total.fiber + recipe.nutrition.fiber,
    sodium: total.sodium + recipe.nutrition.sodium,
  }), {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
    sodium: 0,
  });
}

// 生成食谱推荐提示词
export function generateRecipePrompt(request: RecipeGenerationRequest): string {
  const levelDescriptions = {
    normal: '尿酸正常，可以推荐营养均衡的日常食谱',
    high: '尿酸偏高，需要推荐低嘌呤、清淡的食谱',
    veryHigh: '尿酸过高，必须推荐严格低嘌呤、有利于降尿酸的食谱'
  };

  const categoryDescriptions = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '加餐'
  };

  let prompt = `请为${levelDescriptions[request.userLevel]}的用户生成${categoryDescriptions[request.category || 'lunch']}食谱。

要求：
1. 食谱必须适合${request.userLevel === 'normal' ? '正常' : request.userLevel === 'high' ? '高尿酸' : '非常高尿酸'}人群
2. 提供详细的食材清单和制作步骤
3. 包含营养分析（热量、蛋白质、脂肪、碳水化合物、纤维、钠含量）
4. 标注嘌呤风险等级
5. 给出制作时间和难度
6. 返回JSON格式数据

${request.preferences ? `饮食偏好：${request.preferences.join('、')}` : ''}
${request.allergies ? `避免食材：${request.allergies.join('、')}` : ''}
${request.calorieTarget ? `目标热量：${request.calorieTarget}卡路里` : ''}

请返回以下格式的JSON数据：
{
  "name": "食谱名称",
  "description": "食谱描述",
  "ingredients": [
    {"name": "食材名", "amount": "用量", "purineLevel": "low/mid/high"}
  ],
  "steps": ["步骤1", "步骤2", "步骤3"],
  "nutrition": {
    "calories": 数值,
    "protein": 数值,
    "fat": 数值,
    "carbs": 数值,
    "fiber": 数值,
    "sodium": 数值
  },
  "purineScore": "low/mid/high",
  "cookingTime": 分钟数,
  "servings": 份数,
  "difficulty": "easy/medium/hard",
  "tags": ["标签1", "标签2"],
  "suitableFor": "normal/high/veryHigh"
}`;

  return prompt;
}

// 生成每日菜单提示词
export function generateDailyMenuPrompt(request: RecipeGenerationRequest): string {
  const levelDescriptions = {
    normal: '尿酸正常，需要营养均衡的一日三餐',
    high: '尿酸偏高，需要低嘌呤、清淡的一日三餐',
    veryHigh: '尿酸过高，需要严格低嘌呤、有利于降尿酸的一日三餐'
  };

  let prompt = `请为${levelDescriptions[request.userLevel]}的用户生成一日三餐食谱。

要求：
1. 包含早餐、午餐、晚餐，可选择加餐
2. 全天嘌呤总量控制在适合范围内
3. 营养均衡，热量合理分配
4. 提供每餐的详细食材和制作方法
5. 计算全天总营养值
6. 返回JSON格式数据
7. 每餐菜品需完全不同，主食、主要食材和烹饪方式不得重复或仅作轻微修改
8. 合理搭配蔬菜、优质蛋白和主食，保证整体口味与营养多样化
9. 若包含加餐，加餐需与正餐明显区分，可选择低嘌呤的水果、饮品或坚果

${request.preferences ? `饮食偏好：${request.preferences.join('、')}` : ''}
${request.allergies ? `避免食材：${request.allergies.join('、')}` : ''}
${request.calorieTarget ? `全天目标热量：${request.calorieTarget}卡路里` : ''}

请返回以下格式的JSON数据：
{
  "breakfast": {完整的食谱数据},
  "lunch": {完整的食谱数据},
  "dinner": {完整的食谱数据},
  "snack": {可选的加餐食谱数据},
  "totalPurineScore": "low/mid/high",
  "totalNutrition": {
    "calories": 全天总热量,
    "protein": 总蛋白质,
    "fat": 总脂肪,
    "carbs": 总碳水,
    "fiber": 总纤维,
    "sodium": 总钠
  }
}`;

  return prompt;
}
