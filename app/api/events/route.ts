import { parseLearningEvent } from "../../domain/learning-event.ts";
import { getDb, jsonError, jsonWithIdentity, resolveIdentity } from "../../lib/server-store.ts";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const identity = resolveIdentity(request);
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return jsonWithIdentity(identity, { error: "学习事件不是有效的 JSON" }, { status: 400 });
  }
  const payload = parseLearningEvent(input);
  if (!payload) {
    return jsonWithIdentity(identity, { error: "无效的学习事件" }, { status: 400 });
  }
  try {
    const now = new Date().toISOString();
    const db = getDb();
    await db.prepare(
        `INSERT OR IGNORE INTO learning_events
         (id, user_id, action, track, lesson_id, character_id, question_id, correct, selection_json, dimension, cue_level, answer_mode, latency_ms, error_tags_json, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)`,
      ).bind(
        payload.eventId,
        identity.userId,
        payload.action,
        payload.track || null,
        payload.lessonId || null,
        payload.characterId || null,
        payload.questionId || null,
        payload.action === "answer"
          ? (payload.correct === null ? null : payload.correct ? 1 : 0)
          : payload.action === "read" && payload.readingAccuracy
            ? (payload.readingAccuracy === "accurate" ? 1 : 0)
            : null,
        JSON.stringify(payload.selected || []),
        payload.dimension || null,
        payload.cueLevel ?? null,
        payload.answerMode || (payload.action === "read" ? "speech" : null),
        payload.latencyMs ?? null,
        JSON.stringify(payload.errorTags || []),
        now,
      )
      .run();
    return jsonWithIdentity(identity, { ok: true, id: payload.eventId });
  } catch (error) {
    return jsonError(identity, request, "暂时无法保存学习事件", error);
  }
}
