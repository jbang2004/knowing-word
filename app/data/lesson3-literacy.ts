export const LESSON_THREE_ID = "g5v1-l03";

export type LessonThreeRole = "semantic" | "phonetic" | "structural";

export type LessonThreeKnowledge = {
  hanzi: string;
  method: "phonosemantic" | "structure";
  methodLabel: "形声字·形旁声旁" | "部件路线·规范字形";
  structure: string;
  equation: string;
  explanation: string;
  evidence: string;
  recallCue: string;
  components: readonly {
    glyph: string;
    role: LessonThreeRole;
    label: string;
    note: string;
  }[];
};

export const lessonThreeKnowledge: Readonly<Record<string, LessonThreeKnowledge>> = {
  箩: {
    hanzi: "箩",
    method: "phonosemantic",
    methodLabel: "形声字·形旁声旁",
    structure: "上下结构",
    equation: "⺮（表义）+ 罗（表音）= 箩",
    explanation: "上面的竹字头提示它和竹制器具有关，下面的“罗”提示 luó 一类读音。",
    evidence: "按现代规范字形讲构形关系；画面只帮助记住竹箩，不当作历史字源。",
    recallCue: "先想“竹制器具”，再用“罗”找读音。",
    components: [
      { glyph: "⺮", role: "semantic", label: "形旁·表义", note: "提示竹制器具这一意义类别。" },
      { glyph: "罗", role: "phonetic", label: "声旁·表音", note: "提示 luó 一类读音。" },
    ],
  },
  杭: {
    hanzi: "杭",
    method: "phonosemantic",
    methodLabel: "形声字·形旁声旁",
    structure: "左右结构",
    equation: "木（表义）+ 亢（表音）= 杭",
    explanation: "左边“木”是意义线索，右边“亢”提示 háng 一类读音；本课把它放在地名“杭州”里认读。",
    evidence: "按现代规范字形讲构形关系；地名意义要放回词语理解，不逐部件硬解释。",
    recallCue: "看到“亢”先试读 háng，再用“杭州”核对。",
    components: [
      { glyph: "木", role: "semantic", label: "形旁·表义", note: "提供构字时的意义线索。" },
      { glyph: "亢", role: "phonetic", label: "声旁·表音", note: "提示 háng 一类读音。" },
    ],
  },
  懂: {
    hanzi: "懂",
    method: "phonosemantic",
    methodLabel: "形声字·形旁声旁",
    structure: "左右结构",
    equation: "忄（表义）+ 董（表音）= 懂",
    explanation: "竖心旁提示这个字和心里的理解有关，“董”提示 dǒng 的读音。",
    evidence: "按现代规范字形讲形旁、声旁；插图是记忆桥梁，不是造字历史。",
    recallCue: "心里明白就是“懂”，右边“董”帮你读准。",
    components: [
      { glyph: "忄", role: "semantic", label: "形旁·表义", note: "提示心理、感受或认识这一类意义。" },
      { glyph: "董", role: "phonetic", label: "声旁·表音", note: "提示 dǒng 的读音。" },
    ],
  },
  兰: {
    hanzi: "兰",
    method: "structure",
    methodLabel: "部件路线·规范字形",
    structure: "上下结构",
    equation: "丷（在上）+ 三（在下）= 兰",
    explanation: "本课只按现代规范字形观察：两点在上，三横在下，保持上下位置。",
    evidence: "这是书写用的部件路线，不解释历史来源；兰花图片仅帮助联系词义。",
    recallCue: "先写上面的两点，再把下面三横排稳。",
    components: [
      { glyph: "丷", role: "structural", label: "上部·定位", note: "两点位于字的上方。" },
      { glyph: "三", role: "structural", label: "下部·定位", note: "三横在下方，间距要匀。" },
    ],
  },
  婆: {
    hanzi: "婆",
    method: "phonosemantic",
    methodLabel: "形声字·形旁声旁",
    structure: "上下结构",
    equation: "波（表音）+ 女（表义）= 婆",
    explanation: "下面“女”提示和女性称谓有关，上面的“波”提示 pó 一类读音。",
    evidence: "按现代规范字形讲形旁、声旁；在“外婆”这个称谓中理解字义。",
    recallCue: "先用“女”想女性称谓，再借“波”读 pó。",
    components: [
      { glyph: "波", role: "phonetic", label: "声旁·表音", note: "提示 pó 一类读音。" },
      { glyph: "女", role: "semantic", label: "形旁·表义", note: "提示女性称谓这一意义类别。" },
    ],
  },
  糕: {
    hanzi: "糕",
    method: "phonosemantic",
    methodLabel: "形声字·形旁声旁",
    structure: "左右结构",
    equation: "米（表义）+ 羔（表音）= 糕",
    explanation: "米字旁提示它和粮食做成的食物有关，“羔”提示 gāo 一类读音。",
    evidence: "按现代规范字形讲形旁、声旁；食物图片只负责连接“糕饼”的词义。",
    recallCue: "米做的食物，右边“羔”读 gāo。",
    components: [
      { glyph: "米", role: "semantic", label: "形旁·表义", note: "提示粮食、食物这一意义类别。" },
      { glyph: "羔", role: "phonetic", label: "声旁·表音", note: "提示 gāo 一类读音。" },
    ],
  },
  饼: {
    hanzi: "饼",
    method: "phonosemantic",
    methodLabel: "形声字·形旁声旁",
    structure: "左右结构",
    equation: "饣（表义）+ 并（表音）= 饼",
    explanation: "食字旁提示它和食物有关，“并”提示 bǐng 一类读音，声调不完全相同。",
    evidence: "按现代规范字形讲形旁、声旁；声旁只提供读音线索，不保证完全相同。",
    recallCue: "先认食字旁，再借“并”试读 bǐng。",
    components: [
      { glyph: "饣", role: "semantic", label: "形旁·表义", note: "提示食物这一意义类别。" },
      { glyph: "并", role: "phonetic", label: "声旁·表音", note: "提示 bǐng 一类读音，声调会变化。" },
    ],
  },
  浸: {
    hanzi: "浸",
    method: "structure",
    methodLabel: "部件路线·规范字形",
    structure: "左右结构",
    equation: "氵（意义线索）+ 右部（分层定位）= 浸",
    explanation: "三点水提示和水有关；右边按“彐、冖、又”从上到下定位，不把每一部分编成字源故事。",
    evidence: "只说明现代字形和书写位置；右部在本课不作为可靠的读音线索。",
    recallCue: "左边三点水，右边从上到下分三层。",
    components: [
      { glyph: "氵", role: "semantic", label: "意义线索", note: "提示“浸”与水、泡入有关。" },
      { glyph: "彐", role: "structural", label: "右上·定位", note: "位于右部最上方。" },
      { glyph: "冖", role: "structural", label: "右中·定位", note: "承接右部上下两层。" },
      { glyph: "又", role: "structural", label: "右下·定位", note: "稳稳放在右部下方。" },
    ],
  },
  缠: {
    hanzi: "缠",
    method: "structure",
    methodLabel: "部件路线·规范字形",
    structure: "左右结构",
    equation: "纟（意义线索）+ 㢆（右部定位）= 缠",
    explanation: "绞丝旁提示和丝线缠绕有关；右边作为一个整体记位置，不勉强说成准确的读音提示。",
    evidence: "只说明现代简化字的结构与意义线索；助记故事不当作字源。",
    recallCue: "左窄右宽：先写绞丝旁，再把右部放稳。",
    components: [
      { glyph: "纟", role: "semantic", label: "意义线索", note: "提示丝线、缠绕这一意义类别。" },
      { glyph: "㢆", role: "structural", label: "右部·定位", note: "作为整体保持在右侧，不拆成虚构故事。" },
    ],
  },
  茶: {
    hanzi: "茶",
    method: "structure",
    methodLabel: "部件路线·规范字形",
    structure: "上下结构",
    equation: "艹（上）+ 人（中）+ 木（下）= 茶",
    explanation: "用“艹在上、人居中、木在下”的路线记住规范字形；茶树图片只连接“茶叶”的词义。",
    evidence: "这是现代字形的部件定位，不把三部分拼成虚构的造字历史。",
    recallCue: "从上到下记三层：艹、人、木。",
    components: [
      { glyph: "艹", role: "semantic", label: "意义线索", note: "提示植物这一意义类别。" },
      { glyph: "人", role: "structural", label: "中部·定位", note: "位于上下两层之间。" },
      { glyph: "木", role: "structural", label: "下部·定位", note: "在下方承托整个字形。" },
    ],
  },
  捡: {
    hanzi: "捡",
    method: "phonosemantic",
    methodLabel: "形声字·形旁声旁",
    structure: "左右结构",
    equation: "扌（表义）+ 佥（表音）= 捡",
    explanation: "提手旁提示这是手的动作，“佥”是声旁，主要保留 -ian 的韵母线索；读音不完全相同。",
    evidence: "按现代规范字形讲形旁、声旁；声旁只帮助猜读音，还要回到词语“捡起”核对。",
    recallCue: "手做动作是“捡”，佥字族帮助记 jiǎn。",
    components: [
      { glyph: "扌", role: "semantic", label: "形旁·表义", note: "提示用手完成的动作。" },
      { glyph: "佥", role: "phonetic", label: "声旁·表音", note: "主要提示 -ian 韵母线索，读音会有变化。" },
    ],
  },
};

export const qianPhoneticFamily = [
  { hanzi: "捡", semantic: "扌", word: "捡起", lesson: "本课", active: true },
  { hanzi: "睑", semantic: "目", word: "眼睑", lesson: "第4课", active: false },
  { hanzi: "俭", semantic: "亻", word: "节俭", lesson: "第11课", active: false },
] as const;

export function getLessonThreeKnowledge(hanzi: string) {
  return lessonThreeKnowledge[hanzi];
}
