import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const artifactRoot = join(projectRoot, "artifacts/narration-v3");
const context = JSON.parse(await readFile(join(artifactRoot, "authoring-context.json"), "utf8"));
const gold = JSON.parse(await readFile(join(artifactRoot, "calibration/gold.json"), "utf8"));
const goldIds = new Set(gold.records.map((record) => record.recordId));
// Keep lesson boundaries intact while balancing this book's uneven record counts.
const ranges = [[1, 7], [8, 16], [17, 26]];
const outputRoot = join(artifactRoot, "packages");
await mkdir(outputRoot, { recursive: true });

for (const [first, last] of ranges) {
  const allRecords = context.records.filter((record) =>
    record.lessonPosition >= first && record.lessonPosition <= last,
  );
  const records = allRecords.filter((record) => !goldIds.has(record.recordId));
  const ownedGlyphs = context.glyphs.filter((glyph) => {
    const firstRecord = context.records.find((record) => record.glyph === glyph.glyph);
    return firstRecord && firstRecord.lessonPosition >= first && firstRecord.lessonPosition <= last;
  });
  const label = `lessons-${String(first).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
  const payload = {
    version: "narration-v3-authoring-package",
    packageId: label,
    lessonRange: [first, last],
    expectedRecordCount: records.length,
    expectedOwnedGlyphCount: ownedGlyphs.length,
    omittedCalibrationRecordIds: allRecords.filter((record) => goldIds.has(record.recordId)).map((record) => record.recordId),
    goldExamples: gold.records,
    records,
    ownedGlyphs,
  };
  await writeFile(join(outputRoot, `${label}.context.json`), `${JSON.stringify(payload, null, 2)}\n`);
  process.stdout.write(`${label}: ${records.length} drafts, ${ownedGlyphs.length} owned glyphs\n`);
}
