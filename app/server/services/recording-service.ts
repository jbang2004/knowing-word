export const MAX_RECORDING_BYTES = 12 * 1024 * 1024;
export const MAX_RECORDING_STORAGE_BYTES = 120 * 1024 * 1024;
export const MAX_RECORDINGS_PER_LESSON = 3;

class RecordingPayloadTooLargeError extends Error {}

const recordingTypes = new Map([
  ["audio/webm", "webm"],
  ["audio/mp4", "m4a"],
  ["audio/ogg", "ogg"],
  // These formats are emitted by WeChat's RecorderManager and are accepted now
  // so the media boundary is ready before a second client is introduced.
  ["audio/mpeg", "mp3"],
  ["audio/mp3", "mp3"],
  ["audio/aac", "aac"],
  ["audio/wav", "wav"],
  ["audio/x-wav", "wav"],
]);

export function baseContentType(value: string | null) {
  return (value || "").split(";", 1)[0].trim().toLowerCase();
}

export function recordingExtension(contentType: string) {
  return recordingTypes.get(baseContentType(contentType));
}

export async function listRecordings(db: D1Database, userId: string, lessonId: string | null) {
  const rows = await db
    .prepare(
      `SELECT id, lesson_id, content_type, byte_size, created_at
       FROM recordings WHERE user_id = ?1 AND (?2 IS NULL OR lesson_id = ?2)
       ORDER BY created_at DESC LIMIT 12`,
    )
    .bind(userId, lessonId)
    .all<{ id: string; lesson_id: string; content_type: string; byte_size: number; created_at: string }>();
  return rows.results.map((row) => ({
    id: row.id,
    lessonId: row.lesson_id,
    contentType: row.content_type,
    byteSize: row.byte_size,
    createdAt: row.created_at,
    url: `/api/recordings?id=${encodeURIComponent(row.id)}`,
  }));
}

export async function readRecording(
  db: D1Database,
  media: R2Bucket,
  userId: string,
  id: string,
) {
  const row = await db
    .prepare("SELECT object_key, content_type FROM recordings WHERE id = ?1 AND user_id = ?2")
    .bind(id, userId)
    .first<{ object_key: string; content_type: string }>();
  if (!row) return null;
  const object = await media.get(row.object_key);
  if (!object?.body) return null;
  return { object, contentType: row.content_type };
}

export async function saveRecording({
  db,
  media,
  userId,
  lessonId,
  contentType,
  body,
  declaredLength,
  now = () => new Date().toISOString(),
  createId = () => crypto.randomUUID(),
}: {
  db: D1Database;
  media: R2Bucket;
  userId: string;
  lessonId: string;
  contentType: string;
  body: ReadableStream<Uint8Array>;
  declaredLength?: number;
  now?: () => string;
  createId?: () => string;
}) {
  const extension = recordingExtension(contentType);
  if (!extension) return { status: "unsupported" as const };
  if (declaredLength === undefined) return { status: "length-required" as const };
  if (!Number.isFinite(declaredLength) || declaredLength <= 0 || declaredLength > MAX_RECORDING_BYTES) {
    return { status: "too-large" as const };
  }

  const usage = await db
    .prepare("SELECT COALESCE(SUM(byte_size), 0) AS byte_size FROM recordings WHERE user_id = ?1")
    .bind(userId)
    .first<{ byte_size: number }>();
  const storedBytes = Number(usage?.byte_size ?? 0);
  if (declaredLength && storedBytes + declaredLength > MAX_RECORDING_STORAGE_BYTES) {
    return { status: "quota" as const };
  }

  const id = createId();
  const identityHash = Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(userId))),
  ).slice(0, 12).map((item) => item.toString(16).padStart(2, "0")).join("");
  const objectKey = `recordings/${identityHash}/${id}.${extension}`;
  let byteSize = 0;
  const boundedBody = body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      byteSize += chunk.byteLength;
      if (byteSize > MAX_RECORDING_BYTES) {
        controller.error(new RecordingPayloadTooLargeError("recording exceeds maximum size"));
        return;
      }
      controller.enqueue(chunk);
    },
  }));
  try {
    const fixed = typeof FixedLengthStream === "undefined" ? null : new FixedLengthStream(declaredLength);
    const uploadBody = fixed?.readable ?? boundedBody;
    const pipeTask = fixed ? boundedBody.pipeTo(fixed.writable) : Promise.resolve();
    await Promise.all([media.put(objectKey, uploadBody, {
      httpMetadata: { contentType },
      customMetadata: { lessonId, owner: identityHash },
    }), pipeTask]);
    if (!byteSize) {
      await media.delete(objectKey);
      return { status: "too-large" as const };
    }
    if (storedBytes + byteSize > MAX_RECORDING_STORAGE_BYTES) {
      await media.delete(objectKey);
      return { status: "quota" as const };
    }
    const createdAt = now();
    await db.prepare(
        `INSERT INTO recordings (id, user_id, lesson_id, object_key, content_type, byte_size, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
      )
      .bind(id, userId, lessonId, objectKey, contentType, byteSize, createdAt)
      .run();
    await pruneLessonRecordings(db, media, userId, lessonId);
    return {
      status: "saved" as const,
      recording: {
        id,
        lessonId,
        contentType,
        byteSize,
        createdAt,
        url: `/api/recordings?id=${id}`,
      },
    };
  } catch (error) {
    try {
      await media.delete(objectKey);
    } catch (cleanupError) {
      console.error(JSON.stringify({
        level: "error",
        message: "recording cleanup failed",
        objectKey,
        error: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
      }));
    }
    if (error instanceof RecordingPayloadTooLargeError) return { status: "too-large" as const };
    if (byteSize !== declaredLength) return { status: "invalid-length" as const };
    throw error;
  }
}

async function pruneLessonRecordings(
  db: D1Database,
  media: R2Bucket,
  userId: string,
  lessonId: string,
) {
  const stale = await db
    .prepare(
      `SELECT id, object_key FROM recordings
       WHERE user_id = ?1 AND lesson_id = ?2
       ORDER BY created_at DESC LIMIT -1 OFFSET ?3`,
    )
    .bind(userId, lessonId, MAX_RECORDINGS_PER_LESSON)
    .all<{ id: string; object_key: string }>();
  if (!stale.results.length) return;
  await db.batch(stale.results.map((item) => (
    db.prepare("DELETE FROM recordings WHERE id = ?1 AND user_id = ?2").bind(item.id, userId)
  )));
  await media.delete(stale.results.map((item) => item.object_key));
}
