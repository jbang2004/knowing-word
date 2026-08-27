import {
  emptyProfile,
  mergeStudyProfiles,
  normalizeProfile,
  type AnswerStat,
  type StudyProfile,
} from "../lib/profile-model.ts";

export const PROFILE_ANSWER_BUCKETS = 8;

/** Stable FNV-1a hash: changing this would move persisted questions between buckets. */
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

export function combineProfileShards(baseValue: unknown, shardValues: unknown[]) {
  let profile = normalizeProfile(baseValue);
  for (const shardValue of shardValues) {
    const shard = shardValue && typeof shardValue === "object" && !Array.isArray(shardValue)
      ? shardValue as Record<string, unknown>
      : {};
    const answers = shard.answers && typeof shard.answers === "object" ? shard.answers : shard;
    const partial = emptyProfile();
    partial.answers = normalizeProfile({ answers }).answers;
    profile = mergeStudyProfiles(profile, partial);
  }
  return profile;
}
