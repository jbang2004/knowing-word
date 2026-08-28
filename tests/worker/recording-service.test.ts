import { env } from "cloudflare:workers";
import { beforeEach, describe, expect, it } from "vitest";
import {
  MAX_RECORDING_BYTES,
  MAX_RECORDINGS_PER_LESSON,
  saveRecording,
} from "../../app/server/services/recording-service.ts";

async function prepareSchema() {
  await env.DB.prepare("DROP TABLE IF EXISTS recordings").run();
  await env.DB.prepare(`CREATE TABLE recordings (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    object_key TEXT NOT NULL,
    content_type TEXT NOT NULL,
    byte_size INTEGER NOT NULL,
    created_at TEXT NOT NULL
  )`).run();
  await env.DB.prepare(
    "CREATE INDEX recordings_user_lesson_idx ON recordings (user_id, lesson_id, created_at)",
  ).run();
}

function audioBody(bytes: number[]) {
  return new Blob([new Uint8Array(bytes)]).stream();
}

describe("recording storage in the Workers runtime", () => {
  beforeEach(prepareSchema);

  it("streams bytes into R2 and records owned metadata in D1", async () => {
    const result = await saveRecording({
      db: env.DB,
      media: env.MEDIA,
      userId: "wechat:test-user",
      lessonId: "g5v1-l01",
      contentType: "audio/webm",
      body: audioBody([1, 2, 3, 4]),
      declaredLength: 4,
    });
    expect(result.status).toBe("saved");
    if (result.status !== "saved") return;
    const row = await env.DB.prepare("SELECT object_key, byte_size FROM recordings WHERE id = ?1")
      .bind(result.recording.id)
      .first<{ object_key: string; byte_size: number }>();
    expect(row?.byte_size).toBe(4);
    expect((await env.MEDIA.get(row!.object_key))?.size).toBe(4);
  });

  it("stops a stream that exceeds its declared bounded length", async () => {
    const result = await saveRecording({
      db: env.DB,
      media: env.MEDIA,
      userId: "wechat:test-user",
      lessonId: "g5v1-l01",
      contentType: "audio/webm",
      body: new Blob([new Uint8Array(MAX_RECORDING_BYTES + 1)]).stream(),
      declaredLength: MAX_RECORDING_BYTES,
    });
    expect(result.status).toBe("too-large");
    const count = await env.DB.prepare("SELECT COUNT(*) AS count FROM recordings").first<{ count: number }>();
    expect(count?.count).toBe(0);
  });

  it("keeps only the newest recordings for each lesson", async () => {
    const keys: string[] = [];
    for (let index = 0; index < MAX_RECORDINGS_PER_LESSON + 1; index += 1) {
      const result = await saveRecording({
        db: env.DB,
        media: env.MEDIA,
        userId: "wechat:test-user",
        lessonId: "g5v1-l01",
        contentType: "audio/webm",
        body: audioBody([index + 1]),
        declaredLength: 1,
        now: () => new Date(Date.UTC(2026, 7, 28, 0, 0, index)).toISOString(),
      });
      expect(result.status).toBe("saved");
      const newest = await env.DB.prepare("SELECT object_key FROM recordings ORDER BY created_at DESC LIMIT 1")
        .first<{ object_key: string }>();
      keys.push(newest!.object_key);
    }
    const rows = await env.DB.prepare("SELECT id FROM recordings").all();
    expect(rows.results).toHaveLength(MAX_RECORDINGS_PER_LESSON);
    expect(await env.MEDIA.get(keys[0])).toBeNull();
  });
});
