import { mkdir, readFile, writeFile } from "node:fs/promises";
import { accessSync } from "node:fs";
import { resolve, join } from "node:path";
import { convert, getInitialAndFinal, getNumOfTone, pinyin } from "pinyin-pro";
import Hanzi from "hanzi";
import {
  grade5Volume1Lessons,
  grade5LessonLearning,
  officialPolyphonicContexts,
  officialPolyphonicCount,
  officialRecognitionCount,
  officialWritingCount,
} from "../app/data/grade5-volume1-source.ts";
import { mnemonicQualityPlans } from "../app/data/mnemonic-quality.ts";
import { extensionCharacters } from "../app/data/extension-characters.ts";
import { grade5SemanticGold } from "./grade5-semantic-gold.mjs";

const root = resolve(import.meta.dirname, "..");
const dictionaryCache = "/tmp/knowing-word-makemeahanzi-dictionary.txt";
const dictionaryUrl = "https://raw.githubusercontent.com/skishore/makemeahanzi/master/dictionary.txt";
const generatedCatalogRoot = join(root, "app/data/generated/grade5-volume1");
const generatedLessonRoot = join(generatedCatalogRoot, "lessons");
const generatedReviewLessonRoot = join(generatedCatalogRoot, "review-lessons");
const visualModule = join(root, "app/data/grade5-volume1-visuals.generated.ts");
const mnemonicModule = join(root, "app/data/grade5-volume1-mnemonics.generated.ts");
const promptModule = join(root, "scripts/generated/grade5-volume1-image-prompts.generated.ts");
const extensionLearningModule = join(generatedCatalogRoot, "extension-learning.ts");
const mnemonicRoot = join(root, "public/illustrations/mnemonics-v2");

const structureNames = {
  "⿰": "左右结构", "⿱": "上下结构", "⿲": "左中右结构", "⿳": "上中下结构",
  "⿴": "全包围结构", "⿵": "上三包围结构", "⿶": "下三包围结构", "⿷": "左三包围结构",
  "⿸": "左上包围结构", "⿹": "右上包围结构", "⿺": "左下包围结构", "⿻": "穿插结构",
};

const typeNames = {
  pictographic: "象形字", ideographic: "会意字", pictophonetic: "形声字",
  "pictophonetic/ideographic": "形声兼会意字", simplified: "简化字", unknown: "字形字",
};

// Lesson-record meaning must follow the word in this lesson, not the reusable
// dictionary sense of the isolated glyph. These overrides are deliberately
// keyed by glyph + word so later polysemy repairs remain local and auditable.
const contextualLearningOverrides = {
  "鹭|白鹭": {
    semanticOption: "羽色洁白、身段修长的水鸟。",
    semanticClass: "animal",
  },
  "抗|抗日": {
    contextualMeaning: "“抗日”中的“抗”表示抵抗、反抗侵略。",
    contextSentence: "冀中人民利用地道坚持抗日斗争，保卫自己的家乡。",
    semanticOption: "指抵御侵略、保卫家园的行动。",
    semanticClass: "conflict-action",
  },
  "日|抗日": {
    contextualMeaning: "“抗日”中的“日”是日本的简称，这个词表示反抗日本侵略。",
    contextSentence: "地道里的军民坚持抗日斗争，英勇保卫家乡。",
    semanticOption: "指发动侵华战争的国家简称。",
    semanticClass: "social-term",
  },
  "乃|乃至": {
    contextualMeaning: "“乃至”表示甚至、以至于，用来说明范围或程度进一步扩大。",
    contextSentence: "这次展览吸引了本校同学，乃至外地游客也赶来参观。",
    semanticOption: "表示甚至、以至于。",
    semanticClass: "linguistic-expression",
  },
  "略|侵略": {
    semanticOption: "指强行进犯并侵占别国领土。",
    semanticClass: "conflict-action",
  },
  "估|估计": {
    semanticOption: "根据已有情况作大致推算。",
    semanticClass: "cognitive-action",
  },
  "风|台风": {
    semanticOption: "空气流动形成的自然现象。",
    semanticClass: "nature",
  },
  "台|台风": {
    semanticOption: "与后一部分合用，指热带气旋。",
    semanticClass: "nature",
  },
  "水|浇水": {
    semanticOption: "浇灌植物时使用的液体。",
    semanticClass: "nature",
  },
  "距|距离": {
    semanticOption: "两处相隔的长度。",
    semanticClass: "time-quantity",
  },
  "桂|桂花": {
    semanticOption: "一种会开出清香小花的树木。",
    semanticClass: "plant",
  },
  "花|桂花": {
    semanticOption: "植物开放时形成的繁殖部分。",
    semanticClass: "plant",
  },
  "木|木兰花": {
    semanticOption: "一种春季开花的树种。",
    semanticClass: "plant",
  },
  "间|间隔": {
    semanticOption: "两处相隔时留出的距离。",
    semanticClass: "time-quantity",
  },
  "坏|破坏": {
    semanticOption: "使完整的事物受到损害。",
    semanticClass: "action",
  },
  "丘|任丘": {
    semanticOption: "用于组成河北的一个地名。",
    semanticClass: "social-term",
  },
  "厕|厕所": {
    semanticOption: "供人方便和保持卫生的场所。",
    semanticClass: "place",
  },
  "线|光线": {
    semanticOption: "从光源射出的明亮细束。",
    semanticClass: "nature",
  },
  "乡|故乡": {
    semanticOption: "自己出生或长期生活的地方。",
    semanticClass: "place",
  },
  "其|尤其": {
    semanticOption: "进一步突出某种情况。",
    semanticClass: "linguistic-expression",
  },
  "尤|尤其": {
    semanticOption: "表示特别、更加。",
    semanticClass: "linguistic-expression",
  },
  "品|食品": {
    semanticOption: "表示具有某种性质的一类物品。",
    semanticClass: "object",
  },
  "茅|茅亭": {
    semanticOption: "一种可以铺盖屋顶的草本植物。",
    semanticClass: "plant",
  },
  "贵|可贵": {
    semanticOption: "表示值得珍惜和重视。",
    semanticClass: "quality-state",
  },
  "绿|嫩绿": {
    semanticOption: "表示像青草一样的颜色。",
    semanticClass: "quality-state",
  },
  "面|体面": {
    semanticOption: "表示外在的样子和给人的观感。",
    semanticClass: "quality-state",
  },
  "体|体面": {
    semanticOption: "表示光彩、好看。",
    semanticClass: "quality-state",
  },
  "原|平原": {
    semanticOption: "宽广而平坦的陆地。",
    semanticClass: "place",
  },
  "锁|封锁": {
    semanticOption: "用来封闭门户或器物的装置。",
    semanticClass: "object",
  },
  "碎|粉碎": {
    semanticOption: "使完整的东西破成细小部分。",
    semanticClass: "action",
  },
  "直|简直": {
    semanticOption: "表示完全如此，带有强调语气。",
    semanticClass: "linguistic-expression",
  },
  "阔|广阔": {
    semanticOption: "表示范围宽大、开阔。",
    semanticClass: "quality-state",
  },
  "所|厕所": {
    semanticOption: "指特定用途的场所。",
    semanticClass: "place",
  },
  "光|光线": {
    semanticOption: "使物体能够被看见的自然现象。",
    semanticClass: "nature",
  },
  "兵|民兵": {
    semanticOption: "参加武装组织保卫家乡的人。",
    semanticClass: "person",
  },
  "民|民兵": {
    semanticOption: "指普通百姓或国家的公民。",
    semanticClass: "person",
  },
  "弯|拐弯": {
    semanticOption: "改变原来行进的方向。",
    semanticClass: "action",
  },
  "棒|木棒": {
    semanticOption: "一端可以握住的长条形物品。",
    semanticClass: "object",
  },
  "木|木棒": {
    semanticOption: "树干加工后得到的坚硬材料。",
    semanticClass: "object",
  },
  "付|对付": {
    semanticOption: "采取办法处理某件事情。",
    semanticClass: "action",
  },
  "铃|铜铃": {
    semanticOption: "摇动时能够发出清脆声音的器物。",
    semanticClass: "object",
  },
  "铜|铜铃": {
    semanticOption: "一种可以制作器物的金属材料。",
    semanticClass: "object",
  },
  "无|无穷无尽": {
    semanticOption: "表示没有、不存在。",
    semanticClass: "linguistic-expression",
  },
};

function contextualLearningFor(character, word, fallbackMeaning) {
  const override = contextualLearningOverrides[`${character}|${word}`] || {};
  return {
    ...override,
    contextualMeaning: override.contextualMeaning || fallbackMeaning,
    contextSentence: override.contextSentence || "",
    semanticOption: override.semanticOption || "",
    semanticClass: override.semanticClass || "",
  };
}

// MakeMeAHanzi deliberately leaves a few modern simplified composites unnamed.
// These overrides keep the parts teachable instead of silently dropping every
// component after the radical.
// Authoritative structure decisions where the makemeahanzi operator is contested
// or pedagogically misleading for Grade 5 (卿/亥/奉 are taught as whole shapes,
// 幽 follows the mainstream 半包围 treatment instead of 穿插).
const structureOverrides = {
  卿: "独体结构",
  亥: "独体结构",
  奉: "独体结构",
  幽: "半包围结构",
};

const componentOverrides = {
  // Make Me a Hanzi groups 甘 + 欠 into the Extension-B component 𣢟.
  // That glyph is absent even from the bundled LXGW WenKai source face and
  // renders as tofu or U+FFFD in WeChat. The visible modern teaching split is
  // the same shape expressed with the portable components children can read.
  嵌: ["山", "甘", "欠"],
  亭: ["亠", "口", "冖", "丁"], 享: ["亠", "口", "子"], 免: ["⺈", "口", "儿"],
  唐: ["广", "肀", "口"], 疆: ["弓", "土", "畺"], 浸: ["氵", "彐", "冖", "又"], 茶: ["艹", "人", "木"], 惰: ["忄", "左", "月"],
  衡: ["彳", "田", "大", "亍"], 臣: ["臣"], 赤: ["赤"], 侵: ["亻", "彐", "冖", "又"],
  延: ["廴", "丿", "止"], 监: ["〢", "丿", "一", "丶", "皿"], 狱: ["犭", "讠", "犬"], 乃: ["乃"],
  郎: ["良", "阝"], 妻: ["十", "彐", "女"], 衰: ["衰"], 熏: ["熏"],
  祭: ["月", "又", "示"], 瑶: ["王", "爫", "缶"], 毁: ["臼", "工", "殳"],
  览: ["〢", "丿", "一", "丶", "见"], 瞒: ["目", "艹", "两"], 矛: ["矛"],
  氏: ["氏"], 鼠: ["鼠"], 兜: ["兜"], 席: ["广", "廿", "巾"],
  桨: ["丬", "夕", "木"], 寝: ["宀", "丬", "彐", "冖", "又"], 抛: ["扌", "九", "力"],
  煞: ["刍", "攵", "灬"], 寇: ["宀", "元", "攴"], 琐: ["王", "⺌", "贝"],
  鉴: ["〢", "丿", "一", "丶", "金"], 幽: ["幺", "幺", "山"], 盾: ["⺁", "十", "目"],
  区: ["匸", "乂"], 惫: ["备", "心"], 脊: ["脊"], 兼: ["兼"], 更: ["更"], 差: ["⺶", "工"],
};

const componentAliases = { "㣺": "⺗", "足": "⻊", "⺼": "月" };

// Variant forms are equivalent only for matching component evidence. We keep
// the visible modern glyph in char, and put the evidence form in
// normalizedChar. In particular, 月 is normalized to 肉 only when the
// etymology explicitly says that the component is the meat form.
const componentVariantGroups = [
  ["足", "⻊"],
  ["肉", "⺼", "月"],
  ["心", "忄", "⺗", "㣺"],
  ["手", "扌"],
  ["水", "氵"],
  ["火", "灬"],
  ["犬", "犭"],
  ["示", "礻"],
  ["衣", "衤"],
  ["言", "讠"],
  ["食", "饣"],
  ["金", "钅"],
  ["人", "亻"],
  ["刀", "刂"],
  ["艸", "艹"],
];

function glyphs(value = "") { return Array.from(value); }
function unique(values) { return [...new Set(values)]; }
function lessonId(position) { return `g5v1-l${String(position).padStart(2, "0")}`; }
function codeId(character) { return `u${character.codePointAt(0).toString(16)}`; }
function charId(position, index, character) { return `${lessonId(position)}-c${String(index + 1).padStart(2, "0")}-${codeId(character)}`; }
function pinyinFor(lesson, word, character) {
  const override = officialPolyphonicContexts[`${lesson.position}:${character}`];
  if (override) return override.pinyin;
  const chars = Array.from(word);
  const syllables = pinyin(word, { toneType: "symbol", type: "array", v: true });
  const index = chars.indexOf(character);
  return syllables[Math.max(0, index)] || pinyin(character, { toneType: "symbol" });
}

function wordFor(lesson, character) {
  const override = officialPolyphonicContexts[`${lesson.position}:${character}`];
  if (override) return override.word;
  return lesson.words.find((word) => word.includes(character)) || character;
}

function decompositionFor(record, parts) {
  if (structureOverrides[record?.character]) return structureOverrides[record.character];
  if (parts.length === 1 && record?.character === parts[0]) return "独体结构";
  const operator = record?.decomposition?.[0];
  if (structureNames[operator]) return structureNames[operator];
  return parts.length <= 1 ? "独体结构" : "组合结构";
}

function topParts(character) {
  if (componentOverrides[character]) return componentOverrides[character];
  const decomposed = Hanzi.decompose(character, 1)?.components || [];
  const clean = decomposed.filter((part) =>
    part
    && part !== "？"
    && part !== "No glyph available"
    && !part.startsWith("["),
  ).slice(0, 3);
  if (!clean.length || clean.join("") === character) return [character];
  return clean.map((part) => componentAliases[part] || part);
}

function independentGenerationParts(character, teachingParts) {
  if (teachingParts.length > 1 && !teachingParts.includes(character)) {
    return teachingParts;
  }
  for (const depth of [1, 2, 3]) {
    const raw = Hanzi.decompose(character, depth)?.components || [];
    if (!raw.length || raw.some((part) =>
      !part || part === "？" || part === "No glyph available" || part.startsWith("[")
    )) continue;
    const clean = raw.map((part) => componentAliases[part] || part);
    if (clean.length > 1 && !clean.includes(character)) return clean;
  }
  throw new Error(`cannot build target-hidden independent generation parts for ${character}`);
}

function generationSequenceChoices(parts, character) {
  const correct = parts.join(" → ");
  const alternatives = [];
  const add = (candidate) => {
    const text = candidate.join(" → ");
    if (text !== correct && !alternatives.includes(text)) alternatives.push(text);
  };
  add([...parts].reverse());
  for (let offset = 1; offset < parts.length; offset += 1) {
    add([...parts.slice(offset), ...parts.slice(0, offset)]);
  }
  const distractors = ["木", "口", "土", "日", "人", "又", "丶", "一"]
    .filter((part) => part !== character && !parts.includes(part));
  for (let index = 0; alternatives.length < 3 && index < distractors.length; index += 1) {
    const replaced = [...parts];
    replaced[index % replaced.length] = distractors[index];
    add(replaced);
  }
  return { correct, alternatives: alternatives.slice(0, 3) };
}

function componentEvidenceMatch(part, evidence) {
  if (!evidence) return { matches: false, normalizedChar: part, variant: false };
  const evidenceGroup = componentVariantGroups.find((items) => items.includes(evidence));
  const normalizedEvidence = evidenceGroup?.[0] === "肉" && evidence === "月"
    ? "月"
    : evidenceGroup?.[0] || evidence;
  if (part === evidence) return { matches: true, normalizedChar: normalizedEvidence, variant: false };
  const group = componentVariantGroups.find((items) =>
    items.includes(part) && items.includes(evidence),
  );
  return group
    ? { matches: true, normalizedChar: normalizedEvidence, variant: true }
    : { matches: false, normalizedChar: part, variant: false };
}

function componentRole(part, record, character) {
  if (character === "嵌") {
    // 甘 and 欠 are exposed here only to express the visible lower shape with
    // portable glyphs. They are not independent top-level etymological
    // evidence, so do not promote the nested 欠 shape to a verified sound
    // component or teach an unsupported phonetic rule.
    return {
      char: part,
      role: "graphic",
      normalizedChar: part,
      functionText: `“${part}”在这里负责构成现代字形，不能只凭它推断字义或读音。`,
      confidence: "verified",
      source: "project portable visible component override",
    };
  }
  if (character === "间" && (part === "门" || part === "日")) {
    return {
      char: part,
      role: "semantic",
      normalizedChar: part,
      functionText: "“" + part + "”与另一个部件共同会意，帮助理解中间、间隙的意思。",
      confidence: "verified",
      source: "Make Me a Hanzi ideographic hint + project teaching alignment",
    };
  }
  const semantic = componentEvidenceMatch(part, record?.etymology?.semantic);
  // The modern teaching split and the source mnemonic expose 龸 in 党, while
  // the dictionary's top-level IDS names the overlapping sound element 尚.
  const phonetic = character === "党"
    && part === "龸"
    && record?.etymology?.phonetic === "尚"
    ? {
        matches: true,
        normalizedChar: "尚",
        variant: true,
        alignment: "project top-level IDS alignment",
      }
    : componentEvidenceMatch(part, record?.etymology?.phonetic);
  const role = semantic.matches && phonetic.matches
    ? "mixed"
    : semantic.matches
      ? "semantic"
      : phonetic.matches
        ? "phonetic"
        : "graphic";
  const normalizedChar = semantic.matches
    ? semantic.normalizedChar
    : phonetic.matches
      ? phonetic.normalizedChar
      : part;
  if (role === "semantic") {
    return {
      char: part,
      role,
      normalizedChar,
      functionText: "“" + part + "”在这个字里是表义部件，提示意义类别。",
      confidence: "verified",
      source: semantic.variant
        ? "Make Me a Hanzi etymology.semantic + standard component variant"
        : "Make Me a Hanzi etymology.semantic",
    };
  }
  if (role === "phonetic") {
    return {
      char: part,
      role,
      normalizedChar,
      functionText: "“" + part + "”在这个字里是声旁，只提供大致读音线索，实际读音要放进词语核实。",
      confidence: "verified",
      source: phonetic.alignment
        || (phonetic.variant
        ? "Make Me a Hanzi etymology.phonetic + standard component variant"
        : "Make Me a Hanzi etymology.phonetic"),
    };
  }
  if (role === "mixed") {
    return {
      char: part,
      role,
      normalizedChar,
      functionText: "“" + part + "”兼有表义和表音作用；读音线索只是大致提示，仍要放进词语核实。",
      confidence: "verified",
      source: "Make Me a Hanzi etymology.semantic + etymology.phonetic",
    };
  }
  return {
    char: part,
    role,
    normalizedChar,
    functionText: "“" + part + "”在这里负责构成现代字形，不能只凭它推断字义或读音。",
    confidence: "verified",
    source: componentOverrides[character]
      ? "project top-level component override"
      : "Hanzi top-level decomposition (Make Me a Hanzi-derived)",
  };
}

function characterType(record, partDetails) {
  const sourceType = record?.etymology?.type || "unknown";
  const hasPhonetic = partDetails.some((part) =>
    part.role === "phonetic" || part.role === "mixed"
  );
  const hasSemantic = partDetails.some((part) =>
    part.role === "semantic" || part.role === "mixed"
  );
  if (sourceType.includes("pictophonetic") && !hasPhonetic) {
    return "现代字形字";
  }
  if (sourceType === "ideographic" && !hasSemantic) {
    return "现代字形字";
  }
  return typeNames[sourceType] || "字形字";
}

function partIsDictionaryRadical(part, radical) {
  return componentEvidenceMatch(part, radical).matches;
}

function makeOptions(id, values, correctValues, radicalValues = [], idc = {}) {
  return values.map((text, index) => ({
    id: `${id}-${index}`,
    text,
    correct: correctValues.includes(text),
    radical: radicalValues.includes(text),
    idcCode: idc[text] || "",
  }));
}

function optionErrorMetadata(options, tags) {
  return Object.fromEntries(
    options
      .filter((option) => !option.correct)
      .map((option) => [option.id, tags]),
  );
}

function learningMetadataFor(exercise) {
  if (exercise.id.endsWith("-words-pronunciation")) {
    return { dimension: "phonology", answerMode: "choice", cueLevel: 0, tags: ["pronunciation-tone"] };
  }
  if (exercise.id.endsWith("-words-context")) {
    return { dimension: "recognition", answerMode: "choice", cueLevel: 0, tags: ["lookalike-confusion", "homophone-confusion"] };
  }
  if (exercise.questionType === "image_single_select") {
    return { dimension: "recognition", answerMode: "choice", cueLevel: 1, tags: ["lookalike-confusion"] };
  }
  if (exercise.questionType === "character_structure_select") {
    return { dimension: "discrimination", answerMode: "choice", cueLevel: 0, tags: ["component-position"] };
  }
  if (exercise.id.endsWith("-words-components")) {
    return { dimension: "discrimination", answerMode: "choice", cueLevel: 1, tags: ["component-extra"] };
  }
  if (exercise.id.endsWith("-split-components")) {
    return { dimension: "generation", answerMode: "choice", cueLevel: 2, tags: ["component-extra"] };
  }
  if (exercise.questionType === "composition_select_to_text") {
    return exercise.origin === "拆一拆"
      ? { dimension: "generation", answerMode: "choice", cueLevel: 2, tags: ["component-extra"] }
      : { dimension: "discrimination", answerMode: "choice", cueLevel: 1, tags: ["component-extra"] };
  }
  if (exercise.questionType === "radical_component_select") {
    return { dimension: "discrimination", answerMode: "choice", cueLevel: 1, tags: ["semantic-component"] };
  }
  if (exercise.questionType === "write_full_word_empty") {
    return { dimension: "generation", answerMode: "handwriting", cueLevel: 0, tags: ["writing-unverified"] };
  }
  if (exercise.kind === "write") {
    return { dimension: "generation", answerMode: "handwriting", cueLevel: 3, tags: ["writing-unverified"] };
  }
  return { dimension: "recognition", answerMode: "choice", cueLevel: 1, tags: ["meaning-unknown"] };
}

function annotateExercise(exercise, override) {
  if (!override
    && exercise.dimension
    && exercise.answerMode
    && exercise.cueLevel !== undefined
    && exercise.optionErrorTags) {
    return exercise;
  }
  const metadata = override || learningMetadataFor(exercise);
  return {
    ...exercise,
    dimension: metadata.dimension,
    answerMode: metadata.answerMode,
    cueLevel: metadata.cueLevel,
    optionErrorTags: optionErrorMetadata(exercise.options, metadata.tags),
  };
}

let courseGlyphPool = [];
let courseReadingPool = [];
let courseMeaningPool = [];
let confusionGlyphPool = [];

function normalizedReading(value) {
  return String(value || "").normalize("NFC").replace(/\s+/gu, "");
}

function partsOverlap(left, right) {
  return left.some((leftPart) =>
    right.some((rightPart) => componentEvidenceMatch(leftPart, rightPart).matches)
  );
}

function pickConfusionCandidates({ character, pinyinText, parts, structure, index, count = 3 }) {
  const targetReading = normalizedReading(pinyinText);
  const candidates = confusionGlyphPool
    .filter((candidate) => candidate.character !== character)
    .map((candidate) => {
      const homophone = candidate.readings.some((reading) =>
        normalizedReading(reading) === targetReading
      );
      const sharedPart = partsOverlap(parts, candidate.parts);
      const sameStructure = Boolean(structure) && candidate.structure === structure;
      const evidenceLevel = homophone || sharedPart ? 2 : sameStructure ? 1 : 0;
      const score = evidenceLevel * 10_000
        + Number(homophone) * 2_000
        + Number(sharedPart) * 1_000
        + Number(sameStructure) * 100
        - candidate.rank;
      const tags = unique([
        ...(homophone ? ["homophone-confusion"] : []),
        ...(sharedPart || sameStructure ? ["lookalike-confusion"] : []),
      ]);
      return { ...candidate, homophone, sharedPart, sameStructure, score, tags };
    })
    .sort((left, right) => right.score - left.score || left.rank - right.rank);

  // Rotate within the equally useful tail so neighbouring characters do not
  // all receive the same generic fallback, while always keeping the strongest
  // homophone/component evidence first.
  const preferred = candidates.filter((candidate) => candidate.score >= 10_000);
  const structural = candidates.filter((candidate) =>
    candidate.score < 10_000 && candidate.sameStructure
  );
  const fallback = candidates.filter((candidate) =>
    candidate.score < 10_000 && !candidate.sameStructure
  );
  const selected = [...preferred];
  for (const pool of [structural, fallback]) {
    if (selected.length >= count || !pool.length) break;
    const offset = index % pool.length;
    for (let step = 0; step < pool.length && selected.length < count; step += 1) {
      selected.push(pool[(offset + step) % pool.length]);
    }
  }
  return selected.slice(0, count).map((candidate) => ({
    character: candidate.character,
    tags: candidate.tags.length ? candidate.tags : ["lookalike-confusion"],
    highValue: candidate.homophone || candidate.sharedPart,
  }));
}

function confusionOptionMetadata(options, candidates, baseTags = []) {
  const tagsByCharacter = new Map(
    candidates.map((candidate) => [candidate.character, candidate.tags]),
  );
  return Object.fromEntries(
    options
      .filter((option) => !option.correct)
      .map((option) => [
        option.id,
        unique([...baseTags, ...(tagsByCharacter.get(option.text) || ["lookalike-confusion"])]),
      ]),
  );
}

function readingFeatures(value) {
  const normalized = normalizedReading(value);
  const { initial = "", final = normalized } = getInitialAndFinal(normalized);
  return {
    initial,
    final: convert(final, { format: "toneNone" }),
    tone: getNumOfTone(normalized),
  };
}

function pickReadingDistractors(correct, index, count = 3) {
  const target = readingFeatures(correct);
  const candidates = courseReadingPool
    .filter((reading) => reading && normalizedReading(reading) !== normalizedReading(correct))
    .map((reading, rank) => {
      const feature = readingFeatures(reading);
      const sameInitial = feature.initial === target.initial;
      const sameFinal = feature.final === target.final;
      const sameTone = feature.tone === target.tone;
      const score = Number(sameInitial && sameFinal) * 3_000
        + Number(sameFinal) * 2_000
        + Number(sameInitial) * 1_000
        + Number(sameTone) * 100
        - rank;
      const tags = unique([
        ...(!sameInitial ? ["pronunciation-initial"] : []),
        ...(!sameFinal ? ["pronunciation-final"] : []),
        ...(sameInitial && sameFinal && !sameTone ? ["pronunciation-tone"] : []),
      ]);
      return { text: reading, score, tags };
    })
    .sort((left, right) => right.score - left.score);
  const selected = candidates.slice(0, count);
  if (selected.length < count && candidates.length) {
    const offset = index % candidates.length;
    for (let step = 0; selected.length < count && step < candidates.length; step += 1) {
      const candidate = candidates[(offset + step) % candidates.length];
      if (!selected.some((item) => item.text === candidate.text)) selected.push(candidate);
    }
  }
  return selected;
}

const semanticDistractorBanks = {
  "conflict-action": [
    "在多个地点之间快速转移并寻找机会打乱敌方部署", "避开正面交锋、利用熟悉环境不断扰乱敌方行动",
    "灵活改变位置并向敌方发动突然攻势", "在不同地点迅速转移并持续扰乱敌方行动",
    "发现敌情后及时传递消息", "危险来临前组织人员撤离", "战斗结束后救助受伤人员",
    "修筑工事以保护重要地点", "把重要物资转移到安全处", "安排人员轮流观察周围动静",
  ],
  "cognitive-action": [
    "作出判断", "理解含义", "推测结果", "比较线索",
    "结合已知情况推测可能结果", "比较不同线索后作出判断",
    "把多条线索放在一起比较，再判断事情可能出现的结果",
    "先查看已有资料，再推断陌生现象背后可能存在的原因",
    "结合前后信息反复思考，最后找出最符合条件的解释",
    "根据线索判断事情的原因", "观察变化后记录得到的结果", "比较不同信息并作出选择",
    "回想已有经验寻找解决办法", "阅读前后内容理解陌生说法", "按照已知条件推算大致结果",
  ],
  "linguistic-expression": [
    "用于说明说话人态度和语气变化的一种表达", "放在句子末尾表示肯定或感叹的文言说法",
    "用来加强肯定或赞叹语气的表达", "说明前后内容存在转折关系的说法",
    "加强语气", "计算数量", "连接前后内容", "表达赞叹",
    "用于加强语气的一种表达", "用于计算物件数量的说法", "表示转折关系的连接表达",
    "形容声音轻而连续的词语", "表示范围逐步扩大的说法", "用于称呼某类事物的名称",
  ],
  "social-term": [
    "古代社会按照共同规则设置并长期沿用的一种正式名称",
    "古代举行重要活动时使用的礼仪名称", "用来记录一段历史时期的正式名称",
    "古代国家举行重大活动时使用的一种正式礼仪名称",
    "社会成员按照共同规则组成并承担公共事务的组织",
    "用来记录某段历史时期并方便后人查找的年代名称",
    "古代纪年名称", "地区使用的简称", "历史事件名称", "社会身份称呼",
    "古代记录年份的一种名称", "国家之间正式往来的称呼", "历史事件使用的简短名称",
    "社会成员承担的一种身份", "纪念重要日子的节日名称", "用于区分地区的正式简称",
  ],
  animal: [
    "栖息在水边、善于捕食小鱼的鸟类", "生活在树林里、善于跳跃的小动物",
    "生活在山林中、善于攀爬和寻找果实的小动物",
    "常在夜间活动、依靠灵敏听觉寻找食物的动物",
    "羽翼有力、会随着季节变化成群迁徙的鸟类",
    "水边生活的鸟类", "善于游动的动物", "夜间活动的兽类", "成群飞行的鸟类",
    "羽翼宽大、常在高空盘旋的鸟类", "生活在水边、善于游动的动物", "体形小巧、尾巴蓬松的林间动物",
    "身披硬壳、行动缓慢的小动物", "夜间活动、听觉灵敏的动物", "成群迁徙、善于飞行的鸟类",
  ],
  plant: [
    "一种适合生长在温暖湿润环境中的多年生观赏植物",
    "根系发达、能够保持水土的植物", "花期较长、适合庭院观赏的植物",
    "根系发达、能够牢固保持水土的多年生植物",
    "花期较长、常被种在庭院中供人观赏的植物",
    "依靠柔软藤条沿着支架向上生长的木本植物",
    "常绿的观赏植物", "会结果的植物", "沿支架生长的藤本", "水边生长的植物",
    "叶片细长、四季常青的植物", "花朵清香、适合观赏的植物", "藤条柔韧、沿着支架生长的植物",
    "果实成熟后可以食用的植物", "根系发达、能够固土的植物", "生长在水边、叶面宽大的植物",
  ],
  person: [
    "负责照顾集体生活并提供帮助的人", "经过学习、能够传授专门知识的人",
    "负责照顾集体生活并帮助大家解决困难的人",
    "经过长期学习、能够向别人传授专门知识的人",
    "在公共岗位上按照规则为大家提供服务的人员",
    "照顾家人的长辈", "守护家乡的人", "传授知识的人", "制作器物的工匠",
    "负责照顾家人的年长亲属", "保卫家乡、守护百姓的人", "专门研究学问并传授知识的人",
    "善于制作器物的劳动者", "带领大家完成任务的人", "在故事中推动情节的人物",
  ],
  place: [
    "供人居住和开展日常活动的区域", "连接多个房间并方便人员来往的通道",
    "位于城市边缘、供人参观休息并保存历史景物的公共场所",
    "依山傍水、通过道路连接多个生活区域的居民聚居地",
    "四周有坚固围墙、内部划分多个功能空间的大型建筑群",
    "连接不同区域、供行人和车辆安全来往的公共通行空间",
    "供人休息的地方", "连接两处的道路", "存放物品的空间", "大家活动的场地",
    "供人休息和躲避风雨的地方", "连接两处、方便通行的道路", "用来存放物品的室内空间",
    "人们聚集活动的开阔场地", "依山临水、适合居住的区域", "四周封闭、只留入口的空间",
  ],
  "time-quantity": [
    "从活动开始到完成所经过的时间", "说明事物先后排列和彼此位置的次序",
    "从一项活动开始到全部完成所经过的一整段时间",
    "用来说明多个事物先后排列和彼此位置的一种次序",
    "两个地点之间沿着道路实际测量得到的相隔长度",
    "先后次序", "一段时间", "所在位置", "多少数量",
    "事情发生先后的顺序", "从开始到结束的一段时间", "物体所在的方向和位置",
    "用来比较多少的数量", "范围向外延伸的程度", "两处之间相隔的长度",
  ],
  nature: [
    "水汽聚集后随气温变化形成的天气现象", "河水受降雨影响而改变流速的自然现象",
    "水汽在高空聚集后随气温变化形成的一种天气现象",
    "地表受到阳光照射后逐渐升温并产生明暗变化的现象",
    "河水受到地势和降雨影响而持续改变流速的自然现象",
    "空气流动的现象", "水汽凝结的现象", "光照产生的变化", "岩石风化的颗粒",
    "空气流动形成的自然现象", "水汽凝结后落下的自然现象", "地面受到光照后产生的明暗变化",
    "岩石长期风化形成的细小颗粒", "河水随地势向低处流动的现象", "云层遮挡阳光形成的天气变化",
  ],
  object: [
    "由坚硬材料制成的日常劳动工具", "内部留有空间、用来收纳用品的容器",
    "由坚硬材料制成、能够帮助人们完成劳动任务的工具",
    "内部留有空间、专门用来分类收纳日常用品的容器",
    "可以随身携带、在光线不足时提供照明的小型设备",
    "经过多道工序加工、供人记录和保存重要内容的物品",
    "便携的照明工具", "盛放物品的容器", "坚硬的劳动工具", "记录内容的物品",
    "用来照明、便于携带的工具", "用来盛放小件物品的容器", "由坚硬材料制成的劳动工具",
    "供人阅读、记录内容的物品", "用于出行、能够载人的交通工具", "穿在身上、能够保暖的物品",
  ],
  "body-part": [
    "位于面部中央、能够帮助呼吸的部位", "连接躯干和手掌、能够弯曲的身体部分",
    "位于面部中央、能够帮助人辨别气味和顺畅呼吸的部位",
    "连接躯干和手掌、能够弯曲并完成多种动作的身体部分",
    "覆盖在身体外面、可以感受冷热并起保护作用的组织",
    "位于口腔内、帮助咀嚼的部分", "连接手掌和手臂的部位", "覆盖在头顶、能够保护皮肤的部分",
    "帮助身体弯曲和伸展的关节", "位于面部、能够辨别气味的部位", "保护脚底并支撑行走的部分",
  ],
  "quality-state": [
    "形容遇到变化仍然镇定的状态", "形容物体表面细致均匀的特点",
    "形容一个人遇到突发情况仍然镇定、做事有条理的状态",
    "形容物体表面细致均匀、没有明显凹凸和裂纹的特点",
    "形容环境十分安静、几乎听不到其他声响时的样子",
    "平静安稳的状态", "迅速熟练的样子", "精神振奋的状态", "明亮柔和的样子",
    "形容心情平静而安稳的状态", "形容动作迅速而熟练的样子", "形容精神振奋、充满力量的状态",
    "形容光线明亮而柔和的样子", "形容物体细小而精巧的特点", "形容环境安静、没有声响的状态",
  ],
  action: [
    "观察情况后选择合适办法完成任务", "把散落材料分类收集并整理整齐",
    "先观察周围情况，再选择合适方法完成任务的行动",
    "把散落材料分类收集，并按原来位置整理整齐的动作",
    "遇到突发情况时及时提醒他人并采取保护措施的做法",
    "按照事先约定的步骤逐项检查并完成全部工作的行为",
    "保护重要物品", "迅速离开危险", "收集散落物品", "观察并记录变化",
    "用双手保护重要物品的行动", "遇到危险时迅速离开的动作", "把散落物品收集起来的行动",
    "认真观察并记录变化的行为", "共同抵挡外来危险的行动", "按照要求完成任务的做法",
  ],
  "abstract-concept": [
    "人与人长期相处后建立的信任关系", "处理复杂问题时用来作出选择的原则",
    "人与人长期相处后逐渐建立、彼此愿意遵守的信任关系",
    "处理复杂问题时用来判断先后轻重并作出选择的原则",
    "根据多次经历总结出来、能够帮助解决新问题的道理",
    "不同事物互相影响并共同发生变化时形成的联系和规律",
    "彼此信任的关系", "处理问题的原则", "坚持不放弃的精神", "根据现象作出的判断",
    "人与人之间彼此信任的关系", "处理问题时遵循的一种原则", "面对困难时坚持不放弃的精神",
    "根据现象作出的合理判断", "事物之间相互联系的方式", "从经历中逐渐明白的道理",
  ],
};

function semanticFormFor(semanticClass) {
  if (semanticClass === "action" || semanticClass.endsWith("-action")) return "verb-action";
  if (semanticClass === "quality-state") return "adjective-state";
  if (semanticClass === "time-quantity") return "measure-expression";
  return "noun-concept";
}

function lessonSemanticGold(character, word) {
  const key = `${character}|${word}`;
  const entry = grade5SemanticGold[key];
  if (!entry) throw new Error(`missing independent semantic gold: ${key}`);
  const text = String(entry.option || "").replace(/[。！？；]+$/u, "").trim();
  if (!text || text.includes(character) || text.includes(word)) {
    throw new Error(`semantic gold leaks target or is empty: ${key} / ${text}`);
  }
  if (!entry.semanticClass || !entry.semanticForm) {
    throw new Error(`semantic gold lacks independent class/form: ${key}`);
  }
  return {
    text,
    semanticClass: entry.semanticClass,
    semanticForm: entry.semanticForm,
    goldKey: key,
  };
}

const meaningSynonymGroups = [
  ["抵御", "抵挡", "抵抗", "反抗", "抗拒", "挡住", "阻挡"],
  ["帮助", "协助", "援助", "帮忙"],
  ["害怕", "恐惧", "惧怕", "畏惧"],
  ["喜爱", "喜欢", "爱好", "嗜好"],
  ["观看", "观察", "注视", "凝视"],
  ["快速", "迅速", "飞快", "敏捷"],
];

function normalizedMeaning(value) {
  return String(value || "")
    .replace(/[“”‘’「」『』，、。；：！？,.!?;:\s]/gu, "")
    .replace(/(?:表示|意思是|指的是|本义是|在这里|这个词)/gu, "");
}

function meaningBigrams(value) {
  const glyphs = Array.from(value);
  return new Set(glyphs.slice(0, -1).map((glyph, index) => glyph + glyphs[index + 1]));
}

function meaningsConflict(correct, candidate) {
  const left = normalizedMeaning(correct);
  const right = normalizedMeaning(candidate);
  if (!left || !right) return true;
  if (left.includes(right) || right.includes(left)) return true;
  if (meaningSynonymGroups.some((group) =>
    group.some((term) => left.includes(term))
    && group.some((term) => right.includes(term))
  )) return true;
  const leftBigrams = meaningBigrams(left);
  const rightBigrams = meaningBigrams(right);
  const overlap = [...leftBigrams].filter((item) => rightBigrams.has(item)).length;
  const denominator = Math.min(leftBigrams.size, rightBigrams.size);
  return denominator > 0 && overlap / denominator >= 0.5;
}

function pickMeaningDistractors(correct, character, word, index, count = 3) {
  const safePool = courseMeaningPool
    .filter((candidate) =>
      candidate.text !== correct.text
      && candidate.semanticBank === true
      && candidate.semanticClass === correct.semanticClass
      && candidate.semanticForm === correct.semanticForm
      && !candidate.text.includes(character)
      && !candidate.text.includes(word)
      && !meaningsConflict(correct.text, candidate.text)
    )
    .sort((left, right) => {
      const lengthDifference = Math.abs(Array.from(left.text).length - Array.from(correct.text).length)
        - Math.abs(Array.from(right.text).length - Array.from(correct.text).length);
      if (lengthDifference) return lengthDifference;
      return (left.rank + index) % courseMeaningPool.length
        - (right.rank + index) % courseMeaningPool.length;
    });
  if (safePool.length < count) {
    throw new Error(`not enough same-class semantic distractors for ${character}/${word} (${correct.semanticClass})`);
  }
  const correctLength = Array.from(correct.text).length;
  const atLeastAsLong = safePool.find((candidate) =>
    Array.from(candidate.text).length >= correctLength
  );
  const atMostAsLong = safePool.find((candidate) =>
    Array.from(candidate.text).length <= correctLength && candidate !== atLeastAsLong
  );
  const selected = unique([atLeastAsLong, atMostAsLong, ...safePool].filter(Boolean))
    .slice(0, count);
  if (selected.length < count) {
    throw new Error(`cannot balance semantic distractor lengths for ${character}/${word}`);
  }
  return selected;
}

function contextCue(value, character, word) {
  const clauses = String(value || "").split(/[；。！？]/u).map((item) => item.trim()).filter(Boolean);
  const metalinguistic = /形声|会意|结构|本义|字形|部件|读音|在这里|就指/u;
  const definitional = /(?:是|表示|指|通常|形容|意思为|本义为)/u;
  const clause = clauses.find((item) =>
    item.includes(character)
    && item.split(character).length === 2
    && !metalinguistic.test(item)
    && !definitional.test(item)
  );
  const source = clause
    || `课外阅读中，我读到“${word}”这一表达，并结合前后句理解了它`;
  let concealed = false;
  return Array.from(trimStop(source)).map((glyph) => {
    if (glyph !== character) return glyph;
    if (!concealed) {
      concealed = true;
      return "□";
    }
    return "它";
  }).join("");
}

function scientificExerciseSet({
  base,
  character,
  word,
  pinyinText,
  contextText,
  parts = [],
  structure = "",
  index,
  includeRecognition = true,
  includeGeneration = false,
  independentGeneration = false,
}) {
  const safeWord = word.split(character).join("□");
  const confusionCandidates = pickConfusionCandidates({
    character,
    pinyinText,
    parts,
    structure,
    index,
  });
  const glyphDistractors = confusionCandidates.map((candidate) => candidate.character);
  const readingCandidates = pickReadingDistractors(pinyinText, index);
  const readingDistractors = readingCandidates.map((candidate) => candidate.text);
  const correctMeaning = lessonSemanticGold(character, word);
  const meaningDistractors = pickMeaningDistractors(
    correctMeaning,
    character,
    word,
    index,
  );
  const exercises = [];
  if (includeRecognition) {
    const id = `${base}-words-science-recognition`;
    const exercise = annotateExercise({
      id,
      origin: "科学复习",
      kind: "single",
      questionType: "single_select",
      prompt: `读音是 ${pinyinText}，能补全词语“${safeWord}”的是哪个字？`,
      options: makeOptions(id, unique([character, ...glyphDistractors]), [character]),
      explanation: `“${character}”读 ${pinyinText}，能组成词语“${word}”。`,
    }, {
      dimension: "recognition",
      answerMode: "choice",
      cueLevel: 0,
      tags: ["lookalike-confusion", "homophone-confusion"],
    });
    exercise.optionErrorTags = confusionOptionMetadata(
      exercise.options,
      confusionCandidates,
    );
    exercises.push(exercise);
  }
  {
    const id = `${base}-words-science-phonology`;
    const exercise = annotateExercise({
      id,
      origin: "科学复习",
      kind: "single",
      questionType: "single_select",
      prompt: `“${character}”在词语“${word}”中读什么？`,
      options: makeOptions(id, unique([pinyinText, ...readingDistractors]), [pinyinText]),
      explanation: `放回词语“${word}”核实，“${character}”读 ${pinyinText}。`,
    }, {
      dimension: "phonology",
      answerMode: "choice",
      cueLevel: 0,
      tags: ["pronunciation-initial", "pronunciation-final", "pronunciation-tone"],
    });
    exercise.optionErrorTags = Object.fromEntries(
      exercise.options
        .filter((option) => !option.correct)
        .map((option) => [
          option.id,
          readingCandidates.find((candidate) => candidate.text === option.text)?.tags
            || ["pronunciation-final"],
        ]),
    );
    exercises.push(exercise);
  }
  {
    const id = `${base}-words-science-semantics`;
    exercises.push(annotateExercise({
      id,
      origin: "科学复习",
      kind: "single",
      questionType: "single_select",
      prompt: `“${character}”在“${word}”中主要表示什么？`,
      options: makeOptions(
        id,
        [correctMeaning.text, ...meaningDistractors.map((item) => item.text)],
        [correctMeaning.text],
      ),
      explanation: `${correctMeaning.text}。`,
      semanticClass: correctMeaning.semanticClass,
      semanticForm: correctMeaning.semanticForm,
      semanticGoldKey: correctMeaning.goldKey,
      semanticGoldSource: "frozen-lesson-word-gold",
      semanticDistractorSource: "explicit-class-bank",
      optionSemanticClasses: Object.fromEntries([
        [correctMeaning.text, correctMeaning.semanticClass],
        ...meaningDistractors.map((item) => [item.text, item.semanticClass]),
      ]),
    }, {
      dimension: "semantics",
      answerMode: "choice",
      cueLevel: 0,
      tags: ["meaning-unknown"],
    }));
  }
  {
    const id = `${base}-words-science-context`;
    const exercise = annotateExercise({
      id,
      origin: "科学复习",
      kind: "single",
      questionType: "single_select",
      prompt: `把新句补完整：“${contextCue(contextText, character, word)}”。`,
      options: makeOptions(id, unique([character, ...glyphDistractors]), [character]),
      explanation: `放回新句核对，空格里应填“${character}”。`,
    }, {
      dimension: "context",
      answerMode: "choice",
      cueLevel: 0,
      tags: ["context-misuse"],
    });
    exercise.optionErrorTags = confusionOptionMetadata(
      exercise.options,
      confusionCandidates,
      ["context-misuse"],
    );
    exercises.push(exercise);
  }
  {
    const id = `${base}-words-science-discrimination`;
    const discriminationContext = contextCue(contextText, character, word);
    const discriminationPrompt = `先比较容易混淆的读音和部件，再结合新句“${discriminationContext}”选出正确答案。`
      .split(character).join("□");
    const exercise = annotateExercise({
      id,
      origin: "科学复习",
      kind: "single",
      questionType: "single_select",
      prompt: discriminationPrompt,
      options: makeOptions(id, unique([character, ...glyphDistractors]), [character]),
      explanation: `比较读音和关键部件后，“${character}”才能组成“${word}”，并符合句中意思。`,
      concealTarget: true,
    }, {
      dimension: "discrimination",
      answerMode: "choice",
      cueLevel: 0,
      tags: ["lookalike-confusion", "homophone-confusion"],
    });
    exercise.optionErrorTags = confusionOptionMetadata(
      exercise.options,
      confusionCandidates,
    );
    exercises.push(exercise);
  }
  if (includeGeneration) {
    const id = `${base}-words-science-generation`;
    if (!independentGeneration) {
      throw new Error(`generated science generation must be independently scorable: ${character}`);
    }
    const reconstructionParts = independentGenerationParts(character, parts);
    const sequences = generationSequenceChoices(reconstructionParts, character);
    const prompt = `根据词语“${safeWord}”和读音 ${pinyinText}，选择能按正确顺序组成空格中字形的部件序列。`
      .split(character).join("□");
    const exercise = annotateExercise({
      id,
      origin: "科学复习",
      kind: "single",
      questionType: "single_select",
      prompt,
      options: makeOptions(id, [sequences.correct, ...sequences.alternatives], [sequences.correct]),
      explanation: `${reconstructionParts.join(" + ")} 按顺序重新组成“${character}”。`,
      concealTarget: true,
    }, {
      dimension: "generation",
      answerMode: "choice",
      cueLevel: 0,
      tags: ["component-position", "component-extra"],
    });
    if (exercise.options.some((option) => option.text.includes(character))) {
      throw new Error(`independent generation option leaks target ${character}`);
    }
    exercises.push(exercise);
  }
  return exercises;
}

function exerciseSet(character, index, lesson, parts, partDetails, radical, structure, writing, polyphonic, word, pinyinText, plan) {
  const base = charId(lesson.position, index, character);
  const safeWord = word.split(character).join("□");
  const confusionCandidates = pickConfusionCandidates({
    character,
    pinyinText,
    parts,
    structure,
    index,
  });
  const glyphDistractors = confusionCandidates.map((candidate) => candidate.character);
  const componentPool = unique([...parts, "木", "口", "土", "日", "人"]).slice(0, Math.max(4, parts.length + 2));
  const redBlueDecoys = ["木", "口", "土", "日", "人", "又", "丶"].filter((part) => !parts.includes(part)).slice(0, 3);
  // Keep structure distractors unambiguous: never mix a specific 包围 type with
  // the generic 半包围结构 in the same question.
  const surroundFamily = ["全包围结构", "上三包围结构", "下三包围结构", "左三包围结构", "左上包围结构", "右上包围结构", "左下包围结构", "半包围结构"];
  const structureDistractors = surroundFamily.includes(structure)
    ? ["左右结构", "上下结构", "独体结构"]
    : ["左右结构", "上下结构", "半包围结构", "独体结构"];
  const structures = unique([structure, ...structureDistractors]).slice(0, 4);
  const structureCodes = Object.fromEntries(
    structures.map((item) => [
      item,
      Object.entries(structureNames).find(([, name]) => name === item)?.[0] || (item === "半包围结构" ? "⿵" : ""),
    ]),
  );
  const semanticParts = partDetails
    .filter((part) => part.role === "semantic" || part.role === "mixed")
    .map((part) => part.normalizedChar);
  const phoneticParts = partDetails
    .filter((part) => part.role === "phonetic" || part.role === "mixed")
    .map((part) => part.normalizedChar);
  const semanticCopy = semanticParts.length
    ? "表义部件是“" + semanticParts.join("、") + "”"
    : "这些顶层部件主要用于观察字形";
  const phoneticCopy = phoneticParts.length
    ? "，声旁是“" + phoneticParts.join("、") + "”；声旁只提供大致读音线索，实际读音要放进词语核实"
    : "";
  const wordQuestion = `${base}-words-context`;
  const structureQuestion = `${base}-words-structure`;
  const imageQuestion = `${base}-words-image`;
  const componentQuestion = `${base}-words-components`;
  const splitQuestion = `${base}-split-components`;
  const redBlueQuestion = `${base}-honglan-components`;
  const structureTrackQuestion = `${base}-structure-choice`;
  const list = [
    { id: wordQuestion, origin: "识字小测", kind: "single", questionType: "single_select", prompt: `读音是 ${pinyinText}，能补全词语“${safeWord}”的是哪个字？`, options: makeOptions(wordQuestion, unique([character, ...glyphDistractors]), [character]), explanation: `“${character}”读 ${pinyinText}，能组成词语“${word}”。` },
    { id: structureQuestion, origin: "识字小测", kind: "structure", questionType: "character_structure_select", prompt: `“${character}”是什么结构？`, options: makeOptions(structureQuestion, structures, [structure], [], structureCodes), explanation: `“${character}”是${structure}，各部件排布舒展、层次分明。` },
    { id: imageQuestion, origin: "识字小测", kind: "single", questionType: "image_single_select", prompt: `哪幅图把“${character}”的部件藏得最完整？`, options: [0, 1, 2].map((slot) => ({ id: `${imageQuestion}-${slot}`, text: "", correct: slot === 1, radical: false, idcCode: "" })), explanation: `正确画面把${parts.map((part) => `“${part}”`).join("和")}按${structure}嵌进了“${character}”。` },
    { id: componentQuestion, origin: "识字小测", kind: "components", questionType: "composition_select_to_text", prompt: `选择“${character}”的主要部件。`, options: makeOptions(componentQuestion, componentPool, parts, [radical]), explanation: `${parts.join(" + ")}，按${structure}组合成“${character}”。` },
    { id: splitQuestion, origin: "拆一拆", kind: "components", questionType: "composition_select_to_text", prompt: `按顺序搭出“${character}”。`, options: makeOptions(splitQuestion, componentPool, parts, [radical]), explanation: `先按${structure}排好部件；${semanticCopy}${phoneticCopy}。` },
    { id: redBlueQuestion, origin: "红蓝字", kind: "components", questionType: "radical_component_select", prompt: `选出组成“${character}”的真正部件。`, options: makeOptions(redBlueQuestion, unique([...parts, ...redBlueDecoys]), parts, [radical]), explanation: `“${character}”由${parts.map((part) => `“${part}”`).join("和")}组成。${semanticCopy}${phoneticCopy}；字典部首只用于检字，不自动等于表义部件。` },
    { id: structureTrackQuestion, origin: "空间结构", kind: "structure", questionType: "character_structure_select", prompt: `把“${character}”放进正确的结构格。`, options: makeOptions(structureTrackQuestion, structures, [structure], [], structureCodes), explanation: `“${character}”的部件按${structure}站位。` },
  ];
  list.push(...scientificExerciseSet({
    base,
    character,
    word,
    pinyinText,
    meaningText: plan.meaning,
    semanticOption: plan.semanticOption,
    semanticClass: plan.semanticClass,
    contextText: plan.contextSentence || plan.meaning,
    parts,
    structure,
    index,
    includeRecognition: false,
    includeGeneration: true,
    independentGeneration: true,
  }));
  // Prefer a course word for polyphonic readings. A standalone interjection
  // such as “哼” is still a real sentence-level context, so keep its reading
  // question but explain the role it plays instead of asking circularly.
  if (polyphonic) {
    const readings = unique(pinyin(character, { toneType: "symbol", type: "array", multiple: true }));
    const readingQuestion = `${base}-words-pronunciation`;
    const hasWordContext = Array.from(word).length >= 2;
    list.splice(1, 0, {
      id: readingQuestion,
      origin: "识字小测",
      kind: "single",
      questionType: "single_select",
      prompt: hasWordContext ? `“${character}”在“${word}”中读什么？` : `课文里的“${word}”读什么？`,
      options: makeOptions(readingQuestion, readings, [pinyinText]),
      explanation: hasWordContext
        ? `放回本课词语“${word}”里读，“${character}”读${pinyinText}。多音字要跟着语境选读音。`
        : `课文里的“${word}”是一声短促的语气声，这里读${pinyinText}。`,
    });
  }
  if (writing) {
    const safeWord = word.split(character).join("□");
    const recallPrompt = `看词语线索“${safeWord}”和读音 ${pinyinText}，独立写出空格中的字。`;
    const spokenPrompt = `听提示：课文词语是“${safeWord}”，空格里的字读 ${pinyinText}。请独立写出这个字。`;
    list.splice(4, 0, { id: `${base}-words-write`, origin: "识字小测", kind: "write", questionType: "write_full_word", prompt: `在田字格里写一遍“${character}”。`, options: [], explanation: `先看整体结构，再写关键部件。` });
    list.push({ id: `${base}-split-write`, origin: "拆一拆", kind: "write", questionType: "write_full_word_empty", prompt: recallPrompt, spokenPrompt, concealTarget: true, options: [], explanation: `写完后再揭示范字，对照部件位置自查。` });
  }
  return list.map((exercise) => {
    const annotated = annotateExercise(exercise);
    if (exercise.id === wordQuestion) {
      annotated.optionErrorTags = confusionOptionMetadata(
        annotated.options,
        confusionCandidates,
      );
    }
    return annotated;
  });
}

function componentDescription(part, plan, parts, index, detail) {
  const sceneCue = sceneCues(plan, parts)[index];
  const functionCopy = detail
    ? detail.functionText
    : `它在字形中作为“${part}”部件，轮廓舒展、位置清晰。`;
  return `${sceneCue}${functionCopy}`;
}

function trimStop(value) {
  return value.replace(/[。！？；]+$/u, "");
}

function etymologyCopy(record, parts, partDetails) {
  const semantic = record?.etymology?.semantic;
  const phonetic = record?.etymology?.phonetic;
  if (record?.etymology?.type?.includes("pictophonetic")) {
    const hasVisiblePhonetic = partDetails.some((part) =>
      part.role === "phonetic" || part.role === "mixed"
    );
    if (!hasVisiblePhonetic) {
      return "现有教学证据不足以在这些顶层部件中可靠标出声旁，先按现代字形观察，不硬猜读音功能";
    }
    const evidence = semantic && phonetic
      ? `字源资料把“${semantic}”记作表义部件，把“${phonetic}”记作声旁`
      : semantic
        ? `字源资料明确记录了表义部件“${semantic}”`
        : phonetic
          ? `字源资料明确记录了声旁“${phonetic}”`
          : "现有字源资料没有完整标出表义、表音分工";
    return `${evidence}；声旁只提供大致读音线索，实际读音要放进词语核实`;
  }
  if (record?.character === "间") {
    return "“门”和“日”共同会意：日光从门缝照入，帮助理解中间、间隙的意思";
  }
  if (parts.length > 1) return "这些是现代字形的顶层部件；字典部首用于检字，不自动等于表义部件";
  return "笔画连贯一体，适合顺着整体轮廓来观察";
}

function makeDescription(character, pinyinText, word, structure, parts, partDetails, plan, record) {
  const etym = etymologyCopy(record, parts, partDetails);
  const partList = parts.length > 1 ? `由${parts.map((part) => `“${part}”`).join("和")}组合而成` : `为独体结构`;
  return `${character}，读 ${pinyinText}，出自词语“${word}”。它是${structure}，${partList}；${etym}。画面中，${trimStop(plan.scene)}。${trimStop(plan.meaning)}。`;
}

function sceneCues(plan, parts) {
  const clauses = plan.scene.split(/[，；。]/u).map((item) => item.trim()).filter(Boolean);
  return parts.map((part, index) => {
    const exact = clauses.find((clause) => clause.includes(`“${part}”`));
    if (exact) return `${exact}。`;
    return `${index === 0 ? "先" : "再"}在画面中找到“${part}”的完整位置；${trimStop(plan.scene)}。`;
  });
}

function imagePrompt({ character, word, lesson, structure, parts, plan }) {
  return `Use case: scientific-educational\nAsset type: square web mnemonic illustration for a Grade 5 Chinese literacy lesson\nPrimary request: create one polished child-friendly object-shaped mnemonic for the Chinese character “${character}” in the word “${word}”\nScene/backdrop: a single coherent ${lesson.title} learning scene on warm rice-paper texture, quiet and uncluttered\nSubject: ${trimStop(plan.scene)}\nStructure accuracy: preserve the real ${structure}; place ${parts.map((part) => `“${part}”`).join("、")} in that exact order and relative position; keep every top-level component clearly findable without treating the dictionary radical as automatic semantic evidence\nStyle/medium: premium Chinese children’s-book watercolor with crisp object silhouettes, natural depth, refined details, warm light, visually comparable to an award-winning educational picture book\nComposition/framing: 1:1 square, the full mnemonic object centered inside the middle 78% of the canvas, generous safe padding on all four sides, no object or stroke-like edge cropped; readable on mobile\nLearning goal: every component is made from meaningful real objects, and those object contours naturally grow into the component strokes before combining into the whole character\nConstraints: one scene only; component contours must stay complete and separable; meaning must be understandable without labels; age-appropriate and beautiful\nAvoid: printed or handwritten Chinese text, font masks, a giant opaque character pasted over a photo, captions, pinyin, labels, borders, split panels, UI, watermark, logos, violence, clutter, cropped subjects`;
}

function enrichExtensionCharacter(item, index, dictionary) {
  const record = dictionary.get(item.hanzi);
  const contextual = contextualLearningFor(item.hanzi, item.word, item.originalMeaning);
  const dictionaryRadical = record?.radical && record.radical !== item.hanzi
    ? record.radical
    : "";
  const parts = item.parts.map((part) => {
    const detail = componentRole(part.char, record, item.hanzi);
    return {
      ...part,
      ...detail,
      radical: partIsDictionaryRadical(part.char, dictionaryRadical),
    };
  });
  const resolvedCharacterType = item.charType
    ? characterType(record, parts)
    : "";
  const exercises = item.exercises.map((exercise) => {
    if (exercise.questionType !== "write_full_word_empty") {
      return annotateExercise(exercise);
    }
    const safeWord = item.word.split(item.hanzi).join("□");
    return annotateExercise({
      ...exercise,
      prompt: `看词语线索“${safeWord}”和读音 ${item.pinyin}，独立写出空格中的字。`,
      spokenPrompt: `听提示：课文词语是“${safeWord}”，空格里的字读 ${item.pinyin}。请独立写出这个字。`,
      concealTarget: true,
    });
  });
  exercises.push(...scientificExerciseSet({
    base: item.id,
    character: item.hanzi,
    word: item.word,
    pinyinText: item.pinyin,
    meaningText: contextual.contextualMeaning,
    semanticOption: contextual.semanticOption,
    semanticClass: contextual.semanticClass,
    contextText: contextual.contextSentence || item.description,
    parts: item.parts.map((part) => part.char),
    structure: item.decomposition,
    index,
    includeGeneration: true,
    independentGeneration: true,
  }));
  let description = item.description;
  if (contextualLearningOverrides[`${item.hanzi}|${item.word}`]) {
    description = `${contextual.contextualMeaning} ${description}`;
  }
  if (record?.etymology?.type?.includes("pictophonetic")
    && !resolvedCharacterType.includes("形声")) {
    description = description.replace(/^形声字[，,]?/u, "按现代字形观察，")
      + " 现有教学证据不足以在顶层部件中可靠标出声旁，不硬猜读音功能。";
  } else if (resolvedCharacterType.includes("形声")
    && !description.includes("声旁只提供")) {
    description += " 声旁只提供大致读音线索，实际读音要放进词语核实。";
  }
  return {
    ...item,
    glyphMeaning: item.originalMeaning,
    originalMeaning: contextual.contextualMeaning,
    contextualMeaning: contextual.contextualMeaning,
    contextSentence: contextual.contextSentence,
    charType: resolvedCharacterType,
    description,
    parts,
    exercises,
  };
}

async function loadDictionary() {
  try { accessSync(dictionaryCache); }
  catch {
    const response = await fetch(dictionaryUrl);
    if (!response.ok) throw new Error(`dictionary download failed: ${response.status}`);
    await writeFile(dictionaryCache, await response.text());
  }
  const lines = (await readFile(dictionaryCache, "utf8")).trim().split("\n");
  return new Map(lines.map((line) => { const item = JSON.parse(line); return [item.character, item]; }));
}

function buildConfusionGlyphPool(dictionary, courseCharacters, commonLimit = 3_500) {
  const commonCharacters = [];
  for (let position = 1; position <= commonLimit; position += 1) {
    const frequency = Hanzi.getCharacterInFrequencyListByPosition(position);
    if (typeof frequency !== "object" || !frequency.character) continue;
    commonCharacters.push(frequency.character);
  }
  return unique([...commonCharacters, ...courseCharacters])
    .map((character, rank) => {
      const record = dictionary.get(character);
      if (!record) return null;
      const parts = topParts(character);
      return {
        character,
        readings: unique(record.pinyin || [pinyin(character, { toneType: "symbol" })]),
        parts,
        structure: decompositionFor(record, parts),
        rank,
      };
    })
    .filter(Boolean);
}

function serialize(name, value, space = 2) {
  return `/* Generated by scripts/generate-grade5-catalog.mjs. Do not edit by hand. */\nexport const ${name} = ${JSON.stringify(value, null, space || undefined)} as const;\n`;
}

await Hanzi.start();
const dictionary = await loadDictionary();
const officialGlyphPool = unique(grade5Volume1Lessons.flatMap((lesson) => [
  ...glyphs(lesson.recognition),
  ...glyphs(lesson.writing),
]));
courseGlyphPool = unique([
  ...officialGlyphPool,
  ...extensionCharacters.map((item) => item.hanzi),
]);
confusionGlyphPool = buildConfusionGlyphPool(dictionary, courseGlyphPool);
courseReadingPool = unique([
  ...confusionGlyphPool.flatMap((item) => item.readings),
  ...courseGlyphPool.map((character) => pinyin(character, { toneType: "symbol" })),
  ...extensionCharacters.map((item) => item.pinyin),
  ...Object.values(officialPolyphonicContexts).map((item) => item.pinyin),
]);
const activeSemanticKeys = [];
for (const lesson of grade5Volume1Lessons) {
  const union = unique([...glyphs(lesson.recognition), ...glyphs(lesson.writing)]);
  for (const character of union) {
    const word = wordFor(lesson, character);
    activeSemanticKeys.push(`${character}|${word}`);
  }
}
for (const item of extensionCharacters) {
  activeSemanticKeys.push(`${item.hanzi}|${item.word}`);
}
const missingSemanticGold = activeSemanticKeys.filter((key) => !grade5SemanticGold[key]);
if (activeSemanticKeys.length !== 430 || missingSemanticGold.length) {
  throw new Error(`semantic gold coverage mismatch: ${activeSemanticKeys.length}/430; missing ${missingSemanticGold.join(", ")}`);
}
const semanticMeaningRecords = [];
for (const [semanticClass, texts] of Object.entries(semanticDistractorBanks)) {
  for (const text of texts) {
    semanticMeaningRecords.push({
      text,
      semanticClass,
      semanticForm: semanticFormFor(semanticClass),
      semanticBank: true,
    });
  }
}
// Reviewed lesson-word definitions also form a large explicit distractor
// bank. This keeps choices comparable in length and specificity while the
// class/form and conflict filters still prevent near-synonyms or mixed types.
for (const entry of Object.values(grade5SemanticGold)) {
  semanticMeaningRecords.push({
    text: entry.option,
    semanticClass: entry.semanticClass,
    semanticForm: entry.semanticForm,
    semanticBank: true,
  });
}
const seenSemanticMeanings = new Set();
courseMeaningPool = semanticMeaningRecords
  .filter((item) => {
    const key = `${item.semanticClass}|${item.semanticForm}|${item.text}`;
    if (seenSemanticMeanings.has(key)) return false;
    seenSemanticMeanings.add(key);
    return true;
  })
  .map((item, rank) => ({ ...item, rank }));
await mkdir(mnemonicRoot, { recursive: true });
await mkdir(join(root, "scripts/generated"), { recursive: true });
await mkdir(generatedLessonRoot, { recursive: true });
await mkdir(generatedReviewLessonRoot, { recursive: true });

const lessons = [];
const characters = [];
const visuals = {};
const scenes = {};
const imagePrompts = {};
const componentMap = new Map();

for (const lesson of grade5Volume1Lessons) {
  const recognition = glyphs(lesson.recognition);
  const polyphonic = new Set(glyphs(lesson.polyphonic));
  const writing = new Set(glyphs(lesson.writing));
  const union = unique([...recognition, ...writing]);
  const id = lessonId(lesson.position);
  const learning = grade5LessonLearning[lesson.position];
  lessons.push({ id, title: lesson.title, position: lesson.position, skimming: Boolean(lesson.skimming), context: lesson.context, mode: learning.mode, learningPath: learning.path, recognitionCount: recognition.length - polyphonic.size, polyphonicCount: polyphonic.size, writingCount: writing.size, officialCount: union.length });

  for (let index = 0; index < union.length; index += 1) {
    const character = union[index];
    const record = dictionary.get(character);
    const rawParts = topParts(character);
    const parts = rawParts;
    const dictionaryRadical = record?.radical && record.radical !== character ? record.radical : "";
    const partDetails = parts.map((part) => componentRole(part, record, character));
    const resolvedCharacterType = characterType(record, partDetails);
    const visibleRadical = parts.find((part) => partIsDictionaryRadical(part, dictionaryRadical)) || "";
    const structure = decompositionFor(record, parts);
    const word = wordFor(lesson, character);
    const pinyinText = pinyinFor(lesson, word, character);
    const role = writing.has(character) ? "write" : polyphonic.has(character) ? "polyphonic" : "recognize";
    const authoredPlan = mnemonicQualityPlans[character];
    if (!authoredPlan) throw new Error(`missing mnemonic quality plan for ${character}`);
    const contextual = contextualLearningFor(character, word, authoredPlan.meaning);
    const plan = {
      ...authoredPlan,
      meaning: contextual.contextualMeaning,
      contextSentence: contextual.contextSentence,
      semanticOption: contextual.semanticOption,
      semanticClass: contextual.semanticClass,
    };
    const scene = plan.scene;
    const idForCharacter = charId(lesson.position, index, character);
    const compositions = parts.map((part, partIndex) => ({ char: part, description: componentDescription(part, plan, parts, partIndex, partDetails[partIndex]), charType: part === character ? resolvedCharacterType : "字形部件", children: [] }));
    const item = {
      id: idForCharacter, lessonId: id, lessonTitle: lesson.title, lessonPosition: lesson.position,
      word, wordPosition: lesson.words.indexOf(word) + 1 || index + 1, hanzi: character, primary: true, ready: true,
      pinyin: pinyinText, charType: resolvedCharacterType, decomposition: structure,
      originalMeaning: plan.meaning, contextualMeaning: plan.meaning, contextSentence: plan.contextSentence,
      description: makeDescription(character, pinyinText, word, structure, parts, partDetails, plan, record), originalText: lesson.context,
      parts: partDetails.map((part) => ({ ...part, radical: part.char === visibleRadical })), compositions,
      exercises: exerciseSet(character, index, lesson, parts, partDetails, visibleRadical, structure, writing.has(character), polyphonic.has(character), word, pinyinText, plan),
      curriculumRole: role, polyphonic: polyphonic.has(character), official: true, tier: "curriculum",
    };
    characters.push(item);
    scenes[character] ||= { scene, cues: sceneCues(plan, parts) };
    visuals[character] ||= { src: `/illustrations/mnemonics-v2/g5-${codeId(character)}.webp`, label: word, alt: `${trimStop(plan.meaning)} 图中${parts.map((part) => `“${part}”`).join("与")}按${structure}自然长成“${character}”。` };
    imagePrompts[character] ||= { character, word, lesson: lesson.title, structure, parts, radical: dictionaryRadical, filename: `g5-${codeId(character)}.jpg`, prompt: imagePrompt({ character, word, lesson, structure, parts, plan }) };
    for (const [partIndex, part] of parts.entries()) if (!componentMap.has(part)) componentMap.set(part, { id: `g5-component-${codeId(part)}`, title: part, glyph: part, examples: [character], description: componentDescription(part, plan, parts, partIndex), characterSet: [character], group: componentMap.size + 600, sequence: componentMap.size + 600 }); else { const component = componentMap.get(part); if (!component.examples.includes(character)) component.examples.push(character); if (!component.characterSet.includes(character)) component.characterSet.push(character); }
  }
}

const enrichedExtensionCharacters = extensionCharacters.map((item, index) =>
  enrichExtensionCharacter(item, characters.length + index, dictionary),
);

const recognitionTotal = grade5Volume1Lessons.reduce((total, lesson) => total + glyphs(lesson.recognition).length - glyphs(lesson.polyphonic).length, 0);
const polyphonicTotal = grade5Volume1Lessons.reduce((total, lesson) => total + glyphs(lesson.polyphonic).length, 0);
const writingTotal = grade5Volume1Lessons.reduce((total, lesson) => total + glyphs(lesson.writing).length, 0);
if (recognitionTotal !== officialRecognitionCount || polyphonicTotal !== officialPolyphonicCount || writingTotal !== officialWritingCount) throw new Error(`official count mismatch: ${recognitionTotal}/${polyphonicTotal}/${writingTotal}`);
if (characters.length !== 365 || new Set(characters.map((item) => item.hanzi)).size !== 359) throw new Error(`union mismatch: ${characters.length}/${new Set(characters.map((item) => item.hanzi)).size}`);

const course = { title: "语文 · 五年级上册", edition: "统编版（2025 更新）", grade: 5, volume: 1, lessonCount: 26, recognitionCount: 200, polyphonicCount: 16, writingCount: 220, officialCharacterCount: 359 };
await writeFile(
  join(generatedCatalogRoot, "course.ts"),
  [serialize("grade5Course", course), serialize("grade5Lessons", lessons)].join("\n"),
);
for (const lesson of lessons) {
  const lessonCharacters = characters.filter((character) => character.lessonId === lesson.id);
  const reviewExercisesByCharacterId = Object.fromEntries(
    lessonCharacters.map((character) => [
      character.id,
      character.exercises.filter((exercise) => exercise.origin === "科学复习"),
    ]),
  );
  const baseCharacters = lessonCharacters.map((character) => ({
    ...character,
    exercises: character.exercises.filter((exercise) => exercise.origin !== "科学复习"),
  }));
  await writeFile(
    join(generatedReviewLessonRoot, `${lesson.id}.ts`),
    serialize("reviewExercisesByCharacterId", reviewExercisesByCharacterId, 0),
  );
  await writeFile(
    join(generatedLessonRoot, `${lesson.id}.ts`),
    [
      `import { reviewExercisesByCharacterId } from "../review-lessons/${lesson.id}.ts";\n`,
      serialize("lesson", lesson),
      serialize("baseCharacters", baseCharacters, 0),
      "export const characters = baseCharacters.map((character) => ({\n"
        + "  ...character,\n"
        + "  exercises: [...character.exercises, ...reviewExercisesByCharacterId[character.id]],\n"
        + "}));\n",
    ].join("\n"),
  );
}
const lessonImports = lessons.map((lesson, index) =>
  `import { characters as lesson${index + 1}Characters } from "./lessons/${lesson.id}.ts";`,
).join("\n");
const lessonSpreads = lessons.map((_, index) => `  ...lesson${index + 1}Characters,`).join("\n");
await writeFile(
  join(generatedCatalogRoot, "all-characters.ts"),
  `/* Generated by scripts/generate-grade5-catalog.mjs. Do not edit by hand. */\n${lessonImports}\n\nexport const grade5Characters = [\n${lessonSpreads}\n] as const;\n`,
);
const lessonLoaders = lessons.map((lesson) =>
  `  "${lesson.id}": () => import("./lessons/${lesson.id}.ts"),`,
).join("\n");
await writeFile(
  join(generatedCatalogRoot, "lesson-loaders.ts"),
  `/* Generated by scripts/generate-grade5-catalog.mjs. Do not edit by hand. */\nexport const grade5LessonLoaders = {\n${lessonLoaders}\n} as const;\n\nexport type Grade5LessonId = keyof typeof grade5LessonLoaders;\n`,
);
await writeFile(
  join(generatedCatalogRoot, "components.ts"),
  serialize("grade5Components", [...componentMap.values()]),
);
await writeFile(
  extensionLearningModule,
  serialize("grade5ExtensionCharacters", enrichedExtensionCharacters, 0),
);
await writeFile(visualModule, `${serialize("grade5CharacterVisuals", visuals)}\n${serialize("grade5LessonVisuals", Object.fromEntries(grade5Volume1Lessons.map((lesson) => [lessonId(lesson.position), { src: `/illustrations/lessons/g5-${String(lesson.position).padStart(2, "0")}.webp`, label: lesson.title, alt: lesson.visual }])))}`);
await writeFile(mnemonicModule, serialize("grade5MnemonicScenes", scenes));
await writeFile(promptModule, serialize("grade5ImagePrompts", imagePrompts));
process.stdout.write(`Generated ${lessons.length} lessons, ${characters.length} lesson-character records, ${Object.keys(visuals).length} unique glyph visuals and ${componentMap.size} components.\n`);
