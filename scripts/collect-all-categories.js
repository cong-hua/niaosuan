const FoodDataCollector = require('../lib/food-data-collector');

// 所有分类的食物数据
const allCategoriesData = {
  // 谷薯类及其制品 - 已在上面脚本中处理
  '谷薯类及其制品': require('./collect-food-data').sampleFoodData,

  // 肉／水产类 - 示例数据
  '肉／水产类': [
    {
      name_cn: "白带鱼皮",
      category: "肉／水产类",
      aliases: [],
      description: "白带鱼皮",
      purine_level: "very_high",
      purine_mg: 350
    },
    {
      name_cn: "小鱼干",
      category: "肉／水产类",
      aliases: [],
      description: "小鱼干",
      purine_level: "very_high",
      purine_mg: 1538
    },
    {
      name_cn: "小牛颈肉",
      category: "肉／水产类",
      aliases: [],
      description: "小牛颈肉",
      purine_level: "high",
      purine_mg: 150
    },
    {
      name_cn: "熏鲱鱼",
      category: "肉／水产类",
      aliases: [],
      description: "熏鲱鱼",
      purine_level: "high",
      purine_mg: 378
    },
    {
      name_cn: "胰脏",
      category: "肉／水产类",
      aliases: [],
      description: "胰脏",
      purine_level: "very_high",
      purine_mg: 825
    },
    {
      name_cn: "羊脾",
      category: "肉／水产类",
      aliases: [],
      description: "羊脾",
      purine_level: "high",
      purine_mg: 196
    },
    {
      name_cn: "熏羊脾",
      category: "肉／水产类",
      aliases: [],
      description: "熏羊脾",
      purine_level: "high",
      purine_mg: 196
    },
    {
      name_cn: "公牛肝",
      category: "肉／水产类",
      aliases: [],
      description: "公牛肝",
      purine_level: "very_high",
      purine_mg: 233
    },
    {
      name_cn: "炸鸡",
      category: "肉／水产类",
      aliases: [],
      description: "炸鸡",
      purine_level: "high",
      purine_mg: 152
    },
    {
      name_cn: "猪脾/猪横脷",
      category: "肉／水产类",
      aliases: [],
      description: "猪脾/猪横脷",
      purine_level: "high",
      purine_mg: 270
    }
  ],

  // 蔬菜类 - 示例数据
  '蔬菜类': [
    {
      name_cn: "豆苗菜",
      category: "蔬菜类",
      aliases: [],
      description: "豆苗菜",
      purine_level: "medium",
      purine_mg: 52
    },
    {
      name_cn: "芦笋",
      category: "蔬菜类",
      aliases: [],
      description: "芦笋",
      purine_level: "medium",
      purine_mg: 28
    },
    {
      name_cn: "椰菜花",
      category: "蔬菜类",
      aliases: [],
      description: "椰菜花",
      purine_level: "medium",
      purine_mg: 29
    },
    {
      name_cn: "蒜苔",
      category: "蔬菜类",
      aliases: [],
      description: "蒜苔",
      purine_level: "medium",
      purine_mg: 30
    },
    {
      name_cn: "蒜黄",
      category: "蔬菜类",
      aliases: [],
      description: "蒜黄",
      purine_level: "medium",
      purine_mg: 31
    },
    {
      name_cn: "蒜苗",
      category: "蔬菜类",
      aliases: [],
      description: "蒜苗",
      purine_level: "medium",
      purine_mg: 32
    },
    {
      name_cn: "龙须菜",
      category: "蔬菜类",
      aliases: [],
      description: "龙须菜",
      purine_level: "medium",
      purine_mg: 33
    },
    {
      name_cn: "柠檬萱草",
      category: "蔬菜类",
      aliases: [],
      description: "柠檬萱草",
      purine_level: "medium",
      purine_mg: 34
    },
    {
      name_cn: "金针菜",
      category: "蔬菜类",
      aliases: [],
      description: "金针菜",
      purine_level: "medium",
      purine_mg: 35
    },
    {
      name_cn: "西兰花",
      category: "蔬菜类",
      aliases: ["绿菜花"],
      description: "西兰花",
      purine_level: "medium",
      purine_mg: 36
    }
  ],

  // 豆类及豆制品 - 示例数据
  '豆类及豆制品': [
    {
      name_cn: "发芽的豆类",
      category: "豆类及豆制品",
      aliases: [],
      description: "发芽的豆类",
      purine_level: "medium",
      purine_mg: 52
    },
    {
      name_cn: "纳豆",
      category: "豆类及豆制品",
      aliases: [],
      description: "纳豆",
      purine_level: "medium",
      purine_mg: 215
    },
    {
      name_cn: "豆芽",
      category: "豆类及豆制品",
      aliases: [],
      description: "豆芽",
      purine_level: "medium",
      purine_mg: 52
    },
    {
      name_cn: "发芽豆类",
      category: "豆类及豆制品",
      aliases: [],
      description: "发芽豆类",
      purine_level: "medium",
      purine_mg: 52
    },
    {
      name_cn: "黑豆",
      category: "豆类及豆制品",
      aliases: [],
      description: "黑豆",
      purine_level: "medium",
      purine_mg: 137
    },
    {
      name_cn: "红芸豆",
      category: "豆类及豆制品",
      aliases: [],
      description: "红芸豆",
      purine_level: "medium",
      purine_mg: 126
    },
    {
      name_cn: "干黄豆",
      category: "豆类及豆制品",
      aliases: [],
      description: "干黄豆",
      purine_level: "medium",
      purine_mg: 166
    },
    {
      name_cn: "豌豆",
      category: "豆类及豆制品",
      aliases: [],
      description: "豌豆",
      purine_level: "medium",
      purine_mg: 82
    },
    {
      name_cn: "荷兰豆",
      category: "豆类及豆制品",
      aliases: [],
      description: "荷兰豆",
      purine_level: "medium",
      purine_mg: 82
    },
    {
      name_cn: "绿豆",
      category: "豆类及豆制品",
      aliases: [],
      description: "绿豆",
      purine_level: "medium",
      purine_mg: 166
    }
  ],

  // 水果类 - 示例数据
  '水果类': [
    {
      name_cn: "无花果",
      category: "水果类",
      aliases: [],
      description: "无花果",
      purine_level: "low",
      purine_mg: 5
    },
    {
      name_cn: "椰蓉",
      category: "水果类",
      aliases: [],
      description: "椰蓉",
      purine_level: "low",
      purine_mg: 2
    },
    {
      name_cn: "榴莲",
      category: "水果类",
      aliases: [],
      description: "榴莲",
      purine_level: "low",
      purine_mg: 3
    },
    {
      name_cn: "草莓",
      category: "水果类",
      aliases: [],
      description: "草莓",
      purine_level: "low",
      purine_mg: 4
    },
    {
      name_cn: "红车厘子",
      category: "水果类",
      aliases: [],
      description: "红车厘子",
      purine_level: "low",
      purine_mg: 5
    },
    {
      name_cn: "红樱桃",
      category: "水果类",
      aliases: [],
      description: "红樱桃",
      purine_level: "low",
      purine_mg: 5
    },
    {
      name_cn: "大樱桃",
      category: "水果类",
      aliases: [],
      description: "大樱桃",
      purine_level: "low",
      purine_mg: 5
    },
    {
      name_cn: "鹅莓",
      category: "水果类",
      aliases: [],
      description: "鹅莓",
      purine_level: "low",
      purine_mg: 4
    },
    {
      name_cn: "火龙果",
      category: "水果类",
      aliases: [],
      description: "火龙果",
      purine_level: "low",
      purine_mg: 3
    },
    {
      name_cn: "奇异果",
      category: "水果类",
      aliases: [],
      description: "奇异果",
      purine_level: "low",
      purine_mg: 8
    }
  ],

  // 硬／干果类 - 示例数据
  '硬／干果类': [
    {
      name_cn: "葵瓜子",
      category: "硬／干果类",
      aliases: [],
      description: "葵瓜子",
      purine_level: "medium",
      purine_mg: 79
    },
    {
      name_cn: "干葵花籽",
      category: "硬／干果类",
      aliases: [],
      description: "干葵花籽",
      purine_level: "medium",
      purine_mg: 79
    },
    {
      name_cn: "花生（熟）",
      category: "硬／干果类",
      aliases: [],
      description: "花生（熟）",
      purine_level: "medium",
      purine_mg: 79
    },
    {
      name_cn: "腰果",
      category: "硬／干果类",
      aliases: [],
      description: "腰果",
      purine_level: "medium",
      purine_mg: 79
    },
    {
      name_cn: "野生榛子（熟）",
      category: "硬／干果类",
      aliases: [],
      description: "野生榛子（熟）",
      purine_level: "medium",
      purine_mg: 79
    },
    {
      name_cn: "松子（熟）",
      category: "硬／干果类",
      aliases: [],
      description: "松子（熟）",
      purine_level: "medium",
      purine_mg: 79
    },
    {
      name_cn: "开心果（熟）",
      category: "硬／干果类",
      aliases: [],
      description: "开心果（熟）",
      purine_level: "medium",
      purine_mg: 79
    },
    {
      name_cn: "白芝麻（熟）",
      category: "硬／干果类",
      aliases: [],
      description: "白芝麻（熟）",
      purine_level: "medium",
      purine_mg: 57
    },
    {
      name_cn: "干李子",
      category: "硬／干果类",
      aliases: [],
      description: "干李子",
      purine_level: "low",
      purine_mg: 5
    },
    {
      name_cn: "李干",
      category: "硬／干果类",
      aliases: [],
      description: "李干",
      purine_level: "low",
      purine_mg: 5
    }
  ],

  // 蛋／奶类 - 示例数据
  '蛋／奶类': [
    {
      name_cn: "黑麦薄脆",
      category: "蛋／奶类",
      aliases: [],
      description: "黑麦薄脆",
      purine_level: "low",
      purine_mg: 35
    },
    {
      name_cn: "蛋糕",
      category: "蛋／奶类",
      aliases: [],
      description: "蛋糕",
      purine_level: "low",
      purine_mg: 35
    },
    {
      name_cn: "奶粉",
      category: "蛋／奶类",
      aliases: [],
      description: "奶粉",
      purine_level: "low",
      purine_mg: 15
    },
    {
      name_cn: "脱脂奶粉",
      category: "蛋／奶类",
      aliases: [],
      description: "脱脂奶粉",
      purine_level: "low",
      purine_mg: 15
    },
    {
      name_cn: "鹌鹑蛋",
      category: "蛋／奶类",
      aliases: [],
      description: "鹌鹑蛋",
      purine_level: "low",
      purine_mg: 35
    },
    {
      name_cn: "炼乳",
      category: "蛋／奶类",
      aliases: [],
      description: "炼乳",
      purine_level: "low",
      purine_mg: 15
    },
    {
      name_cn: "冰淇淋",
      category: "蛋／奶类",
      aliases: [],
      description: "冰淇淋",
      purine_level: "low",
      purine_mg: 20
    },
    {
      name_cn: "乳酪",
      category: "蛋／奶类",
      aliases: [],
      description: "乳酪",
      purine_level: "low",
      purine_mg: 15
    },
    {
      name_cn: "鸽子蛋",
      category: "蛋／奶类",
      aliases: [],
      description: "鸽子蛋",
      purine_level: "low",
      purine_mg: 35
    },
    {
      name_cn: "鹅蛋",
      category: "蛋／奶类",
      aliases: [],
      description: "鹅蛋",
      purine_level: "low",
      purine_mg: 35
    }
  ],

  // 酒／饮料类 - 示例数据
  '酒／饮料类': [
    {
      name_cn: "黄酒",
      category: "酒／饮料类",
      aliases: [],
      description: "黄酒",
      purine_level: "high",
      purine_mg: 12
    },
    {
      name_cn: "日本清酒",
      category: "酒／饮料类",
      aliases: [],
      description: "日本清酒",
      purine_level: "high",
      purine_mg: 12
    },
    {
      name_cn: "白兰地",
      category: "酒／饮料类",
      aliases: [],
      description: "白兰地",
      purine_level: "high",
      purine_mg: 12
    },
    {
      name_cn: "伏特加",
      category: "酒／饮料类",
      aliases: [],
      description: "伏特加",
      purine_level: "high",
      purine_mg: 12
    },
    {
      name_cn: "威士忌",
      category: "酒／饮料类",
      aliases: [],
      description: "威士忌",
      purine_level: "high",
      purine_mg: 12
    },
    {
      name_cn: "鸡尾酒",
      category: "酒／饮料类",
      aliases: [],
      description: "鸡尾酒",
      purine_level: "high",
      purine_mg: 12
    }
  ]
};

async function main() {
  const collector = new FoodDataCollector();

  console.log('开始处理所有分类的食物嘌呤数据...');

  let allData = [];
  let totalItems = 0;

  // 处理每个分类
  for (const [category, foods] of Object.entries(allCategoriesData)) {
    console.log(`处理分类: ${category} (${foods.length} 个食物)`);

    // 为每个食物添加分类信息
    const categoryData = foods.map(food => ({
      ...food,
      category: category
    }));

    allData = [...allData, ...categoryData];
    totalItems += foods.length;
  }

  // 处理收集到的数据
  const processedData = collector.processCollectedData(allData);

  // 保存原始数据
  collector.saveDataToFile(allData, 'all-categories-raw-data.json');

  // 保存处理后的数据
  collector.saveDataToFile(processedData, 'all-categories-processed-data.json');

  // 生成SQL语句
  const sqlStatements = collector.generateSQLInsert(processedData);
  collector.saveSQLToFile(sqlStatements, 'insert-all-categories-data.sql');

  console.log(`\n成功处理 ${processedData.length} 个食物数据（总共 ${totalItems} 个分类）`);
  console.log('数据已保存到 data/ 和 sql/ 目录');

  // 显示统计信息
  const stats = {
    total: processedData.length,
    low: processedData.filter(f => f.purine_level === 'low').length,
    medium: processedData.filter(f => f.purine_level === 'medium').length,
    high: processedData.filter(f => f.purine_level === 'high').length,
    very_high: processedData.filter(f => f.purine_level === 'very_high').length,
    unknown: processedData.filter(f => f.purine_level === 'unknown').length
  };

  console.log('\n嘌呤等级统计:');
  console.log(`低嘌呤: ${stats.low} 个 (${(stats.low/stats.total*100).toFixed(1)}%)`);
  console.log(`中等嘌呤: ${stats.medium} 个 (${(stats.medium/stats.total*100).toFixed(1)}%)`);
  console.log(`高嘌呤: ${stats.high} 个 (${(stats.high/stats.total*100).toFixed(1)}%)`);
  console.log(`极高嘌呤: ${stats.very_high} 个 (${(stats.very_high/stats.total*100).toFixed(1)}%)`);
  console.log(`未知: ${stats.unknown} 个 (${(stats.unknown/stats.total*100).toFixed(1)}%)`);

  // 显示分类统计
  console.log('\n分类统计:');
  const categoryStats = {};
  processedData.forEach(food => {
    if (!categoryStats[food.category]) {
      categoryStats[food.category] = 0;
    }
    categoryStats[food.category]++;
  });

  Object.entries(categoryStats).forEach(([category, count]) => {
    console.log(`${category}: ${count} 个`);
  });
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { allCategoriesData };