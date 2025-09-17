const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('请在 .env.local 文件中设置 SUPABASE_URL 和 SUPABASE_SERVICE_KEY');
    process.exit(1);
}

// 读取 SQL 文件
const sqlPath = path.join(__dirname, 'supabase-setup.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

// 将 SQL 分成单独的语句
const statements = sql.split(';').filter(s => s.trim());

console.log('Supabase 项目 URL:', supabaseUrl);
console.log('数据库设置步骤:');
console.log('1. 创建 uuid-ossp 扩展');
console.log('2. 创建 food_library 表');
console.log('3. 插入样例数据');
console.log('');
console.log('请在 Dia 浏览器中打开 https://supabase.com/dashboard');
console.log('然后进入项目 "尿酸助手" → SQL Editor，粘贴以下内容:');
console.log('');
console.log(sql);
console.log('');
console.log('或者直接访问:');
console.log('https://tioxhwowfiaancyntmta.supabase.co/dashboard/sql');
console.log('');
console.log('数据库密码: uric-acid-assistant-2025');