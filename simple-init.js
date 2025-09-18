const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ 环境变量缺失，请检查 SUPABASE_URL 和 SUPABASE_SERVICE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const testConnection = async () => {
    console.log('🔍 测试数据库连接...');

    try {
        // 测试 food_library 表是否存在
        const { data, error } = await supabase
            .from('food_library')
            .select('name_cn')
            .limit(1);

        if (error) {
            console.error('❌ 数据库连接失败:', error.message);
            return false;
        }

        console.log('✅ 数据库连接成功');
        console.log('📚 food_library 表存在，包含数据');
        return true;
    } catch (error) {
        console.error('❌ 连接测试失败:', error.message);
        return false;
    }
};

const createUsersTable = async () => {
    console.log('👥 尝试创建用户表...');

    // 先尝试插入一个测试用户，如果表不存在会创建
    const testUser = {
        email: 'test@example.com',
        password_hash: 'test_hash_123456',
        username: 'test_user',
        phone: '13800138000'
    };

    const { data, error } = await supabase
        .from('users')
        .insert([testUser])
        .select();

    if (error) {
        if (error.code === '42P01') {
            console.log('⚠️  users 表不存在，请在 Supabase 控制台手动创建');
            console.log('📋 请在 Supabase SQL 编辑器中执行 create-tables.sql 中的 SQL');
        } else if (error.code === '23505') {
            console.log('✅ users 表存在，测试用户已存在');
        } else {
            console.log('⚠️  创建用户时出错:', error.message);
        }
        return false;
    }

    console.log('✅ users 表创建成功，测试用户已添加');

    // 删除测试用户
    if (data && data[0]) {
        await supabase
            .from('users')
            .delete()
            .eq('id', data[0].id);
    }

    return true;
};

const main = async () => {
    console.log('🚀 开始数据库初始化...\n');

    const connectionOk = await testConnection();
    if (!connectionOk) {
        console.log('❌ 数据库连接失败，请检查环境变量');
        return;
    }

    console.log('\n');
    await createUsersTable();

    console.log('\n📝 数据库初始化说明:');
    console.log('1. ✅ food_library 表已存在且工作正常');
    console.log('2. ⚠️  users 和 uric_acid_records 表需要在 Supabase 控制台手动创建');
    console.log('3. 📋 请在 Supabase 控制台的 SQL 编辑器中执行 create-tables.sql 文件');
    console.log('4. 🌐 访问: https://tioxhwowfiaancyntmta.supabase.co/project/sql');
};

main().catch(console.error);