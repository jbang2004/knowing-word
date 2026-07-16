import { mkdir, readFile, writeFile } from "node:fs/promises";
import { accessSync } from "node:fs";
import { resolve, join } from "node:path";
import { pinyin } from "pinyin-pro";
import Hanzi from "hanzi";
import {
  grade5Volume1Lessons,
  grade5LessonLearning,
  officialPolyphonicContexts,
  officialPolyphonicCount,
  officialRecognitionCount,
  officialWritingCount,
} from "../app/data/grade5-volume1-source.ts";

const root = resolve(import.meta.dirname, "..");
const dictionaryCache = "/tmp/knowing-word-makemeahanzi-dictionary.txt";
const dictionaryUrl = "https://raw.githubusercontent.com/skishore/makemeahanzi/master/dictionary.txt";
const outputModule = join(root, "app/data/grade5-volume1-generated.ts");
const visualModule = join(root, "app/data/grade5-volume1-visuals.generated.ts");
const mnemonicModule = join(root, "app/data/grade5-volume1-mnemonics.generated.ts");
const narrationModule = join(root, "app/data/grade5-volume1-narration.generated.ts");
const mnemonicRoot = join(root, "public/illustrations/mnemonics");

const structureNames = {
  "⿰": "左右结构", "⿱": "上下结构", "⿲": "左中右结构", "⿳": "上中下结构",
  "⿴": "全包围结构", "⿵": "上三包围结构", "⿶": "下三包围结构", "⿷": "左三包围结构",
  "⿸": "左上包围结构", "⿹": "右上包围结构", "⿺": "左下包围结构", "⿻": "穿插结构",
};

const typeNames = {
  pictographic: "象形字", ideographic: "会意字", pictophonetic: "形声字",
  "pictophonetic/ideographic": "形声兼会意字", simplified: "简化字", unknown: "字形字",
};

const cueMap = {
  "氵": "三股清亮水流", 水: "分开的河流与水花", 木: "有横枝、直干和斜根的大树", "艹": "成排草叶与花梗",
  "扌": "伸出并发力的手臂", 手: "张开的手掌", 口: "方形传声窗", 日: "有中央光带的日轮", 月: "弯月形灯盘",
  "忄": "跳动的心形灯带", 心: "心形灯带与三点微光", 亻: "侧身站立的人", 人: "展开双臂的人", 女: "照料幼苗的人影",
  土: "分层的土台", 山: "高低相连的山峰", 石: "带切面的岩石", 鸟: "舒展翅尾的小鸟", 鱼: "有鳍和尾巴的鱼",
  虫: "弯身的小虫", 犭: "奔跑动物的侧影", 牛: "带角的牛头", 羊: "对称羊角", 马: "奔跑的马与鬃尾",
  米: "米架和四散米粒", 禾: "低垂的谷穗", 竹: "两簇竹叶", "⺮": "两簇竹叶", 贝: "被托起的贝壳",
  金: "金属工具架", "钅": "金属工具架", 火: "向上跳动的火焰", "灬": "四点温暖火光", 纟: "盘绕的细丝线", 糸: "盘绕的细丝线",
  讠: "从说话框飞出的短句", 言: "从口中升起的言语", 足: "脚印和落脚台", "⻊": "脚印和落脚台", 走: "向前迈出的脚步",
  门: "打开的双扇门", 广: "伸出长檐的屋舍", 宀: "安稳覆盖的屋顶", 穴: "带采光孔的洞顶", 厂: "山崖与长檐",
  辶: "回转向前的小路", 阝: "高低相接的土坡", 车: "有轮轴的车架", 舟: "细长的小船", 巾: "垂下的布幅",
  衤: "展开衣襟的上衣", 衣: "展开衣襟的上衣", 页: "突出头部的人影", 目: "方框中的眼睛", 耳: "竖起的耳朵",
  王: "三层玉架", 玉: "温润的玉石", 皿: "浅口器皿", 酉: "封口酒坛", 食: "带盖的食器", "饣": "带盖的食器",
  刂: "竖直刀刃", 刀: "弯柄刀具", 力: "弯曲而发力的手臂", 弓: "绷紧的弓弦", 攵: "迈步轻敲的短杖",
  攴: "迈步轻敲的短杖", 寸: "有刻度的手腕", 又: "回转的右手", 欠: "张口舒气的人影", 小: "中央光点与两侧小点",
  大: "正面伸展的人", 子: "被轻轻托住的孩子", 田: "分成四格的田地", 雨: "云框和落下的雨点", 白: "明亮的小窗",
};

function glyphs(value = "") { return Array.from(value); }
function unique(values) { return [...new Set(values)]; }
function lessonId(position) { return `g5v1-l${String(position).padStart(2, "0")}`; }
function codeId(character) { return `u${character.codePointAt(0).toString(16)}`; }
function charId(position, index, character) { return `${lessonId(position)}-c${String(index + 1).padStart(2, "0")}-${codeId(character)}`; }
function xml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); }

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

function cueFor(component) {
  return cueMap[component] || `轮廓像“${component}”的故事道具`;
}

function decompositionFor(record, parts) {
  const operator = record?.decomposition?.[0];
  if (structureNames[operator]) return structureNames[operator];
  return parts.length <= 1 ? "独体结构" : "组合结构";
}

function topParts(character) {
  const decomposed = Hanzi.decompose(character, 1)?.components || [];
  const clean = decomposed.filter((part) =>
    part
    && part !== "？"
    && part !== "No glyph available"
    && !part.startsWith("["),
  ).slice(0, 3);
  if (!clean.length || clean.join("") === character) return [character];
  return clean;
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

function exerciseSet(character, index, lesson, parts, structure, writing, polyphonic, word, pinyinText) {
  const base = charId(lesson.position, index, character);
  const lessonWords = unique(lesson.words.filter((item) => item !== word));
  const distractorWords = [lessonWords[(index * 3 + 1) % lessonWords.length], lessonWords[(index * 5 + 2) % lessonWords.length]].filter(Boolean);
  const componentPool = unique([...parts, "木", "口", "土", "日", "人"]).slice(0, Math.max(4, parts.length + 2));
  const structures = unique([structure, "左右结构", "上下结构", "半包围结构", "独体结构"]).slice(0, 4);
  const structureCodes = Object.fromEntries(
    structures.map((item) => [
      item,
      Object.entries(structureNames).find(([, name]) => name === item)?.[0] || "",
    ]),
  );
  const wordQuestion = `${base}-words-context`;
  const structureQuestion = `${base}-words-structure`;
  const imageQuestion = `${base}-words-image`;
  const componentQuestion = `${base}-words-components`;
  const splitQuestion = `${base}-split-components`;
  const redBlueQuestion = `${base}-honglan-components`;
  const structureTrackQuestion = `${base}-structure-choice`;
  const list = [
    { id: wordQuestion, origin: "识字小测", kind: "single", questionType: "single_select", prompt: `“${character}”在本课哪个词语中出现？`, options: makeOptions(wordQuestion, unique([word, ...distractorWords]), [word]), explanation: `“${character}”就在“${word}”中。先把字放回词语，字义会更清楚。` },
    { id: structureQuestion, origin: "识字小测", kind: "structure", questionType: "character_structure_select", prompt: `“${character}”是什么结构？`, options: makeOptions(structureQuestion, structures, [structure], [], structureCodes), explanation: `“${character}”是${structure}。先看部件站位，再看笔画细节。` },
    { id: imageQuestion, origin: "识字小测", kind: "single", questionType: "image_single_select", prompt: `哪幅图把“${character}”的部件藏得最完整？`, options: [0, 1, 2].map((slot) => ({ id: `${imageQuestion}-${slot}`, text: "", correct: slot === 1, radical: false, idcCode: "" })), explanation: `正确画面把${parts.map((part) => `“${part}”`).join("和")}按${structure}嵌进了“${character}”。` },
    { id: componentQuestion, origin: "识字小测", kind: "components", questionType: "composition_select_to_text", prompt: `选择“${character}”的主要部件。`, options: makeOptions(componentQuestion, componentPool, parts, [parts[0]]), explanation: `${parts.join(" + ")}，按${structure}组合成“${character}”。` },
    { id: splitQuestion, origin: "拆一拆", kind: "components", questionType: "composition_select_to_text", prompt: `按顺序搭出“${character}”。`, options: makeOptions(splitQuestion, componentPool, parts, [parts[0]]), explanation: `先找到表意部件，再按顺序补齐其余部件。` },
    { id: redBlueQuestion, origin: "红蓝字", kind: "components", questionType: "radical_component_select", prompt: `给“${character}”的表意部件和其他部件分色。`, options: makeOptions(redBlueQuestion, parts, parts, [parts[0]]), explanation: `暖红追踪表意部件“${parts[0]}”，靛蓝追踪其余字形线索。` },
    { id: structureTrackQuestion, origin: "空间结构", kind: "structure", questionType: "character_structure_select", prompt: `把“${character}”放进正确的结构格。`, options: makeOptions(structureTrackQuestion, structures, [structure], [], structureCodes), explanation: `“${character}”的部件按${structure}站位。` },
  ];
  if (polyphonic) {
    const readings = unique(pinyin(character, { toneType: "symbol", type: "array", multiple: true }));
    const readingQuestion = `${base}-words-pronunciation`;
    list.splice(1, 0, {
      id: readingQuestion,
      origin: "识字小测",
      kind: "single",
      questionType: "single_select",
      prompt: `“${character}”在“${word}”中读什么？`,
      options: makeOptions(readingQuestion, readings, [pinyinText]),
      explanation: `放回本课词语“${word}”里读，“${character}”读${pinyinText}。多音字要跟着语境选读音。`,
    });
  }
  if (writing) {
    list.splice(4, 0, { id: `${base}-words-write`, origin: "识字小测", kind: "write", questionType: "write_full_word", prompt: `在田字格里写一遍“${character}”。`, options: [], explanation: `先看整体结构，再写关键部件。` });
    list.push({ id: `${base}-split-write`, origin: "拆一拆", kind: "write", questionType: "write_full_word_empty", prompt: `合起部件，完整写出“${character}”。`, options: [], explanation: `写完后对照部件位置自查。` });
  }
  return list;
}

function componentDescription(part) {
  return `把“${part}”看成${cueFor(part)}。观察转折、长短和它在整字里的位置，再把轮廓合回去。`;
}

function makeDescription(character, pinyinText, word, structure, parts, role, scene) {
  const roleCopy = role === "write" ? "这是本课要求会写的字" : role === "polyphonic" ? "这是本课要留意读音变化的多音字" : "这是本课要求会认的字";
  return `${character}，读${pinyinText}，是“${word}”里的字。${roleCopy}。先看整体：它是${structure}，可以抓住${parts.map((part) => `“${part}”`).join("和")}。${scene}暖红部分先提示意义，靛蓝部分补足字形或读音线索。最后回到“${word}”里读一遍，再闭眼把字形在脑中描出来。`;
}

function makeNarration(character, word, structure, parts, polyphonic) {
  const memoryCopy = parts.length > 1 ? "看图找部件，合成字形" : "顺着图记住整体轮廓";
  if (polyphonic) {
    const wordIndex = Math.max(0, Array.from(word).indexOf(character));
    const ordinal = ["一", "二", "三", "四", "五"][wordIndex] || String(wordIndex + 1);
    return `先读“${word}”。这里的第${ordinal}个字是多音字，要跟着课文语境读。它是${structure}。${memoryCopy}。再读：${word}。`;
  }
  return `${character}，“${word}”的“${character}”。它是${structure}。${memoryCopy}。再读：${word}。`;
}

function makeSvg({ character, word, lesson, parts, radical }) {
  const palettes = [
    ["#243B67", "#6A5BE7", "#F4B84A", "#FFF7E8"], ["#184F57", "#2D9A78", "#F08958", "#F0FBF4"],
    ["#4A315E", "#B05CC8", "#F2A84B", "#FFF3F4"], ["#203E66", "#3F7CD8", "#ED6B61", "#EEF7FF"],
  ];
  const [ink, blue, coral, paper] = palettes[(lesson.position - 1) % palettes.length];
  const filename = `g5-${codeId(character)}.svg`;
  const partLabels = parts.map((part, index) => `<g transform="translate(${330 + index * 190} 760)"><rect width="160" height="58" rx="29" fill="${index === 0 ? coral : blue}" opacity=".96"/><text x="80" y="39" text-anchor="middle" fill="white" font-family="PingFang SC, sans-serif" font-size="28" font-weight="800">${xml(part)} · ${index === 0 ? "表意" : "补形"}</text></g>`).join("");
  const shapes = parts.map((part, index) => `<g transform="translate(${220 + index * 270} ${215 + (index % 2) * 45})" opacity="${index === 0 ? ".92" : ".82"}"><circle cx="0" cy="0" r="92" fill="${index === 0 ? coral : blue}" opacity=".2"/><path d="M-105 35 Q0 -120 105 35 Q58 128 0 108 Q-58 128 -105 35Z" fill="${index === 0 ? coral : blue}" opacity=".25"/><text x="0" y="30" text-anchor="middle" fill="${index === 0 ? coral : blue}" font-family="Songti SC, STSong, serif" font-size="116" font-weight="900">${xml(part)}</text></g>`).join("");
  return { filename, content: `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" role="img" aria-labelledby="title desc"><title id="title">${xml(character)}字的图中嵌字意象</title><desc id="desc">${xml(parts.join("与"))}按${xml(decompositionFor(null, parts))}形成${xml(character)}</desc><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${paper}"/><stop offset="1" stop-color="#EAF1FF"/></linearGradient><filter id="shadow"><feDropShadow dx="0" dy="20" stdDeviation="18" flood-color="${ink}" flood-opacity=".18"/></filter><mask id="glyph"><rect width="1200" height="900" fill="black"/><text x="600" y="650" text-anchor="middle" fill="white" stroke="white" stroke-width="8" font-family="Songti SC, STSong, serif" font-size="570" font-weight="900">${xml(character)}</text></mask><linearGradient id="glyphPaint" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${coral}"/><stop offset=".48" stop-color="${blue}"/><stop offset="1" stop-color="${ink}"/></linearGradient></defs><rect width="1200" height="900" rx="60" fill="url(#bg)"/><circle cx="1050" cy="115" r="210" fill="${coral}" opacity=".09"/><circle cx="120" cy="790" r="270" fill="${blue}" opacity=".08"/><g opacity=".32">${shapes}</g><g mask="url(#glyph)" filter="url(#shadow)"><rect x="125" y="105" width="950" height="610" rx="120" fill="url(#glyphPaint)"/><image href="../lessons/g5-${String(lesson.position).padStart(2, "0")}.jpg" x="0" y="0" width="1200" height="900" preserveAspectRatio="xMidYMid slice" opacity=".38"/></g><text x="70" y="82" fill="${ink}" font-family="PingFang SC, sans-serif" font-size="27" font-weight="800">第 ${lesson.position} 课 · ${xml(lesson.title)}</text><text x="1130" y="82" text-anchor="end" fill="${ink}" opacity=".66" font-family="PingFang SC, sans-serif" font-size="24">${xml(word)}</text>${partLabels}<text x="70" y="852" fill="${ink}" opacity=".68" font-family="PingFang SC, sans-serif" font-size="22">物象长成笔画 · ${xml(cueFor(radical))}</text></svg>\n` };
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

function serialize(name, value) {
  return `/* Generated by scripts/generate-grade5-catalog.mjs. Do not edit by hand. */\nexport const ${name} = ${JSON.stringify(value, null, 2)} as const;\n`;
}

await Hanzi.start();
const dictionary = await loadDictionary();
await mkdir(mnemonicRoot, { recursive: true });

const lessons = [];
const characters = [];
const visuals = {};
const scenes = {};
const narrations = {};
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
    const radical = record?.radical && record.radical !== character ? record.radical : rawParts[0];
    const parts = [radical, ...rawParts.filter((part) => part !== radical)];
    const structure = decompositionFor(record, parts);
    const word = wordFor(lesson, character);
    const pinyinText = pinyinFor(lesson, word, character);
    const role = writing.has(character) ? "write" : polyphonic.has(character) ? "polyphonic" : "recognize";
    const scene = `在“${word}”的画面里，${parts.map((part) => cueFor(part)).join("和")}按${structure}站好，物体边缘顺着真实笔画长成“${character}”。`;
    const idForCharacter = charId(lesson.position, index, character);
    const compositions = parts.map((part) => ({ char: part, description: componentDescription(part), charType: part === character ? typeNames[record?.etymology?.type] || "字形部件" : "字形部件", children: [] }));
    const item = {
      id: idForCharacter, lessonId: id, lessonTitle: lesson.title, lessonPosition: lesson.position,
      word, wordPosition: lesson.words.indexOf(word) + 1 || index + 1, hanzi: character, primary: true, ready: true,
      pinyin: pinyinText, charType: typeNames[record?.etymology?.type] || "字形字", decomposition: structure,
      originalMeaning: word, description: makeDescription(character, pinyinText, word, structure, parts, role, scene), originalText: lesson.context,
      parts: parts.map((part) => ({ char: part, radical: part === radical })), compositions,
      exercises: exerciseSet(character, index, lesson, parts, structure, writing.has(character), polyphonic.has(character), word, pinyinText),
      curriculumRole: role, polyphonic: polyphonic.has(character), official: true, tier: "curriculum",
    };
    characters.push(item);
    scenes[character] ||= { scene, cues: parts.map((part, partIndex) => `${cueFor(part)}沿着“${part}”的主要笔画转折，${partIndex === 0 ? "先提示意义类别" : "再补足字形或读音线索"}。`) };
    narrations[character] ||= makeNarration(character, word, structure, parts, polyphonic.has(character));
    visuals[character] ||= { src: `/illustrations/mnemonics/g5-${codeId(character)}.svg`, label: word, alt: `${character}字嵌在${cueFor(radical)}与${parts.slice(1).map(cueFor).join("、") || "完整物象"}组成的学习插图中` };
    for (const part of parts) if (!componentMap.has(part)) componentMap.set(part, { id: `g5-component-${codeId(part)}`, title: part, glyph: part, examples: [character], description: componentDescription(part), characterSet: [character], group: componentMap.size + 600, sequence: componentMap.size + 600 }); else { const component = componentMap.get(part); if (!component.examples.includes(character)) component.examples.push(character); if (!component.characterSet.includes(character)) component.characterSet.push(character); }
    const svg = makeSvg({ character, word, lesson, parts, radical });
    await writeFile(join(mnemonicRoot, svg.filename), svg.content);
  }
}

const recognitionTotal = grade5Volume1Lessons.reduce((total, lesson) => total + glyphs(lesson.recognition).length - glyphs(lesson.polyphonic).length, 0);
const polyphonicTotal = grade5Volume1Lessons.reduce((total, lesson) => total + glyphs(lesson.polyphonic).length, 0);
const writingTotal = grade5Volume1Lessons.reduce((total, lesson) => total + glyphs(lesson.writing).length, 0);
if (recognitionTotal !== officialRecognitionCount || polyphonicTotal !== officialPolyphonicCount || writingTotal !== officialWritingCount) throw new Error(`official count mismatch: ${recognitionTotal}/${polyphonicTotal}/${writingTotal}`);
if (characters.length !== 365 || new Set(characters.map((item) => item.hanzi)).size !== 359) throw new Error(`union mismatch: ${characters.length}/${new Set(characters.map((item) => item.hanzi)).size}`);

const course = { title: "语文 · 五年级上册", edition: "统编版（2025 更新）", grade: 5, volume: 1, lessonCount: 26, recognitionCount: 200, polyphonicCount: 16, writingCount: 220, officialCharacterCount: 359 };
await writeFile(outputModule, [serialize("grade5Course", course), serialize("grade5Lessons", lessons), serialize("grade5Characters", characters), serialize("grade5Components", [...componentMap.values()])].join("\n"));
await writeFile(visualModule, `${serialize("grade5CharacterVisuals", visuals)}\n${serialize("grade5LessonVisuals", Object.fromEntries(grade5Volume1Lessons.map((lesson) => [lessonId(lesson.position), { src: `/illustrations/lessons/g5-${String(lesson.position).padStart(2, "0")}.jpg`, label: lesson.title, alt: lesson.visual }])))}`);
await writeFile(mnemonicModule, serialize("grade5MnemonicScenes", scenes));
await writeFile(narrationModule, serialize("grade5NarrationScripts", narrations));
process.stdout.write(`Generated ${lessons.length} lessons, ${characters.length} lesson-character records, ${Object.keys(visuals).length} unique glyph visuals and ${componentMap.size} components.\n`);
