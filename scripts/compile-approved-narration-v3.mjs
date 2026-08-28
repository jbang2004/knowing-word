import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

import { characters } from "../app/data/catalog.ts";
import { formalNarrationBookPolicy } from "./narration-policy.mjs";
import { narrationRecordDigest } from "./narration-review-digest.mjs";
import { ttsSafeNarration } from "./narration-tts-text.mjs";

const projectRoot = resolve(import.meta.dirname, "..");
const artifactRoot = join(projectRoot, "artifacts/narration-v3");
const outputPath = join(projectRoot, "app/data/narration-v3/approved/book.json");
const verdictPath = join(artifactRoot, "root-review.json");
const narrationSources = [
  "calibration/gold.json",
  "drafts/lessons-01-07.json",
  "drafts/lessons-08-16.json",
  "drafts/lessons-17-26.json",
];
const factSources = [
  "facts/facts-01-07.json",
  "facts/facts-08-16.json",
  "facts/facts-17-26.json",
];
const expectedRecordCount = characters.length;
const expectedGlyphCount = new Set(characters.map((row) => row.hanzi)).size;

async function rowsFrom(relativePath, field) {
  const payload = JSON.parse(await readFile(join(artifactRoot, relativePath), "utf8"));
  const rows = Array.isArray(payload) ? payload : payload[field];
  if (!Array.isArray(rows)) throw new Error(`${relativePath} 缺少 ${field} 数组`);
  return rows;
}

function normalizedClaim(claim, sourcePath) {
  if (claim && typeof claim === "object") return claim;
  if (typeof claim !== "string" || !claim.trim()) throw new Error(`${sourcePath} 含空 claim`);
  const text = claim.trim();
  if (/(记忆|记形|画面|联想|不承载|不建立价值联系)/u.test(text)) {
    return { text, kind: "mnemonic", evidenceGrade: "D" };
  }
  if (/(结构|部件|字形由|现代字形)/u.test(text)) {
    return {
      text,
      kind: "structure",
      evidenceGrade: "C",
      source: "app/data/generated/grade5-volume1/all-characters.ts",
    };
  }
  return { text, kind: "meaning", evidenceGrade: "C", source: `artifacts/narration-v3/${sourcePath}` };
}

function assertUnique(rows, key, expectedCount, label) {
  const values = rows.map((row) => row[key]);
  const unique = new Set(values);
  if (rows.length !== expectedCount || unique.size !== expectedCount) {
    throw new Error(`${label} 应有 ${expectedCount} 个唯一 ${key}，实际 ${rows.length}/${unique.size}`);
  }
}

const narrations = [];
const narrationDigestById = new Map();
for (const sourcePath of narrationSources) {
  for (const row of await rowsFrom(sourcePath, "records")) {
    narrationDigestById.set(row.recordId, narrationRecordDigest(row));
    narrations.push({
      ...row,
      claims: row.claims.map((claim) => normalizedClaim(claim, sourcePath)),
      ttsText: row.ttsText || ttsSafeNarration(row.script),
      status: "approved",
      reviewer: "root",
    });
  }
}

const factCards = [];
for (const sourcePath of factSources) {
  for (const row of await rowsFrom(sourcePath, "factCards")) {
    if (row.status !== "reviewed") throw new Error(`${row.glyph} 事实卡尚未完成人工复核`);
    if (row.etymologyReview === "needs-review") throw new Error(`${row.glyph} 事实卡仍有待核字源`);
    factCards.push({ ...row, status: "approved" });
  }
}

assertUnique(narrations, "recordId", expectedRecordCount, "讲稿");
assertUnique(factCards, "glyph", expectedGlyphCount, "事实卡");

const expectedRecordIds = new Set(characters.map((row) => row.id));
const expectedGlyphs = new Set(characters.map((row) => row.hanzi));
for (const row of narrations) {
  if (!expectedRecordIds.has(row.recordId)) throw new Error(`未知 recordId: ${row.recordId}`);
}
for (const card of factCards) {
  if (!expectedGlyphs.has(card.glyph)) throw new Error(`未知事实卡: ${card.glyph}`);
}

let verdictPayload;
try {
  verdictPayload = JSON.parse(await readFile(verdictPath, "utf8"));
} catch (error) {
  if (error?.code === "ENOENT") throw new Error("缺少 root-review.json，全书尚未通过主审，禁止生成批准库");
  throw error;
}
if (verdictPayload.reviewer !== "root") throw new Error("root-review.json 必须由 root 主审签署");
const verdicts = verdictPayload.records;
if (!Array.isArray(verdicts)) throw new Error("root-review.json 缺少 records");
assertUnique(verdicts, "recordId", expectedRecordCount, "主审结论");
const verdictById = new Map(verdicts.map((row) => [row.recordId, row]));
for (const row of narrations) {
  const verdict = verdictById.get(row.recordId);
  if (!verdict || verdict.verdict !== "approved" || verdict.hardFail) {
    throw new Error(`${row.recordId} 尚未通过 root 主审`);
  }
  if (!Number.isFinite(verdict.reviewScore) || verdict.reviewScore < 90) {
    throw new Error(`${row.recordId} 主审分数不足 90`);
  }
  if (verdict.draftDigest !== narrationDigestById.get(row.recordId)) {
    throw new Error(`${row.recordId} 在主审签署后发生变化，必须重新复核`);
  }
  row.reviewScore = verdict.reviewScore;
}

const catalogOrder = new Map(characters.map((row, index) => [row.id, index]));
narrations.sort((left, right) => catalogOrder.get(left.recordId) - catalogOrder.get(right.recordId));
factCards.sort((left, right) =>
  characters.findIndex((row) => row.hanzi === left.glyph)
  - characters.findIndex((row) => row.hanzi === right.glyph));

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify({
  version: "narration-v3-book",
  modelPolicy: formalNarrationBookPolicy,
  factCards,
  records: narrations,
}, null, 2)}\n`);
process.stdout.write(`Approved ${narrations.length} records and ${factCards.length} fact cards.\n`);
