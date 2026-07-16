import {
  grade5CharacterVisuals,
  grade5LessonVisuals,
} from "./grade5-volume1-visuals.generated.ts";

export type LearningVisual = {
  src: string;
  label: string;
  alt: string;
};

const visual = (id: string, label: string, alt: string): LearningVisual => ({
  src: `/illustrations/mnemonics/${id}.webp`,
  label,
  alt,
});

const semanticVisual = (id: string, label: string, alt: string): LearningVisual => ({
  src: `/illustrations/meanings/${id}.webp`,
  label,
  alt,
});

const legacyCharacterVisuals: Record<string, LearningVisual> = {
  劲: visual("m01", "弓强有力", "孩子用力拉开一张绷紧的弓"),
  吩: visual("m02", "用嘴巴发出命令", "小队长向同伴清楚地发出指令"),
  其: visual("m09", "簸箕", "装着谷物的竹编簸箕"),
  茶: visual("m10", "茶树", "山坡上的茶树和嫩绿茶芽"),
  使: visual("m11", "差遣、指派", "领到任务后出发的少年信使"),
  乡: visual("m17", "二人相向对食（享用）", "两个孩子面对面分享食物"),
  糕: visual("m21", "糕饼", "竹盘中各式蒸糕和糕饼"),
  水: visual("m27", "河流", "从群山之间流过的清澈河流"),
  花: visual("m28", "花朵", "孩子用放大镜观察盛开的花朵"),
  贵: visual("m31", "价格高", "孩子惊叹地观看珍贵的玉器"),
  赏: visual("m33", "奖励、赐予、赠予", "老师为努力的孩子颁发奖章和礼物"),
  阔: visual("m38", "开阔", "孩子面向无边草原和辽阔天空"),
  饼: visual("m39", "烤熟或蒸熟的面食", "蒸笼和木盘里的包子、饼和面包"),
  兰: visual("m41", "兰草", "山石旁生长的幽兰和细长叶片"),
  可: visual("m42", "劳作时加油鼓劲的歌声", "孩子们伴着号子一起拉绳劳动"),
  面: visual("m43", "脸", "正面呈现的孩子面孔"),
  距: visual("m44", "两处相隔的长度", "两个孩子站在相隔很远的石板路两端"),
  绿: visual("m45", "绿色", "深浅不同的绿叶、绿风筝和绿围巾"),
  茅: visual("m48", "茅草", "茅屋旁长着高高的茅草和白色穗子"),
  婆: visual("m50", "母亲或与母亲一辈的女子", "年长女性温柔地为孩子系好围巾"),
  老: visual("m52", "年岁大的人", "银发老人教孩子照料盆景"),
  桂: visual("m55", "肉桂、桂花树", "金桂树下两个孩子闻桂花"),
  体: visual("m59", "身体", "从头到脚完整站立的孩子"),
  嫩: visual("m61", "初生、柔弱", "孩子为刚长出的柔嫩小芽遮阳"),
  木: visual("m63", "树", "枝干、树冠和根系清楚的大树"),
  叶: visual("m64", "树叶", "枝头和地面上许多形状清楚的树叶"),
  欣: visual("m69", "喜悦、快乐", "完成拼图后开心跳起的两个孩子"),
  咐: visual("m73", "嘘气", "孩子在冬日向手心轻轻呼气"),
  风: visual("m77", "流动的空气", "风吹动风车、丝带、落叶和草丛"),
  亭: visual("m80", "供行人休息的地方", "山路旁供行人歇脚的亭子"),
  台: visual("m81", "高而平坦的土台", "用夯土筑成、顶部平坦的高台"),
  浇: visual("m83", "用水灌溉", "水从木闸流进田间灌溉沟渠"),
  平: visual("m85", "语气平和舒顺", "两个孩子平静友好地交谈"),
  食: visual("m88", "张口吃饭", "孩子张口吃下一勺米饭"),
  品: visual("m89", "众多", "孩子面对许多鸟、花和石头"),
  尤: visual("m90", "赘疣", "手臂上一个安全无痛的小凸起"),
  故: visual("m91", "旧、从前", "老人打开旧物箱讲述从前的故事"),
  碍: visual("m92", "阻挡、妨碍", "路上的障碍物挡住前进方向"),
  棒: visual("m93", "棍棒", "一根结实笔直的木棒"),
  兵: visual("m94", "兵器、武器", "博物馆中陈列的古代兵器"),
  厕: visual("m95", "厕所", "整洁明亮的儿童公共卫生间"),
  常: visual("m96", "古代下身穿的裙子", "博物馆里展示的古代下裳"),
  对: visual("m97", "高举、显扬", "孩子把完成的作品高高举起展示"),
  妨: visual("m98", "伤害、损害", "受损的幼苗与得到保护的幼苗形成对比"),
  粉: visual("m99", "细末、化妆粉", "古代梳妆台上的细腻粉末和粉盒"),
  封: visual("m100", "堆土植树为界", "孩子在界土旁栽下一棵小树"),
  付: visual("m101", "交给", "一个孩子把物品交到另一个孩子手中"),
  拐: visual("m102", "拐杖", "老人使用弯柄拐杖稳稳行走"),
  光: visual("m103", "明亮、光芒", "晨光穿过窗户照亮房间"),
  广: visual("m104", "依山崖建造的敞屋", "山崖旁敞开的古代屋舍"),
  坏: visual("m105", "土丘、未烧制的陶坯", "陶坊里尚未烧制的陶坯与土丘"),
  击: visual("m106", "敲打、拍打", "孩子用鼓槌敲响大鼓"),
  简: visual("m107", "竹简", "整齐编连在一起的古代竹简"),
  尽: visual("m108", "器皿中空", "孩子倾斜陶罐查看空空的内部"),
  坑: visual("m109", "沟壑、洼处", "草地中明显下陷的浅沟和洼地"),
  抗: visual("m110", "抵御、抵挡", "两个孩子用竹屏抵挡强风"),
  离: visual("m111", "鸟遭捕获", "孩子打开松软的网救出被困小鸟"),
  铃: visual("m112", "铃铛", "系着红绳并正在摇响的铜铃"),
  民: visual("m113", "古代失去自由、受役使的人", "孩子在博物馆了解古代被迫劳作的人们"),
  破: visual("m114", "石头碎裂、不完整", "孩子用放大镜观察裂成数块的石头"),
  穷: visual("m115", "达到尽头", "山路在安全观景台处到达终点"),
  日: visual("m116", "太阳", "群山上空明亮温暖的圆形太阳"),
  碎: visual("m117", "破碎成小块", "陶片碎成许多小块并被仔细收拢"),
  所: visual("m118", "伐木声", "孩子侧耳倾听树林深处传来的伐木声"),
  锁: visual("m119", "锁具", "木箱上的铜锁与相配的钥匙"),
  铜: visual("m120", "赤金、铜", "博物馆中泛着红金色光泽的铜器"),
  弯: visual("m121", "拉开弓", "孩子在指导下把木弓拉成弧形"),
  无: visual("m122", "舞蹈", "两个孩子挥舞长绸快乐起舞"),
  线: visual("m123", "细长的丝线", "孩子从线轴拉出一根细长丝线"),
  陷: visual("m124", "掉进、沉下", "孩子的雨靴轻轻陷进泥地洼处"),
  游: visual("m125", "古代旗帜下沿的垂饰", "孩子观察古代旗帜下沿垂落的长条饰物"),
  原: visual("m126", "水流源头", "泉水从山石间涌出并汇成小溪"),
  战: visual("m127", "古代持戈抵御野兽", "古代守卫持长戈保护村庄免受野兽侵扰"),
  照: visual("m128", "光线射向物体", "一束晨光穿过窗格照亮瓷瓶"),
  争: visual("m129", "两手争取一物", "两个孩子同时伸手拿同一个红球"),
  直: visual("m130", "正见、看得正直", "孩子沿笔直竹尺瞄准远处标记"),
};

export const characterVisuals: Record<string, LearningVisual> = {
  ...(grade5CharacterVisuals as unknown as Record<string, LearningVisual>),
  ...legacyCharacterVisuals,
};

export const supplementalVisuals: LearningVisual[] = [
  semanticVisual("m03", "检查、验证", "孩子用放大镜仔细检查一件物品"),
  semanticVisual("m04", "倚靠、凭借", "行路的人稳稳倚靠一根手杖"),
  semanticVisual("m05", "朗声诵读", "孩子面向同伴清楚地朗读"),
  semanticVisual("m06", "背负、承载", "孩子把行囊稳稳背在背上"),
  semanticVisual("m07", "一代又一代", "祖辈、父母和孩子三代人相聚"),
  semanticVisual("m08", "整齐有序", "竹简按照次序整齐排列"),
];

const legacyLessonVisuals: Record<string, LearningVisual> = {
  "019f0523-819f-7702-89a2-75f13809d57a": {
    src: "/illustrations/lessons/guihua-yu.webp",
    label: "桂花雨",
    alt: "金桂树下孩子们用竹篮接住纷纷落下的桂花",
  },
  "019f0523-819f-7702-89a2-7b176be276e5": {
    src: "/illustrations/lessons/luohuasheng.webp",
    label: "落花生",
    alt: "一家人在田里收获花生并围坐分享",
  },
  "019f0523-819f-7702-89a2-7cf5002b615d": {
    src: "/illustrations/lessons/didaozhan.webp",
    label: "冀中的地道战",
    alt: "村庄地面与地下地道网络的剖面图",
  },
};

export const lessonVisuals: Record<string, LearningVisual> = {
  ...legacyLessonVisuals,
  ...(grade5LessonVisuals as unknown as Record<string, LearningVisual>),
};

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return Math.abs(result);
}

export function getVisualDistractors(hanzi: string, questionId: string) {
  const characterPool = Object.entries(characterVisuals).filter(
    ([glyph]) => glyph !== hanzi,
  );
  const semanticIndex = hash(questionId) % supplementalVisuals.length;
  const characterIndex = hash(`${questionId}:character`) % characterPool.length;
  return [supplementalVisuals[semanticIndex], characterPool[characterIndex][1]];
}

export function getVisualOption(
  hanzi: string,
  questionId: string,
  correct: boolean,
  wrongSlot: number,
  optionText = "",
) {
  if (correct) return characterVisuals[hanzi];
  const normalized = optionText.replace(/[，。、；：\s]/g, "");
  if (normalized) {
    const semantic = [...Object.values(characterVisuals), ...supplementalVisuals].find((item) => {
      const label = item.label.replace(/[，。、；：\s]/g, "");
      return label.includes(normalized) || normalized.includes(label);
    });
    if (semantic) return semantic;
  }
  return getVisualDistractors(hanzi, questionId)[wrongSlot % 2];
}
