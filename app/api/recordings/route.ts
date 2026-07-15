import { getDb, getMedia, jsonWithIdentity, resolveIdentity } from "../../lib/server-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const identity = resolveIdentity(request);
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const lessonId = url.searchParams.get("lessonId");
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
    if (!object) return jsonWithIdentity(identity, { error: "录音文件不存在" }, { status: 404 });
    const headers = new Headers();
    headers.set("content-type", row.content_type);
    headers.set("cache-control", "private, max-age=300");
    return new Response(object.body, { headers });
  } catch (error) {
    return jsonWithIdentity(
      identity,
      { error: error instanceof Error ? error.message : "无法读取录音" },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const identity = resolveIdentity(request);
  const lessonId = new URL(request.url).searchParams.get("lessonId") || "unknown";
  const contentType = request.headers.get("content-type") || "audio/webm";
  if (!contentType.toLowerCase().startsWith("audio/")) {
    return jsonWithIdentity(identity, { error: "只接受音频录音" }, { status: 415 });
  }
  const bytes = await request.arrayBuffer();
  if (!bytes.byteLength || bytes.byteLength > 12 * 1024 * 1024) {
    return jsonWithIdentity(identity, { error: "录音需要小于 12MB" }, { status: 413 });
  }
  try {
    const id = crypto.randomUUID();
    const identityHash = Array.from(
      new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(identity.userId))),
    ).slice(0, 12).map((item) => item.toString(16).padStart(2, "0")).join("");
    const objectKey = `recordings/${identityHash}/${id}.webm`;
    await getMedia().put(objectKey, bytes, { httpMetadata: { contentType } });
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
    return jsonWithIdentity(
      identity,
      { error: error instanceof Error ? error.message : "无法保存录音" },
      { status: 503 },
    );
  }
}
