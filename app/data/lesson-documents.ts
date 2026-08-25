import {
  grade5LessonLearning,
  grade5Volume1Lessons,
} from "./grade5-volume1-source.ts";

export type LessonDocumentGenre =
  | "nature"
  | "story"
  | "history"
  | "science"
  | "poetry"
  | "reflection";

export type LessonDocumentRights = {
  status: "original" | "licensed" | "public-domain" | "unverified";
  publicDisplay: "full" | "metadata-only";
  basis: string;
  reviewedAt: string;
  label: string;
  note: string;
};

export type LessonDocumentParagraph = {
  id: string;
  text: string;
};

export type LessonDocumentFormat = "reading" | "guide";

export type LessonDocumentSection = {
  id: string;
  number: string;
  title: string;
  paragraphs: readonly LessonDocumentParagraph[];
  question?: string;
  focusWords?: readonly string[];
};

export type LessonDocument = {
  lessonId: string;
  title: string;
  eyebrow: string;
  dek: string;
  genre: LessonDocumentGenre;
  format: LessonDocumentFormat;
  intro?: string;
  rights: LessonDocumentRights;
  sections: readonly LessonDocumentSection[];
};

type GuideClue = {
  guide: string;
  question: string;
  focusWords: readonly string[];
};

type GuideDetails = {
  theme: string;
  genre: LessonDocumentGenre;
  intro?: string;
  clues: readonly [GuideClue, GuideClue, GuideClue];
};

const sectionNumbers = ["一", "二", "三"] as const;

const guideRights: LessonDocumentRights = Object.freeze({
  status: "original",
  publicDisplay: "full",
  basis: "authored-in-project",
  reviewedAt: "2026-08-24",
  label: "原创课文导读",
  note: "围绕阅读方法独立编写，不展示教材正文，也不提供课文替代文本。",
});

const guideDetails: Readonly<Record<keyof typeof grade5LessonLearning, GuideDetails>> = {
  1: {
    theme: "看见朴素之美",
    genre: "nature",
    intro: "这一课把目光放在一种常见的水鸟身上。阅读时先看白鹭的色彩和身段，再留意画面、声音与感受词，想一想朴素的事物为什么也能留下悠长韵味。",
    clues: [
      {
        guide: "读到白鹤、朱红等词时，先不要急着记结论。比较它们和白鹭在大小、颜色上的差别，看看作者怎样让身段变得清楚。",
        question: "这些比较让你看见了怎样的白鹭？",
        focusWords: ["白鹭", "适宜", "白鹤", "嫌弃", "朱红"],
      },
      {
        guide: "留意镶嵌、画框、匣子带来的共同感觉。它们都在帮助读者安排边界、位置和画面，让眼前的景物更有秩序。",
        question: "这些词把景物组织成了怎样的画面？",
        focusWords: ["镶嵌", "画框", "匣子"],
      },
      {
        guide: "嗜好、口哨写动作和声音，恩惠、韵味写读完后的感受。把两组词分开看，再想想文章为什么显得安静而不单调。",
        question: "哪些词让文章的意味在读完后继续留下来？",
        focusWords: ["嗜好", "口哨", "恩惠", "韵味"],
      },
    ],
  },
  2: {
    theme: "读懂朴素的分量",
    genre: "reflection",
    clues: [
      {
        guide: "先按事情发生的顺序读种花生和收花生的过程。留意人物怎样分工，哪些动作让一段劳动显得具体可见。",
        question: "从播种到收获，家人做了哪些事？",
        focusWords: ["半亩", "播种", "浇水", "吩咐"],
      },
      {
        guide: "读到一家人围坐谈花生时，分清眼前的食物、环境和人物谈话。场景很平常，后面的道理正从这些细节里生长出来。",
        question: "这一场谈话为什么安排在收获以后？",
        focusWords: ["茅亭", "榨油", "石榴"],
      },
      {
        guide: "比较人物怎样评价花生和其他事物，再把这些评价放回做人这个话题。关注话语之间的联系，不急着背最后的结论。",
        question: "花生的特点让人物想到了怎样的人？",
        focusWords: ["爱慕", "矮小", "谈论"],
      },
    ],
  },
  3: {
    theme: "沿花香回到故乡",
    genre: "reflection",
    clues: [
      {
        guide: "开头先写眼前，也打开了回忆。阅读时分清现在和从前，留意一种熟悉的花香怎样把人物带回故乡。",
        question: "花香怎样成为回忆的起点？",
        focusWords: ["懂得", "兰花", "老婆婆", "杭州"],
      },
      {
        guide: "进入摇花的场景后，跟着动作读。人物怎样准备，花怎样落下，孩子的心情怎样变化，都藏在连续的动作和感官里。",
        question: "哪些动作让你感到这场花雨很热闹？",
        focusWords: ["箩筐", "纠缠", "捡起"],
      },
      {
        guide: "结尾让花香进入食物，也进入长久的记忆。把味道、地方和人物感受连起来，看思念怎样从具体事物中慢慢显出来。",
        question: "离开故乡以后，什么仍留在人物心里？",
        focusWords: ["糕饼", "沉浸", "茶叶"],
      },
    ],
  },
  4: {
    theme: "看信赖怎样靠近",
    genre: "story",
    clues: [
      {
        guide: "先认识小鸟所处的环境和它起初的状态。留意遮蔽、距离和熟悉程度，这些细节为后面的靠近留下了空间。",
        question: "小鸟起初为什么和人保持距离？",
        focusWords: ["蔓延", "幽深", "熟悉", "书柜"],
      },
      {
        guide: "接着按一次次试探来读。每次靠近都比上一次多一点，人物的反应也影响着小鸟下一步会做什么。",
        question: "小鸟的哪些动作说明信任正在增加？",
        focusWords: ["雏鸟", "哟", "陪伴", "趴下"],
      },
      {
        guide: "最后把安静的动作和人物的感受放在一起。信赖没有被直接喊出来，读者从眼神、姿态和相处方式中看见了它。",
        question: "文章用哪个细节把信赖写得最动人？",
        focusWords: ["享受", "眼睑", "眼眸", "咂嘴"],
      },
    ],
  },
  5: {
    theme: "从搭石读出人情",
    genre: "reflection",
    clues: [
      {
        guide: "先弄清搭石出现的环境和摆放办法。水势、距离和人的动作互相影响，读懂这些条件才能明白搭石为何重要。",
        question: "乡亲们为什么要这样摆放和走过搭石？",
        focusWords: ["汛期", "洪水", "鞋子", "挽裤", "间隔"],
      },
      {
        guide: "再观察一行人怎样过溪。脚步、间距和彼此配合形成连续节奏，普通动作因此有了整齐的画面感。",
        question: "哪些词让你听见并看见过搭石的节奏？",
        focusWords: ["懒惰", "安稳", "免得", "平衡", "协调"],
      },
      {
        guide: "最后留意人物相遇时怎样选择。一次停步、一次礼让或一次照顾，都把搭石从生活物件变成了家乡情感的线索。",
        question: "乡亲之间的哪些做法让搭石有了温度？",
        focusWords: ["访问", "人影绰绰"],
      },
    ],
  },
  6: {
    theme: "在冲突中看见大局",
    genre: "history",
    clues: [
      {
        guide: "先抓住完璧归赵里的任务、危险和选择。边读边分清人物手里有什么条件，他怎样判断对方，又怎样一步步守住承诺。",
        question: "蔺相如凭什么化解眼前的危险？",
        focusWords: ["和氏璧", "大臣", "强迫", "承诺", "计划", "推辞", "缺少", "王宫", "献上", "胆怯", "拒绝"],
      },
      {
        guide: "读渑池会面时关注双方的行动如何来回变化。礼节、言语和现场反应都关系到国家尊严，要顺着较量的次序理解。",
        question: "会面中的每一步回应保护了什么？",
        focusWords: ["典礼", "侮辱", "擅长", "击缶", "上卿", "召集", "商议", "抄写"],
      },
      {
        guide: "最后比较廉颇前后的认识和行动。人物愿意修正自己，关系才从冲突走向和好，大局也有了更稳固的支撑。",
        question: "廉颇的改变为什么能让两个人重新并肩？",
        focusWords: ["得罪", "廉颇", "抵御", "削弱", "战袍", "荆条"],
      },
    ],
  },
  7: {
    theme: "顺着比较追上光",
    genre: "science",
    clues: [
      {
        guide: "从熟悉的人和动物开始比较，留意每一次比较都以前一个对象作参照。这样读，速度的层级会一步步变得清楚。",
        question: "作者为什么先从容易想象的对象写起？",
        focusWords: ["鸵鸟", "赢家", "冠军", "俯冲"],
      },
      {
        guide: "对象换成交通工具和火箭以后，速度范围迅速扩大。关注数字、举例和比较怎样帮助读者理解难以直接感受的快。",
        question: "哪些说明方法让更快的速度变得可理解？",
        focusWords: ["喷气", "一枚", "火箭", "浩瀚"],
      },
      {
        guide: "最后读到光时，把前面的比较链完整连起来。留意作者怎样借日常物品和空间概念说明光的速度。",
        question: "如果少了前面的层层比较，结尾还会同样有说服力吗？",
        focusWords: ["手电筒", "一束", "赤道", "圆圈", "难以置信"],
      },
    ],
  },
  8: {
    theme: "看懂地下的智慧",
    genre: "history",
    clues: [
      {
        guide: "先把地道当作一张地下地图来读。辨认入口、通道和不同方向，想清它们怎样把村庄和人连接起来。",
        question: "地道的布局解决了哪些联络问题？",
        focusWords: ["任丘", "岔道", "修筑", "隐蔽"],
      },
      {
        guide: "再看地道里的防守办法。每个机关都有明确用途，把位置和作用对应起来，才能看出设计的周密。",
        question: "不同设施怎样互相配合保护地道里的人？",
        focusWords: ["堡垒", "搁东西", "陷坑", "拐弯", "城堡"],
      },
      {
        guide: "最后回到建造和使用地道的人。环境艰难，办法却不断出现，文章要表现的智慧来自共同协作和守护家乡。",
        question: "人民的智慧具体表现在哪些选择上？",
        focusWords: ["侵略", "党员", "妨碍"],
      },
    ],
  },
  9: {
    theme: "看一个选择的分量",
    genre: "story",
    clues: [
      {
        guide: "先梳理海力布得到宝石的原因和条件。礼物带来新的能力，也带来必须遵守的约定，这为后面的困难埋下了线索。",
        question: "宝石给海力布带来了什么机会和限制？",
        focusWords: ["酬谢", "珍宝", "叮嘱"],
      },
      {
        guide: "知道灾难以后，人物陷入两难。跟着他的言语和行动读，看看时间怎样变紧，乡亲们的反应又怎样增加困难。",
        question: "海力布为什么越来越焦急？",
        focusWords: ["倒塌", "焦急", "发誓", "谎话", "延迟", "灾难"],
      },
      {
        guide: "结尾要联系前面的约定来理解。人物清楚代价仍作出选择，故事的力量来自他把别人的安危放在自己前面。",
        question: "最后的选择让你重新认识了怎样的海力布？",
        focusWords: ["后悔", "扶着老人", "牺牲"],
      },
    ],
  },
  10: {
    theme: "沿相遇梳理故事",
    genre: "story",
    clues: [
      {
        guide: "先认识牛郎原来的生活。家庭关系、日常劳动和周围人的态度共同说明他的处境，也让老牛的陪伴显得格外重要。",
        question: "哪些生活细节让你了解牛郎的性格和处境？",
        focusWords: ["牛郎", "爹娘", "嫂子", "车辆", "好歹", "稀罕", "勤勤恳恳", "筛干草"],
      },
      {
        guide: "老牛开始帮助牛郎以后，故事进入转折。留意提示、准备和行动之间的先后关系，看奇遇怎样一步步成为可能。",
        question: "老牛的哪些帮助推动了故事变化？",
        focusWords: ["一趟", "托着纱衣", "溜出来", "挨挨耳朵", "梭子", "监狱"],
      },
      {
        guide: "相识以后，人物关系发生变化。按相遇、交谈和决定的顺序读，再看看故事怎样为新的生活留下期待。",
        question: "牛郎和织女为何愿意共同开始新的生活？",
        focusWords: ["纱衣", "妻子", "结婚", "一辈子", "酿的葡萄酒", "瞌睡", "落在后边"],
      },
    ],
  },
  11: {
    theme: "在分离中守望团圆",
    genre: "story",
    clues: [
      {
        guide: "先画出人物关系，找清冲突从哪里开始。生活环境和人物选择形成鲜明差别，分离的原因也由此逐渐显露。",
        question: "哪些关系和选择推动了冲突发生？",
        focusWords: ["节俭", "富丽堂皇", "衰老"],
      },
      {
        guide: "追赶发生后，要边读边辨认空间变化。人物经过哪里，借助什么行动，阻隔又怎样出现，故事的紧张感就藏在这条路线中。",
        question: "空间不断变化怎样加快了故事节奏？",
        focusWords: ["珊瑚", "珊瑚礁", "两个筐"],
      },
      {
        guide: "结尾把长久分离和相会愿望放在一起。民间故事借想象保存人们对团圆的期盼，也让人物的守望有了延续。",
        question: "这个结尾寄托了人们怎样的愿望？",
        focusWords: ["依偎", "拗不过"],
      },
    ],
  },
  12: {
    theme: "在三种诗境中听见心声",
    genre: "poetry",
    clues: [
      {
        guide: "读第一首诗时先找时间、人物和最牵挂的事。短短几句里有长期等待，也有临近生命终点仍放不下的心愿。",
        question: "诗人把最深的牵挂交给了谁？",
        focusWords: ["祭祀", "乃至", "可哀"],
      },
      {
        guide: "第二首诗从眼前景物写到现实处境。留意景色的明丽和人物感受之间怎样形成距离，读出文字里的提醒。",
        question: "美景背后藏着诗人怎样的担忧？",
        focusWords: ["熏陶", "杭州"],
      },
      {
        guide: "第三首诗把目光投向人才和时代。读准有力量的动词，再想想诗人期待怎样的改变，语气就会更加清楚。",
        question: "诗人盼望怎样的力量改变眼前局面？",
        focusWords: ["己亥", "恃强", "抖擞", "拘束"],
      },
    ],
  },
  13: {
    theme: "从蓬勃意象走向未来",
    genre: "history",
    clues: [
      {
        guide: "先按停顿读出短句的节奏。声音要有起伏，也要看清句子怎样反复推进，让整段文字形成开阔有力的气势。",
        question: "哪些句式让朗读产生不断向前的力量？",
        focusWords: ["倾泻", "鱼鳞", "美哉", "纵横"],
      },
      {
        guide: "再把文中的自然意象一幅幅看清。江河、光芒和生命都在生长或运动，它们共同塑造了充满活力的形象。",
        question: "这些意象为什么大多处在运动之中？",
        focusWords: ["潜水", "胎儿", "矞矞皇皇"],
      },
      {
        guide: "最后把少年成长和国家未来联系起来。关注文字怎样从眼前的少年走向辽阔疆域，理解其中的期待和责任。",
        question: "文章希望少年把怎样的未来变成现实？",
        focusWords: ["惶恐", "履行", "考试", "边疆"],
      },
    ],
  },
  14: {
    theme: "在盛景与毁灭之间",
    genre: "history",
    clues: [
      {
        guide: "先读圆明园原来的布局和景观。把建筑、园林和空间关系在脑中连成图，才能体会昔日规模与艺术之美。",
        question: "哪些描写帮助你在脑中建立园林地图？",
        focusWords: ["众星拱月", "辉煌", "玲珑", "剔透", "宫殿", "武陵春色", "游览", "安澜园", "瑶台"],
      },
      {
        guide: "接着认识园中收藏的历史文物。留意时间跨度和种类，理解这里保存的文化价值为何无法只用数量衡量。",
        question: "园林和收藏共同构成了怎样的文化价值？",
        focusWords: ["估计", "宏伟", "唐代", "幻想的境界"],
      },
      {
        guide: "最后读毁灭过程时保持时间顺序。把曾经的盛景和留下的结果放在一起，损失的分量会更加清楚。",
        question: "前面的盛景描写怎样加深了结尾的痛惜？",
        focusWords: ["毁灭", "损失", "闯入", "销毁", "奉命", "灰烬"],
      },
    ],
  },
  15: {
    theme: "从一盘菜读懂守岛心意",
    genre: "story",
    clues: [
      {
        guide: "先认识小岛的环境和生活条件。位置、交通和物资都影响人物的日常选择，也让岛上的一片绿色显得难得。",
        question: "小岛的环境给生活带来了哪些困难？",
        focusWords: ["海域", "小艇", "炊事员"],
      },
      {
        guide: "发现菜地和共进晚餐时，跟着将军的观察和疑问读。饭菜、动作和对话都在传递战士们没有直接说出的心意。",
        question: "一盘菜为什么让人物产生复杂感受？",
        focusWords: ["隐瞒", "矛盾", "筷子", "勺子", "搅了几下", "舀起一勺汤"],
      },
      {
        guide: "结尾关注人物说话、停顿和吞咽等细节。情感越深，表达反而越克制，需要从身体反应中体会。",
        question: "哪些细节让你感到人物心里有话没有说完？",
        focusWords: ["哼", "喉咙", "哽咽"],
      },
    ],
  },
  16: {
    theme: "用说明方法认识太阳",
    genre: "science",
    clues: [
      {
        guide: "先读太阳离我们多远、有多大、多热。圈出数字和比较对象，看看作者怎样把遥远而巨大的事物说得可以想象。",
        question: "哪些数字必须借助比较才能真正看懂？",
        focusWords: ["摄氏", "地区", "煤炭"],
      },
      {
        guide: "接着辨认列数字、作比较和举例子等说明方法。每种方法都在解决一个理解难点，要说清它具体帮助了什么。",
        question: "换掉其中一种说明方法，表达会发生什么变化？",
        focusWords: ["粮食", "繁殖"],
      },
      {
        guide: "最后沿着光和热寻找它与地球生命的联系。从天气到植物，再到人的生活，把分散的信息连成一张关系图。",
        question: "太阳怎样通过一连串作用影响我们的生活？",
        focusWords: ["杀菌", "治疗"],
      },
    ],
  },
  17: {
    theme: "有条理地观察松鼠",
    genre: "science",
    clues: [
      {
        guide: "先观察外形，按从整体到局部的顺序读。颜色、身段和尾巴各有特点，作者的词语也带着鲜明的喜爱。",
        question: "哪些外形描写让松鼠显得轻快可爱？",
        focusWords: ["松鼠", "驯良", "矫健", "清秀", "玲珑", "帽子", "尾巴"],
      },
      {
        guide: "再看活动和储食。把每个动作放回环境中，分清它什么时候做、怎样做，由此认识松鼠的生活习性。",
        question: "连续动作表现了松鼠怎样的能力？",
        focusWords: ["歇息", "拾取", "梳理", "光滑"],
      },
      {
        guide: "最后研究住所。位置、材料、形状和内部安排各回答一个问题，顺着这些方面就能学会有条理地介绍动物。",
        question: "作者按哪些方面把松鼠的窝介绍清楚？",
        focusWords: ["树杈", "苔藓", "狭窄", "勉强", "圆锥", "鸟窝"],
      },
    ],
  },
  18: {
    theme: "从细节体会深沉母爱",
    genre: "reflection",
    clues: [
      {
        guide: "先进入母亲工作的环境。声音、光线、机器和拥挤感一起压向人物，读者要先感到这份工作的辛苦。",
        question: "环境描写怎样改变了你对母亲工作的认识？",
        focusWords: ["压抑", "颓败", "缝纫", "噪声", "褐色", "疲惫", "忙碌", "酷暑", "机械"],
      },
      {
        guide: "见到母亲以后，抓住动作、神态和短促对话。人物没有停下工作，许多情感便落在脊背、手势和片刻反应上。",
        question: "哪个细节最能表现母亲忙碌而坚定？",
        focusWords: ["衣兜", "辞别", "吊起", "脊背", "笼罩", "竟然", "好哇", "忍受"],
      },
      {
        guide: "最后关注买书这个选择给孩子带来的变化。把前面看见的环境和母亲的决定联系起来，心酸与敬意便有了来处。",
        question: "这次买书为什么会成为孩子难忘的经历？",
        focusWords: ["魂魄", "耽误", "权利", "心酸"],
      },
    ],
  },
  19: {
    theme: "让一只小舟串起父爱",
    genre: "reflection",
    clues: [
      {
        guide: "先找反复出现的小船和生活物件。它们把分散的往事连在一起，也保存了父子一次次同行的具体情景。",
        question: "小船怎样帮助文章在不同回忆之间移动？",
        focusWords: ["蚕茧", "草席", "糖果", "纸屑", "钉子", "煮饭", "枕头", "客栈"],
      },
      {
        guide: "再梳理求学路上的时间和花费。父亲做出的每个安排都很实际，把路程、费用和生活困难放在一起看。",
        question: "父亲为孩子求学承担了哪些具体辛劳？",
        focusWords: ["考试", "毕业", "偏僻", "出嫁", "缴费", "兼职"],
      },
      {
        guide: "最后从许多小事中概括父爱。人物很少直接表达，疼爱、陪伴和期望都通过行动留下，需要读者自己把它们连起来。",
        question: "哪一件小事最能说明父亲一直托举着孩子？",
        focusWords: ["疼爱", "启迪", "陪伴", "冤枉", "恍惚", "跷跷板", "委屈", "榜样", "嘲笑"],
      },
    ],
  },
  20: {
    theme: "在两种评价中找到方向",
    genre: "reflection",
    clues: [
      {
        guide: "先跟着孩子交出作品后的心情读。期待、害羞和受到鼓励后的兴奋连在一起，表现了肯定怎样给人继续写作的勇气。",
        question: "母亲的评价给孩子带来了什么力量？",
        focusWords: ["腼腆", "誊写", "鼓励"],
      },
      {
        guide: "父亲的评价让故事转向另一种感受。留意孩子的反应，也思考严格判断在作品成长过程中可能发挥什么作用。",
        question: "孩子为什么一时难以接受父亲的评价？",
        focusWords: ["出版", "慈祥"],
      },
      {
        guide: "结尾回看两种声音怎样长期陪伴作者。鼓励保护信心，提醒帮助判断，两者共同让写作走得更稳。",
        question: "成长为什么同时需要肯定和提醒？",
        focusWords: ["歧途", "谨慎"],
      },
    ],
  },
  21: {
    theme: "走进三种秋夜",
    genre: "poetry",
    clues: [
      {
        guide: "第一首诗从雨后秋山展开。按远近和动静寻找景物，再留意人物为何愿意停留，山居的清新与安宁会逐渐显出来。",
        question: "哪些景物共同营造了安静明净的秋夜？",
        focusWords: ["子孙"],
      },
      {
        guide: "第二首诗写客船夜泊。月落、声音和灯火依次进入感官，景物越清楚，旅人的愁绪也越容易被读者感到。",
        question: "诗人怎样用所见所闻写出夜里的愁？",
        focusWords: ["停泊", "发愁", "寺庙"],
      },
      {
        guide: "第三首词沿行程进入风雪夜。地点不断移动，声音却把思乡情绪推近，朗读时要听见节奏里的奔波和难眠。",
        question: "风雪声为什么会让故乡显得更近？",
        focusWords: ["榆树", "河畔", "一更", "聒噪"],
      },
    ],
  },
  22: {
    theme: "用两次经过看动静之美",
    genre: "nature",
    clues: [
      {
        guide: "第一次经过时先看大榕树。沿船行的视线辨认树根、枝叶和水面，体会作者怎样把繁茂的静景写出层次。",
        question: "哪些观察顺序让大榕树显得越来越壮阔？",
        focusWords: ["船桨", "榕树", "木桩", "涨潮"],
      },
      {
        guide: "第二次经过时，画面由静转动。留意声音从哪里出现，鸟群怎样增多，人物的目光又怎样被不断吸引。",
        question: "群鸟出现以后，文章的节奏发生了什么变化？",
        focusWords: ["闪耀", "宝塔", "树梢", "闲暇"],
      },
      {
        guide: "最后把两次所见放在一起比较。一静一动共同说明这里适合生命生长，也解释了题目中天堂的意味。",
        question: "为什么两次经过缺少任何一次都不完整？",
        focusWords: ["纠正", "眉毛", "抛开"],
      },
    ],
  },
  23: {
    theme: "跟着孩子寻找月亮",
    genre: "poetry",
    clues: [
      {
        guide: "先从屋内发现月亮。留意孩子怎样等待、观察和猜想，安静的环境让月光的出现带上了神秘感。",
        question: "月亮初次出现时，孩子们为什么格外专注？",
        focusWords: ["悄没声儿", "瓷器"],
      },
      {
        guide: "走到院中以后，月亮在不同地方留下踪迹。把树梢、水面和眼睛里的月影连起来，寻找路线也就清楚了。",
        question: "月亮为什么仿佛到处都有自己的踪迹？",
        focusWords: ["累累", "嫦娥"],
      },
      {
        guide: "结尾把寻找从外面的景物带回孩子心里。留意争论和发现怎样变化，理解童真如何让普通月夜充满想象。",
        question: "孩子们最后真正找到了什么？",
        focusWords: ["嫉妒"],
      },
    ],
  },
  24: {
    theme: "把古人的读书法用起来",
    genre: "reflection",
    clues: [
      {
        guide: "先读懂诚实面对自己的要求。知道就是知道，有疑问就承认，学习才有继续追问和改正的可能。",
        question: "诚实面对不懂之处会怎样帮助学习？",
        focusWords: ["羞耻", "教诲", "所谓"],
      },
      {
        guide: "再看读书怎样调动眼、口和心。把古人的短句换成自己能执行的动作，方法才会从道理进入每天的学习。",
        question: "眼到、口到、心到分别可以怎样做？",
        focusWords: ["默而识之", "诵读"],
      },
      {
        guide: "最后关注专心和坚持。外在安排影响学习状态，读者可以联系自己的作息，判断哪些习惯需要保留或调整。",
        question: "你的读书习惯里，哪一步最需要改进？",
        focusWords: ["就寝", "矣", "岂能"],
      },
    ],
  },
  25: {
    theme: "沿阅读经历学会选书",
    genre: "reflection",
    clues: [
      {
        guide: "先沿年龄梳理早期阅读经历。书从谁那里来，读到什么，感受怎样变化，这些具体回忆共同说明兴趣如何开始。",
        question: "哪些人和书打开了作者最初的阅读世界？",
        focusWords: ["舅舅", "天津", "宴会", "斩断", "葛布", "鲁莽", "煞有介事", "敌寇"],
      },
      {
        guide: "阅读范围扩大以后，作者开始比较不同作品。留意她用哪些感受和判断选择书，也分清故事吸引人与真正耐读的差别。",
        question: "作者评价一本书时关注了哪些方面？",
        focusWords: ["限制", "凯旋", "讲述", "传记", "商贾", "试卷", "刊物"],
      },
      {
        guide: "结尾把多年经验整理成可使用的建议。把多读、选择和思考分别落实为行动，再判断哪些方法适合自己的阅读生活。",
        question: "你会怎样把作者的经验变成下一次选书行动？",
        focusWords: ["琐事", "呻吟", "某人", "衰老", "统一", "朴实"],
      },
    ],
  },
  26: {
    theme: "看阅读怎样长成文字",
    genre: "reflection",
    clues: [
      {
        guide: "先看书怎样打开想象。阅读兴趣、寻找书籍和沉入故事彼此相连，作者用具体感受说明自己为何不断靠近书。",
        question: "哪些体验让阅读成为持续的需要？",
        focusWords: ["比喻", "上瘾", "奔向", "书籍", "饥饿", "磁铁"],
      },
      {
        guide: "再找阅读进入写作的过程。积累的词句经过观察和思考，慢慢形成新的表达，修改反馈又让文字继续变化。",
        question: "阅读积累经过哪些步骤才会进入自己的文章？",
        focusWords: ["差事", "补偿", "沉甸甸", "反馈", "发酵"],
      },
      {
        guide: "最后归纳作者从阅读和写作中得到的经验。关注方法带来的真实变化，再把其中一条转成自己可以尝试的行动。",
        question: "你准备怎样验证阅读能帮助自己的写作？",
        focusWords: ["领悟", "皎洁", "鉴赏", "呕心沥血"],
      },
    ],
  },
};

function normalizeGuideCopy(text: string) {
  return text.replaceAll("：", "，").replaceAll(":", "，");
}

function guideDocument(position: keyof typeof grade5LessonLearning): LessonDocument {
  const lesson = grade5Volume1Lessons[position - 1];
  const learning = grade5LessonLearning[position];
  const details = guideDetails[position];
  const lessonId = `g5v1-l${String(position).padStart(2, "0")}`;
  if (!lesson || !learning || !details) {
    throw new Error(`Missing lesson guide configuration for lesson ${position}`);
  }

  return {
    lessonId,
    title: `读《${lesson.title}》，${details.theme}`,
    eyebrow: `《${lesson.title}》课文导读`,
    dek: `带着三条线索打开课本，把本课 ${lesson.words.length} 个重点词放回真实阅读过程。`,
    genre: details.genre,
    format: "guide",
    intro: details.intro ?? `${normalizeGuideCopy(lesson.context)} 阅读时沿着下面三条线索，把内容、语言和本课生字连在一起。`,
    rights: guideRights,
    sections: details.clues.map((clue, index) => ({
      id: `${lessonId}-section-${index + 1}`,
      number: sectionNumbers[index],
      title: learning.path[index],
      paragraphs: [{ id: `lesson-paragraph-${index + 1}`, text: clue.guide }],
      question: clue.question,
      focusWords: clue.focusWords,
    })),
  };
}

export function isLessonDocumentPublishable(document: LessonDocument) {
  if (document.rights.publicDisplay !== "full") return false;
  if (document.rights.status === "unverified") return false;
  if (document.rights.status === "original") {
    return document.rights.basis === "authored-in-project";
  }
  return document.rights.basis.trim().length > 0;
}

export const lessonDocuments: Readonly<Record<string, LessonDocument>> = Object.freeze(
  Object.fromEntries(
    grade5Volume1Lessons.map((_, index) => {
      const position = (index + 1) as keyof typeof grade5LessonLearning;
      const document = guideDocument(position);
      return [document.lessonId, document];
    }),
  ),
);

export function getPublishableLessonDocument(lessonId: string) {
  const document = lessonDocuments[lessonId];
  return document && isLessonDocumentPublishable(document) ? document : undefined;
}
