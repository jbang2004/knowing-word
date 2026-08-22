import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve, join } from "node:path";

const args = process.argv.slice(2);
const fileArg = args.find((arg) => !arg.startsWith("--"));
if (!fileArg) throw new Error("Usage: node scripts/audit-narration-v3-corpus.mjs <file.json> [--strict]");

const projectRoot = resolve(import.meta.dirname, "..");
const inputPath = resolve(fileArg);
const payload = JSON.parse(await readFile(inputPath, "utf8"));
const records = Array.isArray(payload) ? payload : payload.records;
if (!Array.isArray(records)) throw new Error("Expected narration records");

const prohibited = [
  ["colon", /[：:]/u],
  ["em-dash", /[—–]/u],
  ["flip-not-but", /不是[^。！？]{0,36}而是/u],
  ["flip-not-but-formal", /并非[^。！？]{0,36}而是/u],
  ["flip-not-in-but-in", /不在于[^。！？]{0,36}而在于/u],
  ["flip-rather", /与其说[^。！？]{0,36}不如说/u],
  ["flip-not-only", /不只[^。！？]{0,36}(还|也)/u],
  ["flip-surface", /表面[^。！？]{0,36}实际/u],
  ["flip-seems", /看似[^。！？]{0,36}实则/u],
  ["banned-lead", /(不丢|说白了|说穿了|先说结论|更微妙的是|还有一层|只说对了一半|值得注意的是|需要指出的是|从某种意义上说)/u],
  ["banned-jargon", /(赋能|抓手|商业闭环|价值闭环|闭环|能力沉淀|打法|拉通|底层逻辑|顶层设计|认知跃迁|价值释放|能力建设|降本增效|内容矩阵|全链路|组合拳|打开想象空间|想象空间|结构性机会|关键命题|深层逻辑|技术底座|公共底座|技术主权|单点风险|主脊柱|材料锚点|认知增量|迭代闭环)/u],
  ["defensive-course-denial", /((课文|文章|原文|古文|冰心)[^。！？]{0,20}(没有|并未|并非|没写|未写|并没有)|并非(文章|课文|原文|古文)|并没有(写|安排)|没有(写|安排|展开|点出)|未(写|讲|展开)|不替课文补)/u],
  ["meta-vocabulary-bridge", /(只是识字表里的教学词|只用于理解这个字|在这里[^。！？]{0,14}(帮助识字|帮助我们认字|用来教词义|负责帮助识字|认字用的词|用来辨认)|先从[^。！？]{0,10}(学会这个字|读懂这个字))/u],
  ["sentence-stub", /(这。|这幅情景。|这轮太阳。|柳树和桥影。)/u],
  ["legacy-overview", /先看整体结构/u],
  ["legacy-close", /最后再读一遍/u],
  ["legacy-division", /从构字分工看/u],
];
const errors = [];
const warnings = [];
const lengths = [];
const sentences = new Map();
const sentenceSkeletons = new Map();
const fragments = new Map();
const openings = new Map();
const endings = new Map();

function add(map, key, id) {
  const ids = map.get(key) || new Set();
  ids.add(id);
  map.set(key, ids);
}

for (const record of records) {
  const script = record.script || "";
  lengths.push(Array.from(script).length);
  for (const [name, pattern] of prohibited) {
    if (pattern.test(script)) errors.push({ type: name, recordId: record.recordId, sample: script });
  }
  for (const sentence of script.split(/[。！？]/u).map((item) => item.trim()).filter(Boolean)) {
    if (Array.from(sentence).length >= 8) {
      add(sentences, sentence, record.recordId);
      const skeleton = sentence
        .split(record.word || "\u0000").join("{词}")
        .split(record.glyph || "\u0000").join("{字}")
        .replace(/[A-Za-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]+/gu, "{音}");
      const functionalPronunciationOpening = /^(\{字\}[，,])?(\{词\}的)?\{字\}[，,]?(读|读作|这里读|这个字读|念)\{音\}$/u.test(skeleton);
      if (!functionalPronunciationOpening) add(sentenceSkeletons, skeleton, record.recordId);
    }
  }
  const compact = Array.from(script.replace(/[，。！？；、“”‘’（）《》\s]/gu, ""));
  const localFragments = new Set();
  for (let start = 0; start <= compact.length - 12; start += 1) {
    localFragments.add(compact.slice(start, start + 12).join(""));
  }
  for (const fragment of localFragments) add(fragments, fragment, record.recordId);
  add(openings, Array.from(script).slice(0, 10).join(""), record.recordId);
  add(endings, Array.from(script).slice(-12).join(""), record.recordId);
}

for (const [sentence, ids] of sentences) {
  if (ids.size >= 4) warnings.push({ type: "shared-sentence", count: ids.size, text: sentence, recordIds: [...ids] });
}
for (const [skeleton, ids] of sentenceSkeletons) {
  if (ids.size >= 4) warnings.push({ type: "shared-sentence-skeleton", count: ids.size, text: skeleton, recordIds: [...ids] });
}
for (const [fragment, ids] of fragments) {
  // Naming a structure and its radical is functional teaching language. Keep it
  // stable; repetition becomes a warning only in the surrounding explanation.
  const functionalStructureFragment = /^(是)?左右结构左边是.{1,4}旁右/u.test(fragment);
  if (ids.size >= 5 && !functionalStructureFragment) {
    warnings.push({ type: "shared-12-char-fragment", count: ids.size, text: fragment, recordIds: [...ids] });
  }
}
for (const [text, ids] of openings) {
  if (ids.size >= 5) warnings.push({ type: "shared-opening", count: ids.size, text, recordIds: [...ids] });
}
for (const [text, ids] of endings) {
  if (ids.size >= 5) warnings.push({ type: "shared-ending", count: ids.size, text, recordIds: [...ids] });
}

lengths.sort((left, right) => left - right);
const percentile = (ratio) => lengths[Math.min(lengths.length - 1, Math.floor(lengths.length * ratio))];
const report = {
  version: "narration-v3-corpus-audit",
  input: inputPath,
  counts: {
    records: records.length,
    glyphs: new Set(records.map((record) => record.glyph)).size,
    errors: errors.length,
    warnings: warnings.length,
  },
  length: {
    minimum: lengths[0],
    p10: percentile(0.1),
    median: percentile(0.5),
    p90: percentile(0.9),
    maximum: lengths.at(-1),
    average: Number((lengths.reduce((sum, item) => sum + item, 0) / lengths.length).toFixed(1)),
  },
  errors,
  warnings: warnings.sort((left, right) => (right.count || 0) - (left.count || 0)),
};

const outputPath = join(projectRoot, "artifacts/narration-v3/corpus-audit.json");
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(report.counts)} length=${JSON.stringify(report.length)}\n`);
if (args.includes("--strict") && (errors.length || warnings.length)) process.exitCode = 1;
