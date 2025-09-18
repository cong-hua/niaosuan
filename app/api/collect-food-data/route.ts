import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseKey);
}

// 示例食物数据 - 实际使用时可以从数据库或外部API获取
const sampleFoodData = [
  {
    name_cn: "糙米",
    category: "谷薯类及其制品",
    purine_level: "low",
    purine_mg: 35,
    description: "低嘌呤食物，适合痛风患者食用，嘌呤含量为35mg/100g"
  },
  {
    name_cn: "小麦",
    category: "谷薯类及其制品",
    purine_level: "low",
    purine_mg: 12.1,
    description: "低嘌呤食物，适合痛风患者食用，嘌呤含量为12.1mg/100g"
  },
  {
    name_cn: "面粉",
    category: "谷薯类及其制品",
    purine_level: "low",
    purine_mg: 26,
    description: "低嘌呤食物，适合痛风患者食用，嘌呤含量为26mg/100g"
  },
  {
    name_cn: "麦芽",
    category: "谷薯类及其制品",
    purine_level: "high",
    purine_mg: 500,
    description: "高嘌呤食物，痛风患者应避免食用，嘌呤含量为500mg/100g"
  },
  {
    name_cn: "小鱼干",
    category: "肉／水产类",
    purine_level: "very_high",
    purine_mg: 1538,
    description: "极高嘌呤食物，痛风患者绝对禁止食用，嘌呤含量为1538mg/100g"
  },
  {
    name_cn: "芦笋",
    category: "蔬菜类",
    purine_level: "medium",
    purine_mg: 28,
    description: "中等嘌呤食物，痛风患者需适量食用，嘌呤含量为28mg/100g"
  },
  {
    name_cn: "干黄豆",
    category: "豆类及豆制品",
    purine_level: "medium",
    purine_mg: 166,
    description: "中等嘌呤食物，痛风患者需适量食用，嘌呤含量为166mg/100g"
  },
  {
    name_cn: "花生（熟）",
    category: "硬／干果类",
    purine_level: "medium",
    purine_mg: 79,
    description: "中等嘌呤食物，痛风患者需适量食用，嘌呤含量为79mg/100g"
  },
  {
    name_cn: "啤酒",
    category: "酒／饮料类",
    purine_level: "high",
    purine_mg: 79,
    description: "高嘌呤食物，痛风患者应避免食用，嘌呤含量为79mg/100g"
  }
];

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'collect') {
      const supabase = getSupabaseClient();

      // 插入食物数据到数据库
      const results = [];

      for (const food of sampleFoodData) {
        const { data, error } = await supabase
          .from('food_library')
          .insert([food])
          .select();

        if (error) {
          console.error('插入数据失败:', error);
          results.push({ name: food.name_cn, status: 'error', message: error.message });
        } else {
          results.push({ name: food.name_cn, status: 'success', data: data?.[0] });
        }
      }

      const successCount = results.filter(r => r.status === 'success').length;
      const errorCount = results.filter(r => r.status === 'error').length;

      return NextResponse.json({
        message: `数据收集完成`,
        total: results.length,
        success: successCount,
        errors: errorCount,
        results: results
      });
    }

    if (action === 'list') {
      const supabase = getSupabaseClient();

      // 获取现有食物数据
      const { data, error } = await supabase
        .from('food_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        message: '获取食物数据成功',
        data: data,
        total: data?.length || 0
      });
    }

    return NextResponse.json({ error: '不支持的操作' }, { status: 400 });

  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    // 获取数据库统计信息
    const { data: totalFoods, error: countError } = await supabase
      .from('food_library')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    // 获取分类统计
    const { data: categoryStats, error: statsError } = await supabase
      .from('food_library')
      .select('category');

    if (statsError) {
      return NextResponse.json({ error: statsError.message }, { status: 500 });
    }

    // 获取嘌呤等级统计
    const { data: levelStats } = await supabase
      .from('food_library')
      .select('purine_level');

    const levelCounts = {
      low: levelStats?.filter(f => f.purine_level === 'low').length || 0,
      medium: levelStats?.filter(f => f.purine_level === 'medium').length || 0,
      high: levelStats?.filter(f => f.purine_level === 'high').length || 0,
      very_high: levelStats?.filter(f => f.purine_level === 'very_high').length || 0,
      unknown: levelStats?.filter(f => f.purine_level === 'unknown').length || 0
    };

    return NextResponse.json({
      message: '获取统计信息成功',
      total: totalFoods?.length || 0,
      categoryStats: categoryStats || [],
      levelStats: levelCounts
    });

  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}