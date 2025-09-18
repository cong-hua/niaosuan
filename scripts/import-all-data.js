const fs = require('fs');
const path = require('path');
const CompleteFoodCollector = require('../lib/complete-food-collector');
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

// 创建食物收集器实例
const collector = new CompleteFoodCollector();

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
            aliases: [],
            description: item.desc,
            purine_level: item.level,
            purine_mg: item.purine,
            source_url: ''
        }));

        return processedData;
    } catch (error) {
        console.error(`处理 ${category} 数据时出错:`, error.message);
        return [];
    }
}

// 生成完整的SQL插入语句
function generateCompleteSQL() {
    const allFoodData = [];

    // 收集所有食物数据
    for (const [category, info] of Object.entries(FOOD_DATA_FILES)) {
        const filePath = path.join(__dirname, '..', 'data', info.file);
        const data = processFoodData(filePath, category);
        allFoodData.push(...data);
    }

    console.log(`总计收集到 ${allFoodData.length} 条食物数据`);

    // 生成SQL语句
    const sqlStatements = allFoodData.map(food => {
        const id = `uuid_generate_v4()`;
        const name_cn = food.name_cn.replace(/'/g, "''");
        const category = food.category.replace(/'/g, "''");
        const purine_level = food.purine_level || collector.autoDetectPurineLevel(food.purine_mg);
        const purine_mg = food.purine_mg || 'NULL';
        const description = food.description.replace(/'/g, "''");

        return `INSERT INTO food_library (id, name_cn, category, purine_level, purine_mg, description, created_at)
VALUES (${id}, '${name_cn}', '${category}', '${purine_level}', ${purine_mg}, '${description}', CURRENT_TIMESTAMP);`;
    });

    return sqlStatements;
}

// 保存SQL到文件
function saveCompleteSQL(sqlStatements) {
    const sqlContent = `-- 食物库完整数据导入SQL
-- 总计: ${sqlStatements.length} 条数据
-- 生成时间: ${new Date().toISOString()}
-- 数据来源: purinefood.com/zh/categories

${sqlStatements.join('\n\n')}`;

    const filePath = path.join(__dirname, '..', 'sql', 'insert-complete-food-data.sql');
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, sqlContent, 'utf8');
    console.log(`完整SQL文件已保存到: ${filePath}`);

    return filePath;
}

// 执行SQL导入
async function importToDatabase(sqlFilePath) {
    try {
        console.log(`开始执行SQL导入: ${sqlFilePath}`);

        // 读取SQL文件
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

        // 分割SQL语句（按双换行符分割）
        const sqlStatements = sqlContent
            .split('\n\n')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        console.log(`找到 ${sqlStatements.length} 条SQL语句`);

        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        // 逐条执行SQL语句
        for (let i = 0; i < sqlStatements.length; i++) {
            const sql = sqlStatements[i];

            try {
                // 解析SQL语句中的数据
                const match = sql.match(/INSERT INTO food_library \(id, name_cn, category, purine_level, purine_mg, description, created_at\) VALUES \(([^,]+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*([^,]+),\s*'([^']*)',\s*CURRENT_TIMESTAMP\)/);

                if (match) {
                    const [, id, name_cn, category, purine_level, purine_mg, description] = match;

                    // 使用标准插入方法
                    const { data, error } = await supabase
                        .from('food_library')
                        .insert({
                            id: id,
                            name_cn: name_cn,
                            category: category,
                            purine_level: purine_level,
                            purine_mg: purine_mg === 'NULL' ? null : parseFloat(purine_mg),
                            description: description,
                            created_at: new Date().toISOString()
                        });

                    if (error) {
                        console.error(`第 ${i + 1} 条语句执行失败:`, error.message);
                        errors.push({ index: i + 1, error: error.message, sql: sql.substring(0, 100) + '...' });
                        errorCount++;
                    } else {
                        successCount++;

                        // 每100条显示一次进度
                        if (successCount % 100 === 0) {
                            console.log(`已成功导入 ${successCount} 条数据...`);
                        }
                    }
                } else {
                    console.error(`第 ${i + 1} 条SQL语句格式不正确`);
                    errors.push({ index: i + 1, error: 'SQL格式不正确', sql: sql.substring(0, 100) + '...' });
                    errorCount++;
                }
            } catch (err) {
                console.error(`第 ${i + 1} 条语句执行异常:`, err.message);
                errors.push({ index: i + 1, error: err.message, sql: sql.substring(0, 100) + '...' });
                errorCount++;
            }

            // 添加延迟避免请求过快
            if (i < sqlStatements.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }

        console.log('\n导入结果:');
        console.log(`成功: ${successCount} 条`);
        console.log(`失败: ${errorCount} 条`);
        console.log(`总计: ${sqlStatements.length} 条`);

        if (errors.length > 0) {
            console.log('\n错误详情:');
            errors.forEach(err => {
                console.log(`语句 ${err.index}: ${err.error}`);
                console.log(`SQL: ${err.sql}`);
            });
        }

        return { successCount, errorCount, total: sqlStatements.length, errors };
    } catch (error) {
        console.error('导入失败:', error);
        throw error;
    }
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
        .select('category, count', { count: 'exact' });

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
        console.log(`${category}: ${count} 个`);
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
        console.log('开始完整食物数据导入...');
        console.log(`使用数据库: ${supabaseUrl}`);

        // 生成完整SQL
        console.log('\n生成完整SQL数据...');
        const sqlStatements = generateCompleteSQL();

        // 保存SQL文件
        const sqlFilePath = saveCompleteSQL(sqlStatements);

        // 询问是否直接导入数据库
        console.log('\nSQL文件已生成，现在开始导入数据库...');

        // 执行导入
        const result = await importToDatabase(sqlFilePath);

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

module.exports = { generateCompleteSQL, saveCompleteSQL, importToDatabase, verifyImport };