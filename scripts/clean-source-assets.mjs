import { readFile, readdir, rm } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const publicRoot = join(projectRoot, "public");
const narrationRoot = join(publicRoot, "narration");

async function removeMatching(directory, predicate) {
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
      removed += await removeMatching(path, predicate);
      const remaining = await readdir(path);
      if (!remaining.length) await rm(path, { recursive: true });
    } else if (predicate(path, entry.name)) {
      await rm(path);
      removed += 1;
    }
  }
  return removed;
}

const manifest = await readFile(join(projectRoot, "app/data/narration-assets.ts"), "utf8");
const referencedNarration = new Set(
  [...manifest.matchAll(/["']\/narration\/([^"']+)["']/g)].map((match) => match[1]),
);

const heritage = await removeMatching(
  join(publicRoot, "heritage"),
  (_path, name) => name === "audio.mp3" || name === "audio-marks.json",
);
const mnemonicSvg = await removeMatching(
  join(publicRoot, "illustrations/mnemonics"),
  (_path, name) => /^g5-.*\.svg$/.test(name),
);
const narration = await removeMatching(narrationRoot, (path) => {
  const assetPath = relative(narrationRoot, path).split(sep).join("/");
  return !referencedNarration.has(assetPath);
});

let starter = 0;
for (const name of ["file.svg", "globe.svg", "window.svg"]) {
  try {
    await rm(join(publicRoot, name));
    starter += 1;
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

process.stdout.write(
  `Source assets cleaned: ${heritage} legacy heritage files, ${mnemonicSvg} unused mnemonic SVGs, ` +
  `${narration} unreferenced narration files, ${starter} starter icons.\n`,
);
