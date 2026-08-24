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
import { mnemonicQualityPlans } from "../app/data/mnemonic-quality.ts";

const root = resolve(import.meta.dirname, "..");
const dictionaryCache = "/tmp/knowing-word-makemeahanzi-dictionary.txt";
const dictionaryUrl = "https://raw.githubusercontent.com/skishore/makemeahanzi/master/dictionary.txt";
const generatedCatalogRoot = join(root, "app/data/generated/grade5-volume1");
const generatedLessonRoot = join(generatedCatalogRoot, "lessons");
const outputModule = join(root, "app/data/grade5-volume1-generated.ts");
const visualModule = join(root, "app/data/grade5-volume1-visuals.generated.ts");
const mnemonicModule = join(root, "app/data/grade5-volume1-mnemonics.generated.ts");
const promptModule = join(root, "scripts/generated/grade5-volume1-image-prompts.generated.ts");
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

function makeOptions(id, values, correctValues, radicalValues = [], idc = {}) {
  return values.map((text, index) => ({
    id: `${id}-${index}`,
    text,
    correct: correctValues.includes(text),
    radical: radicalValues.includes(text),
    idcCode: idc[text] || "",
  }));
}

// Course-wide fallback pool so context questions always get enough plausible
// distractors even in small lessons.
let courseWordPool = [];
function pickDistractorWords(lesson, character, word, index, count) {
  const lessonWords = lesson.words.filter((item) => item !== word && !item.includes(character));
  const used = new Set([word]);
  const picks = [];
  const takeFrom = (pool, stride, offset) => {
    if (!pool.length || picks.length >= count) return;
    for (let step = 0; step < pool.length && picks.length < count; step += 1) {
      const candidate = pool[(index * stride + offset + step) % pool.length];
      if (!candidate || used.has(candidate) || candidate.includes(character)) continue;
      used.add(candidate);
      picks.push(candidate);
    }
  };
  takeFrom(lessonWords, 3, 1);
  takeFrom(courseWordPool, 7, 3);
  return picks;
}

function exerciseSet(character, index, lesson, parts, radical, structure, writing, polyphonic, word, pinyinText) {
  const base = charId(lesson.position, index, character);
  const distractorWords = pickDistractorWords(lesson, character, word, index, 3);
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
    { id: componentQuestion, origin: "识字小测", kind: "components", questionType: "composition_select_to_text", prompt: `选择“${character}”的主要部件。`, options: makeOptions(componentQuestion, componentPool, parts, [radical]), explanation: `${parts.join(" + ")}，按${structure}组合成“${character}”。` },
    { id: splitQuestion, origin: "拆一拆", kind: "components", questionType: "composition_select_to_text", prompt: `按顺序搭出“${character}”。`, options: makeOptions(splitQuestion, componentPool, parts, [radical]), explanation: `先按${structure}排好部件，再找到表意线索“${radical}”。` },
    { id: redBlueQuestion, origin: "红蓝字", kind: "components", questionType: "radical_component_select", prompt: `选出组成“${character}”的真正部件。`, options: makeOptions(redBlueQuestion, unique([...parts, ...redBlueDecoys]), parts, [radical]), explanation: `“${character}”由${parts.map((part) => `“${part}”`).join("和")}组成。暖红追踪表意线索“${radical}”，靛蓝追踪其余字形或读音线索。` },
    { id: structureTrackQuestion, origin: "空间结构", kind: "structure", questionType: "character_structure_select", prompt: `把“${character}”放进正确的结构格。`, options: makeOptions(structureTrackQuestion, structures, [structure], [], structureCodes), explanation: `“${character}”的部件按${structure}站位。` },
  ];
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
    list.splice(4, 0, { id: `${base}-words-write`, origin: "识字小测", kind: "write", questionType: "write_full_word", prompt: `在田字格里写一遍“${character}”。`, options: [], explanation: `先看整体结构，再写关键部件。` });
    list.push({ id: `${base}-split-write`, origin: "拆一拆", kind: "write", questionType: "write_full_word_empty", prompt: `合起部件，完整写出“${character}”。`, options: [], explanation: `写完后对照部件位置自查。` });
  }
  return list;
}

function componentDescription(part, plan, parts, index) {
  const sceneCue = sceneCues(plan, parts)[index];
  return `${sceneCue}先认清“${part}”的完整轮廓和所在位置，再回到整幅图里把各部件合成字。`;
}

function trimStop(value) {
  return value.replace(/[。！？；]+$/u, "");
}

function etymologyCopy(record, parts, radical) {
  const semantic = record?.etymology?.semantic;
  const phonetic = record?.etymology?.phonetic;
  if (record?.etymology?.type?.includes("pictophonetic") && semantic && phonetic) {
    return `从构字分工看，“${semantic}”提示意义类别，“${phonetic}”提供读音线索`;
  }
  if (parts.length > 1) return `从构字分工看，“${radical}”先提示意义类别，其余部件补足字形`;
  return "这个字适合顺着完整轮廓来记";
}

function makeDescription(character, pinyinText, word, structure, parts, radical, role, plan, record) {
  const roleCopy = role === "write" ? "这是本课要求会写的字" : role === "polyphonic" ? "这是本课要留意读音变化的多音字" : "这是本课要求会认的字";
  return `${character}，读${pinyinText}，是“${word}”里的字。${roleCopy}。先看整体：它是${structure}，按顺序能看到${parts.map((part) => `“${part}”`).join("和")}。${etymologyCopy(record, parts, radical)}。看图时，${trimStop(plan.scene)}。${trimStop(plan.meaning)}。这幅物象图用于记笔画和位置，不代替完整字源。最后回到“${word}”里读一遍。`;
}

function sceneCues(plan, parts) {
  const clauses = plan.scene.split(/[，；。]/u).map((item) => item.trim()).filter(Boolean);
  return parts.map((part, index) => {
    const exact = clauses.find((clause) => clause.includes(`“${part}”`));
    if (exact) return `${exact}。`;
    return `${index === 0 ? "先" : "再"}在专属画面中找到“${part}”的完整位置；${trimStop(plan.scene)}。`;
  });
}

function imagePrompt({ character, word, lesson, structure, parts, radical, plan }) {
  return `Use case: scientific-educational\nAsset type: square web mnemonic illustration for a Grade 5 Chinese literacy lesson\nPrimary request: create one polished child-friendly object-shaped mnemonic for the Chinese character “${character}” in the word “${word}”\nScene/backdrop: a single coherent ${lesson.title} learning scene on warm rice-paper texture, quiet and uncluttered\nSubject: ${trimStop(plan.scene)}\nStructure accuracy: preserve the real ${structure}; place ${parts.map((part) => `“${part}”`).join("、")} in that exact order and relative position; “${radical}” remains clearly findable as the semantic clue\nStyle/medium: premium Chinese children’s-book watercolor with crisp object silhouettes, natural depth, refined details, warm light, visually comparable to an award-winning educational picture book\nComposition/framing: 1:1 square, the full mnemonic object centered inside the middle 78% of the canvas, generous safe padding on all four sides, no object or stroke-like edge cropped; readable on mobile\nLearning goal: every component is made from meaningful real objects, and those object contours naturally grow into the component strokes before combining into the whole character\nConstraints: one scene only; component contours must stay complete and separable; meaning must be understandable without labels; age-appropriate and beautiful\nAvoid: printed or handwritten Chinese text, font masks, a giant opaque character pasted over a photo, captions, pinyin, labels, borders, split panels, UI, watermark, logos, violence, clutter, cropped subjects`;
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
courseWordPool = unique(grade5Volume1Lessons.flatMap((lesson) => lesson.words));
await mkdir(mnemonicRoot, { recursive: true });
await mkdir(join(root, "scripts/generated"), { recursive: true });
await mkdir(generatedLessonRoot, { recursive: true });

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
    const radical = record?.radical && record.radical !== character ? record.radical : rawParts[0];
    const parts = rawParts;
    const teachingRadical = parts.includes(radical) ? radical : parts[0];
    const structure = decompositionFor(record, parts);
    const word = wordFor(lesson, character);
    const pinyinText = pinyinFor(lesson, word, character);
    const role = writing.has(character) ? "write" : polyphonic.has(character) ? "polyphonic" : "recognize";
    const plan = mnemonicQualityPlans[character];
    if (!plan) throw new Error(`missing mnemonic quality plan for ${character}`);
    const scene = plan.scene;
    const idForCharacter = charId(lesson.position, index, character);
    const compositions = parts.map((part, partIndex) => ({ char: part, description: componentDescription(part, plan, parts, partIndex), charType: part === character ? typeNames[record?.etymology?.type] || "字形部件" : "字形部件", children: [] }));
    const item = {
      id: idForCharacter, lessonId: id, lessonTitle: lesson.title, lessonPosition: lesson.position,
      word, wordPosition: lesson.words.indexOf(word) + 1 || index + 1, hanzi: character, primary: true, ready: true,
      pinyin: pinyinText, charType: typeNames[record?.etymology?.type] || "字形字", decomposition: structure,
      originalMeaning: plan.meaning, description: makeDescription(character, pinyinText, word, structure, parts, teachingRadical, role, plan, record), originalText: lesson.context,
      parts: parts.map((part) => ({ char: part, radical: part === teachingRadical })), compositions,
      exercises: exerciseSet(character, index, lesson, parts, teachingRadical, structure, writing.has(character), polyphonic.has(character), word, pinyinText),
      curriculumRole: role, polyphonic: polyphonic.has(character), official: true, tier: "curriculum",
    };
    characters.push(item);
    scenes[character] ||= { scene, cues: sceneCues(plan, parts) };
    visuals[character] ||= { src: `/illustrations/mnemonics-v2/g5-${codeId(character)}.webp`, label: word, alt: `${trimStop(plan.meaning)} 图中${parts.map((part) => `“${part}”`).join("与")}按${structure}自然长成“${character}”。` };
    imagePrompts[character] ||= { character, word, lesson: lesson.title, structure, parts, radical: teachingRadical, filename: `g5-${codeId(character)}.jpg`, prompt: imagePrompt({ character, word, lesson, structure, parts, radical: teachingRadical, plan }) };
    for (const [partIndex, part] of parts.entries()) if (!componentMap.has(part)) componentMap.set(part, { id: `g5-component-${codeId(part)}`, title: part, glyph: part, examples: [character], description: componentDescription(part, plan, parts, partIndex), characterSet: [character], group: componentMap.size + 600, sequence: componentMap.size + 600 }); else { const component = componentMap.get(part); if (!component.examples.includes(character)) component.examples.push(character); if (!component.characterSet.includes(character)) component.characterSet.push(character); }
  }
}

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
  await writeFile(
    join(generatedLessonRoot, `${lesson.id}.ts`),
    [
      serialize("lesson", lesson),
      serialize("characters", characters.filter((character) => character.lessonId === lesson.id)),
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
  outputModule,
  `/* Generated compatibility surface. Runtime routes should load lesson shards directly. */\nexport { grade5Course, grade5Lessons } from "./generated/grade5-volume1/course.ts";\nexport { grade5Characters } from "./generated/grade5-volume1/all-characters.ts";\nexport { grade5Components } from "./generated/grade5-volume1/components.ts";\n`,
);
await writeFile(visualModule, `${serialize("grade5CharacterVisuals", visuals)}\n${serialize("grade5LessonVisuals", Object.fromEntries(grade5Volume1Lessons.map((lesson) => [lessonId(lesson.position), { src: `/illustrations/lessons/g5-${String(lesson.position).padStart(2, "0")}.webp`, label: lesson.title, alt: lesson.visual }])))}`);
await writeFile(mnemonicModule, serialize("grade5MnemonicScenes", scenes));
await writeFile(promptModule, serialize("grade5ImagePrompts", imagePrompts));
process.stdout.write(`Generated ${lessons.length} lessons, ${characters.length} lesson-character records, ${Object.keys(visuals).length} unique glyph visuals and ${componentMap.size} components.\n`);
