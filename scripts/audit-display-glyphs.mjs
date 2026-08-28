import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { characters, components, lessons } from "../app/data/catalog.ts";
import { lessonDocuments } from "../app/data/lesson-documents.ts";
import { inspectDisplayGlyphs } from "./lib/teaching-glyphs.mjs";

const projectRoot = resolve(import.meta.dirname, "..");
const fontPath = resolve(projectRoot, "public/fonts/lxgw-wenkai-subset.woff2");
const { contexts, invalid } = inspectDisplayGlyphs(
  { characters, components, lessons, lessonDocuments },
  "runtime",
);
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
