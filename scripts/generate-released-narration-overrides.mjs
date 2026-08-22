import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import { characters } from "../app/data/catalog.ts";
import { narrationAssets } from "../app/data/narration-assets.ts";
import { authoredNarrationScripts } from "../app/data/narration-scripts.ts";

const projectRoot = resolve(import.meta.dirname, "..");
const outputPath = resolve(projectRoot, "app/data/released-narration-overrides.generated.ts");
const seen = new Set();
const overrides = {};

for (const character of characters) {
  if (seen.has(character.hanzi)) continue;
  seen.add(character.hanzi);
  const asset = narrationAssets[character.id];
  const marksPath = resolve(projectRoot, "public", asset.audioMarks.replace(/^\//u, ""));
  const marks = JSON.parse(await readFile(marksPath, "utf8"));
  if (marks.transcript !== authoredNarrationScripts[character.hanzi]) {
    overrides[character.hanzi] = marks.transcript;
  }
}

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(
  outputPath,
  `// Generated from the transcripts paired with the currently released v2 audio.\n`
    + `// Remove an override only when replacement audio and authored marks are released atomically.\n`
    + `export const releasedNarrationOverrides = ${JSON.stringify(overrides, null, 2)} as const;\n`,
  "utf8",
);
process.stdout.write(`Froze ${Object.keys(overrides).length} released narration transcripts.\n`);
