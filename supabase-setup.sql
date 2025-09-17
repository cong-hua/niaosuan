-- 创建 uuid-ossp 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建 food_library 表
CREATE TABLE IF NOT EXISTS food_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_cn TEXT NOT NULL,
    category TEXT,
    purine_level TEXT NOT NULL,
    purine_mg FLOAT8,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 插入样例数据
INSERT INTO food_library (name_cn, category, purine_level, purine_mg, description) VALUES
('红烧牛肉', '肉类', 'high', 110, '嘌呤非常高，痛风患者请避免'),
('苹果', '水果', 'low', 14, '嘌呤低，可适量食用'),
('啤酒', '饮品', 'high', 120, '酒精与嘌呤都高，应尽量不喝'),
('豆腐', '豆制品', 'medium', 55, '嘌呤适中，痛风患者需适量'),
('菠菜', '蔬菜', 'medium', 57, '嘌呤适中，但营养丰富'),
('白米饭', '主食', 'low', 6, '嘌呤很低，日常可安全食用'),
('猪肝', '内脏', 'very_high', 229, '嘌呤极高，痛风患者绝对禁止'),
('香蕉', '水果', 'low', 11, '嘌呤低，适合痛风患者'),
('绿茶', '饮品', 'low', 3, '嘌呤极低，且有利尿作用'),
('虾', '海鲜', 'high', 137, '嘌呤高，痛风急性期禁止食用');