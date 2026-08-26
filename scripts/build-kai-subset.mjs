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
import { execFile, spawn } from "node:child_process";

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
    (codePoint >= 0xf900 && codePoint <= 0xfaff) ||
    // Plane 2. Ten teaching components in the course live in extension B and
    // above (𠃜 𡗗 𡱒 𢀖 𢦏 𣎆 𥫗 𦐇 𧴪 …); without this they subset out and
    // every component card, 红蓝 option and etymology line renders them blank.
    (codePoint >= 0x20000 && codePoint <= 0x2ebef)
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

/** Characters we asked for that the source font cannot actually draw. */
async function uncoveredCharacters(characters) {
  const probe = join(cacheDir, "coverage.txt");
  await writeFile(probe, characters);
  const script = [
    "import sys",
    "from fontTools.ttLib import TTFont",
    "cmap = TTFont(sys.argv[1], fontNumber=0, lazy=True).getBestCmap()",
    "text = open(sys.argv[2], encoding='utf8').read()",
    "print(''.join(sorted({c for c in text if ord(c) not in cmap})))",
  ].join("\n");
  const found = await new Promise((resolvePromise) => {
    execFile("python3", ["-c", script, sourceFont, probe], (error, stdout) => {
      // fontTools is only needed for this report; pyftsubset already ran.
      resolvePromise(error ? "" : stdout.trim());
    });
  });
  return [...found];
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

  // A character the upstream face does not carry subsets out silently and then
  // renders as nothing at all — an empty component title, an empty pair of
  // quotation marks mid-sentence. Name them here rather than in the UI.
  const missing = await uncoveredCharacters(characters);
  if (missing.length) {
    console.warn(
      `warning: ${missing.length} teaching character(s) have no glyph in LXGW WenKai and will render blank: ` +
        missing.map((char) => `${char} (U+${char.codePointAt(0).toString(16).toUpperCase()})`).join(", "),
    );
  }

  const bytes = await readFile(output);
  console.log(
    `wrote public/fonts/lxgw-wenkai-subset.woff2 — ${(bytes.length / 1024).toFixed(0)} KB, sha256 ${createHash("sha256").update(bytes).digest("hex").slice(0, 16)}`,
  );
}

await main();
