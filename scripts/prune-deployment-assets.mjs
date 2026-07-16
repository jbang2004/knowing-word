import { readdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";

const heritageRoot = resolve(import.meta.dirname, "../dist/client/heritage");
const legacyNarrationFiles = new Set(["audio.mp3", "audio-marks.json"]);

async function pruneDirectory(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") return 0;
    throw error;
  }

  let removed = 0;
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      removed += await pruneDirectory(path);
    } else if (legacyNarrationFiles.has(entry.name)) {
      await rm(path);
      removed += 1;
    }
  }
  return removed;
}

const removed = await pruneDirectory(heritageRoot);
process.stdout.write(`Pruned ${removed} superseded heritage narration files from the deployment build.\n`);
