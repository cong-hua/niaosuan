'use client';

import { useState, useEffect } from 'react';
import type { Recipe, DailyMenu } from '@/lib/recipe';
import RecipeCard from './RecipeCard';
import DailyMenuView from './DailyMenuView';

interface UricAcidRecord {
  id: string;
  user_id: string;
  value: number;
  measurement_date: string;
  notes?: string;
  created_at: string;
}

interface TrendAnalysisProps {
  user: {
    id: string;
    email: string;
    username?: string;
  };
}

type ViewMode = 'recipes' | 'menu';

const DEFAULT_PREFERENCE_TEXT = '偏好清淡、低盐少油的饮食，喜欢蒸煮炖，避免油炸和辛辣食物，忌海鲜和动物内脏，多加入高纤维蔬菜、全谷物和豆制品。';

const PREFERENCE_PRESETS = [
  {
    label: '清淡低盐',
    text: '偏好清淡少油的中式家常菜，烹饪方式以蒸、煮、炖为主，调味控制盐和糖，用橄榄油或菜籽油。'
  },
  {
    label: '高纤维营养',
    text: '每日需要搭配全谷物和杂粮，午晚餐增加深色叶菜和菌菇，优先选择豆制品和禽类作为蛋白质来源。'
  },
  {
    label: '控制嘌呤',
    text: '严格限制海鲜、动物内脏和高嘌呤红肉，适量食用去皮禽肉和低脂乳制品，避免浓肉汤和啤酒。'
  }
];

function extractPreferences(text: string): string[] {
  return text
    .split(/[，,；;。\n]/)
    .map(item => item.trim())
    .filter(Boolean);
}

export default function RecipeRecommendation({ user }: TrendAnalysisProps) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [dailyMenu, setDailyMenu] = useState<DailyMenu | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('recipes');
  const [records, setRecords] = useState<UricAcidRecord[]>([]);
  const [generatingCategory, setGeneratingCategory] = useState<string | null>(null);
  const [preferenceText, setPreferenceText] = useState<string>(DEFAULT_PREFERENCE_TEXT);

  // 获取用户尿酸记录
  useEffect(() => {
    fetchRecords();
  }, [user.id]);

  const fetchRecords = async () => {
    try {
      const response = await fetch(`/api/uric-acid/records?user_id=${user.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '获取记录失败');
      }

      // 按测量日期排序，取最新的记录
      const sortedRecords = data.records.sort((a: UricAcidRecord, b: UricAcidRecord) =>
        new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime()
      );

      setRecords(sortedRecords);
    } catch (err) {
      console.error('获取尿酸记录失败:', err);
      // 即使获取记录失败，也显示默认推荐
      setRecords([]);
    }
  };

  // 获取用户尿酸水平
  const getUserUricAcidLevel = (): 'normal' | 'high' | 'veryHigh' => {
    if (records.length === 0) return 'normal';

    const latest = records[0];
    const value = latest.value;

    // 根据性别判断阈值
    const threshold = 360; // 默认使用女性阈值（更严格）

    if (value < threshold) return 'normal';
    if (value < 900) return 'high';
    return 'veryHigh';
  };

  // 生成食谱推荐
  const generateRecipes = async (category?: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    setLoading(true);
    setError('');
    setGeneratingCategory(category || 'all');

    try {
      const requestBody = {
        userLevel: getUserUricAcidLevel(),
        gender: 'male', // 默认男性，实际应该从用户信息获取
        category: category,
        calorieTarget: category === 'breakfast' ? 400 : category === 'lunch' ? 600 : category === 'dinner' ? 500 : 200,
        preferences: extractPreferences(preferenceText)
      };

      const response = await fetch('/api/recipe/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '生成食谱失败');
      }

      const recipe: Recipe = await response.json();

      if (category) {
        // 如果是特定分类，替换现有该分类的食谱
        setRecipes(prev => {
          const filtered = prev.filter(r => r.category !== category);
          return [...filtered, recipe];
        });
      } else {
        // 如果是综合推荐，添加到列表
        setRecipes(prev => [...prev.slice(0, 2), recipe]); // 最多显示3个
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成食谱失败');
    } finally {
      setLoading(false);
      setGeneratingCategory(null);
    }
  };

  // 生成每日菜单
  const generateDailyMenu = async () => {
    setLoading(true);
    setError('');

    try {
      const requestBody = {
        userLevel: getUserUricAcidLevel(),
        gender: 'male', // 默认男性
        calorieTarget: 1800, // 一天目标热量
        preferences: extractPreferences(preferenceText)
      };

      const response = await fetch('/api/recipe/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '生成菜单失败');
      }

      const menu: DailyMenu = await response.json();
      setDailyMenu(menu);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成菜单失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载推荐食谱
  useEffect(() => {
    if (records.length > 0) {
      generateRecipes('lunch'); // 默认生成午餐推荐
    }
  }, [records]);

  const userLevel = getUserUricAcidLevel();
  const levelText = userLevel === 'normal' ? '尿酸正常' : userLevel === 'high' ? '尿酸偏高' : '尿酸过高';

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">智能食谱推荐</h2>
            <div className="text-sm text-gray-600 mt-1">
              基于您的{levelText}状况，为您推荐合适的低嘌呤食谱
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('recipes')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'recipes'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              食谱推荐
            </button>
            <button
              onClick={() => setViewMode('menu')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'menu'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              每日菜单
            </button>
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">饮食偏好（AI 将参考此描述生成菜谱）</label>
            <span className="text-xs text-gray-400">可手动修改或点击示例快速填写</span>
          </div>
          <textarea
            className="w-full rounded-md border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm p-3 transition-colors"
            rows={3}
            value={preferenceText}
            onChange={(event) => setPreferenceText(event.target.value)}
            placeholder="例如：偏好清淡饮食，限制油盐，喜欢蒸煮炖，避免海鲜和高嘌呤红肉，晚餐减少碳水。"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {PREFERENCE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setPreferenceText(preset.text)}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {viewMode === 'recipes' ? (
          <div>
            {/* 分类生成按钮 */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => generateRecipes('breakfast')}
                disabled={loading}
                className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 disabled:opacity-50"
              >
                {generatingCategory === 'breakfast' ? '生成中...' : '早餐推荐'}
              </button>
              <button
                onClick={() => generateRecipes('lunch')}
                disabled={loading}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 disabled:opacity-50"
              >
                {generatingCategory === 'lunch' ? '生成中...' : '午餐推荐'}
              </button>
              <button
                onClick={() => generateRecipes('dinner')}
                disabled={loading}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md text-sm hover:bg-purple-200 disabled:opacity-50"
              >
                {generatingCategory === 'dinner' ? '生成中...' : '晚餐推荐'}
              </button>
              <button
                onClick={() => generateRecipes('snack')}
                disabled={loading}
                className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md text-sm hover:bg-yellow-200 disabled:opacity-50"
              >
                {generatingCategory === 'snack' ? '生成中...' : '加餐推荐'}
              </button>
            </div>

            {/* 食谱列表 */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">AI正在为您生成专属食谱...</p>
              </div>
            ) : recipes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>暂无食谱推荐</p>
                <p className="text-sm mt-2">点击上方按钮生成个性化食谱</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* 每日菜单视图 */}
            <div className="flex justify-center mb-6">
              <button
                onClick={generateDailyMenu}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-md hover:from-green-600 hover:to-blue-700 disabled:opacity-50"
              >
                {loading ? '生成中...' : '生成今日菜单'}
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">AI正在为您规划今日菜单...</p>
              </div>
            ) : dailyMenu ? (
              <DailyMenuView menu={dailyMenu} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>暂无每日菜单</p>
                <p className="text-sm mt-2">点击上方按钮生成今日健康菜单</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
