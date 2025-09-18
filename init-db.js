const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ 环境变量缺失，请检查 SUPABASE_URL 和 SUPABASE_SERVICE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const createTables = async () => {
    console.log('🚀 开始创建数据库表...');

    try {
        // 检查连接
        const { data, error } = await supabase.from('food_library').select('count').limit(1);
        if (error) {
            console.error('❌ 数据库连接失败:', error.message);
            return;
        }
        console.log('✅ 数据库连接成功');

        // 创建用户表（如果不存在）
        console.log('📋 创建用户表...');
        const { error: usersError } = await supabase.rpc('exec', {
            query: `
                CREATE TABLE IF NOT EXISTS users (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    username TEXT UNIQUE,
                    phone TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            `
        });

        if (usersError) {
            console.log('⚠️  用户表创建可能失败，尝试继续...');
        } else {
            console.log('✅ 用户表创建成功');
        }

        // 创建尿酸记录表
        console.log('📋 创建尿酸记录表...');
        const { error: recordsError } = await supabase.rpc('exec', {
            query: `
                CREATE TABLE IF NOT EXISTS uric_acid_records (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    value FLOAT8 NOT NULL CHECK (value > 0),
                    measurement_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    notes TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                )
            `
        });

        if (recordsError) {
            console.log('⚠️  尿酸记录表创建可能失败，尝试继续...');
        } else {
            console.log('✅ 尿酸记录表创建成功');
        }

        console.log('🎉 数据库表创建完成！');

    } catch (error) {
        console.error('❌ 创建表时发生错误:', error.message);
        console.log('💡 请手动在 Supabase 控制台执行 create-tables.sql 文件中的 SQL 语句');
    }
};

createTables();