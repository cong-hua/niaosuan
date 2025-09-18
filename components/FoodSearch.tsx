"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { PURINE_GUIDE, PURINE_THRESHOLDS, getPurineLevelDescription, type PurineStatus } from "@/lib/purine";
import type { FoodRiskWithId } from "@/lib/supabase";

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

type FoodItem = {
  id: string;
  name: string;
  category: string;
  purine_level: PurineStatus;
  purine_mg: number | null;
  description: string | null;
};

type CategoryGroup = {
  category: string;
  foods: FoodItem[];
};

const STATUS_STYLES: Record<PurineStatus, string> = {
  low: "bg-green-50 border-green-200 text-green-900",
  mid: "bg-yellow-50 border-yellow-200 text-yellow-900",
  high: "bg-red-50 border-red-200 text-red-900",
  unknown: "bg-gray-50 border-gray-200 text-gray-700"
};

const STATUS_LABELS: Record<PurineStatus, string> = {
  low: "能吃",
  mid: "少吃",
  high: "别吃",
  unknown: "待确认"
};

const STATUS_DESCRIPTIONS: Record<PurineStatus, string> = {
  low: `≤ ${PURINE_THRESHOLDS.LOW} mg/100g`,
  mid: `${PURINE_THRESHOLDS.LOW + 1}-${PURINE_THRESHOLDS.HIGH} mg/100g`,
  high: `> ${PURINE_THRESHOLDS.HIGH} mg/100g`,
  unknown: "待确认"
};

export default function FoodSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<FoodItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadAllFoods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Starting to load foods...');

      const response = await fetch('/api/foods');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to load foods');
      }

      const foodData = result.data;
      console.log('Loaded food data:', foodData?.length || 0, 'items');
      const mappedFoods: FoodItem[] = foodData.map((food: any, index: number) => ({
        id: food.id || `food-${index}`,
        name: food.name,
        category: food.category || "未分类",
        purine_level: food.purine_level,
        purine_mg: food.purine_mg ?? null,
        description: food.description ?? null
      }));
      setFoods(mappedFoods);
      console.log('Successfully mapped', mappedFoods.length, 'foods');
    } catch (error) {
      console.error('Failed to load foods:', error);
      setError(error instanceof Error ? error.message : '加载食物数据失败');
      // 在加载失败时使用示例数据，确保界面可用
      const fallbackFoods: FoodItem[] = [
        {
          id: "1",
          name: "苹果",
          category: "水果类",
          purine_level: "low",
          purine_mg: 10,
          description: "苹果，嘌呤含量低，适合痛风患者食用"
        },
        {
          id: "2",
          name: "香蕉",
          category: "水果类",
          purine_level: "low",
          purine_mg: 15,
          description: "香蕉，嘌呤含量低，适合痛风患者食用"
        },
        {
          id: "3",
          name: "猪肉",
          category: "肉／水产类",
          purine_level: "high",
          purine_mg: 120,
          description: "猪肉，嘌呤含量高，痛风患者应避免食用"
        },
        {
          id: "4",
          name: "大米",
          category: "谷薯类及其制品",
          purine_level: "low",
          purine_mg: 18,
          description: "大米，嘌呤含量低，适合痛风患者食用"
        },
        {
          id: "5",
          name: "豆腐",
          category: "豆类及豆制品",
          purine_level: "mid",
          purine_mg: 55,
          description: "豆腐，嘌呤含量中等，痛风患者需适量食用"
        }
      ];
      setFoods(fallbackFoods);
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载所有食物数据
  useEffect(() => {
    loadAllFoods();
  }, [loadAllFoods]);

  // 按分类分组食物
  const categoryGroups = useMemo(() => {
    const groups: Record<string, FoodItem[]> = {};

    foods.forEach(food => {
      if (!groups[food.category]) {
        groups[food.category] = [];
      }
      groups[food.category].push(food);
    });

    return Object.entries(groups).map(([category, foods]) => ({
      category,
      foods: foods.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
    })).sort((a, b) => a.category.localeCompare(b.category, 'zh-CN'));
  }, [foods]);

  // 搜索建议
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];

    // 如果已经加载了所有食物，先从本地过滤
    if (foods.length > 0) {
      return foods.filter(food =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8);
    }

    return [];
  }, [searchQuery, foods]);

  // 搜索结果
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return categoryGroups;

    const query = searchQuery.toLowerCase();
    const filtered = foods.filter(food =>
      food.name.toLowerCase().includes(query)
    );

    // 将搜索结果按分类分组
    const groups: Record<string, FoodItem[]> = {};
    filtered.forEach(food => {
      if (!groups[food.category]) {
        groups[food.category] = [];
      }
      groups[food.category].push(food);
    });

    return Object.entries(groups).map(([category, foods]) => ({
      category,
      foods: foods.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
    }));
  }, [searchQuery, foods, categoryGroups]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (food: FoodItem) => {
    setSearchQuery(food.name);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSuggestions(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-800">加载失败</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <button
                  onClick={loadAllFoods}
                  className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  重试
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 搜索栏 */}
      <div className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="搜索食物名称..."
            className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* 搜索建议下拉框 */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
            {filteredSuggestions.map((food) => (
              <div
                key={food.id}
                onClick={() => handleSuggestionClick(food)}
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{food.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLES[food.purine_level]}`}>
                    {STATUS_LABELS[food.purine_level]}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">{food.category}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 分类标签 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          全部
        </button>
        {categoryGroups.map((group) => (
          <button
            key={group.category}
            onClick={() => setSelectedCategory(
              selectedCategory === group.category ? null : group.category
            )}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === group.category
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {group.category}
          </button>
        ))}
      </div>

      {/* 搜索结果 */}
      <div className="space-y-8">
        {searchResults.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">没有找到匹配的食物</div>
          </div>
        ) : (
          searchResults
            .filter(group => !selectedCategory || group.category === selectedCategory)
            .map((group) => (
              <div key={group.category} className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  {group.category} ({group.foods.length}种)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {group.foods.map((food) => (
                    <FoodCard key={food.id} food={food} />
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

function FoodCard({ food }: { food: FoodItem }) {
  const purineText = typeof food.purine_mg === "number" ? `${food.purine_mg} mg/100g` : "待补充";
  const status = food.purine_level as PurineStatus;
  const statusStyle = STATUS_STYLES[status];
  const statusLabel = STATUS_LABELS[status];

  return (
    <div className={`rounded-lg border p-4 shadow-sm hover:shadow-md transition-all duration-200 ${statusStyle}`}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 truncate flex-1">{food.name}</h3>
        <span className="text-xs px-2 py-1 rounded-full bg-white/80 shadow-sm">
          {statusLabel}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">嘌呤含量</span>
          <div className="text-right">
            <span className="font-medium">{purineText}</span>
            <div className="text-xs text-gray-500">{STATUS_DESCRIPTIONS[status]}</div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">分类</span>
          <span className="text-xs text-gray-500">{food.category}</span>
        </div>

        {food.description && (
          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
            {food.description}
          </p>
        )}
      </div>
    </div>
  );
}