import { getDb, getMedia, jsonError, jsonWithIdentity, resolveIdentity } from "../../lib/server-store.ts";
import { normalizeProfile } from "../../lib/profile-model.ts";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const identity = resolveIdentity(request);
  try {
    const row = await getDb()
      .prepare("SELECT payload_json, updated_at FROM study_profiles WHERE user_id = ?1")
      .bind(identity.userId)
      .first<{ payload_json: string; updated_at: string }>();
    return jsonWithIdentity(identity, {
      identity: {
        displayName: identity.displayName,
        email: identity.email,
        mode: identity.mode,
      },
      profile: row ? normalizeProfile(JSON.parse(row.payload_json)) : null,
      updatedAt: row?.updated_at || null,
    });
  } catch (error) {
    return jsonError(identity, request, "暂时无法读取学习档案", error);
  }
}

export async function PUT(request: Request) {
  const identity = resolveIdentity(request);
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonWithIdentity(identity, { error: "学习档案不是有效的 JSON" }, { status: 400 });
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return jsonWithIdentity(identity, { error: "学习档案格式无效" }, { status: 400 });
  }
  try {
    const serialized = JSON.stringify(normalizeProfile(payload));
    if (serialized.length > 400_000) {
      return jsonWithIdentity(identity, { error: "学习档案过大" }, { status: 413 });
    }
    const now = new Date().toISOString();
    await getDb()
      .prepare(
        `INSERT INTO study_profiles (user_id, payload_json, updated_at)
         VALUES (?1, ?2, ?3)
         ON CONFLICT(user_id) DO UPDATE SET payload_json = excluded.payload_json, updated_at = excluded.updated_at`,
      )
      .bind(identity.userId, serialized, now)
      .run();
    return jsonWithIdentity(identity, { ok: true, updatedAt: now });
  } catch (error) {
    return jsonError(identity, request, "暂时无法保存学习档案", error);
  }
}

export async function DELETE(request: Request) {
  const identity = resolveIdentity(request);
  try {
    const db = getDb();
    const recordingRows = await db
      .prepare("SELECT object_key FROM recordings WHERE user_id = ?1")
      .bind(identity.userId)
      .all<{ object_key: string }>();
    const objectKeys = recordingRows.results.map((row) => row.object_key);
    if (objectKeys.length) await getMedia().delete(objectKeys);
    await db.batch([
      db.prepare("DELETE FROM study_profiles WHERE user_id = ?1").bind(identity.userId),
      db.prepare("DELETE FROM learning_events WHERE user_id = ?1").bind(identity.userId),
      db.prepare("DELETE FROM recordings WHERE user_id = ?1").bind(identity.userId),
    ]);
    return jsonWithIdentity(identity, { ok: true });
  } catch (error) {
    return jsonError(identity, request, "暂时无法清除学习档案", error);
  }
}
