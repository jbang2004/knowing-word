import type { LearningEvent } from "../../domain/learning-event.ts";

export const MAX_LEARNING_EVENTS_PER_DAY = 5_000;

export async function saveLearningEvent(
  db: D1Database,
  userId: string,
  payload: LearningEvent,
  createdAt: string = new Date().toISOString(),
) {
  const dayStart = `${createdAt.slice(0, 10)}T00:00:00.000Z`;
  const dayEnd = new Date(Date.parse(dayStart) + 24 * 60 * 60 * 1_000).toISOString();
  const usage = await db.prepare(
    `SELECT COUNT(*) AS count FROM learning_events
     WHERE user_id = ?1 AND created_at >= ?2 AND created_at < ?3`,
  ).bind(userId, dayStart, dayEnd).first<{ count: number }>();
  if (Number(usage?.count ?? 0) >= MAX_LEARNING_EVENTS_PER_DAY) {
    return { status: "quota" as const, id: payload.eventId };
  }
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
        : null,
      JSON.stringify(payload.action === "read" && payload.readingReflection
        ? [payload.readingReflection]
        : payload.selected || []),
      payload.dimension || null,
      payload.cueLevel ?? null,
      payload.answerMode || (payload.action === "read" ? "speech" : null),
      payload.latencyMs ?? null,
      JSON.stringify(payload.errorTags || []),
      createdAt,
    )
    .run();
  return { status: "saved" as const, id: payload.eventId };
}
