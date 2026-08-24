import { access, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const clientRoot = join(projectRoot, "dist/client");
const wranglerConfigPath = join(projectRoot, "dist/server/wrangler.json");
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

const counts = {
  heritage: await removeMatching(
    join(clientRoot, "heritage"),
    (_path, name) => legacyNarrationFiles.has(name),
  ),
  mnemonicSvg: await removeMatching(
    join(clientRoot, "illustrations/mnemonics"),
    (_path, name) => /^g5-.*\.svg$/.test(name),
  ),
  starter: 0,
};

for (const name of ["file.svg", "globe.svg", "window.svg"]) {
  const path = join(clientRoot, name);
  if (await exists(path)) {
    await rm(path);
    counts.starter += 1;
  }
}

const wranglerConfig = JSON.parse(await readFile(wranglerConfigPath, "utf8"));
wranglerConfig.assets = {
  ...wranglerConfig.assets,
  binding: "ASSETS",
  run_worker_first: [
    "/assets/*",
    "/illustrations/*",
    "/heritage/*",
    "/og-cover.jpg",
  ],
};
await writeFile(wranglerConfigPath, `${JSON.stringify(wranglerConfig)}\n`);

process.stdout.write(
  `Deployment assets pruned: ${counts.heritage} legacy heritage files, ` +
  `${counts.mnemonicSvg} unused mnemonic SVGs, ` +
  `${counts.starter} starter icons; enabled cache-header routing.\n`,
);
