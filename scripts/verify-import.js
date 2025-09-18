const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function verifyData() {
    console.log('验证导入结果...');

    // 获取总数
    const { data: totalFoods, error: totalError } = await supabase
        .from('food_library')
        .select('*', { count: 'exact' });

    if (totalError) {
        console.error('获取总数失败:', totalError.message);
        return;
    }

    console.log(`数据库中现有 ${totalFoods?.length || 0} 个食物记录`);

    // 获取分类统计
    const { data: categoryData, error: categoryError } = await supabase
        .from('food_library')
        .select('category');

    if (categoryError) {
        console.error('获取分类数据失败:', categoryError.message);
        return;
    }

    // 手动统计分类
    const categoryCount = {};
    categoryData?.forEach(item => {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });

    console.log('\n分类统计:');
    Object.entries(categoryCount).forEach(([category, count]) => {
        const percentage = ((count / (totalFoods?.length || 1)) * 100).toFixed(1);
        console.log(`${category}: ${count} 个 (${percentage}%)`);
    });

    // 获取嘌呤等级统计
    const { data: levelData, error: levelError } = await supabase
        .from('food_library')
        .select('purine_level');

    if (levelError) {
        console.error('获取嘌呤等级数据失败:', levelError.message);
        return;
    }

    // 手动统计嘌呤等级
    const levelCount = {};
    levelData?.forEach(item => {
        levelCount[item.purine_level] = (levelCount[item.purine_level] || 0) + 1;
    });

    console.log('\n嘌呤等级统计:');
    Object.entries(levelCount).forEach(([level, count]) => {
        const percentage = ((count / (totalFoods?.length || 1)) * 100).toFixed(1);
        console.log(`${level}: ${count} 个 (${percentage}%)`);
    });

    // 显示前10条记录作为示例
    console.log('\n前10条记录示例:');
    const { data: sampleData } = await supabase
        .from('food_library')
        .select('name_cn, category, purine_level, purine_mg')
        .limit(10);

    sampleData?.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name_cn} (${item.category}) - ${item.purine_level} (${item.purine_mg}mg)`);
    });
}

verifyData().catch(console.error);