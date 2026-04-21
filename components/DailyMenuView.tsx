'use client';

import { useState } from 'react';
import type { DailyMenu, Recipe } from '@/lib/recipe';

interface DailyMenuViewProps {
  menu: DailyMenu;
}

export default function DailyMenuView({ menu }: DailyMenuViewProps) {
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  const getPurineScoreColor = (score: string) => {
    switch (score) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'mid':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPurineScoreText = (score: string) => {
    switch (score) {
      case 'low':
        return '低嘌呤';
      case 'mid':
        return '中嘌呤';
      case 'high':
        return '高嘌呤';
      default:
        return '未知';
    }
  };

  const getMealName = (category: string) => {
    switch (category) {
      case 'breakfast':
        return '早餐';
      case 'lunch':
        return '午餐';
      case 'dinner':
        return '晚餐';
      case 'snack':
        return '加餐';
      default:
        return '其他';
    }
  };

  const MealCard = ({ recipe, category }: { recipe: Recipe; category: string }) => (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpandedMeal(expandedMeal === category ? null : category)}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-800">{recipe.name}</h4>
              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                {getMealName(category)}
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{recipe.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPurineScoreColor(recipe.purineScore)}`}>
            {getPurineScoreText(recipe.purineScore)}
          </span>
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
            {recipe.cookingTime}分钟
          </span>
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
            {recipe.servings}人份
          </span>
        </div>

        {/* 营养信息概览 */}
        <div className="grid grid-cols-4 gap-1 text-xs">
          <div className="text-center p-1 bg-gray-50 rounded">
            <div className="text-gray-600">{recipe.nutrition.calories}</div>
            <div className="text-gray-500">kcal</div>
          </div>
          <div className="text-center p-1 bg-gray-50 rounded">
            <div className="text-gray-600">{recipe.nutrition.protein}g</div>
            <div className="text-gray-500">蛋白质</div>
          </div>
          <div className="text-center p-1 bg-gray-50 rounded">
            <div className="text-gray-600">{recipe.nutrition.fat}g</div>
            <div className="text-gray-500">脂肪</div>
          </div>
          <div className="text-center p-1 bg-gray-50 rounded">
            <div className="text-gray-600">{recipe.nutrition.carbs}g</div>
            <div className="text-gray-500">碳水</div>
          </div>
        </div>

        <div className="text-center text-sm text-blue-600 mt-2">
          {expandedMeal === category ? '点击收起' : '点击展开详情'}
        </div>
      </div>

      {/* 详细信息 */}
      {expandedMeal === category && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {/* 食材清单 */}
          <div className="mb-3">
            <h5 className="font-semibold text-gray-800 mb-2">食材清单</h5>
            {recipe.ingredients.length === 0 ? (
              <p className="text-sm text-gray-500">AI 暂未提供该餐的食材详情，建议手动确认所用食材。</p>
            ) : (
              <div className="space-y-1">
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{ingredient.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{ingredient.amount}</span>
                      <span className={`text-xs px-1 py-0.5 rounded ${getPurineScoreColor(ingredient.purineLevel)}`}>
                        {getPurineScoreText(ingredient.purineLevel)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 制作步骤 */}
          <div>
            <h5 className="font-semibold text-gray-800 mb-2">制作步骤</h5>
            {recipe.steps.length === 0 ? (
              <p className="text-sm text-gray-500">AI 暂未提供制作步骤，建议按照常规烹饪方式处理或重新生成菜单。</p>
            ) : (
              <div className="space-y-2">
                {recipe.steps.map((step, index) => (
                  <div key={index} className="flex gap-3 text-sm">
                    <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const meals = [
    { recipe: menu.breakfast, category: 'breakfast' },
    { recipe: menu.lunch, category: 'lunch' },
    { recipe: menu.dinner, category: 'dinner' },
    { recipe: menu.snack, category: 'snack' }
  ].filter(meal => meal.recipe !== null);

  return (
    <div className="space-y-6">
      {/* 日期和总体评估 */}
      <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {new Date(menu.date).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          })} 菜单
        </h3>
        <div className="flex justify-center items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">总体嘌呤风险:</span>
            <span className={`px-3 py-1 rounded-full font-medium ${getPurineScoreColor(menu.totalPurineScore)}`}>
              {getPurineScoreText(menu.totalPurineScore)}
            </span>
          </div>
        </div>
      </div>

      {/* 每日餐食 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {meals.map((meal) => (
          <MealCard
            key={meal.category}
            recipe={meal.recipe as Recipe}
            category={meal.category}
          />
        ))}
      </div>

      {/* 全天营养汇总 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">全天营养汇总</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {menu.totalNutrition.calories}
            </div>
            <div className="text-sm text-gray-600">总热量 (kcal)</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {menu.totalNutrition.protein}g
            </div>
            <div className="text-sm text-gray-600">蛋白质</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {menu.totalNutrition.fat}g
            </div>
            <div className="text-sm text-gray-600">脂肪</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {menu.totalNutrition.carbs}g
            </div>
            <div className="text-sm text-gray-600">碳水化合物</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {menu.totalNutrition.fiber}g
            </div>
            <div className="text-sm text-gray-600">膳食纤维</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {menu.totalNutrition.sodium}mg
            </div>
            <div className="text-sm text-gray-600">钠</div>
          </div>
        </div>

        {/* 健康建议 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">健康建议</h4>
          <div className="text-sm text-gray-700 space-y-1">
            {menu.totalPurineScore === 'low' && (
              <p>✅ 今日菜单嘌呤含量较低，适合您的健康状况。</p>
            )}
            {menu.totalPurineScore === 'mid' && (
              <p>⚠️ 今日菜单嘌呤含量适中，建议多喝水促进代谢。</p>
            )}
            {menu.totalPurineScore === 'high' && (
              <p>❌ 今日菜单嘌呤含量较高，建议调整部分食材或减少份量。</p>
            )}
            {menu.totalNutrition.sodium > 2300 && (
              <p>🧂 钠含量较高，建议减少盐的使用或选择低钠食材。</p>
            )}
            {menu.totalNutrition.calories > 2000 && (
              <p>🔥 热量较高，可根据活动量适当调整份量。</p>
            )}
            <p>💡 记得多喝水，建议每日饮水量不少于2000ml。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
