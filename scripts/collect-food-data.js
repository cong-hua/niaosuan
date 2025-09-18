const FoodDataCollector = require('../lib/food-data-collector');
const fs = require('fs');
const path = require('path');

// 示例数据 - 基于网页分析得到的食物嘌呤数据
const sampleFoodData = [
  // 谷薯类及其制品
  {
    name_cn: "糙米",
    category: "谷薯类及其制品",
    aliases: [],
    description: "糙米是稻谷脱去外保护皮层稻壳后的颖果",
    purine_level: "low",
    purine_mg: 35
  },
  {
    name_cn: "小麦",
    category: "谷薯类及其制品",
    aliases: ["麸麦"],
    description: "小麦的颖果是人类的主食之一",
    purine_level: "low",
    purine_mg: 12.1
  },
  {
    name_cn: "面粉",
    category: "谷薯类及其制品",
    aliases: ["白面", "小麦粉"],
    description: "面粉是一种由小麦磨成的粉状物",
    purine_level: "low",
    purine_mg: 26
  },
  {
    name_cn: "面条",
    category: "谷薯类及其制品",
    aliases: ["挂面", "卫生面", "汤面"],
    description: "面条一种用谷物或豆类的面粉加水磨成面团制成的条状食品",
    purine_level: "low",
    purine_mg: 19.8
  },
  {
    name_cn: "高粱米",
    category: "谷薯类及其制品",
    aliases: ["白高粱", "红高粱", "黄高粱"],
    description: "高粱脱壳后即为高梁米",
    purine_level: "low",
    purine_mg: 15
  },
  {
    name_cn: "玉米",
    category: "谷薯类及其制品",
    aliases: ["粟米"],
    description: "玉米中所含木质素，可使人体内的巨噬细胞的活力提高2~3倍",
    purine_level: "low",
    purine_mg: 9.4
  },
  {
    name_cn: "米粉",
    category: "谷薯类及其制品",
    aliases: [],
    description: "米粉以大米为原料，经浸泡、蒸煮和压条等工序制成的条状米制品",
    purine_level: "low",
    purine_mg: 11.1
  },
  {
    name_cn: "麦片",
    category: "谷薯类及其制品",
    aliases: [],
    description: "麦片是一种以小麦为原料加工而成的食品",
    purine_level: "low",
    purine_mg: 24.4
  },
  {
    name_cn: "糯米",
    category: "谷薯类及其制品",
    aliases: [],
    description: "糯米是糯稻脱壳的米，在中国南方称为糯米",
    purine_level: "medium",
    purine_mg: 50
  },
  {
    name_cn: "米糠",
    category: "谷薯类及其制品",
    aliases: [],
    description: "米糠主要是由果皮、种皮、外胚乳、糊粉层和胚加工制成的",
    purine_level: "medium",
    purine_mg: 54
  },
  {
    name_cn: "芋头",
    category: "谷薯类及其制品",
    aliases: ["香芋", "青芋", "毛芋头", "芋艿"],
    description: "芋头性平，味甘、辛，有小毒",
    purine_level: "low",
    purine_mg: 10.1
  },
  {
    name_cn: "荸荠/马蹄",
    category: "谷薯类及其制品",
    aliases: ["马蹄", "水栗"],
    description: "荸荠又名马蹄、水栗、乌芋、菩荠等",
    purine_level: "low",
    purine_mg: 2.6
  },
  {
    name_cn: "大豆/黄豆",
    category: "谷薯类及其制品",
    aliases: ["菽", "黄豆"],
    description: "大豆通称黄豆，大豆最常用来做各种豆制品、榨取豆油",
    purine_level: "low",
    purine_mg: 27
  },
  {
    name_cn: "普通大米",
    category: "谷薯类及其制品",
    aliases: [],
    description: "大米是稻谷经清理、砻谷、碾米、成品整理等工序后制成的成品",
    purine_level: "low",
    purine_mg: 35
  },
  {
    name_cn: "土豆淀粉",
    category: "谷薯类及其制品",
    aliases: ["马铃薯淀粉"],
    description: "马铃薯淀粉是由清洗干净的土豆粉粹，过滤，沉淀，将得到的沉淀物烘干即可获得",
    purine_level: "low",
    purine_mg: 5
  },
  {
    name_cn: "小麦胚芽",
    category: "谷薯类及其制品",
    aliases: ["麦芽粉", "胚芽"],
    description: "每100克全麦包含大约51毫克嘌呤",
    purine_level: "low",
    purine_mg: 25
  },
  {
    name_cn: "燕麦",
    category: "谷薯类及其制品",
    aliases: ["皮燕麦"],
    description: "燕麦是禾本科、燕麦属一年生草本植物",
    purine_level: "medium",
    purine_mg: 59
  },
  {
    name_cn: "薏仁米",
    category: "谷薯类及其制品",
    aliases: [],
    description: "薏仁米",
    purine_level: "low",
    purine_mg: 25
  },
  {
    name_cn: "通心粉",
    category: "谷薯类及其制品",
    aliases: [],
    description: "通心粉",
    purine_level: "low",
    purine_mg: 16.5
  },
  {
    name_cn: "干淀粉",
    category: "谷薯类及其制品",
    aliases: [],
    description: "干淀粉",
    purine_level: "low",
    purine_mg: 14.8
  },
  {
    name_cn: "木薯粉",
    category: "谷薯类及其制品",
    aliases: [],
    description: "木薯粉",
    purine_level: "low",
    purine_mg: 6
  },
  {
    name_cn: "甘薯（红心，杭州）",
    category: "谷薯类及其制品",
    aliases: ["红薯"],
    description: "红薯性味甘平、无毒，可补脾胃、养心神、益气力",
    purine_level: "low",
    purine_mg: 19
  },
  {
    name_cn: "冬粉",
    category: "谷薯类及其制品",
    aliases: [],
    description: "冬粉",
    purine_level: "low",
    purine_mg: 7.8
  },
  {
    name_cn: "面线",
    category: "谷薯类及其制品",
    aliases: [],
    description: "面线",
    purine_level: "low",
    purine_mg: 19.8
  },
  {
    name_cn: "麦芽",
    category: "谷薯类及其制品",
    aliases: [],
    description: "麦芽",
    purine_level: "high",
    purine_mg: 500
  },
  {
    name_cn: "黑麦等制成的薄脆饼干",
    category: "谷薯类及其制品",
    aliases: [],
    description: "黑麦等制成的薄脆饼干",
    purine_level: "medium",
    purine_mg: 60
  },
  {
    name_cn: "树薯粉",
    category: "谷薯类及其制品",
    aliases: [],
    description: "树薯粉",
    purine_level: "low",
    purine_mg: 6
  },
  {
    name_cn: "薏米",
    category: "谷薯类及其制品",
    aliases: [],
    description: "薏米(Coix lacryma-jobi L. var. ma-yuen)，又叫做薏苡仁、苡米、苡仁等",
    purine_level: "low",
    purine_mg: 15
  },
  {
    name_cn: "薏苡仁",
    category: "谷薯类及其制品",
    aliases: [],
    description: "薏苡仁",
    purine_level: "low",
    purine_mg: 5
  },
  {
    name_cn: "全麦",
    category: "谷薯类及其制品",
    aliases: [],
    description: "全麦",
    purine_level: "low",
    purine_mg: 24.4
  },
  {
    name_cn: "方便面",
    category: "谷薯类及其制品",
    aliases: ["方便面汤", "即食面", "泡面"],
    description: "方便面本身含嘌呤并不高，但其调味料的汤水应少喝为宜",
    purine_level: "high",
    purine_mg: 150
  },
  {
    name_cn: "三角麦",
    category: "谷薯类及其制品",
    aliases: [],
    description: "三角麦",
    purine_level: "low",
    purine_mg: 25
  },
  {
    name_cn: "乌麦",
    category: "谷薯类及其制品",
    aliases: [],
    description: "乌麦",
    purine_level: "low",
    purine_mg: 25
  },
  {
    name_cn: "花荞",
    category: "谷薯类及其制品",
    aliases: [],
    description: "花荞",
    purine_level: "low",
    purine_mg: 25
  },
  {
    name_cn: "莜麦",
    category: "谷薯类及其制品",
    aliases: [],
    description: "莜麦",
    purine_level: "low",
    purine_mg: 25
  },
  {
    name_cn: "山芋",
    category: "谷薯类及其制品",
    aliases: ["山竽"],
    description: "山芋",
    purine_level: "low",
    purine_mg: 10.1
  },
  {
    name_cn: "番薯/蕃薯",
    category: "谷薯类及其制品",
    aliases: ["甜薯", "地瓜", "红薯", "白薯", "甘薯"],
    description: "番薯性味甘平、无毒，可补脾胃、养心神、益气力",
    purine_level: "low",
    purine_mg: 5.6
  },
  {
    name_cn: "肥大米",
    category: "谷薯类及其制品",
    aliases: [],
    description: "肥大米",
    purine_level: "low",
    purine_mg: 5.6
  },
  {
    name_cn: "番芋",
    category: "谷薯类及其制品",
    aliases: [],
    description: "番芋",
    purine_level: "low",
    purine_mg: 5.6
  },
  {
    name_cn: "地瓜",
    category: "谷薯类及其制品",
    aliases: ["凉薯", "土瓜"],
    description: "地瓜是豆科豆薯属植物，豆薯的别称之一",
    purine_level: "low",
    purine_mg: 13
  },
  {
    name_cn: "大麦",
    category: "谷薯类及其制品",
    aliases: ["牟麦", "饭麦", "赤膊麦"],
    description: "大麦是禾本科、大麦属一年生草本植物",
    purine_level: "low",
    purine_mg: 47
  },
  {
    name_cn: "精白面条",
    category: "谷薯类及其制品",
    aliases: ["精白面粉"],
    description: "精白面条",
    purine_level: "low",
    purine_mg: 2.3
  },
  {
    name_cn: "白米饭",
    category: "谷薯类及其制品",
    aliases: [],
    description: "白米饭",
    purine_level: "low",
    purine_mg: 27.1
  },
  {
    name_cn: "精白面包",
    category: "谷薯类及其制品",
    aliases: [],
    description: "精白面包",
    purine_level: "low",
    purine_mg: 1.7
  },
  {
    name_cn: "风腊",
    category: "谷薯类及其制品",
    aliases: ["粟子", "毛栗", "板栗", "风栗"],
    description: "风腊，即为栗子，中医认为栗有补肾健脾、强身壮骨，益胃平肝等功效",
    purine_level: "low",
    purine_mg: 34.6
  },
  {
    name_cn: "肠粉",
    category: "谷薯类及其制品",
    aliases: ["拉肠"],
    description: "拉肠是一种使用米浆作成的广东地区传统名吃之一",
    purine_level: "low",
    purine_mg: 25
  },
  {
    name_cn: "馒头",
    category: "谷薯类及其制品",
    aliases: ["馍馍", "蒸馍"],
    description: "馒头，以小麦面粉，水，酵母，苏打为主要原料",
    purine_level: "low",
    purine_mg: 27
  },
  {
    name_cn: "面包（去皮）",
    category: "谷薯类及其制品",
    aliases: [],
    description: "面包也写作麺包，一种用五谷磨粉制作并加热而制成的食品",
    purine_level: "medium",
    purine_mg: 50
  },
  {
    name_cn: "木薯",
    category: "谷薯类及其制品",
    aliases: ["树葛"],
    description: "木薯的功效与作用消肿解毒",
    purine_level: "low",
    purine_mg: 31
  },
  {
    name_cn: "稻花香米",
    category: "谷薯类及其制品",
    aliases: ["香禾米", "香稻"],
    description: "香米的种类有很多，其类型包括香籼、香粳和香糯",
    purine_level: "low",
    purine_mg: 41
  },
  {
    name_cn: "陈醋",
    category: "谷薯类及其制品",
    aliases: ["山西老陈醋"],
    description: "陈醋是指酿成后存放较久的醋",
    purine_level: "low",
    purine_mg: 12
  },
  {
    name_cn: "甘薯（紫心，杭州）",
    category: "谷薯类及其制品",
    aliases: ["紫薯", "黑薯", "苕薯"],
    description: "紫薯又叫黑薯，薯肉呈紫色至深紫色",
    purine_level: "low",
    purine_mg: 24
  },
  {
    name_cn: "面筋",
    category: "谷薯类及其制品",
    aliases: ["水面筋", "素面筋", "油面筋"],
    description: "面筋是植物性蛋白质，由麦醇溶蛋白和麦谷蛋白组成",
    purine_level: "low",
    purine_mg: 25
  },
  {
    name_cn: "大米粥",
    category: "谷薯类及其制品",
    aliases: [],
    description: "米粥是一道以大米和水作为主要原料经大火煮沸熬制而成的美食",
    purine_level: "low",
    purine_mg: 25
  },
  {
    name_cn: "河粉",
    category: "谷薯类及其制品",
    aliases: ["沙河粉", "米面", "粿条"],
    description: "河粉原料是大米，自身的嘌呤含量不高",
    purine_level: "low",
    purine_mg: 25
  },
  {
    name_cn: "葛根粉",
    category: "谷薯类及其制品",
    aliases: ["粉葛", "葛粉"],
    description: "葛根粉是当下健康养生的食物，不含嘌呤成分",
    purine_level: "low",
    purine_mg: 0
  },
  {
    name_cn: "糍粑",
    category: "谷薯类及其制品",
    aliases: ["糯米粑"],
    description: "糍粑是用糯米蒸熟捣烂后所制成的一种食品",
    purine_level: "high",
    purine_mg: 87.5
  },
  {
    name_cn: "挂面",
    category: "谷薯类及其制品",
    aliases: ["卷面", "筒子面", "卫生面", "干面条"],
    description: "挂面是一种细若发丝、洁白光韧，并且耐存、耐煮的手工面食",
    purine_level: "low",
    purine_mg: 21
  },
  {
    name_cn: "西米",
    category: "谷薯类及其制品",
    aliases: ["西谷米"],
    description: "西米有的是用木薯粉、麦淀粉、苞谷粉加工而成",
    purine_level: "low",
    purine_mg: 25
  },
  {
    name_cn: "花卷",
    category: "谷薯类及其制品",
    aliases: [],
    description: "花卷是和包子、馒头类似的面食",
    purine_level: "low",
    purine_mg: 45
  },
  {
    name_cn: "包子(含酵母粉)",
    category: "谷薯类及其制品",
    aliases: ["肉包子"],
    description: "包子一般是用面粉发酵做成的，大小依据馅心的大小有所不同",
    purine_level: "high",
    purine_mg: 87.5
  },
  {
    name_cn: "培根",
    category: "谷薯类及其制品",
    aliases: ["烟肉"],
    description: "培根又名烟肉，是将猪未经腌熏等加工的猪胸肉/猪肋条肉",
    purine_level: "high",
    purine_mg: 87.5
  },
  {
    name_cn: "拉皮",
    category: "谷薯类及其制品",
    aliases: ["东北拉皮", "肉丝拉皮"],
    description: "东北拉皮是东北的名小吃，又称东北大拉皮",
    purine_level: "low",
    purine_mg: 3
  },
  {
    name_cn: "凉粉",
    category: "谷薯类及其制品",
    aliases: [],
    description: "凉粉是一种食物，主要原材料是凉粉草、大米、红薯和豌豆",
    purine_level: "low",
    purine_mg: 25
  },
  {
    name_cn: "面皮",
    category: "谷薯类及其制品",
    aliases: [],
    description: "面皮主要成分是面粉",
    purine_level: "low",
    purine_mg: 25
  },
  {
    name_cn: "粉条",
    category: "谷薯类及其制品",
    aliases: ["水晶粉条", "红薯粉条", "马铃薯粉条"],
    description: "粉条，是以红薯、马铃薯等为原料",
    purine_level: "low",
    purine_mg: 2
  },
  {
    name_cn: "黑苦荞",
    category: "谷薯类及其制品",
    aliases: ["苦荞麦", "黑苦荞茶", "黑苦荞麦", "苦荞茶", "黑珍珠"],
    description: "黑苦荞是荞麦的一种，多生长在高寒地区",
    purine_level: "low",
    purine_mg: 25
  },
  {
    name_cn: "油条",
    category: "谷薯类及其制品",
    aliases: ["果子", "大油条", "大果子", "油炸鬼"],
    description: "油条中含有食碱碳酸钠，无毒，但是多吃会破坏体内的酸碱平衡",
    purine_level: "low",
    purine_mg: 19
  },
  {
    name_cn: "无馅汤圆",
    category: "谷薯类及其制品",
    aliases: ["汤圆", "浮元子", "圆子"],
    description: "汤圆的外皮部分均以糯米粉为食材",
    purine_level: "low",
    purine_mg: 25
  },
  {
    name_cn: "芝麻汤圆",
    category: "谷薯类及其制品",
    aliases: ["麻心汤圆", "汤圆", "浮元子", "圆子"],
    description: "汤圆的外皮部分均以糯米粉为食材",
    purine_level: "medium",
    purine_mg: 80
  },
  {
    name_cn: "肉粽子",
    category: "谷薯类及其制品",
    aliases: ["粽子", "咸肉粽", "枧水粽", "糯米粽", "碱水粽"],
    description: "肉粽起源于福建泉州，是闽南地区以及台湾、东南亚等地区的特色传统美食",
    purine_level: "low",
    purine_mg: 18
  },
  {
    name_cn: "精粉",
    category: "谷薯类及其制品",
    aliases: ["精面粉", "精白面粉"],
    description: "精粉基本不含小麦皮，是磨面机第一道磨出来的面粉",
    purine_level: "low",
    purine_mg: 25
  },
  {
    name_cn: "白米",
    category: "谷薯类及其制品",
    aliases: [],
    description: "白米是稻米经过精制后的一种米",
    purine_level: "low",
    purine_mg: 18.1
  },
  {
    name_cn: "面包（带皮）",
    category: "谷薯类及其制品",
    aliases: [],
    description: "面包也写作麺包，一种用五谷磨粉制作并加热而制成的食品",
    purine_level: "medium",
    purine_mg: 51
  },
  {
    name_cn: "全麦粉",
    category: "谷薯类及其制品",
    aliases: [],
    description: "全麦粉，是指面粉中没有添加增白剂和增筋剂的原色原味面粉",
    purine_level: "low",
    purine_mg: 42
  },
  {
    name_cn: "麻花",
    category: "谷薯类及其制品",
    aliases: [],
    description: "麻花，是中国的一种特色油炸面食小吃",
    purine_level: "low",
    purine_mg: 39
  },
  {
    name_cn: "富强粉",
    category: "谷薯类及其制品",
    aliases: [],
    description: "富强粉是指一种比较精细、面筋含量高、杂质少、较白类似于精粉的高筋面粉",
    purine_level: "low",
    purine_mg: 37
  },
  {
    name_cn: "煎饼（大米味）",
    category: "谷薯类及其制品",
    aliases: [],
    description: "煎饼，是我国北方地区传统主食之一",
    purine_level: "low",
    purine_mg: 36
  },
  {
    name_cn: "稻花香米",
    category: "谷薯类及其制品",
    aliases: [],
    description: "五常香米，是黑龙江省五常市出产的大米",
    purine_level: "low",
    purine_mg: 34
  },
  {
    name_cn: "油饼",
    category: "谷薯类及其制品",
    aliases: ["油托"],
    description: "油饼和油条一样是老北京的风味",
    purine_level: "low",
    purine_mg: 27
  },
  {
    name_cn: "烧饼",
    category: "谷薯类及其制品",
    aliases: [],
    description: "烧饼，属大众化的烤烙面食，品种颇多",
    purine_level: "low",
    purine_mg: 27
  },
  {
    name_cn: "北大荒饺子粉",
    category: "谷薯类及其制品",
    aliases: ["饺子面粉"],
    description: "北大荒旧指中国黑龙江省北部在三江平原、黑龙江沿河平原及嫩江流域广大荒芜地区",
    purine_level: "low",
    purine_mg: 26
  },
  {
    name_cn: "小麦粉（绍兴）",
    category: "谷薯类及其制品",
    aliases: [],
    description: "小麦粉：用小麦加工的面粉，一般是指提取麸皮后的面粉",
    purine_level: "low",
    purine_mg: 25
  },
  {
    name_cn: "小麦粉（杭州）",
    category: "谷薯类及其制品",
    aliases: [],
    description: "小麦粉：用小麦加工的面粉，一般是指提取麸皮后的面粉",
    purine_level: "low",
    purine_mg: 22
  },
  {
    name_cn: "高筋粉",
    category: "谷薯类及其制品",
    aliases: ["强力粉"],
    description: "筋粉又叫强力粉，bread flour，筋度最强高筋粉蛋白质含量在12%以上",
    purine_level: "low",
    purine_mg: 21
  },
  {
    name_cn: "雪花粉（润良牌）",
    category: "谷薯类及其制品",
    aliases: ["雪花面粉"],
    description: "雪花面粉简称雪花粉，是小麦面粉的一种不同叫法",
    purine_level: "low",
    purine_mg: 18
  },
  {
    name_cn: "饺子粉（鹤泉牌）",
    category: "谷薯类及其制品",
    aliases: ["饺子面粉"],
    description: "饺子粉是面粉中的一种，普通面粉是中筋粉，饺子粉是高筋粉",
    purine_level: "low",
    purine_mg: 17
  },
  {
    name_cn: "虎皮糕",
    category: "谷薯类及其制品",
    aliases: ["虎皮蛋糕"],
    description: "虎皮糕是以面粉、白糖为主要原料的甜品",
    purine_level: "low",
    purine_mg: 13
  },
  {
    name_cn: "长白糕",
    category: "谷薯类及其制品",
    aliases: ["长白糕", "长远糕", "长软糕"],
    description: "长白糕，东北特产",
    purine_level: "low",
    purine_mg: 13
  },
  {
    name_cn: "粳米",
    category: "谷薯类及其制品",
    aliases: ["粳粟米", "蓬莱米"],
    description: "粳米，又称粳粟米等，与籼米相对应",
    purine_level: "low",
    purine_mg: 31
  },
  {
    name_cn: "油炸糕",
    category: "谷薯类及其制品",
    aliases: [],
    description: "油炸糕是东北地区、山西太原、大同、河北张家口及内蒙古丰镇地区传统特色糕点",
    purine_level: "low",
    purine_mg: 21
  },
  {
    name_cn: "粽子",
    category: "谷薯类及其制品",
    aliases: [],
    description: "粽子，由粽叶包裹糯米蒸制而成的食品",
    purine_level: "low",
    purine_mg: 12
  },
  {
    name_cn: "煎饼（玉米味）",
    category: "谷薯类及其制品",
    aliases: [],
    description: "煎饼，是我国北方地区传统主食之一",
    purine_level: "low",
    purine_mg: 46
  },
  {
    name_cn: "玉米面发糕",
    category: "谷薯类及其制品",
    aliases: [],
    description: "玉米面发糕是一种主食",
    purine_level: "low",
    purine_mg: 19
  },
  {
    name_cn: "小碴子",
    category: "谷薯类及其制品",
    aliases: ["小馇子"],
    description: "小碴子,玉米碴又称苞米碴，将玉米脱皮，每粒破碎三四份即成",
    purine_level: "low",
    purine_mg: 10
  },
  {
    name_cn: "大碴子",
    category: "谷薯类及其制品",
    aliases: ["大颗的玉米粒", "大馇子"],
    description: "大碴子，东北官话词汇，指大颗的玉米粒",
    purine_level: "low",
    purine_mg: 8
  },
  {
    name_cn: "雪饼",
    category: "谷薯类及其制品",
    aliases: ["大米饼"],
    description: "雪饼是用一种用精选大米制成的膨化食品",
    purine_level: "low",
    purine_mg: 28
  },
  {
    name_cn: "番薯粉干",
    category: "谷薯类及其制品",
    aliases: [],
    description: "素食养生：番薯粉干材料：红番薯、粉干",
    purine_level: "low",
    purine_mg: 2
  },
  {
    name_cn: "红薯（红心、杭州）",
    category: "谷薯类及其制品",
    aliases: ["甜薯", "地瓜", "番薯", "红薯"],
    description: "番薯性味甘平、无毒，可补脾胃、养心神、益气力",
    purine_level: "low",
    purine_mg: 12
  },
  {
    name_cn: "马铃薯",
    category: "谷薯类及其制品",
    aliases: ["洋芋", "荷兰薯", "地蛋", "薯仔", "土豆"],
    description: "马铃薯又名洋芋、洋山芋、洋芋头、香山芋、洋番芋、山洋芋、阳芋、地蛋、土豆等",
    purine_level: "low",
    purine_mg: 13
  },
  {
    name_cn: "小米",
    category: "谷薯类及其制品",
    aliases: ["粟米", "谷子"],
    description: "小米原名：粟，也称作粱、狗尾草、黄粟、粟米",
    purine_level: "low",
    purine_mg: 20
  },
  {
    name_cn: "react",
    category: "谷薯类及其制品",
    aliases: [],
    description: "react-framework",
    purine_level: "low",
    purine_mg: 10
  },
  {
    name_cn: "麦麸",
    category: "谷薯类及其制品",
    aliases: ["麦皮", "麸子"],
    description: "麦麸，即麦皮，小麦加工面粉副产品",
    purine_level: "high",
    purine_mg: 87.5
  },
  {
    name_cn: "精白馒头",
    category: "谷薯类及其制品",
    aliases: ["白馒头"],
    description: "白馒头的主要原料为筋面粉500克、温水250ML、酵母7克",
    purine_level: "high",
    purine_mg: 87.5
  },
  {
    name_cn: "荞麦",
    category: "谷薯类及其制品",
    aliases: ["净肠草", "乌麦", "三角麦"],
    description: "荞麦性甘味凉，有开胃宽肠，下气消积",
    purine_level: "low",
    purine_mg: 34
  },
  {
    name_cn: "玉米面",
    category: "谷薯类及其制品",
    aliases: ["苞米面"],
    description: "玉米面有粗细之别",
    purine_level: "low",
    purine_mg: 12
  },
  {
    name_cn: "黑米",
    category: "谷薯类及其制品",
    aliases: [],
    description: "黑米是一种药、食兼用的大米，属于糯米类",
    purine_level: "medium",
    purine_mg: 63
  },
  {
    name_cn: "凉薯",
    category: "谷薯类及其制品",
    aliases: ["豆薯", "沙葛", "地萝卜"],
    description: "凉薯营养丰富，含有人体所必需的钙、铁、锌、铜、磷等多种元素",
    purine_level: "low",
    purine_mg: 13
  },
  {
    name_cn: "五常639大米",
    category: "谷薯类及其制品",
    aliases: ["六三九米"],
    description: "五常大米不是专指五常稻花香大米也不是专指五常长粒香大米",
    purine_level: "low",
    purine_mg: 35
  },
  {
    name_cn: "江米",
    category: "谷薯类及其制品",
    aliases: [],
    description: "江米属于糯米的一种",
    purine_level: "low",
    purine_mg: 48
  },
  {
    name_cn: "红米",
    category: "谷薯类及其制品",
    aliases: ["红大米", "红米稻", "赤米"],
    description: "红米是一种接近于野生稻的禾本科稻属杂草稻",
    purine_level: "low",
    purine_mg: 33
  },
  {
    name_cn: "黄米",
    category: "谷薯类及其制品",
    aliases: ["夏小米", "糜子"],
    description: "黄米又称黍、糜子、黄米、夏小米、黄小米",
    purine_level: "low",
    purine_mg: 16
  }
];

async function main() {
  const collector = new FoodDataCollector();

  console.log('开始处理食物嘌呤数据...');

  // 处理收集到的数据
  const processedData = collector.processCollectedData(sampleFoodData);

  // 保存原始数据
  collector.saveDataToFile(sampleFoodData, 'raw-food-data.json');

  // 保存处理后的数据
  collector.saveDataToFile(processedData, 'processed-food-data.json');

  // 生成SQL语句
  const sqlStatements = collector.generateSQLInsert(processedData);
  collector.saveSQLToFile(sqlStatements, 'insert-food-data.sql');

  console.log(`成功处理 ${processedData.length} 个食物数据`);
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
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { sampleFoodData };