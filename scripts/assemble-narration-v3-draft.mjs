import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { characters } from "../app/data/catalog.ts";

const projectRoot = resolve(import.meta.dirname, "..");
const artifactRoot = join(projectRoot, "artifacts/narration-v3");
const sources = [
  ["calibration-gold", "calibration/gold.json"],
  ["lessons-01-07", "drafts/lessons-01-07.json"],
  ["lessons-08-16", "drafts/lessons-08-16.json"],
  ["lessons-17-26", "drafts/lessons-17-26.json"],
];
const records = [];

for (const [packageId, relativePath] of sources) {
  const payload = JSON.parse(await readFile(join(artifactRoot, relativePath), "utf8"));
  const rows = Array.isArray(payload) ? payload : payload.records;
  if (!Array.isArray(rows)) throw new Error(`${relativePath} does not contain records`);
  for (const row of rows) records.push({
    ...row,
    status: row.status === "approved" ? "approved" : "draft",
    authorPackage: packageId,
  });
}

const expectedIds = new Set(characters.map((record) => record.id));
const actualIds = new Set(records.map((record) => record.recordId));
const duplicates = records.filter((record, index) =>
  records.findIndex((candidate) => candidate.recordId === record.recordId) !== index,
);
const missing = [...expectedIds].filter((id) => !actualIds.has(id));
const unknown = [...actualIds].filter((id) => !expectedIds.has(id));
if (duplicates.length || missing.length || unknown.length) {
  throw new Error(JSON.stringify({
    duplicateIds: [...new Set(duplicates.map((record) => record.recordId))],
    missing,
    unknown,
  }, null, 2));
}

records.sort((left, right) => {
  const leftIndex = characters.findIndex((record) => record.id === left.recordId);
  const rightIndex = characters.findIndex((record) => record.id === right.recordId);
  return leftIndex - rightIndex;
});
const outputPath = join(artifactRoot, "full-draft.json");
await mkdir(artifactRoot, { recursive: true });
await writeFile(outputPath, `${JSON.stringify({
  version: "narration-v3-full-draft",
  records,
}, null, 2)}\n`);
process.stdout.write(`Assembled ${records.length} records; ${records.filter((record) => record.status === "approved").length} approved calibration records.\n`);
