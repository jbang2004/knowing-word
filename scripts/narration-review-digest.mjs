import { createHash } from "node:crypto";

export function narrationRecordDigest(record) {
  const editorialPayload = {
    recordId: record.recordId,
    glyph: record.glyph,
    lessonId: record.lessonId,
    word: record.word,
    pinyin: record.pinyin ?? null,
    script: record.script,
    ttsText: record.ttsText ?? null,
    courseConnection: record.courseConnection,
    shapeAnchors: record.shapeAnchors,
    claims: record.claims,
    risks: record.risks,
  };
  return createHash("sha256").update(JSON.stringify(editorialPayload)).digest("hex");
}
