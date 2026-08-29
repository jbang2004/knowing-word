import { createHash } from "node:crypto";
import {
  mkdir,
  readFile,
  readdir,
  unlink,
  writeFile,
} from "node:fs/promises";
import { resolve } from "node:path";
import { characters } from "../app/data/catalog.ts";

const root = resolve(import.meta.dirname, "..");
const sourceRoot = resolve(root, "node_modules/hanzi-writer-data");
const outputRoot = resolve(root, "public/hanzi-data");
const miniPackageRoot = resolve(root, "node_modules/hanzi-writer-wechatmini");
const miniVendorRoot = resolve(root, "wechat-miniprogram/miniprogram/vendor");

function dataFileName(character) {
  const codePoints = Array.from(character, (value) => value.codePointAt(0).toString(16));
  return `u${codePoints.join("-")}.json`;
}

async function copyNormalizedText(source, target) {
  const text = await readFile(source, "utf8");
  await writeFile(
    target,
    `${text.replace(/\r\n?/gu, "\n").replace(/[ \t]+$/gmu, "").trimEnd()}\n`,
    "utf8",
  );
}

const writingCharacters = [...new Set(
  characters
    .filter((character) => character.exercises.some((exercise) => exercise.kind === "write"))
    .map((character) => character.hanzi),
)].sort((left, right) => left.localeCompare(right, "zh-Hans-CN"));

await mkdir(outputRoot, { recursive: true });
await mkdir(miniVendorRoot, { recursive: true });

const expectedFiles = new Set([
  "ARPHICPL.txt",
  "manifest.json",
  ...writingCharacters.map(dataFileName),
]);
const existingFiles = await readdir(outputRoot).catch(() => []);
await Promise.all(existingFiles
  .filter((file) => /^u[0-9a-f-]+\.json$/u.test(file) && !expectedFiles.has(file))
  .map((file) => unlink(resolve(outputRoot, file))));

const entries = [];
for (const character of writingCharacters) {
  const source = resolve(sourceRoot, `${character}.json`);
  const bytes = await readFile(source);
  const data = JSON.parse(bytes.toString("utf8"));
  if (!Array.isArray(data.strokes) || !Array.isArray(data.medians) ||
      data.strokes.length === 0 || data.strokes.length !== data.medians.length) {
    throw new Error(`Invalid Hanzi Writer data for ${character}`);
  }
  const file = dataFileName(character);
  await writeFile(resolve(outputRoot, file), bytes);
  entries.push({
    character,
    file,
    strokes: data.strokes.length,
    sha256: createHash("sha256").update(bytes).digest("hex").slice(0, 16),
  });
}

await copyNormalizedText(
  resolve(sourceRoot, "ARPHICPL.TXT"),
  resolve(outputRoot, "ARPHICPL.txt"),
);
await Promise.all([
  copyNormalizedText(
    resolve(miniPackageRoot, "dist/index.cjs.js"),
    resolve(miniVendorRoot, "hanzi-writer.js"),
  ),
  copyNormalizedText(
    resolve(miniPackageRoot, "LICENSE"),
    resolve(miniVendorRoot, "hanzi-writer.LICENSE.txt"),
  ),
  copyNormalizedText(
    resolve(miniPackageRoot, "COPYING.md"),
    resolve(miniVendorRoot, "hanzi-writer.COPYING.md"),
  ),
]);
await writeFile(
  resolve(outputRoot, "manifest.json"),
  `${JSON.stringify({
    schemaVersion: 1,
    source: "hanzi-writer-data@2.0.1",
    characters: entries,
  })}\n`,
  "utf8",
);

process.stdout.write(`Generated Hanzi Writer data for ${entries.length} writing characters.\n`);
