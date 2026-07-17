import { access, readFile, readdir, rm } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const clientRoot = join(projectRoot, "dist/client");
const narrationRoot = join(clientRoot, "narration");
const narrationManifest = join(projectRoot, "app/data/narration-assets.ts");
const narrationReadyMarker = join(projectRoot, "config/narration-r2-ready-v2.json");
const legacyNarrationFiles = new Set(["audio.mp3", "audio-marks.json"]);

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

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

function manifestNarrationPaths(source) {
  return new Set(
    [...source.matchAll(/["']\/narration\/([^"']+)["']/g)].map((match) => match[1]),
  );
}

const counts = {
  heritage: await removeMatching(
    join(clientRoot, "heritage"),
    (_path, name) => legacyNarrationFiles.has(name),
  ),
  mnemonicSvg: await removeMatching(
    join(clientRoot, "illustrations/mnemonics"),
    (_path, name) => /^g5-.*\.svg$/.test(name),
  ),
  narration: 0,
  starter: 0,
};

if (await exists(narrationReadyMarker)) {
  if (await exists(narrationRoot)) {
    await rm(narrationRoot, { recursive: true });
    counts.narration = -1;
  }
} else {
  const referenced = manifestNarrationPaths(await readFile(narrationManifest, "utf8"));
  counts.narration = await removeMatching(narrationRoot, (path) => {
    const assetPath = relative(narrationRoot, path).split(sep).join("/");
    return !referenced.has(assetPath);
  });
}

for (const name of ["file.svg", "globe.svg", "window.svg"]) {
  const path = join(clientRoot, name);
  if (await exists(path)) {
    await rm(path);
    counts.starter += 1;
  }
}

const narrationSummary = counts.narration === -1
  ? "removed the R2-backed narration directory"
  : `removed ${counts.narration} unreferenced narration files`;
process.stdout.write(
  `Deployment assets pruned: ${counts.heritage} legacy heritage files, ` +
  `${counts.mnemonicSvg} unused mnemonic SVGs, ${narrationSummary}, ` +
  `${counts.starter} starter icons.\n`,
);
