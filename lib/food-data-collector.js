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

// 食物分类映射
const CATEGORY_MAP = {
  1: '谷薯类及其制品',
  2: '蔬菜类',
  3: '豆类及豆制品',
  4: '肉／水产类',
  5: '蛋／奶类',
  6: '水果类',
  7: '硬／干果类',
  8: '其它',
  9: '酒／饮料类',
  10: '菇／菌类'
};

class FoodDataCollector {
  constructor() {
    this.collectedData = [];
    this.baseUrl = 'https://purinefood.com';
  }

  // 从网页快照中提取食物数据
  extractFoodDataFromSnapshot(snapshot, categoryId, categoryName) {
    const foodItems = [];

    // 解析快照数据，提取食物信息
    const lines = snapshot.split('\n');
    let currentFood = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 检测食物标题行
      if (line.includes('heading') && line.includes('level=2')) {
        // 提取食物名称
        const nameMatch = line.match(/"([^"]+)"/);
        if (nameMatch) {
          currentFood = {
            name_cn: nameMatch[1],
            category: categoryName,
            aliases: [],
            description: '',
            purine_level: 'unknown',
            purine_mg: null,
            source_url: ''
          };
        }
      }

      // 检测别名信息
      if (currentFood && line.includes('别名：')) {
        const aliasMatch = line.match(/别名：([^，。]+)/);
        if (aliasMatch) {
          currentFood.aliases = aliasMatch[1].split('、').map(a => a.trim());
        }
      }

      // 检测嘌呤含量信息
      if (currentFood && line.includes('mg/100g')) {
        const purineMatch = line.match(/([\d.]+)mg\/100g/);
        if (purineMatch) {
          currentFood.purine_mg = parseFloat(purineMatch[1]);
        }

        // 检测嘌呤等级
        const levelMatch = line.match(/text: (低|中|高|极高|未知)/);
        if (levelMatch) {
          currentFood.purine_level = PURINE_LEVEL_MAP[levelMatch[1]] || 'unknown';
        }

        // 检测范围值（如 "25-150mg/100g"）
        const rangeMatch = line.match(/([\d.]+)-([\d.]+)mg\/100g/);
        if (rangeMatch) {
          currentFood.purine_mg = (parseFloat(rangeMatch[1]) + parseFloat(rangeMatch[2])) / 2;
          currentFood.purine_level = 'high'; // 范围值通常表示高嘌呤
        }

        // 检测特殊值（如 "≥150mg/100g"）
        const specialMatch = line.match(/≥([\d.]+)mg\/100g/);
        if (specialMatch) {
          currentFood.purine_mg = parseFloat(specialMatch[1]);
          currentFood.purine_level = 'high';
        }

        foodItems.push({...currentFood});
        currentFood = null;
      }
    }

    return foodItems;
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
}

module.exports = FoodDataCollector;