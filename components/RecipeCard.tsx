'use client';

import { useState } from 'react';
import type { Recipe } from '@/lib/recipe';

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const [expanded, setExpanded] = useState(false);

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-50 text-green-700';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700';
      case 'hard':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '简单';
      case 'medium':
        return '中等';
      case 'hard':
        return '困难';
      default:
        return '未知';
    }
  };

  const getCategoryText = (category: string) => {
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

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* 头部信息 */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{recipe.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{recipe.description}</p>
          </div>
        </div>

        {/* 标签 */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            {getCategoryText(recipe.category)}
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPurineScoreColor(recipe.purineScore)}`}>
            {getPurineScoreText(recipe.purineScore)}
          </span>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
            {getDifficultyText(recipe.difficulty)}
          </span>
        </div>

        {/* 营养信息 */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-xs text-gray-600">热量</div>
            <div className="text-sm font-semibold text-gray-800">{recipe.nutrition.calories} kcal</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-xs text-gray-600">蛋白质</div>
            <div className="text-sm font-semibold text-gray-800">{recipe.nutrition.protein}g</div>
          </div>
        </div>

        {/* 基本信息 */}
        <div className="flex justify-between text-xs text-gray-600 mb-3">
          <span>⏱ {recipe.cookingTime}分钟</span>
          <span>🍽 {recipe.servings}人份</span>
        </div>

        {/* 展开/收起按钮 */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2 text-center text-sm text-blue-600 hover:text-blue-800 font-medium border-t border-gray-100 hover:bg-gray-50 transition-colors"
        >
          {expanded ? '收起详情' : '查看详情'}
        </button>

        {/* 详细信息 */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {/* 详细营养信息 */}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">营养成分</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">脂肪</div>
                  <div className="font-medium">{recipe.nutrition.fat}g</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">碳水</div>
                  <div className="font-medium">{recipe.nutrition.carbs}g</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">纤维</div>
                  <div className="font-medium">{recipe.nutrition.fiber}g</div>
                </div>
              </div>
              <div className="mt-2 text-center p-2 bg-yellow-50 rounded">
                <div className="text-xs text-gray-600">钠含量</div>
                <div className="font-medium text-yellow-800">{recipe.nutrition.sodium}mg</div>
              </div>
            </div>

            {/* 食材清单 */}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">食材清单</h4>
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
            </div>

            {/* 制作步骤 */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">制作步骤</h4>
              <div className="space-y-2">
                {recipe.steps.map((step, index) => (
                  <div key={index} className="flex gap-3 text-sm">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 标签 */}
            {recipe.tags.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-800 mb-2">标签</h4>
                <div className="flex flex-wrap gap-1">
                  {recipe.tags.map((tag, index) => (
                    <span key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}