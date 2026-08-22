import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { narrationRecordDigest } from "./narration-review-digest.mjs";

const [reviewArg, draftArg] = process.argv.slice(2);
if (!reviewArg || !draftArg) {
  throw new Error("Usage: node scripts/validate-narration-review.mjs <review.json> <draft.json>");
}

const reviewPayload = JSON.parse(await readFile(resolve(reviewArg), "utf8"));
const draftPayload = JSON.parse(await readFile(resolve(draftArg), "utf8"));
const reviews = reviewPayload.reviews || reviewPayload.records;
const drafts = Array.isArray(draftPayload) ? draftPayload : draftPayload.records;
if (!Array.isArray(reviews) || !Array.isArray(drafts)) throw new Error("复核文件或讲稿文件缺少数组");
if (!reviewPayload.reviewer || reviewPayload.reviewer === "root") throw new Error("交叉复核者必须是非 root 的独立角色");

const scoreCaps = {
  factsAndBoundary: 30,
  childClarity: 20,
  humanVoice: 20,
  courseConnection: 20,
  ttsReadability: 10,
};
const errors = [];
const expectedIds = new Set(drafts.map((row) => row.recordId));
const draftById = new Map(drafts.map((row) => [row.recordId, row]));
const seen = new Set();
for (const review of reviews) {
  if (!expectedIds.has(review.recordId)) errors.push(`${review.recordId}: 不在被审稿件中`);
  if (seen.has(review.recordId)) errors.push(`${review.recordId}: 重复复核`);
  seen.add(review.recordId);
  const draft = draftById.get(review.recordId);
  if (draft && review.draftDigest !== narrationRecordDigest(draft)) {
    errors.push(`${review.recordId}: draftDigest 与当前稿件不一致，必须重新复核`);
  }
  let total = 0;
  for (const [key, cap] of Object.entries(scoreCaps)) {
    const value = review.scores?.[key];
    if (!Number.isFinite(value) || value < 0 || value > cap) errors.push(`${review.recordId}: ${key} 超界`);
    total += Number(value || 0);
  }
  if (review.reviewScore !== total) errors.push(`${review.recordId}: reviewScore 应为 ${total}`);
  const shouldPass = total >= 90 && review.hardFail === false;
  if ((review.verdict === "pass") !== shouldPass) errors.push(`${review.recordId}: verdict 与分数/硬伤不一致`);
  if (!shouldPass && (!Array.isArray(review.issues) || !review.issues.length)) errors.push(`${review.recordId}: revise 必须写明问题`);
}
for (const id of expectedIds) if (!seen.has(id)) errors.push(`${id}: 缺少复核`);
if (reviews.length !== drafts.length) errors.push(`复核数量 ${reviews.length} 与稿件 ${drafts.length} 不一致`);

if (errors.length) {
  for (const error of errors) process.stderr.write(`ERROR ${error}\n`);
  process.exitCode = 1;
} else {
  const revise = reviews.filter((row) => row.verdict !== "pass").length;
  process.stdout.write(`Validated ${reviews.length} reviews; ${revise} require revision.\n`);
}
