import { mkdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { characters, lessons } from "../app/data/catalog.ts";
import { releasedNarrationTranscripts } from "../app/data/released-narration-transcripts.generated.ts";

const projectRoot = resolve(import.meta.dirname, "..");
const outputPath = join(projectRoot, "artifacts/narration-v3/authoring-context.json");
const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));

const records = characters.map((record) => {
  const lesson = lessonById.get(record.lessonId);
  return {
    recordId: record.id,
    glyph: record.hanzi,
    lessonId: record.lessonId,
    lessonTitle: record.lessonTitle,
    lessonPosition: record.lessonPosition,
    word: record.word,
    pinyin: record.pinyin,
    curriculumRole: record.curriculumRole || "extension",
    official: record.official !== false,
    polyphonic: Boolean(record.polyphonic),
    structure: record.decomposition,
    parts: record.parts.map((part) => ({ glyph: part.char, radical: part.radical })),
    currentMeaning: record.originalMeaning,
    currentDescription: record.description,
    shortCourseExcerpt: record.originalText,
    lessonContext: lesson?.context || "",
    lessonMode: lesson?.mode || "",
    learningPath: lesson?.learningPath || [],
    currentNarration: releasedNarrationTranscripts[record.id]?.transcript || "",
  };
});

const glyphs = new Map();
for (const record of records) {
  const current = glyphs.get(record.glyph) || {
    glyph: record.glyph,
    structures: [],
    parts: [],
    meanings: [],
    recordIds: [],
  };
  current.structures.push(record.structure);
  current.parts.push(record.parts);
  current.meanings.push(record.currentMeaning);
  current.recordIds.push(record.recordId);
  glyphs.set(record.glyph, current);
}

const payload = {
  version: "narration-v3-authoring-context",
  generatedAt: new Date().toISOString(),
  counts: { records: records.length, glyphs: glyphs.size },
  records,
  glyphs: [...glyphs.values()],
};

await mkdir(join(projectRoot, "artifacts/narration-v3"), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
process.stdout.write(`Wrote ${records.length} record contexts and ${glyphs.size} glyph contexts.\n`);
