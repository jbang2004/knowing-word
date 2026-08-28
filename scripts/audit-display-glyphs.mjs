import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { characters, components, lessons } from "../app/data/catalog.ts";
import { lessonDocuments } from "../app/data/lesson-documents.ts";

const projectRoot = resolve(import.meta.dirname, "..");
const fontPath = resolve(projectRoot, "public/fonts/lxgw-wenkai-subset.woff2");
const contexts = new Map();
const invalid = [];

function isTeachingGlyph(codePoint) {
  return (
    (codePoint >= 0x2e80 && codePoint <= 0x33ff)
    || (codePoint >= 0x3400 && codePoint <= 0x9fff)
    || (codePoint >= 0xf900 && codePoint <= 0xfaff)
    || (codePoint >= 0x20000 && codePoint <= 0x2ebef)
  );
}

function inspectString(value, path) {
  if (value.includes("\uFFFD")) invalid.push(`${path} contains U+FFFD`);
  for (let index = 0; index < value.length; index += 1) {
    const unit = value.charCodeAt(index);
    if (unit >= 0xd800 && unit <= 0xdbff) {
      const low = value.charCodeAt(index + 1);
      if (!(low >= 0xdc00 && low <= 0xdfff)) invalid.push(`${path} contains an unpaired high surrogate`);
      else index += 1;
    } else if (unit >= 0xdc00 && unit <= 0xdfff) {
      invalid.push(`${path} contains an unpaired low surrogate`);
    }
  }
  for (const glyph of value) {
    if (!isTeachingGlyph(glyph.codePointAt(0))) continue;
    const found = contexts.get(glyph) ?? [];
    if (found.length < 4) found.push(path);
    contexts.set(glyph, found);
  }
}

function inspect(value, path) {
  if (typeof value === "string") {
    inspectString(value, path);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => inspect(item, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, item] of Object.entries(value)) inspect(item, `${path}.${key}`);
}

inspect({ characters, components, lessons, lessonDocuments }, "runtime");
if (invalid.length) throw new Error(`Invalid display Unicode:\n${invalid.join("\n")}`);

const glyphs = [...contexts.keys()].sort().join("");
const python = [
  "import json, sys",
  "from fontTools.ttLib import TTFont",
  "font = TTFont(sys.argv[1], lazy=True)",
  "cmap = font.getBestCmap()",
  "text = sys.stdin.read()",
  "print(json.dumps([c for c in text if ord(c) not in cmap], ensure_ascii=False))",
].join("\n");

let missing;
try {
  missing = JSON.parse(execFileSync("python3", ["-c", python, fontPath], {
    input: glyphs,
    encoding: "utf8",
  }));
} catch (error) {
  throw new Error(`Unable to inspect the bundled teaching font: ${error instanceof Error ? error.message : error}`);
}

if (missing.length) {
  const details = missing.map((glyph) => {
    const codePoint = glyph.codePointAt(0).toString(16).toUpperCase();
    return `${glyph} (U+${codePoint}) at ${(contexts.get(glyph) ?? []).join(", ")}`;
  });
  throw new Error(`Bundled teaching font is missing ${missing.length} runtime glyph(s):\n${details.join("\n")}`);
}

const exercises = characters.flatMap((character) => character.exercises ?? []);
const options = exercises.flatMap((exercise) => exercise.options ?? []);
const parts = characters.flatMap((character) => character.parts ?? []);
process.stdout.write(
  `Display glyph audit passed: ${characters.length} records, ${exercises.length} exercises, `
  + `${options.length} options, ${parts.length} component uses, ${contexts.size} bundled glyphs.\n`,
);
