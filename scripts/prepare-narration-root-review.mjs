import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";

import { characters } from "../app/data/catalog.ts";
import { narrationRecordDigest } from "./narration-review-digest.mjs";

const projectRoot = resolve(import.meta.dirname, "..");
const artifactRoot = join(projectRoot, "artifacts/narration-v3");
const outputPath = join(artifactRoot, "root-review.json");
const packages = [
  {
    author: "editorial-system",
    expectedReviewer: "qa-editorial",
    review: "reviews/review-01-07-by-qa.json",
    draft: "drafts/lessons-01-07.json",
  },
  {
    author: "technical-migration",
    expectedReviewer: "editorial-independent",
    review: "reviews/review-08-16-by-editorial.json",
    draft: "drafts/lessons-08-16.json",
  },
  {
    author: "qa-editorial",
    expectedReviewer: "technical-migration",
    review: "reviews/review-17-26-by-technical.json",
    draft: "drafts/lessons-17-26.json",
  },
];

async function json(relativePath) {
  return JSON.parse(await readFile(join(artifactRoot, relativePath), "utf8"));
}

const records = [];
const unresolved = [];
const calibration = await json("calibration/root-verdict.json");
const calibrationDraft = await json("calibration/gold.json");
const calibrationById = new Map(calibrationDraft.records.map((row) => [row.recordId, row]));
for (const row of calibration.records) {
  if (!Number.isFinite(row.score) || row.score < 90) unresolved.push(row.recordId);
  const draft = calibrationById.get(row.recordId);
  if (!draft) throw new Error(`calibration/root-verdict.json 含未知 recordId ${row.recordId}`);
  records.push({
    recordId: row.recordId,
    draftDigest: narrationRecordDigest(draft),
    reviewScore: row.score,
    hardFail: false,
    verdict: "approved",
    crossReviewer: "root-calibration",
    sourceReview: "calibration/root-verdict.json",
  });
}

for (const item of packages) {
  const reviewPayload = await json(item.review);
  const draftPayload = await json(item.draft);
  const reviews = reviewPayload.reviews || reviewPayload.records;
  const drafts = Array.isArray(draftPayload) ? draftPayload : draftPayload.records;
  if (reviewPayload.reviewer !== item.expectedReviewer) {
    throw new Error(`${item.review} 的 reviewer 应为 ${item.expectedReviewer}`);
  }
  if (item.author === item.expectedReviewer) throw new Error(`${item.review} 违反作者与复核者分离`);
  const expectedIds = new Set(drafts.map((row) => row.recordId));
  const draftById = new Map(drafts.map((row) => [row.recordId, row]));
  if (reviews.length !== expectedIds.size) throw new Error(`${item.review} 未完整覆盖稿件`);
  for (const review of reviews) {
    if (!expectedIds.has(review.recordId)) throw new Error(`${item.review} 含未知 recordId ${review.recordId}`);
    const expectedDigest = narrationRecordDigest(draftById.get(review.recordId));
    if (review.draftDigest !== expectedDigest) {
      throw new Error(`${item.review} 的 ${review.recordId} 未绑定当前稿件，必须重新复核`);
    }
    const pass = review.verdict === "pass" && review.hardFail === false && review.reviewScore >= 90;
    if (!pass) unresolved.push(review.recordId);
    records.push({
      recordId: review.recordId,
      draftDigest: expectedDigest,
      reviewScore: review.reviewScore,
      scores: review.scores,
      hardFail: !pass,
      verdict: pass ? "approved" : "revise",
      crossReviewer: reviewPayload.reviewer,
      sourceReview: item.review,
    });
  }
}

const uniqueIds = new Set(records.map((row) => row.recordId));
const expectedIds = new Set(characters.map((row) => row.id));
if (records.length !== 430 || uniqueIds.size !== 430) throw new Error(`主审输入覆盖应为 430，实际 ${records.length}/${uniqueIds.size}`);
for (const id of expectedIds) if (!uniqueIds.has(id)) unresolved.push(id);
if (unresolved.length) {
  throw new Error(`仍有 ${new Set(unresolved).size} 条未过交叉复核，禁止签署 root-review.json：${[...new Set(unresolved)].join(", ")}`);
}

const order = new Map(characters.map((row, index) => [row.id, index]));
records.sort((left, right) => order.get(left.recordId) - order.get(right.recordId));
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify({
  version: "narration-v3-root-review",
  reviewer: "root",
  threshold: 90,
  records,
}, null, 2)}\n`);
process.stdout.write(`Root review signed for ${records.length} records.\n`);
