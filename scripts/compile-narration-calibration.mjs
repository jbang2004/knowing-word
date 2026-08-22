import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { characters } from "../app/data/catalog.ts";

const projectRoot = resolve(import.meta.dirname, "..");
const folder = join(projectRoot, "artifacts/narration-v3/calibration");
const verdict = JSON.parse(await readFile(join(folder, "root-verdict.json"), "utf8"));
const candidates = new Map();

for (const label of ["a", "b", "c"]) {
  const rows = JSON.parse(await readFile(join(folder, `candidate-${label}.json`), "utf8"));
  candidates.set(label, new Map(rows.map((row) => [row.recordId, row])));
}

const catalogById = new Map(characters.map((record) => [record.id, record]));
const records = verdict.records.map((decision) => {
  const candidate = candidates.get(decision.selected)?.get(decision.recordId);
  const catalogRecord = catalogById.get(decision.recordId);
  if (!candidate || !catalogRecord) throw new Error(`Cannot promote ${decision.recordId}`);
  if (decision.score < verdict.threshold) throw new Error(`${decision.recordId} did not reach the approval threshold`);
  const script = decision.scriptOverride || candidate.script;
  return {
    ...candidate,
    script,
    ...(decision.ttsTextOverride ? { ttsText: decision.ttsTextOverride } : {}),
    charCount: Array.from(script).length,
    lessonTitle: catalogRecord.lessonTitle,
    pinyin: catalogRecord.pinyin,
    status: "approved",
    reviewer: verdict.reviewer,
    selectedCandidate: decision.selected,
    reviewScore: decision.score,
    reviewReason: decision.reason,
  };
});

const output = `${JSON.stringify({
  version: "narration-v3-calibration-gold",
  records,
}, null, 2)}\n`;
await writeFile(join(folder, "gold.json"), output);
const approvedFolder = join(projectRoot, "app/data/narration-v3/approved");
await mkdir(approvedFolder, { recursive: true });
await writeFile(join(approvedFolder, "calibration.json"), output);
process.stdout.write(`Promoted ${records.length} calibration records.\n`);
