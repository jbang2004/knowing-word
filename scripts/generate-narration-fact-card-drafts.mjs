import { mkdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { characters } from "../app/data/catalog.ts";
import { spokenComponent } from "../app/data/narration-v3/component-speech.ts";

const projectRoot = resolve(import.meta.dirname, "..");
const outputPath = join(projectRoot, "artifacts/narration-v3/fact-card-drafts.json");
const byGlyph = new Map();

for (const record of characters) {
  const rows = byGlyph.get(record.hanzi) || [];
  rows.push(record);
  byGlyph.set(record.hanzi, rows);
}

const factCards = [...byGlyph.entries()].map(([glyph, rows]) => {
  const canonical = rows.find((row) => row.official !== false) || rows[0];
  const structures = [...new Set(rows.map((row) => row.decomposition).filter(Boolean))];
  const componentSets = [...new Set(rows.map((row) => row.parts.map((part) => part.char).join("+")))];
  const meanings = [...new Set(rows.map((row) => row.originalMeaning).filter(Boolean))];
  const components = canonical.parts.map((part) => part.char);
  const risks = ["机器只汇总了现有课程数据，须由人工复核后才能批准。"];
  if (structures.length > 1) risks.push(`现有记录的结构不一致：${structures.join(" / ")}`);
  if (componentSets.length > 1) risks.push(`现有记录的部件不一致：${componentSets.join(" / ")}`);
  if (meanings.length > 1) risks.push(`同字在不同记录中有多个释义：${meanings.join(" / ")}`);
  return {
    glyph,
    meaningForChildren: meanings[0] || "",
    structure: structures[0] || "",
    components,
    spokenComponents: components.map((component) => spokenComponent(component)),
    etymologyReview: "needs-review",
    claims: [],
    risks,
    status: "draft",
    recordIds: rows.map((row) => row.id),
  };
});

await mkdir(join(projectRoot, "artifacts/narration-v3"), { recursive: true });
await writeFile(outputPath, `${JSON.stringify({
  version: "narration-v3-fact-card-drafts",
  factCards,
}, null, 2)}\n`);
process.stdout.write(`Wrote ${factCards.length} draft fact cards.\n`);
