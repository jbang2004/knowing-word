// Rebuilds public/fonts/lxgw-wenkai-subset.woff2.
//
// Character forms are part of what this course teaches: 220 of the lesson
// characters are 写字 targets that children copy stroke for stroke. Songti's
// thin horizontals and thick verticals are a printing convention, not a
// handwriting model, and the system 楷体 stacks (Kaiti SC / STKaiti) are absent
// on Android and most Windows installs, so the glyph column silently fell back
// to Songti for a large share of readers. This subsets LXGW WenKai (SIL OFL
// 1.1, whose additional permission explicitly covers WOFF2 subsetting for web
// delivery) down to the characters the catalog can actually render.
//
//   node scripts/build-kai-subset.mjs
//
// Requires `pyftsubset` on PATH (`pip install fonttools brotli`) and network
// access for the one-time upstream download, which is cached under .cache/.

import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";

const projectRoot = resolve(import.meta.dirname, "..");
const dataDir = join(projectRoot, "app/data");
const cacheDir = join(projectRoot, ".cache/fonts");
const fontsDir = join(projectRoot, "public/fonts");
const upstream = "https://github.com/lxgw/LxgwWenKai/releases/latest/download/LXGWWenKai-Regular.ttf";
const licenseUrl = "https://raw.githubusercontent.com/lxgw/LxgwWenKai/main/OFL.txt";
const sourceFont = join(cacheDir, "LXGWWenKai-Regular.ttf");

// Pinyin with tone marks, the punctuation the teaching copy uses, and the
// full-width spaces that appear inside 课文 quotations.
const EXTRA_CHARS = [
  ...Array.from({ length: 0x7f - 0x20 }, (_, i) => String.fromCharCode(0x20 + i)),
  ..."āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüńňǹ",
  ...'，。、；：？！「」『』《》（）〈〉【】—…·""'
  + "''　",
].join("");

function isTeachingGlyph(codePoint) {
  return (
    (codePoint >= 0x3400 && codePoint <= 0x9fff) ||
    (codePoint >= 0xf900 && codePoint <= 0xfaff)
  );
}

async function collectCharacters() {
  const entries = await readdir(dataDir, { withFileTypes: true, recursive: true });
  const glyphs = new Set();
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!/\.(ts|json)$/.test(entry.name)) continue;
    const source = await readFile(join(entry.parentPath ?? dataDir, entry.name), "utf8");
    for (const char of source) {
      if (isTeachingGlyph(char.codePointAt(0))) glyphs.add(char);
    }
  }
  return [...glyphs].sort().join("");
}

async function download(url, destination) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) throw new Error(`${url} responded ${response.status}`);
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
}

function run(command, args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "inherit", "inherit"] });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`${command} exited with ${code}`));
    });
  });
}

async function main() {
  await mkdir(cacheDir, { recursive: true });
  await mkdir(fontsDir, { recursive: true });

  let cached = false;
  try {
    cached = (await stat(sourceFont)).size > 1_000_000;
  } catch {
    cached = false;
  }
  if (!cached) {
    console.log(`downloading ${upstream}`);
    await download(upstream, sourceFont);
  }

  const characters = (await collectCharacters()) + EXTRA_CHARS;
  const charFile = join(cacheDir, "subset-chars.txt");
  await writeFile(charFile, characters);
  console.log(`subsetting ${new Set(characters).size} characters`);

  const output = join(fontsDir, "lxgw-wenkai-subset.woff2");
  await run("pyftsubset", [
    sourceFont,
    `--text-file=${charFile}`,
    `--output-file=${output}`,
    "--flavor=woff2",
    "--layout-features=",
    "--no-hinting",
    "--desubroutinize",
    "--drop-tables+=GSUB,GPOS,GDEF,DSIG,LTSH,VDMX,hdmx",
    "--name-IDs=",
    "--notdef-outline",
  ]);

  const license = join(fontsDir, "LXGWWenKai-OFL.txt");
  try {
    await stat(license);
  } catch {
    await download(licenseUrl, license);
  }

  const bytes = await readFile(output);
  console.log(
    `wrote public/fonts/lxgw-wenkai-subset.woff2 — ${(bytes.length / 1024).toFixed(0)} KB, sha256 ${createHash("sha256").update(bytes).digest("hex").slice(0, 16)}`,
  );
}

await main();
