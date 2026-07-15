import { dayKey, getDb, jsonWithIdentity, resolveIdentity } from "../../lib/server-store";

export const dynamic = "force-dynamic";

type EventPayload = {
  action?: "answer" | "skip" | "read";
  track?: string;
  lessonId?: string;
  characterId?: string;
  questionId?: string;
  correct?: boolean;
  selected?: string[];
};

export async function POST(request: Request) {
  const identity = resolveIdentity(request);
  try {
    const payload = (await request.json()) as EventPayload;
    if (!payload.action || !["answer", "skip", "read"].includes(payload.action)) {
      return jsonWithIdentity(identity, { error: "无效的学习事件" }, { status: 400 });
    }
    const now = new Date().toISOString();
    const date = dayKey(new Date(now));
    const answerDelta = payload.action === "answer" ? 1 : 0;
    const correctDelta = payload.action === "answer" && payload.correct ? 1 : 0;
    const skipDelta = payload.action === "skip" ? 1 : 0;
    const readDelta = payload.action === "read" ? 1 : 0;
    const eventId = crypto.randomUUID();
    const db = getDb();
    await db.batch([
      db.prepare(
        `INSERT INTO learning_events
         (id, user_id, action, track, lesson_id, character_id, question_id, correct, selection_json, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`,
      ).bind(
        eventId,
        identity.userId,
        payload.action,
        payload.track || null,
        payload.lessonId || null,
        payload.characterId || null,
        payload.questionId || null,
        payload.action === "answer" ? (payload.correct ? 1 : 0) : null,
        JSON.stringify(payload.selected || []),
        now,
      ),
      db.prepare(
        `INSERT INTO daily_activity
         (user_id, activity_date, attempts, correct, skips, read_sessions, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
         ON CONFLICT(user_id, activity_date) DO UPDATE SET
           attempts = attempts + excluded.attempts,
           correct = correct + excluded.correct,
           skips = skips + excluded.skips,
           read_sessions = read_sessions + excluded.read_sessions,
           updated_at = excluded.updated_at`,
      ).bind(identity.userId, date, answerDelta, correctDelta, skipDelta, readDelta, now),
    ]);
    return jsonWithIdentity(identity, { ok: true, id: eventId });
  } catch (error) {
    return jsonWithIdentity(
      identity,
      { error: error instanceof Error ? error.message : "无法保存学习事件" },
      { status: 503 },
    );
  }
}
