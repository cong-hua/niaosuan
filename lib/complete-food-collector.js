const fs = require('fs');
const path = require('path');

// 嘌呤等级映射
const PURINE_LEVEL_MAP = {
  '低': 'low',
  '中': 'medium',
  '高': 'high',
  '极高': 'very_high',
  '未知': 'unknown'
};

// 嘌呤等级描述映射
const PURINE_DESCRIPTION_MAP = {
  'low': '低嘌呤食物，适合痛风患者食用',
  'medium': '中等嘌呤食物，痛风患者需适量食用',
  'high': '高嘌呤食物，痛风患者应避免食用',
  'very_high': '极高嘌呤食物，痛风患者绝对禁止食用',
  'unknown': '嘌呤含量未知'
};

class CompleteFoodCollector {
  constructor() {
    this.collectedData = [];
    this.baseUrl = 'https://purinefood.com';
  }

  // 根据嘌呤含量自动判断等级
  autoDetectPurineLevel(purine_mg) {
    if (purine_mg === null || purine_mg === undefined) return 'unknown';
    if (purine_mg < 25) return 'low';
    if (purine_mg < 150) return 'medium';
    if (purine_mg < 300) return 'high';
    return 'very_high';
  }

  // 生成描述信息
  generateDescription(foodName, purineLevel, purineMg) {
    const level = purineLevel || this.autoDetectPurineLevel(purineMg);
    let description = PURINE_DESCRIPTION_MAP[level];

    if (purineMg) {
      description += `，嘌呤含量为${purineMg}mg/100g`;
    }

    return description;
  }

  // 从手动输入的数据中提取食物信息
  extractFoodInfo(name, category, content, purineInfo) {
    const food = {
      name_cn: name,
      category: category,
      aliases: [],
      description: '',
      purine_level: 'unknown',
      purine_mg: null,
      source_url: ''
    };

    // 提取别名
    const aliasMatch = content.match(/别名：([^，。\n]+)/);
    if (aliasMatch) {
      food.aliases = aliasMatch[1].split('、').map(a => a.trim());
    }

    // 提取描述（取前100个字符作为描述）
    food.description = content.substring(0, 200) + '...';

    // 解析嘌呤信息
    if (purineInfo && purineInfo.includes('mg/100g')) {
      const purineMatch = purineInfo.match(/([\d.]+)mg\/100g/);
      if (purineMatch) {
        food.purine_mg = parseFloat(purineMatch[1]);
      }

      // 检测嘌呤等级
      const levelMatch = purineInfo.match(/text: (低|中|高|极高|未知)/);
      if (levelMatch) {
        food.purine_level = PURINE_LEVEL_MAP[levelMatch[1]] || 'unknown';
      } else {
        food.purine_level = this.autoDetectPurineLevel(food.purine_mg);
      }

      // 检测范围值（如 "25-150mg/100g"）
      const rangeMatch = purineInfo.match(/([\d.]+)-([\d.]+)mg\/100g/);
      if (rangeMatch) {
        food.purine_mg = (parseFloat(rangeMatch[1]) + parseFloat(rangeMatch[2])) / 2;
        food.purine_level = 'high';
      }

      // 检测特殊值（如 "≥150mg/100g"）
      const specialMatch = purineInfo.match(/≥([\d.]+)mg\/100g/);
      if (specialMatch) {
        food.purine_mg = parseFloat(specialMatch[1]);
        food.purine_level = 'high';
      }
    }

    // 生成最终描述
    food.description = this.generateDescription(food.name_cn, food.purine_level, food.purine_mg);

    return food;
  }

  // 生成SQL插入语句
  generateSQLInsert(foodData) {
    const sqlStatements = [];

    foodData.forEach(food => {
      const id = `uuid_generate_v4()`;
      const name_cn = food.name_cn.replace(/'/g, "''");
      const category = food.category.replace(/'/g, "''");
      const purine_level = food.purine_level || this.autoDetectPurineLevel(food.purine_mg);
      const purine_mg = food.purine_mg || 'NULL';
      const description = this.generateDescription(food.name_cn, purine_level, food.purine_mg).replace(/'/g, "''");

      const sql = `INSERT INTO food_library (id, name_cn, category, purine_level, purine_mg, description, created_at)
VALUES (${id}, '${name_cn}', '${category}', '${purine_level}', ${purine_mg}, '${description}', CURRENT_TIMESTAMP);`;

      sqlStatements.push(sql);
    });

    return sqlStatements;
  }

  // 保存数据到文件
  saveDataToFile(data, filename) {
    const filePath = path.join(__dirname, '..', 'data', filename);
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`数据已保存到: ${filePath}`);
  }

  // 保存SQL到文件
  saveSQLToFile(sqlStatements, filename) {
    const filePath = path.join(__dirname, '..', 'sql', filename);
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, sqlStatements.join('\n\n'), 'utf8');
    console.log(`SQL文件已保存到: ${filePath}`);
  }

  // 处理收集到的数据
  processCollectedData(rawData) {
    const processedData = [];

    rawData.forEach(item => {
      const processed = {
        ...item,
        purine_level: item.purine_level || this.autoDetectPurineLevel(item.purine_mg),
        description: this.generateDescription(item.name_cn, item.purine_level, item.purine_mg)
      };

      processedData.push(processed);
    });

    return processedData;
  }

  // 验证数据质量
  validateData(data) {
    const issues = [];

    data.forEach((item, index) => {
      if (!item.name_cn || item.name_cn.trim() === '') {
        issues.push(`第${index + 1}项: 食物名称为空`);
      }

      if (!item.category || item.category.trim() === '') {
        issues.push(`第${index + 1}项: 食物分类为空`);
      }

      if (item.purine_mg !== null && (item.purine_mg < 0 || item.purine_mg > 2000)) {
        issues.push(`第${index + 1}项: 嘌呤含量值异常 (${item.purine_mg})`);
      }
    });

    return issues;
  }
}

module.exports = CompleteFoodCollector;