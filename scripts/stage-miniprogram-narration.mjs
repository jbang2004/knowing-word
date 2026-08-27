import { copyFile, mkdir, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { narrationAssets } from "../app/data/narration-assets.ts";

const projectRoot = resolve(import.meta.dirname, "..");
const sourceRoot = resolve(projectRoot, "release/miniprogram-narration-aac32");
const outputRoot = resolve(projectRoot, "dist/client/media/narration/v5");
const relativePaths = [...new Set(
  Object.values(narrationAssets).map((asset) => asset.audio
    .replace(/^\/narration\//, "")
    .replace(/audio\.webm$/u, "audio.m4a")),
)];

let bytes = 0;
for (const relative of relativePaths) {
  const source = join(sourceRoot, relative);
  const output = join(outputRoot, relative);
  await mkdir(dirname(output), { recursive: true });
  await copyFile(source, output);
  bytes += (await stat(output)).size;
}

process.stdout.write(
  `Staged ${relativePaths.length} mini-program narration files (${(bytes / 1024 / 1024).toFixed(1)} MiB) as immutable Site assets.\n`,
);
