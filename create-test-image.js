const { createCanvas, loadImage } = require('canvas');

// 创建画布
const canvas = createCanvas(800, 600);
const ctx = canvas.getContext('2d');

// 设置背景色
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, 800, 600);

// 设置文字样式
ctx.fillStyle = '#000000';
ctx.font = '24px Arial';
ctx.textAlign = 'center';

// 绘制报告标题
ctx.fillText('生化检验报告单', 400, 50);

ctx.font = '16px Arial';
ctx.textAlign = 'left';

// 绘制基本信息
ctx.fillText('检验日期：2024-03-15', 50, 100);
ctx.fillText('姓名：张三 | 性别：男 | 年龄：35岁', 50, 130);

// 绘制表格
ctx.strokeStyle = '#000000';
ctx.lineWidth = 2;

// 表头
ctx.strokeRect(50, 160, 700, 40);
ctx.fillText('检验项目', 60, 185);
ctx.fillText('结果', 200, 185);
ctx.fillText('单位', 300, 185);
ctx.fillText('参考范围', 400, 185);
ctx.fillText('状态', 550, 185);

// 尿酸行
ctx.strokeRect(50, 200, 700, 40);
ctx.fillText('尿酸 (UA)', 60, 225);
ctx.fillText('425', 200, 225);
ctx.fillText('μmol/L', 300, 225);
ctx.fillText('150-420', 400, 225);
ctx.fillStyle = '#ff0000';
ctx.fillText('偏高', 550, 225);
ctx.fillStyle = '#000000';

// 其他项目行
ctx.strokeRect(50, 240, 700, 40);
ctx.fillText('肌酐', 60, 265);
ctx.fillText('75', 200, 265);
ctx.fillText('μmol/L', 300, 265);
ctx.fillText('59-104', 400, 265);
ctx.fillStyle = '#00aa00';
ctx.fillText('正常', 550, 265);
ctx.fillStyle = '#000000';

// 页脚信息
ctx.fillText('检验医生：李医生', 50, 320);
ctx.fillText('报告日期：2024-03-15', 50, 350);

// 保存图片
const fs = require('fs');
const out = fs.createWriteStream('/Users/luohuacong/Documents/project/尿酸助手/test-report.png');
const stream = canvas.createPNGStream();
stream.pipe(out);

out.on('finish', () => {
    console.log('Test medical report image created successfully');
});