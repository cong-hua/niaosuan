const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

// 从环境变量获取Supabase配置
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('错误：缺少Supabase配置，请检查环境变量');
    console.error('需要设置 SUPABASE_URL 和 SUPABASE_SERVICE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 食物数据文件映射
const FOOD_DATA_FILES = {
    '谷薯类及其制品': { file: 'grains-complete.js', category: '谷薯类及其制品', count: 112 },
    '肉／水产类': { file: 'meat-seafood-complete.js', category: '肉／水产类', count: 439 },
    '蔬菜类': { file: 'vegetables-complete.js', category: '蔬菜类', count: 153 },
    '豆类及豆制品': { file: 'beans-complete.js', category: '豆类及豆制品', count: 56 },
    '水果类': { file: 'fruits-complete.js', category: '水果类', count: 54 },
    '硬／干果类': { file: 'nuts-complete.js', category: '硬／干果类', count: 42 },
    '蛋／奶类': { file: 'eggs-dairy-complete.js', category: '蛋／奶类', count: 25 },
    '酒／饮料类': { file: 'alcohol-drinks-complete.js', category: '酒／饮料类', count: 6 },
    '菇／菌类': { file: 'mushrooms-complete.js', category: '菇／菌类', count: 40 },
    '其它': { file: 'others-complete.js', category: '其它', count: 117 }
};

// 读取并处理单个数据文件
function processFoodData(filePath, category) {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`文件不存在: ${filePath}`);
            return [];
        }

        const data = require(filePath);
        console.log(`读取 ${category} 数据: ${data.length} 条`);

        // 处理数据格式
        const processedData = data.map(item => ({
            name_cn: item.name,
            category: category,
            description: item.desc,
            purine_level: item.level,
            purine_mg: item.purine
        }));

        return processedData;
    } catch (error) {
        console.error(`处理 ${category} 数据时出错:`, error.message);
        return [];
    }
}

// 批量导入数据
async function batchImport() {
    const allFoodData = [];

    // 收集所有食物数据
    for (const [category, info] of Object.entries(FOOD_DATA_FILES)) {
        const filePath = path.join(__dirname, '..', 'data', info.file);
        const data = processFoodData(filePath, category);
        allFoodData.push(...data);
    }

    console.log(`总计收集到 ${allFoodData.length} 条食物数据`);

    // 分批导入，每批100条
    const batchSize = 100;
    const batches = [];
    for (let i = 0; i < allFoodData.length; i += batchSize) {
        batches.push(allFoodData.slice(i, i + batchSize));
    }

    console.log(`将数据分为 ${batches.length} 批次进行导入，每批 ${batchSize} 条`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // 执行批量导入
    for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`正在导入第 ${i + 1}/${batches.length} 批数据 (${batch.length} 条)...`);

        try {
            const { data, error } = await supabase
                .from('food_library')
                .insert(batch);

            if (error) {
                console.error(`第 ${i + 1} 批导入失败:`, error.message);
                errors.push({ batch: i + 1, error: error.message });
                errorCount += batch.length;
            } else {
                successCount += batch.length;
                console.log(`第 ${i + 1} 批导入成功 (${batch.length} 条)`);
            }
        } catch (err) {
            console.error(`第 ${i + 1} 批导入异常:`, err.message);
            errors.push({ batch: i + 1, error: err.message });
            errorCount += batch.length;
        }

        // 添加延迟避免请求过快
        if (i < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    console.log('\n导入结果:');
    console.log(`成功: ${successCount} 条`);
    console.log(`失败: ${errorCount} 条`);
    console.log(`总计: ${allFoodData.length} 条`);

    if (errors.length > 0) {
        console.log('\n错误详情:');
        errors.forEach(err => {
            console.log(`批次 ${err.batch}: ${err.error}`);
        });
    }

    return { successCount, errorCount, total: allFoodData.length, errors };
}

// 验证导入结果
async function verifyImport() {
    console.log('\n验证导入结果...');

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
    const { data: categoryStats, error: categoryError } = await supabase
        .from('food_library')
        .select('category')
        .select('category');

    if (categoryError) {
        console.error('获取分类统计失败:', categoryError.message);
        return;
    }

    console.log('\n分类统计:');
    const categoryCount = {};
    categoryStats?.forEach(stat => {
        categoryCount[stat.category] = stat.count;
    });

    Object.entries(categoryCount).forEach(([category, count]) => {
        const percentage = ((count / (totalFoods?.length || 1)) * 100).toFixed(1);
        console.log(`${category}: ${count} 个 (${percentage}%)`);
    });

    // 获取嘌呤等级统计
    const { data: levelStats, error: levelError } = await supabase
        .from('food_library')
        .select('purine_level, count', { count: 'exact' });

    if (levelError) {
        console.error('获取嘌呤等级统计失败:', levelError.message);
        return;
    }

    console.log('\n嘌呤等级统计:');
    const levelCount = {};
    levelStats?.forEach(stat => {
        levelCount[stat.purine_level] = stat.count;
    });

    Object.entries(levelCount).forEach(([level, count]) => {
        const percentage = ((count / (totalFoods?.length || 1)) * 100).toFixed(1);
        console.log(`${level}: ${count} 个 (${percentage}%)`);
    });
}

// 主函数
async function main() {
    try {
        console.log('开始批量导入食物数据...');
        console.log(`使用数据库: ${supabaseUrl}`);

        // 清空现有数据
        console.log('\n清空现有数据...');
        const { error: deleteError } = await supabase
            .from('food_library')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (deleteError) {
            console.error('清空数据失败:', deleteError.message);
        } else {
            console.log('现有数据已清空');
        }

        // 执行批量导入
        const result = await batchImport();

        if (result.errorCount === 0) {
            console.log('\n✅ 所有数据导入成功！');
        } else {
            console.log('\n⚠️ 部分数据导入失败，请检查错误信息');
        }

        // 验证导入结果
        await verifyImport();

    } catch (error) {
        console.error('导入过程失败:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { batchImport, verifyImport };