const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function finalVerification() {
    console.log('🔍 最终数据验证报告');
    console.log('='.repeat(50));

    // 获取总数
    const { count: totalCount, error: totalError } = await supabase
        .from('food_library')
        .select('*', { count: 'exact', head: true });

    if (totalError) {
        console.error('❌ 获取总数失败:', totalError.message);
        return;
    }

    console.log(`📊 总记录数: ${totalCount} 条`);

    // 获取所有记录进行分类统计
    const { data: allData, error: dataError } = await supabase
        .from('food_library')
        .select('category, purine_level');

    if (dataError) {
        console.error('❌ 获取数据失败:', dataError.message);
        return;
    }

    // 分类统计
    const categoryStats = {};
    const levelStats = {};

    allData?.forEach(item => {
        // 分类统计
        categoryStats[item.category] = (categoryStats[item.category] || 0) + 1;

        // 嘌呤等级统计
        levelStats[item.purine_level] = (levelStats[item.purine_level] || 0) + 1;
    });

    console.log('\n📋 分类统计:');
    console.log('-'.repeat(30));
    Object.entries(categoryStats).forEach(([category, count]) => {
        const percentage = ((count / totalCount) * 100).toFixed(1);
        console.log(`${category}: ${count} 条 (${percentage}%)`);
    });

    console.log('\n🎯 嘌呤等级统计:');
    console.log('-'.repeat(30));
    Object.entries(levelStats).forEach(([level, count]) => {
        const percentage = ((count / totalCount) * 100).toFixed(1);
        console.log(`${level}: ${count} 条 (${percentage}%)`);
    });

    // 显示各分类的高嘌呤食物
    console.log('\n⚠️  高嘌呤食物警告 (>150mg):');
    console.log('-'.repeat(40));

    const { data: highPurineData } = await supabase
        .from('food_library')
        .select('name_cn, category, purine_mg')
        .gt('purine_mg', 150)
        .order('purine_mg', { ascending: false })
        .limit(20);

    if (highPurineData && highPurineData.length > 0) {
        highPurineData.forEach((item, index) => {
            console.log(`${index + 1}. ${item.name_cn} (${item.category}) - ${item.purine_mg}mg`);
        });
        console.log(`\n... 还有 ${highPurineData.length - 20} 种高嘌呤食物未显示`);
    } else {
        console.log('没有找到高嘌呤食物');
    }

    // 验证预期数据量
    const expectedCounts = {
        '谷薯类及其制品': 112,
        '肉／水产类': 281,
        '蔬菜类': 154,
        '豆类及豆制品': 101,
        '水果类': 131,
        '硬／干果类': 127,
        '蛋／奶类': 130,
        '酒／饮料类': 189,
        '菇／菌类': 179,
        '其它': 358
    };

    console.log('\n✅ 数据完整性检查:');
    console.log('-'.repeat(30));
    let allComplete = true;

    Object.entries(expectedCounts).forEach(([category, expected]) => {
        const actual = categoryStats[category] || 0;
        const status = actual >= expected ? '✅' : '❌';
        console.log(`${status} ${category}: ${actual}/${expected}`);
        if (actual < expected) allComplete = false;
    });

    console.log('\n🎉 导入状态:', allComplete ? '全部完成' : '部分缺失');
    console.log('\n📝 总结:');
    console.log(`- 成功导入 ${totalCount} 条食物嘌呤数据`);
    console.log(`- 涵盖 ${Object.keys(categoryStats).length} 个食物分类`);
    console.log(`- 数据库已可用于尿酸健康管理应用`);
}

finalVerification().catch(console.error);