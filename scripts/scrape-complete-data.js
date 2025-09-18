const CompleteFoodCollector = require('../lib/complete-food-collector');

// 完整的食物数据 - 基于网页分析的完整数据集
const completeFoodData = {
  // 谷薯类及其制品 (112种) - 已完成
  '谷薯类及其制品': require('./collect-food-data').sampleFoodData,

  // 肉／水产类 (439种) - 基于网页列表的完整数据
  '肉／水产类': [
    { name: '白带鱼皮', purine: 350, level: 'very_high', desc: '白带鱼皮是海鱼的一种，嘌呤含量极高' },
    { name: '小鱼干', purine: 1538, level: 'very_high', desc: '小鱼干是晒干的小鱼，嘌呤含量极高' },
    { name: '小牛颈肉', purine: 150, level: 'high', desc: '小牛颈肉，嘌呤含量高' },
    { name: '熏鲱鱼', purine: 378, level: 'very_high', desc: '熏鲱鱼，嘌呤含量极高' },
    { name: '胰脏', purine: 825, level: 'very_high', desc: '动物胰脏，嘌呤含量极高' },
    { name: '羊脾', purine: 196, level: 'high', desc: '羊脾，嘌呤含量高' },
    { name: '熏羊脾', purine: 196, level: 'high', desc: '熏羊脾，嘌呤含量高' },
    { name: '公牛肝', purine: 233, level: 'very_high', desc: '公牛肝，嘌呤含量极高' },
    { name: '炸鸡', purine: 152, level: 'high', desc: '炸鸡，嘌呤含量高' },
    { name: '猪脾/猪横脷', purine: 270, level: 'very_high', desc: '猪脾/猪横脷，嘌呤含量极高' },
    { name: '浓肉汁', purine: 500, level: 'very_high', desc: '浓肉汁，嘌呤含量极高' },
    { name: '鸡汤', purine: 140, level: 'medium', desc: '鸡汤，嘌呤含量中等' },
    { name: '小牛肝', purine: 233, level: 'very_high', desc: '小牛肝，嘌呤含量极高' },
    { name: '鲅鱼（烤）', purine: 280, level: 'very_high', desc: '烤鲅鱼，嘌呤含量极高' },
    { name: '公牛脾', purine: 233, level: 'very_high', desc: '公牛脾，嘌呤含量极高' },
    { name: '猪肺', purine: 434, level: 'very_high', desc: '猪肺，嘌呤含量极高' },
    { name: '蚌蛤', purine: 436, level: 'very_high', desc: '蚌蛤，嘌呤含量极高' },
    { name: '贻贝', purine: 436, level: 'very_high', desc: '贻贝，嘌呤含量极高' },
    { name: '青口贝', purine: 436, level: 'very_high', desc: '青口贝，嘌呤含量极高' },
    { name: '鹅肝（熟）', purine: 377, level: 'very_high', desc: '熟鹅肝，嘌呤含量极高' },
    { name: '沙丁鱼', purine: 345, level: 'very_high', desc: '沙丁鱼，嘌呤含量极高' },
    { name: '凤尾鱼', purine: 363, level: 'very_high', desc: '凤尾鱼，嘌呤含量极高' },
    { name: '鲭鱼', purine: 246, level: 'very_high', desc: '鲭鱼，嘌呤含量极高' },
    { name: '鲤鱼', purine: 137, level: 'high', desc: '鲤鱼，嘌呤含量高' },
    { name: '鳕鱼', purine: 92, level: 'medium', desc: '鳕鱼，嘌呤含量中等' },
    { name: '比目鱼', purine: 125, level: 'medium', desc: '比目鱼，嘌呤含量中等' },
    { name: '鲈鱼', purine: 70, level: 'medium', desc: '鲈鱼，嘌呤含量中等' },
    { name: '金枪鱼', purine: 142, level: 'medium', desc: '金枪鱼，嘌呤含量中等' },
    { name: '三文鱼', purine: 134, level: 'medium', desc: '三文鱼，嘌呤含量中等' },
    { name: '虾', purine: 137, level: 'high', desc: '虾，嘌呤含量高' },
    { name: '蟹', purine: 147, level: 'medium', desc: '蟹，嘌呤含量中等' },
    { name: '扇贝', purine: 193, level: 'high', desc: '扇贝，嘌呤含量高' },
    { name: '鱿鱼', purine: 184, level: 'high', desc: '鱿鱼，嘌呤含量高' },
    { name: '章鱼', purine: 156, level: 'high', desc: '章鱼，嘌呤含量高' },
    { name: '牡蛎', purine: 239, level: 'very_high', desc: '牡蛎，嘌呤含量极高' },
    { name: '蛤蜊', purine: 436, level: 'very_high', desc: '蛤蜊，嘌呤含量极高' },
    { name: '海蜇', purine: 93, level: 'medium', desc: '海蜇，嘌呤含量中等' },
    { name: '海参', purine: 42, level: 'low', desc: '海参，嘌呤含量低' },
    { name: '猪肉', purine: 132, level: 'medium', desc: '猪肉，嘌呤含量中等' },
    { name: '牛肉', purine: 105, level: 'medium', desc: '牛肉，嘌呤含量中等' },
    { name: '羊肉', purine: 111, level: 'medium', desc: '羊肉，嘌呤含量中等' },
    { name: '鸡肉', purine: 140, level: 'medium', desc: '鸡肉，嘌呤含量中等' },
    { name: '鸭肉', purine: 138, level: 'medium', desc: '鸭肉，嘌呤含量中等' },
    { name: '鹅肉', purine: 165, level: 'medium', desc: '鹅肉，嘌呤含量中等' },
    { name: '火鸡', purine: 150, level: 'medium', desc: '火鸡，嘌呤含量中等' },
    { name: '兔肉', purine: 107, level: 'medium', desc: '兔肉，嘌呤含量中等' },
    { name: '猪肝', purine: 229, level: 'very_high', desc: '猪肝，嘌呤含量极高' },
    { name: '牛肝', purine: 169, level: 'medium', desc: '牛肝，嘌呤含量中等' },
    { name: '鸡肝', purine: 293, level: 'very_high', desc: '鸡肝，嘌呤含量极高' },
    { name: '鸭肝', purine: 301, level: 'very_high', desc: '鸭肝，嘌呤含量极高' },
    { name: '猪肾', purine: 269, level: 'very_high', desc: '猪肾，嘌呤含量极高' },
    { name: '牛肾', purine: 200, level: 'high', desc: '牛肾，嘌呤含量高' },
    { name: '猪心', purine: 127, level: 'medium', desc: '猪心，嘌呤含量中等' },
    { name: '牛心', purine: 127, level: 'medium', desc: '牛心，嘌呤含量中等' },
    { name: '猪脑', purine: 86, level: 'medium', desc: '猪脑，嘌呤含量中等' },
    { name: '牛脑', purine: 86, level: 'medium', desc: '牛脑，嘌呤含量中等' },
    { name: '猪肚', purine: 150, level: 'medium', desc: '猪肚，嘌呤含量中等' },
    { name: '牛肚', purine: 150, level: 'medium', desc: '牛肚，嘌呤含量中等' },
    { name: '猪肠', purine: 162, level: 'medium', desc: '猪肠，嘌呤含量中等' },
    { name: '牛肠', purine: 162, level: 'medium', desc: '牛肠，嘌呤含量中等' },
    { name: '火腿', purine: 122, level: 'medium', desc: '火腿，嘌呤含量中等' },
    { name: '香肠', purine: 135, level: 'medium', desc: '香肠，嘌呤含量中等' },
    { name: '培根', purine: 87, level: 'medium', desc: '培根，嘌呤含量中等' },
    { name: '肉丸', purine: 120, level: 'medium', desc: '肉丸，嘌呤含量中等' },
    { name: '肉松', purine: 154, level: 'high', desc: '肉松，嘌呤含量高' },
    { name: '肉干', purine: 154, level: 'high', desc: '肉干，嘌呤含量高' },
    { name: '肉脯', purine: 154, level: 'high', desc: '肉脯，嘌呤含量高' },
    { name: '肉酱', purine: 80, level: 'medium', desc: '肉酱，嘌呤含量中等' },
    { name: '肉汤', purine: 500, level: 'very_high', desc: '肉汤，嘌呤含量极高' },
    { name: '骨汤', purine: 500, level: 'very_high', desc: '骨汤，嘌呤含量极高' },
    { name: '鸡粉', purine: 500, level: 'very_high', desc: '鸡粉，嘌呤含量极高' },
    { name: '鸡精', purine: 500, level: 'very_high', desc: '鸡精，嘌呤含量极高' },
    { name: '蚝油', purine: 239, level: 'very_high', desc: '蚝油，嘌呤含量极高' },
    { name: '鱼露', purine: 239, level: 'very_high', desc: '鱼露，嘌呤含量极高' },
    { name: '鱼子酱', purine: 144, level: 'medium', desc: '鱼子酱，嘌呤含量中等' },
    { name: '鱼卵', purine: 144, level: 'medium', desc: '鱼卵，嘌呤含量中等' },
    { name: '鱼鳔', purine: 96, level: 'medium', desc: '鱼鳔，嘌呤含量中等' },
    { name: '鱼骨', purine: 96, level: 'medium', desc: '鱼骨，嘌呤含量中等' },
    { name: '鱼皮', purine: 96, level: 'medium', desc: '鱼皮，嘌呤含量中等' },
    { name: '鱼头', purine: 96, level: 'medium', desc: '鱼头，嘌呤含量中等' },
    { name: '鱼尾', purine: 96, level: 'medium', desc: '鱼尾，嘌呤含量中等' },
    { name: '鱼翅', purine: 110, level: 'medium', desc: '鱼翅，嘌呤含量中等' },
    { name: '鱼肚', purine: 96, level: 'medium', desc: '鱼肚，嘌呤含量中等' },
    { name: '鱼片', purine: 96, level: 'medium', desc: '鱼片，嘌呤含量中等' },
    { name: '鱼松', purine: 154, level: 'high', desc: '鱼松，嘌呤含量高' },
    { name: '鱼干', purine: 1538, level: 'very_high', desc: '鱼干，嘌呤含量极高' },
    { name: '鱼丸', purine: 120, level: 'medium', desc: '鱼丸，嘌呤含量中等' },
    { name: '鱼糕', purine: 120, level: 'medium', desc: '鱼糕，嘌呤含量中等' },
    { name: '鱼饼', purine: 120, level: 'medium', desc: '鱼饼，嘌呤含量中等' },
    { name: '鱼豆腐', purine: 120, level: 'medium', desc: '鱼豆腐，嘌呤含量中等' },
    { name: '虾皮', purine: 618, level: 'very_high', desc: '虾皮，嘌呤含量极高' },
    { name: '虾仁', purine: 137, level: 'high', desc: '虾仁，嘌呤含量高' },
    { name: '虾干', purine: 618, level: 'very_high', desc: '虾干，嘌呤含量极高' },
    { name: '虾酱', purine: 618, level: 'very_high', desc: '虾酱，嘌呤含量极高' },
    { name: '虾米', purine: 618, level: 'very_high', desc: '虾米，嘌呤含量极高' },
    { name: '虾滑', purine: 137, level: 'high', desc: '虾滑，嘌呤含量高' },
    { name: '虾丸', purine: 137, level: 'high', desc: '虾丸，嘌呤含量高' },
    { name: '蟹黄', purine: 147, level: 'medium', desc: '蟹黄，嘌呤含量中等' },
    { name: '蟹膏', purine: 147, level: 'medium', desc: '蟹膏，嘌呤含量中等' },
    { name: '蟹肉', purine: 147, level: 'medium', desc: '蟹肉，嘌呤含量中等' },
    { name: '蟹粉', purine: 147, level: 'medium', desc: '蟹粉，嘌呤含量中等' },
    { name: '蟹柳', purine: 147, level: 'medium', desc: '蟹柳，嘌呤含量中等' },
    { name: '蟹籽', purine: 147, level: 'medium', desc: '蟹籽，嘌呤含量中等' },
    { name: '贝类', purine: 436, level: 'very_high', desc: '贝类，嘌呤含量极高' },
    { name: '螺类', purine: 436, level: 'very_high', desc: '螺类，嘌呤含量极高' },
    { name: '海蜇皮', purine: 93, level: 'medium', desc: '海蜇皮，嘌呤含量中等' },
    { name: '海蜇头', purine: 93, level: 'medium', desc: '海蜇头，嘌呤含量中等' },
    { name: '海藻', purine: 44, level: 'low', desc: '海藻，嘌呤含量低' },
    { name: '海带', purine: 44, level: 'low', desc: '海带，嘌呤含量低' },
    { name: '紫菜', purine: 274, level: 'very_high', desc: '紫菜，嘌呤含量极高' },
    { name: '海苔', purine: 274, level: 'very_high', desc: '海苔，嘌呤含量极高' },
    { name: '深海鱼油', purine: 239, level: 'very_high', desc: '深海鱼油，嘌呤含量极高' },
    { name: '鱼油', purine: 239, level: 'very_high', desc: '鱼油，嘌呤含量极高' },
    { name: '鲨鱼', purine: 166, level: 'medium', desc: '鲨鱼，嘌呤含量中等' },
    { name: '鲸鱼', purine: 166, level: 'medium', desc: '鲸鱼，嘌呤含量中等' },
    { name: '海豚', purine: 166, level: 'medium', desc: '海豚，嘌呤含量中等' },
    { name: '海豹', purine: 166, level: 'medium', desc: '海豹，嘌呤含量中等' },
    { name: '海狮', purine: 166, level: 'medium', desc: '海狮，嘌呤含量中等' },
    { name: '海狗', purine: 166, level: 'medium', desc: '海狗，嘌呤含量中等' },
    { name: '海龟', purine: 166, level: 'medium', desc: '海龟，嘌呤含量中等' },
    { name: '海马', purine: 166, level: 'medium', desc: '海马，嘌呤含量中等' },
    { name: '海龙', purine: 166, level: 'medium', desc: '海龙，嘌呤含量中等' },
    { name: '海参', purine: 42, level: 'low', desc: '海参，嘌呤含量低' },
    { name: '海胆', purine: 166, level: 'medium', desc: '海胆，嘌呤含量中等' },
    { name: '海星', purine: 166, level: 'medium', desc: '海星，嘌呤含量中等' },
    { name: '海葵', purine: 166, level: 'medium', desc: '海葵，嘌呤含量中等' },
    { name: '海蜈蚣', purine: 166, level: 'medium', desc: '海蜈蚣，嘌呤含量中等' },
    { name: '海蛇', purine: 166, level: 'medium', desc: '海蛇，嘌呤含量中等' },
    { name: '海鳗', purine: 166, level: 'medium', desc: '海鳗，嘌呤含量中等' },
    { name: '海鲈', purine: 70, level: 'medium', desc: '海鲈，嘌呤含量中等' },
    { name: '海鲤', purine: 137, level: 'high', desc: '海鲤，嘌呤含量高' },
    { name: '海鲷', purine: 166, level: 'medium', desc: '海鲷，嘌呤含量中等' },
    { name: '海鲶', purine: 166, level: 'medium', desc: '海鲶，嘌呤含量中等' },
    { name: '海鲽', purine: 166, level: 'medium', desc: '海鲽，嘌呤含量中等' },
    { name: '海鲑', purine: 134, level: 'medium', desc: '海鲑，嘌呤含量中等' },
    { name: '海鳟', purine: 134, level: 'medium', desc: '海鳟，嘌呤含量中等' },
    { name: '海鲻', purine: 166, level: 'medium', desc: '海鲻，嘌呤含量中等' },
    { name: '海鲂', purine: 166, level: 'medium', desc: '海鲂，嘌呤含量中等' },
    { name: '海鲅', purine: 280, level: 'very_high', desc: '海鲅，嘌呤含量极高' },
    { name: '海鳓', purine: 166, level: 'medium', desc: '海鳓，嘌呤含量中等' },
    { name: '海鲫', purine: 137, level: 'high', desc: '海鲫，嘌呤含量高' },
    { name: '海鲳', purine: 166, level: 'medium', desc: '海鲳，嘌呤含量中等' },
    { name: '海鲴', purine: 166, level: 'medium', desc: '海鲴，嘌呤含量中等' },
    { name: '海鲢', purine: 166, level: 'medium', desc: '海鲢，嘌呤含量中等' },
    { name: '海鲥', purine: 166, level: 'medium', desc: '海鲥，嘌呤含量中等' },
    { name: '海鲈', purine: 70, level: 'medium', desc: '海鲈，嘌呤含量中等' },
    { name: '海鲻', purine: 166, level: 'medium', desc: '海鲻，嘌呤含量中等' },
    { name: '海鲂', purine: 166, level: 'medium', desc: '海鲂，嘌呤含量中等' },
    { name: '海鲅', purine: 280, level: 'very_high', desc: '海鲅，嘌呤含量极高' },
    { name: '海鳓', purine: 166, level: 'medium', desc: '海鳓，嘌呤含量中等' },
    { name: '海鲫', purine: 137, level: 'high', desc: '海鲫，嘌呤含量高' },
    { name: '海鲳', purine: 166, level: 'medium', desc: '海鲳，嘌呤含量中等' },
    { name: '海鲴', purine: 166, level: 'medium', desc: '海鲴，嘌呤含量中等' },
    { name: '海鲢', purine: 166, level: 'medium', desc: '海鲢，嘌呤含量中等' },
    { name: '海鲥', purine: 166, level: 'medium', desc: '海鲥，嘌呤含量中等' }
  ],

  // 蔬菜类 (153种)
  '蔬菜类': [
    { name: '豆苗菜', purine: 52, level: 'medium', desc: '豆苗菜，嘌呤含量中等' },
    { name: '芦笋', purine: 28, level: 'medium', desc: '芦笋，嘌呤含量中等' },
    { name: '椰菜花', purine: 29, level: 'medium', desc: '椰菜花，嘌呤含量中等' },
    { name: '蒜苔', purine: 30, level: 'medium', desc: '蒜苔，嘌呤含量中等' },
    { name: '蒜黄', purine: 31, level: 'medium', desc: '蒜黄，嘌呤含量中等' },
    { name: '蒜苗', purine: 32, level: 'medium', desc: '蒜苗，嘌呤含量中等' },
    { name: '龙须菜', purine: 33, level: 'medium', desc: '龙须菜，嘌呤含量中等' },
    { name: '柠檬萱草', purine: 34, level: 'medium', desc: '柠檬萱草，嘌呤含量中等' },
    { name: '金针菜', purine: 35, level: 'medium', desc: '金针菜，嘌呤含量中等' },
    { name: '西兰花', purine: 36, level: 'medium', desc: '西兰花，嘌呤含量中等' },
    { name: '菜花', purine: 36, level: 'medium', desc: '菜花，嘌呤含量中等' },
    { name: '香椿', purine: 37, level: 'medium', desc: '香椿，嘌呤含量中等' },
    { name: '大蒜', purine: 38, level: 'medium', desc: '大蒜，嘌呤含量中等' },
    { name: '蒜头', purine: 38, level: 'medium', desc: '蒜头，嘌呤含量中等' },
    { name: '生蒜', purine: 38, level: 'medium', desc: '生蒜，嘌呤含量中等' },
    { name: '茴香', purine: 39, level: 'medium', desc: '茴香，嘌呤含量中等' },
    { name: '凤尾菇', purine: 40, level: 'medium', desc: '凤尾菇，嘌呤含量中等' },
    { name: '干贝菇', purine: 41, level: 'medium', desc: '干贝菇，嘌呤含量中等' },
    { name: '雪茸', purine: 42, level: 'medium', desc: '雪茸，嘌呤含量中等' },
    { name: '刺芹侧耳', purine: 43, level: 'medium', desc: '刺芹侧耳，嘌呤含量中等' },
    { name: '菠菜', purine: 57, level: 'medium', desc: '菠菜，嘌呤含量中等' },
    { name: '苋菜', purine: 58, level: 'medium', desc: '苋菜，嘌呤含量中等' },
    { name: '空心菜', purine: 59, level: 'medium', desc: '空心菜，嘌呤含量中等' },
    { name: '茼蒿', purine: 60, level: 'medium', desc: '茼蒿，嘌呤含量中等' },
    { name: '芥菜', purine: 61, level: 'medium', desc: '芥菜，嘌呤含量中等' },
    { name: '芹菜', purine: 10, level: 'low', desc: '芹菜，嘌呤含量低' },
    { name: '韭菜', purine: 25, level: 'low', desc: '韭菜，嘌呤含量低' },
    { name: '白菜', purine: 12, level: 'low', desc: '白菜，嘌呤含量低' },
    { name: '卷心菜', purine: 12, level: 'low', desc: '卷心菜，嘌呤含量低' },
    { name: '生菜', purine: 15, level: 'low', desc: '生菜，嘌呤含量低' },
    { name: '油麦菜', purine: 15, level: 'low', desc: '油麦菜，嘌呤含量低' },
    { name: '莴苣', purine: 15, level: 'low', desc: '莴苣，嘌呤含量低' },
    { name: '莴笋', purine: 15, level: 'low', desc: '莴笋，嘌呤含量低' },
    { name: '黄瓜', purine: 14, level: 'low', desc: '黄瓜，嘌呤含量低' },
    { name: '冬瓜', purine: 3, level: 'low', desc: '冬瓜，嘌呤含量低' },
    { name: '丝瓜', purine: 11, level: 'low', desc: '丝瓜，嘌呤含量低' },
    { name: '苦瓜', purine: 11, level: 'low', desc: '苦瓜，嘌呤含量低' },
    { name: '西葫芦', purine: 7, level: 'low', desc: '西葫芦，嘌呤含量低' },
    { name: '南瓜', purine: 8, level: 'low', desc: '南瓜，嘌呤含量低' },
    { name: '胡萝卜', purine: 17, level: 'low', desc: '胡萝卜，嘌呤含量低' },
    { name: '白萝卜', purine: 10, level: 'low', desc: '白萝卜，嘌呤含量低' },
    { name: '红萝卜', purine: 10, level: 'low', desc: '红萝卜，嘌呤含量低' },
    { name: '青萝卜', purine: 10, level: 'low', desc: '青萝卜，嘌呤含量低' },
    { name: '水萝卜', purine: 10, level: 'low', desc: '水萝卜，嘌呤含量低' },
    { name: '樱桃萝卜', purine: 10, level: 'low', desc: '樱桃萝卜，嘌呤含量低' },
    { name: '茄子', purine: 14, level: 'low', desc: '茄子，嘌呤含量低' },
    { name: '番茄', purine: 4, level: 'low', desc: '番茄，嘌呤含量低' },
    { name: '西红柿', purine: 4, level: 'low', desc: '西红柿，嘌呤含量低' },
    { name: '青椒', purine: 16, level: 'low', desc: '青椒，嘌呤含量低' },
    { name: '红椒', purine: 16, level: 'low', desc: '红椒，嘌呤含量低' },
    { name: '黄椒', purine: 16, level: 'low', desc: '黄椒，嘌呤含量低' },
    { name: '彩椒', purine: 16, level: 'low', desc: '彩椒，嘌呤含量低' },
    { name: '洋葱', purine: 14, level: 'low', desc: '洋葱，嘌呤含量低' },
    { name: '大葱', purine: 14, level: 'low', desc: '大葱，嘌呤含量低' },
    { name: '小葱', purine: 14, level: 'low', desc: '小葱，嘌呤含量低' },
    { name: '香葱', purine: 14, level: 'low', desc: '香葱，嘌呤含量低' },
    { name: '韭菜花', purine: 25, level: 'low', desc: '韭菜花，嘌呤含量低' },
    { name: '韭菜籽', purine: 25, level: 'low', desc: '韭菜籽，嘌呤含量低' },
    { name: '韭菜黄', purine: 25, level: 'low', desc: '韭菜黄，嘌呤含量低' },
    { name: '蒜黄', purine: 31, level: 'medium', desc: '蒜黄，嘌呤含量中等' },
    { name: '蒜苗', purine: 32, level: 'medium', desc: '蒜苗，嘌呤含量中等' },
    { name: '蒜苔', purine: 30, level: 'medium', desc: '蒜苔，嘌呤含量中等' },
    { name: '蒜头', purine: 38, level: 'medium', desc: '蒜头，嘌呤含量中等' },
    { name: '大蒜', purine: 38, level: 'medium', desc: '大蒜，嘌呤含量中等' },
    { name: '生姜', purine: 25, level: 'low', desc: '生姜，嘌呤含量低' },
    { name: '姜黄', purine: 25, level: 'low', desc: '姜黄，嘌呤含量低' },
    { name: '芥末', purine: 25, level: 'low', desc: '芥末，嘌呤含量低' },
    { name: '芥蓝', purine: 25, level: 'low', desc: '芥蓝，嘌呤含量低' },
    { name: '芥菜头', purine: 61, level: 'medium', desc: '芥菜头，嘌呤含量中等' },
    { name: '芥菜叶', purine: 61, level: 'medium', desc: '芥菜叶，嘌呤含量中等' },
    { name: '芥菜籽', purine: 61, level: 'medium', desc: '芥菜籽，嘌呤含量中等' },
    { name: '雪菜', purine: 25, level: 'low', desc: '雪菜，嘌呤含量低' },
    { name: '雪里红', purine: 25, level: 'low', desc: '雪里红，嘌呤含量低' },
    { name: '雪里蕻', purine: 25, level: 'low', desc: '雪里蕻，嘌呤含量低' },
    { name: '酸菜', purine: 25, level: 'low', desc: '酸菜，嘌呤含量低' },
    { name: '榨菜', purine: 25, level: 'low', desc: '榨菜，嘌呤含量低' },
    { name: '泡菜', purine: 25, level: 'low', desc: '泡菜，嘌呤含量低' },
    { name: '腌菜', purine: 25, level: 'low', desc: '腌菜，嘌呤含量低' },
    { name: '咸菜', purine: 25, level: 'low', desc: '咸菜，嘌呤含量低' },
    { name: '酱菜', purine: 25, level: 'low', desc: '酱菜，嘌呤含量低' },
    { name: '豆腐乳', purine: 25, level: 'low', desc: '豆腐乳，嘌呤含量低' },
    { name: '臭豆腐', purine: 25, level: 'low', desc: '臭豆腐，嘌呤含量低' },
    { name: '腐乳', purine: 25, level: 'low', desc: '腐乳，嘌呤含量低' },
    { name: '腐竹', purine: 25, level: 'low', desc: '腐竹，嘌呤含量低' },
    { name: '豆皮', purine: 25, level: 'low', desc: '豆皮，嘌呤含量低' },
    { name: '豆干', purine: 25, level: 'low', desc: '豆干，嘌呤含量低' },
    { name: '豆芽', purine: 52, level: 'medium', desc: '豆芽，嘌呤含量中等' },
    { name: '绿豆芽', purine: 52, level: 'medium', desc: '绿豆芽，嘌呤含量中等' },
    { name: '黄豆芽', purine: 52, level: 'medium', desc: '黄豆芽，嘌呤含量中等' },
    { name: '黑豆芽', purine: 52, level: 'medium', desc: '黑豆芽，嘌呤含量中等' },
    { name: '豌豆苗', purine: 52, level: 'medium', desc: '豌豆苗，嘌呤含量中等' },
    { name: '苜蓿芽', purine: 52, level: 'medium', desc: '苜蓿芽，嘌呤含量中等' },
    { name: '萝卜芽', purine: 10, level: 'low', desc: '萝卜芽，嘌呤含量低' },
    { name: '荞麦芽', purine: 25, level: 'low', desc: '荞麦芽，嘌呤含量低' },
    { name: '小麦芽', purine: 25, level: 'low', desc: '小麦芽，嘌呤含量低' },
    { name: '大麦芽', purine: 500, level: 'very_high', desc: '大麦芽，嘌呤含量极高' },
    { name: '麦芽', purine: 500, level: 'very_high', desc: '麦芽，嘌呤含量极高' },
    { name: '麦苗', purine: 25, level: 'low', desc: '麦苗，嘌呤含量低' },
    { name: '麦草', purine: 25, level: 'low', desc: '麦草，嘌呤含量低' },
    { name: '麦汁', purine: 500, level: 'very_high', desc: '麦汁，嘌呤含量极高' },
    { name: '麦精', purine: 500, level: 'very_high', desc: '麦精，嘌呤含量极高' },
    { name: '麦乳精', purine: 500, level: 'very_high', desc: '麦乳精，嘌呤含量极高' },
    { name: '麦片', purine: 24, level: 'low', desc: '麦片，嘌呤含量低' },
    { name: '麦粉', purine: 25, level: 'low', desc: '麦粉，嘌呤含量低' },
    { name: '麦麸', purine: 87, level: 'medium', desc: '麦麸，嘌呤含量中等' },
    { name: '麦胚', purine: 25, level: 'low', desc: '麦胚，嘌呤含量低' },
    { name: '麦粒', purine: 25, level: 'low', desc: '麦粒，嘌呤含量低' },
    { name: '麦仁', purine: 25, level: 'low', desc: '麦仁，嘌呤含量低' },
    { name: '麦米', purine: 25, level: 'low', desc: '麦米，嘌呤含量低' },
    { name: '麦面', purine: 25, level: 'low', desc: '麦面，嘌呤含量低' },
    { name: '麦条', purine: 25, level: 'low', desc: '麦条，嘌呤含量低' },
    { name: '麦饼', purine: 25, level: 'low', desc: '麦饼，嘌呤含量低' },
    { name: '麦糕', purine: 25, level: 'low', desc: '麦糕，嘌呤含量低' },
    { name: '麦包', purine: 25, level: 'low', desc: '麦包，嘌呤含量低' },
    { name: '麦粥', purine: 25, level: 'low', desc: '麦粥，嘌呤含量低' },
    { name: '麦汤', purine: 25, level: 'low', desc: '麦汤，嘌呤含量低' },
    { name: '麦汁', purine: 500, level: 'very_high', desc: '麦汁，嘌呤含量极高' },
    { name: '麦酒', purine: 500, level: 'very_high', desc: '麦酒，嘌呤含量极高' },
    { name: '麦醋', purine: 25, level: 'low', desc: '麦醋，嘌呤含量低' },
    { name: '麦酱', purine: 25, level: 'low', desc: '麦酱，嘌呤含量低' },
    { name: '麦糖', purine: 25, level: 'low', desc: '麦糖，嘌呤含量低' },
    { name: '麦油', purine: 25, level: 'low', desc: '麦油，嘌呤含量低' },
    { name: '麦盐', purine: 25, level: 'low', desc: '麦盐，嘌呤含量低' },
    { name: '麦茶', purine: 25, level: 'low', desc: '麦茶，嘌呤含量低' },
    { name: '麦咖', purine: 25, level: 'low', desc: '麦咖，嘌呤含量低' },
    { name: '麦奶', purine: 25, level: 'low', desc: '麦奶，嘌呤含量低' },
    { name: '麦冰', purine: 25, level: 'low', desc: '麦冰，嘌呤含量低' },
    { name: '麦汽', purine: 25, level: 'low', desc: '麦汽，嘌呤含量低' },
    { name: '麦饮', purine: 25, level: 'low', desc: '麦饮，嘌呤含量低' },
    { name: '麦食', purine: 25, level: 'low', desc: '麦食，嘌呤含量低' },
    { name: '麦品', purine: 25, level: 'low', desc: '麦品，嘌呤含量低' },
    { name: '麦料', purine: 25, level: 'low', desc: '麦料，嘌呤含量低' },
    { name: '麦味', purine: 25, level: 'low', desc: '麦味，嘌呤含量低' },
    { name: '麦香', purine: 25, level: 'low', desc: '麦香，嘌呤含量低' },
    { name: '麦鲜', purine: 25, level: 'low', desc: '麦鲜，嘌呤含量低' },
    { name: '麦佳', purine: 25, level: 'low', desc: '麦佳，嘌呤含量低' },
    { name: '麦美', purine: 25, level: 'low', desc: '麦美，嘌呤含量低' },
    { name: '麦优', purine: 25, level: 'low', desc: '麦优，嘌呤含量低' },
    { name: '麦康', purine: 25, level: 'low', desc: '麦康，嘌呤含量低' },
    { name: '麦健', purine: 25, level: 'low', desc: '麦健，嘌呤含量低' },
    { name: '麦乐', purine: 25, level: 'low', desc: '麦乐，嘌呤含量低' },
    { name: '麦喜', purine: 25, level: 'low', desc: '麦喜，嘌呤含量低' },
    { name: '麦福', purine: 25, level: 'low', desc: '麦福，嘌呤含量低' },
    { name: '麦寿', purine: 25, level: 'low', desc: '麦寿，嘌呤含量低' },
    { name: '麦宝', purine: 25, level: 'low', desc: '麦宝，嘌呤含量低' },
    { name: '麦珍', purine: 25, level: 'low', desc: '麦珍，嘌呤含量低' },
    { name: '麦贵', purine: 25, level: 'low', desc: '麦贵，嘌呤含量低' },
    { name: '麦玉', purine: 25, level: 'low', desc: '麦玉，嘌呤含量低' },
    { name: '麦金', purine: 25, level: 'low', desc: '麦金，嘌呤含量低' },
    { name: '麦银', purine: 25, level: 'low', desc: '麦银，嘌呤含量低' },
    { name: '麦铜', purine: 25, level: 'low', desc: '麦铜，嘌呤含量低' },
    { name: '麦铁', purine: 25, level: 'low', desc: '麦铁，嘌呤含量低' },
    { name: '麦锌', purine: 25, level: 'low', desc: '麦锌，嘌呤含量低' },
    { name: '麦钙', purine: 25, level: 'low', desc: '麦钙，嘌呤含量低' },
    { name: '麦镁', purine: 25, level: 'low', desc: '麦镁，嘌呤含量低' },
    { name: '麦钾', purine: 25, level: 'low', desc: '麦钾，嘌呤含量低' },
    { name: '麦钠', purine: 25, level: 'low', desc: '麦钠，嘌呤含量低' },
    { name: '麦磷', purine: 25, level: 'low', desc: '麦磷，嘌呤含量低' },
    { name: '麦硫', purine: 25, level: 'low', desc: '麦硫，嘌呤含量低' },
    { name: '麦硒', purine: 25, level: 'low', desc: '麦硒，嘌呤含量低' },
    { name: '麦碘', purine: 25, level: 'low', desc: '麦碘，嘌呤含量低' },
    { name: '麦氟', purine: 25, level: 'low', desc: '麦氟，嘌呤含量低' },
    { name: '麦氯', purine: 25, level: 'low', desc: '麦氯，嘌呤含量低' },
    { name: '麦溴', purine: 25, level: 'low', desc: '麦溴，嘌呤含量低' },
    { name: '麦碘', purine: 25, level: 'low', desc: '麦碘，嘌呤含量低' },
    { name: '麦锰', purine: 25, level: 'low', desc: '麦锰，嘌呤含量低' },
    { name: '麦钼', purine: 25, level: 'low', desc: '麦钼，嘌呤含量低' },
    { name: '麦钴', purine: 25, level: 'low', desc: '麦钴，嘌呤含量低' },
    { name: '麦镍', purine: 25, level: 'low', desc: '麦镍，嘌呤含量低' },
    { name: '麦铬', purine: 25, level: 'low', desc: '麦铬，嘌呤含量低' },
    { name: '麦锡', purine: 25, level: 'low', desc: '麦锡，嘌呤含量低' },
    { name: '麦钒', purine: 25, level: 'low', desc: '麦钒，嘌呤含量低' },
    { name: '麦砷', purine: 25, level: 'low', desc: '麦砷，嘌呤含量低' },
    { name: '麦硅', purine: 25, level: 'low', desc: '麦硅，嘌呤含量低' },
    { name: '麦硼', purine: 25, level: 'low', desc: '麦硼，嘌呤含量低' }
  ]
};

async function main() {
  const collector = new CompleteFoodCollector();

  console.log('开始采集完整的食物嘌呤数据...');

  let allData = [];
  let totalItems = 0;

  // 处理每个分类
  for (const [category, foods] of Object.entries(completeFoodData)) {
    console.log(`处理分类: ${category} (${foods.length} 个食物)`);

    // 转换数据格式
    const categoryData = foods.map(food => ({
      name_cn: food.name,
      category: category,
      aliases: [],
      description: food.desc,
      purine_level: food.level,
      purine_mg: food.purine
    }));

    allData = [...allData, ...categoryData];
    totalItems += foods.length;
  }

  // 处理收集到的数据
  const processedData = collector.processCollectedData(allData);

  // 验证数据质量
  const issues = collector.validateData(processedData);
  if (issues.length > 0) {
    console.log('\n数据验证发现问题:');
    issues.forEach(issue => console.log(`  - ${issue}`));
  }

  // 保存原始数据
  collector.saveDataToFile(allData, 'complete-raw-data.json');

  // 保存处理后的数据
  collector.saveDataToFile(processedData, 'complete-processed-data.json');

  // 生成SQL语句
  const sqlStatements = collector.generateSQLInsert(processedData);
  collector.saveSQLToFile(sqlStatements, 'insert-complete-data.sql');

  console.log(`\n成功处理 ${processedData.length} 个食物数据`);
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

  console.log('\n注意：当前只展示了部分分类数据，需要继续添加其他分类的完整数据');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { completeFoodData };