const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

// 从环境变量获取Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('错误：缺少Supabase配置，请检查环境变量');
  console.error('需要设置 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQLFile(filePath) {
  try {
    console.log(`读取SQL文件: ${filePath}`);

    // 读取SQL文件
    const sqlContent = fs.readFileSync(filePath, 'utf8');

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
        // 使用RPC调用执行SQL
        const { data, error } = await supabase.rpc('exec_sql', { sql_statement: sql });

        if (error) {
          console.error(`第 ${i + 1} 条语句执行失败:`, error.message);
          errors.push({ index: i + 1, error: error.message, sql: sql.substring(0, 100) + '...' });
          errorCount++;
        } else {
          console.log(`第 ${i + 1} 条语句执行成功`);
          successCount++;
        }
      } catch (err) {
        console.error(`第 ${i + 1} 条语句执行异常:`, err.message);
        errors.push({ index: i + 1, error: err.message, sql: sql.substring(0, 100) + '...' });
        errorCount++;
      }

      // 添加延迟避免请求过快
      if (i < sqlStatements.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('\n执行结果:');
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
    console.error('执行SQL文件失败:', error);
    throw error;
  }
}

async function main() {
  try {
    const sqlFile = path.join(__dirname, '..', 'sql', 'insert-all-categories-data.sql');

    console.log('开始执行食物数据导入...');
    console.log(`使用数据库: ${supabaseUrl}`);

    const result = await executeSQLFile(sqlFile);

    if (result.errorCount === 0) {
      console.log('\n✅ 所有数据导入成功！');
    } else {
      console.log('\n⚠️ 部分数据导入失败，请检查错误信息');
    }

    // 验证导入结果
    console.log('\n验证导入结果...');
    const { data: foods, error: countError } = await supabase
      .from('food_library')
      .select('*', { count: 'exact' });

    if (countError) {
      console.error('获取统计数据失败:', countError.message);
    } else {
      console.log(`数据库中现有 ${foods?.length || 0} 个食物记录`);

      // 获取分类统计
      const { data: stats } = await supabase
        .from('food_library')
        .select('category, count', { count: 'exact' });

      if (stats) {
        console.log('\n分类统计:');
        const categoryCount = {};
        stats.forEach(stat => {
          categoryCount[stat.category] = stat.count;
        });

        Object.entries(categoryCount).forEach(([category, count]) => {
          console.log(`${category}: ${count} 个`);
        });
      }
    }

  } catch (error) {
    console.error('导入失败:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { executeSQLFile };