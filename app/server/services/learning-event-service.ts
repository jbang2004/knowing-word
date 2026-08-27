import type { LearningEvent } from "../../domain/learning-event.ts";

export async function saveLearningEvent(
  db: D1Database,
  userId: string,
  payload: LearningEvent,
  createdAt: string = new Date().toISOString(),
) {
  await db.prepare(
      `INSERT OR IGNORE INTO learning_events
       (id, user_id, action, track, lesson_id, character_id, question_id, correct, selection_json, dimension, cue_level, answer_mode, latency_ms, error_tags_json, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)`,
    ).bind(
      payload.eventId,
      userId,
      payload.action,
      payload.track || null,
      payload.lessonId || null,
      payload.characterId || null,
      payload.questionId || null,
      payload.action === "answer"
        ? (payload.correct ? 1 : 0)
        : payload.action === "read" && payload.readingAccuracy
          ? (payload.readingAccuracy === "accurate" ? 1 : 0)
          : null,
      JSON.stringify(payload.selected || []),
      payload.dimension || null,
      payload.cueLevel ?? null,
      payload.answerMode || (payload.action === "read" ? "speech" : null),
      payload.latencyMs ?? null,
      JSON.stringify(payload.errorTags || []),
      createdAt,
    )
    .run();
  return { id: payload.eventId };
}
