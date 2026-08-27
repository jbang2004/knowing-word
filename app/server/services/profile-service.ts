import {
  mergeStudyProfiles,
  normalizeProfile,
} from "../../lib/profile-model.ts";
import {
  answerBucket,
  combineProfileShards,
  partitionProfileForStorage,
  PROFILE_ANSWER_BUCKETS,
} from "../../domain/profile-shards.ts";

/** D1 rejects a single row at 2,000,000 bytes; keep operational headroom. */
export const MAX_PROFILE_ROW_BYTES = 1_800_000;
/** A request may carry the reconstructed profile, including all answer shards. */
export const MAX_PROFILE_REQUEST_BYTES = 8_000_000;
/** @deprecated Use the explicit row/request constants. */
export const MAX_PROFILE_BYTES = MAX_PROFILE_ROW_BYTES;
const MAX_PROFILE_WRITE_RETRIES = 8;
const encoder = new TextEncoder();

type BaseRow = { payload_json: string; updated_at: string; revision: number };
type ShardRow = { bucket: number; answers_json: string; updated_at: string; revision: number };

export function encodedProfileBytes(value: string) {
  return encoder.encode(value).byteLength;
}

export { answerBucket, partitionProfileForStorage, PROFILE_ANSWER_BUCKETS };

export async function readStoredProfile(db: D1Database, userId: string) {
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
  const profile = baseRow || shardRows.length
    ? combineProfileShards(
        baseRow ? JSON.parse(baseRow.payload_json) : {},
        shardRows.map((shard) => JSON.parse(shard.answers_json)),
      )
    : null;
  return { baseRow, shardRows, profile };
}

export async function getProfileSnapshot(db: D1Database, userId: string) {
  const stored = await readStoredProfile(db, userId);
  return {
    profile: stored.profile,
    updatedAt: [
      stored.baseRow?.updated_at,
      ...stored.shardRows.map((row) => row.updated_at),
    ].filter((value): value is string => Boolean(value)).sort().at(-1) ?? null,
    revision: stored.baseRow?.revision ?? 0,
  };
}

export async function saveProfile(
  db: D1Database,
  userId: string,
  profileValue: unknown,
  now: () => string = () => new Date().toISOString(),
) {
  const incoming = normalizeProfile(profileValue);
  for (let attempt = 0; attempt < MAX_PROFILE_WRITE_RETRIES; attempt += 1) {
    const stored = await readStoredProfile(db, userId);
    const merged = stored.profile ? mergeStudyProfiles(stored.profile, incoming) : incoming;
    const { base, shards } = partitionProfileForStorage(merged);
    const serializedBase = JSON.stringify(base);
    const serializedShards = shards.map((answers) => JSON.stringify(answers));
    if (
      encodedProfileBytes(serializedBase) > MAX_PROFILE_ROW_BYTES
      || serializedShards.some((serialized) => encodedProfileBytes(serialized) > MAX_PROFILE_ROW_BYTES)
    ) {
      return { status: "too-large" as const };
    }

    const updatedAt = now();
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
          .bind(userId, bucket, serializedShards[bucket], updatedAt, existing.revision + 1, existing.revision)
          .run()
        : await db.prepare(
            `INSERT OR IGNORE INTO profile_answer_shards
             (user_id, bucket, answers_json, updated_at, revision)
             VALUES (?1, ?2, ?3, ?4, 1)`,
          )
          .bind(userId, bucket, serializedShards[bucket], updatedAt)
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
        .bind(userId, serializedBase, updatedAt, nextRevision, stored.baseRow.revision)
        .run()
      : await db.prepare(
          `INSERT OR IGNORE INTO study_profiles (user_id, payload_json, updated_at, revision)
           VALUES (?1, ?2, ?3, ?4)`,
        )
        .bind(userId, serializedBase, updatedAt, nextRevision)
        .run();
    if ((baseResult.meta.changes ?? 0) > 0) {
      return {
        status: "saved" as const,
        updatedAt,
        revision: nextRevision,
        profile: merged,
      };
    }
    // Re-read all rows and merge after a competing CAS. Partial bucket writes
    // are safe because every answer counter merge is monotonic.
  }
  return { status: "conflict" as const };
}

export async function deleteProfile(db: D1Database, media: R2Bucket, userId: string) {
  const recordingRows = await db
    .prepare("SELECT object_key FROM recordings WHERE user_id = ?1")
    .bind(userId)
    .all<{ object_key: string }>();
  const objectKeys = recordingRows.results.map((row) => row.object_key);
  if (objectKeys.length) await media.delete(objectKeys);
  await db.batch([
    db.prepare("DELETE FROM profile_answer_shards WHERE user_id = ?1").bind(userId),
    db.prepare("DELETE FROM study_profiles WHERE user_id = ?1").bind(userId),
    db.prepare("DELETE FROM learning_events WHERE user_id = ?1").bind(userId),
    db.prepare("DELETE FROM recordings WHERE user_id = ?1").bind(userId),
  ]);
}
