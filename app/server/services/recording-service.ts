export const MAX_RECORDING_BYTES = 12 * 1024 * 1024;

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
  bytes,
  now = () => new Date().toISOString(),
  createId = () => crypto.randomUUID(),
}: {
  db: D1Database;
  media: R2Bucket;
  userId: string;
  lessonId: string;
  contentType: string;
  bytes: ArrayBuffer;
  now?: () => string;
  createId?: () => string;
}) {
  const extension = recordingExtension(contentType);
  if (!extension) return { status: "unsupported" as const };
  if (!bytes.byteLength || bytes.byteLength > MAX_RECORDING_BYTES) {
    return { status: "too-large" as const };
  }

  const id = createId();
  const identityHash = Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(userId))),
  ).slice(0, 12).map((item) => item.toString(16).padStart(2, "0")).join("");
  const objectKey = `recordings/${identityHash}/${id}.${extension}`;
  try {
    await media.put(objectKey, bytes, {
      httpMetadata: { contentType },
      customMetadata: { lessonId, owner: identityHash },
    });
    const createdAt = now();
    await db.prepare(
        `INSERT INTO recordings (id, user_id, lesson_id, object_key, content_type, byte_size, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
      )
      .bind(id, userId, lessonId, objectKey, contentType, bytes.byteLength, createdAt)
      .run();
    return {
      status: "saved" as const,
      recording: {
        id,
        lessonId,
        contentType,
        byteSize: bytes.byteLength,
        createdAt,
        url: `/api/recordings?id=${id}`,
      },
    };
  } catch (error) {
    try {
      await media.delete(objectKey);
    } catch (cleanupError) {
      console.error("recording cleanup failed", cleanupError);
    }
    throw error;
  }
}
