const fs = require('fs');
const path = require('path');

// Generate exactly 6 unique alcohol and drinks items
const generateAlcoholDrinksData = () => {
  const data = [
    {
      name: '啤酒',
      purine: 800,
      level: 'very_high',
      desc: '啤酒，嘌呤含量极高，痛风患者禁止食用'
    },
    {
      name: '白酒',
      purine: 200,
      level: 'very_high',
      desc: '白酒，嘌呤含量极高，痛风患者禁止食用'
    },
    {
      name: '红酒',
      purine: 150,
      level: 'medium',
      desc: '红酒，嘌呤含量中等，痛风患者需适量食用'
    },
    {
      name: '黄酒',
      purine: 180,
      level: 'very_high',
      desc: '黄酒，嘌呤含量极高，痛风患者禁止食用'
    },
    {
      name: '洋酒',
      purine: 160,
      level: 'medium',
      desc: '洋酒，嘌呤含量中等，痛风患者需适量食用'
    },
    {
      name: '含糖饮料',
      purine: 50,
      level: 'low',
      desc: '含糖饮料，嘌呤含量低，适合痛风患者食用'
    }
  ];

  // Verify we have exactly 6 items
  if (data.length !== 6) {
    console.error(`❌ 数据数量错误，应为6种，实际为${data.length}种`);
    process.exit(1);
  }

  return data;
};

const alcoholDrinksData = generateAlcoholDrinksData();

// Create the data file
const dataDir = path.join(__dirname, '..', 'data');
const outputFile = path.join(dataDir, 'alcohol-drinks-complete.js');

const content = `// 酒／饮料类完整数据集 (${alcoholDrinksData.length}种)
module.exports = ${JSON.stringify(alcoholDrinksData, null, 2)};
`;

fs.writeFileSync(outputFile, content);
console.log(`✅ 创建酒／饮料类数据文件: ${outputFile} (${alcoholDrinksData.length}条)`);