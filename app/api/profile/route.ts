import { getDb, getMedia, jsonError, jsonWithIdentity, resolveIdentity } from "../../lib/server-store.ts";
import {
  emptyProfile,
  mergeStudyProfiles,
  normalizeProfile,
  type AnswerStat,
  type StudyProfile,
} from "../../lib/profile-model.ts";

export const dynamic = "force-dynamic";

/** D1 rejects a single row at 2,000,000 bytes; keep operational headroom. */
export const MAX_PROFILE_ROW_BYTES = 1_800_000;
/** A request may carry the reconstructed profile, including all answer shards. */
export const MAX_PROFILE_REQUEST_BYTES = 8_000_000;
/** @deprecated Use the explicit row/request constants. */
export const MAX_PROFILE_BYTES = MAX_PROFILE_ROW_BYTES;
export const PROFILE_ANSWER_BUCKETS = 8;
const MAX_PROFILE_WRITE_RETRIES = 8;
const encoder = new TextEncoder();

type BaseRow = { payload_json: string; updated_at: string; revision: number };
type ShardRow = { bucket: number; answers_json: string; updated_at: string; revision: number };

function encodedBytes(value: string) {
  return encoder.encode(value).byteLength;
}

/** Stable FNV-1a hash: changing this would move persisted questions between rows. */
export function answerBucket(questionId: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < questionId.length; index += 1) {
    hash ^= questionId.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0) % PROFILE_ANSWER_BUCKETS;
}

export function partitionProfileForStorage(profileValue: unknown) {
  const profile = normalizeProfile(profileValue);
  const base: StudyProfile = { ...profile, answers: {} };
  const shards = Array.from(
    { length: PROFILE_ANSWER_BUCKETS },
    () => ({} as Record<string, AnswerStat>),
  );
  for (const [questionId, answer] of Object.entries(profile.answers)) {
    shards[answerBucket(questionId)][questionId] = answer;
  }
  return { base, shards };
}

function parseAnswers(value: string) {
  const raw = JSON.parse(value) as unknown;
  const object = raw && typeof raw === "object" && !Array.isArray(raw)
    ? raw as Record<string, unknown>
    : {};
  const profile = emptyProfile();
  profile.answers = normalizeProfile({
    answers: object.answers && typeof object.answers === "object" ? object.answers : object,
  }).answers;
  return profile;
}

async function readStoredProfile(db: ReturnType<typeof getDb>, userId: string) {
  const baseRow = await db
    .prepare("SELECT payload_json, updated_at, revision FROM study_profiles WHERE user_id = ?1")
    .bind(userId)
    .first<BaseRow>();
  const shardResult = await db
    .prepare(
      `SELECT bucket, answers_json, updated_at, revision
       FROM profile_answer_shards WHERE user_id = ?1 ORDER BY bucket`,
    )
    .bind(userId)
    .all<ShardRow>();
  const shardRows = shardResult.results ?? [];
  let profile = baseRow ? normalizeProfile(JSON.parse(baseRow.payload_json)) : null;
  for (const shard of shardRows) {
    profile = mergeStudyProfiles(profile ?? emptyProfile(), parseAnswers(shard.answers_json));
  }
  return { baseRow, shardRows, profile };
}

export async function GET(request: Request) {
  const identity = resolveIdentity(request);
  try {
    const stored = await readStoredProfile(getDb(), identity.userId);
    return jsonWithIdentity(identity, {
      identity: {
        displayName: identity.displayName,
        email: identity.email,
        mode: identity.mode,
      },
      profile: stored.profile,
      updatedAt: [
        stored.baseRow?.updated_at,
        ...stored.shardRows.map((row) => row.updated_at),
      ].filter((value): value is string => Boolean(value)).sort().at(-1) ?? null,
      revision: stored.baseRow?.revision ?? 0,
    });
  } catch (error) {
    return jsonError(identity, request, "暂时无法读取学习档案", error);
  }
}

export async function PUT(request: Request) {
  const identity = resolveIdentity(request);
  let payload: unknown;
  try {
    const raw = await request.text();
    if (encodedBytes(raw) > MAX_PROFILE_REQUEST_BYTES) {
      return jsonWithIdentity(identity, { error: "学习档案过大" }, { status: 413 });
    }
    payload = JSON.parse(raw);
  } catch {
    return jsonWithIdentity(identity, { error: "学习档案不是有效的 JSON" }, { status: 400 });
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return jsonWithIdentity(identity, { error: "学习档案格式无效" }, { status: 400 });
  }
  try {
    const incoming = normalizeProfile(payload);
    const db = getDb();
    for (let attempt = 0; attempt < MAX_PROFILE_WRITE_RETRIES; attempt += 1) {
      const stored = await readStoredProfile(db, identity.userId);
      const merged = stored.profile
        ? mergeStudyProfiles(stored.profile, incoming)
        : incoming;
      const { base, shards } = partitionProfileForStorage(merged);
      const serializedBase = JSON.stringify(base);
      const serializedShards = shards.map((answers) => JSON.stringify(answers));
      if (
        encodedBytes(serializedBase) > MAX_PROFILE_ROW_BYTES ||
        serializedShards.some((serialized) => encodedBytes(serialized) > MAX_PROFILE_ROW_BYTES)
      ) {
        return jsonWithIdentity(identity, { error: "学习档案分片过大" }, { status: 413 });
      }

      const now = new Date().toISOString();
      const shardByBucket = new Map(stored.shardRows.map((row) => [row.bucket, row]));
      let shardConflict = false;
      for (let bucket = 0; bucket < PROFILE_ANSWER_BUCKETS; bucket += 1) {
        const existing = shardByBucket.get(bucket);
        const result = existing
          ? await db.prepare(
              `UPDATE profile_answer_shards
               SET answers_json = ?3, updated_at = ?4, revision = ?5
               WHERE user_id = ?1 AND bucket = ?2 AND revision = ?6`,
            )
            .bind(identity.userId, bucket, serializedShards[bucket], now, existing.revision + 1, existing.revision)
            .run()
          : await db.prepare(
              `INSERT OR IGNORE INTO profile_answer_shards
               (user_id, bucket, answers_json, updated_at, revision)
               VALUES (?1, ?2, ?3, ?4, 1)`,
            )
            .bind(identity.userId, bucket, serializedShards[bucket], now)
            .run();
        if ((result.meta.changes ?? 0) === 0) {
          shardConflict = true;
          break;
        }
      }
      if (shardConflict) continue;

      const nextRevision = (stored.baseRow?.revision ?? 0) + 1;
      const baseResult = stored.baseRow
        ? await db.prepare(
            `UPDATE study_profiles
             SET payload_json = ?2, updated_at = ?3, revision = ?4
             WHERE user_id = ?1 AND revision = ?5`,
          )
          .bind(identity.userId, serializedBase, now, nextRevision, stored.baseRow.revision)
          .run()
        : await db.prepare(
            `INSERT OR IGNORE INTO study_profiles (user_id, payload_json, updated_at, revision)
             VALUES (?1, ?2, ?3, ?4)`,
          )
          .bind(identity.userId, serializedBase, now, nextRevision)
          .run();
      if ((baseResult.meta.changes ?? 0) > 0) {
        return jsonWithIdentity(identity, {
          ok: true,
          updatedAt: now,
          revision: nextRevision,
          profile: merged,
        });
      }
      // Re-read all rows and merge again after any competing CAS. Partial
      // bucket writes are safe because every answer counter merge is monotonic.
    }
    return jsonWithIdentity(identity, { error: "学习档案正在其他设备更新，请重试" }, { status: 409 });
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
      db.prepare("DELETE FROM profile_answer_shards WHERE user_id = ?1").bind(identity.userId),
      db.prepare("DELETE FROM study_profiles WHERE user_id = ?1").bind(identity.userId),
      db.prepare("DELETE FROM learning_events WHERE user_id = ?1").bind(identity.userId),
      db.prepare("DELETE FROM recordings WHERE user_id = ?1").bind(identity.userId),
    ]);
    return jsonWithIdentity(identity, { ok: true });
  } catch (error) {
    return jsonError(identity, request, "暂时无法清除学习档案", error);
  }
}
