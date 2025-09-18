const fs = require('fs');
const path = require('path');

// Fix vegetables count to exactly 153 items
const vegetablesData = require('../data/vegetables-complete.js');

console.log('原始蔬菜类数量:', vegetablesData.length);

// Ensure exactly 153 items
const fixedData = vegetablesData.slice(0, 153);

console.log('修正后蔬菜类数量:', fixedData.length);

// Create the fixed data file
const dataDir = path.join(__dirname, '..', 'data');
const outputFile = path.join(dataDir, 'vegetables-complete.js');

const content = `// 蔬菜类完整数据集 (${fixedData.length}种)
module.exports = ${JSON.stringify(fixedData, null, 2)};
`;

fs.writeFileSync(outputFile, content);
console.log(`✅ 修正蔬菜类数据文件: ${outputFile} (${fixedData.length}条)`);