const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 从 .env.local 读取配置
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('请在 .env.local 文件中设置 SUPABASE_URL 和 SUPABASE_SERVICE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 读取 SQL 文件
const sqlPath = path.join(__dirname, 'supabase-setup.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

async function executeSQL() {
    try {
        console.log('正在执行 Supabase 数据库设置...');

        // 将 SQL 分成单独的语句
        const statements = sql.split(';').filter(s => s.trim());

        for (let statement of statements) {
            if (statement.trim()) {
                console.log('执行:', statement.trim().substring(0, 50) + '...');

                // 使用 rpc 调用来执行 SQL
                const { error } = await supabase.rpc('exec', {
                    query: statement.trim()
                });

                if (error) {
                    console.error('执行错误:', error.message);
                } else {
                    console.log('✓ 执行成功');
                }
            }
        }

        console.log('数据库设置完成！');

    } catch (error) {
        console.error('错误:', error.message);
    }
}

executeSQL();