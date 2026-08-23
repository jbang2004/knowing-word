import { isGrade5LessonId } from "../../data/lesson-content.ts";
import { getDb, getMedia, jsonError, jsonWithIdentity, resolveIdentity } from "../../lib/server-store.ts";

export const dynamic = "force-dynamic";

const MAX_RECORDING_BYTES = 12 * 1024 * 1024;
const recordingTypes = new Map([
  ["audio/webm", "webm"],
  ["audio/mp4", "m4a"],
  ["audio/ogg", "ogg"],
]);
const recordingIdPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/iu;

function baseContentType(value: string | null) {
  return (value || "").split(";", 1)[0].trim().toLowerCase();
}

export async function GET(request: Request) {
  const identity = resolveIdentity(request);
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const lessonId = url.searchParams.get("lessonId");
  if (id && !recordingIdPattern.test(id)) {
    return jsonWithIdentity(identity, { error: "录音编号无效" }, { status: 400 });
  }
  if (lessonId && !isGrade5LessonId(lessonId)) {
    return jsonWithIdentity(identity, { error: "课次编号无效" }, { status: 400 });
  }
  try {
    const db = getDb();
    if (!id) {
      const rows = await db
        .prepare(
          `SELECT id, lesson_id, content_type, byte_size, created_at
           FROM recordings WHERE user_id = ?1 AND (?2 IS NULL OR lesson_id = ?2)
           ORDER BY created_at DESC LIMIT 12`,
        )
        .bind(identity.userId, lessonId)
        .all<{ id: string; lesson_id: string; content_type: string; byte_size: number; created_at: string }>();
      return jsonWithIdentity(identity, {
        recordings: rows.results.map((row) => ({
          id: row.id,
          lessonId: row.lesson_id,
          contentType: row.content_type,
          byteSize: row.byte_size,
          createdAt: row.created_at,
          url: `/api/recordings?id=${encodeURIComponent(row.id)}`,
        })),
      });
    }
    const row = await db
      .prepare("SELECT object_key, content_type FROM recordings WHERE id = ?1 AND user_id = ?2")
      .bind(id, identity.userId)
      .first<{ object_key: string; content_type: string }>();
    if (!row) return jsonWithIdentity(identity, { error: "录音不存在" }, { status: 404 });
    const object = await getMedia().get(row.object_key);
    if (!object?.body) return jsonWithIdentity(identity, { error: "录音文件不存在" }, { status: 404 });
    const headers = new Headers();
    headers.set("content-type", row.content_type);
    headers.set("content-length", String(object.size));
    headers.set("cache-control", "private, no-store");
    headers.set("x-content-type-options", "nosniff");
    return new Response(object.body, { headers });
  } catch (error) {
    return jsonError(identity, request, "暂时无法读取录音", error);
  }
}

export async function POST(request: Request) {
  const identity = resolveIdentity(request);
  const lessonId = new URL(request.url).searchParams.get("lessonId");
  if (!lessonId || !isGrade5LessonId(lessonId)) {
    return jsonWithIdentity(identity, { error: "课次编号无效" }, { status: 400 });
  }
  const contentType = baseContentType(request.headers.get("content-type"));
  const extension = recordingTypes.get(contentType);
  if (!extension) return jsonWithIdentity(identity, { error: "录音格式不受支持" }, { status: 415 });
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_RECORDING_BYTES) {
    return jsonWithIdentity(identity, { error: "录音需要小于 12MB" }, { status: 413 });
  }
  const bytes = await request.arrayBuffer();
  if (!bytes.byteLength || bytes.byteLength > MAX_RECORDING_BYTES) {
    return jsonWithIdentity(identity, { error: "录音需要小于 12MB" }, { status: 413 });
  }
  let objectKey: string | null = null;
  try {
    const id = crypto.randomUUID();
    const identityHash = Array.from(
      new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(identity.userId))),
    ).slice(0, 12).map((item) => item.toString(16).padStart(2, "0")).join("");
    objectKey = `recordings/${identityHash}/${id}.${extension}`;
    const media = getMedia();
    await media.put(objectKey, bytes, {
      httpMetadata: { contentType },
      customMetadata: { lessonId, owner: identityHash },
    });
    const now = new Date().toISOString();
    await getDb()
      .prepare(
        `INSERT INTO recordings (id, user_id, lesson_id, object_key, content_type, byte_size, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
      )
      .bind(id, identity.userId, lessonId, objectKey, contentType, bytes.byteLength, now)
      .run();
    return jsonWithIdentity(identity, {
      recording: { id, lessonId, contentType, byteSize: bytes.byteLength, createdAt: now, url: `/api/recordings?id=${id}` },
    }, { status: 201 });
  } catch (error) {
    if (objectKey) {
      try {
        await getMedia().delete(objectKey);
      } catch (cleanupError) {
        console.error("recording cleanup failed", cleanupError);
      }
    }
    return jsonError(identity, request, "暂时无法保存录音", error);
  }
}
