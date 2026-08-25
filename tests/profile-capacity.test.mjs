import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_PROFILE_REQUEST_BYTES,
  MAX_PROFILE_ROW_BYTES,
  PROFILE_ANSWER_BUCKETS,
  partitionProfileForStorage,
} from "../app/api/profile/route.ts";
import { characters } from "../app/data/catalog.ts";
import { emptyCharacterMemory } from "../app/domain/learning-state.ts";
import { emptyProfile } from "../app/lib/profile-model.ts";

const encodedBytes = (value) => new TextEncoder().encode(JSON.stringify(value)).byteLength;

test("full-book six-dimension evidence and all answers fit D1 row shards", () => {
  const profile = emptyProfile();
  for (const character of characters) {
    const memory = emptyCharacterMemory();
    for (const dimension of Object.keys(memory)) {
      memory[dimension] = {
        status: "review",
        dueAt: "2026-09-24T00:00:00.000Z",
        intervalDays: 30,
        lapses: 2,
        correctStreak: 4,
        independentStreak: 3,
        lastAt: "2026-08-25T00:00:00.000Z",
        lastIndependentCorrectAt: "2026-08-25T00:00:00.000Z",
      };
    }
    profile.memory[character.id] = memory;
    for (const exercise of character.exercises) {
      profile.answers[exercise.id] = {
        attempts: 1998,
        correct: 1800,
        lastCorrect: false,
        lastAt: "2026-08-25T00:00:00.000Z",
        lastLatencyMs: 999_999,
        lastCueLevel: 3,
        lastErrorTags: ["pronunciation-initial", "pronunciation-final", "pronunciation-tone"],
        actorCounts: {
          tab000000000001: { attempts: 500, correct: 450 },
          tab000000000002: { attempts: 500, correct: 450 },
          tab000000000003: { attempts: 499, correct: 450 },
          tab000000000004: { attempts: 499, correct: 450 },
        },
      };
    }
  }
  assert.equal(Object.keys(profile.answers).length, 5_537, "fixture must dynamically cover every catalog exercise");

  for (let offset = 0; offset < 120; offset += 1) {
    const date = new Date(Date.UTC(2026, 0, 1 + offset)).toISOString().slice(0, 10);
    profile.introducedByDay[date] = characters.slice(0, 5).map((character) => character.id);
    profile.reviewedByDay[date] = characters.slice(0, 10).map((character) => character.id);
    profile.daily[date] = { attempts: 999, correct: 900, skips: 99, readSessions: 9 };
  }

  const { base, shards } = partitionProfileForStorage(profile);
  assert.equal(shards.length, PROFILE_ANSWER_BUCKETS);
  assert.deepEqual(base.answers, {});
  assert.ok(encodedBytes(profile) < MAX_PROFILE_REQUEST_BYTES, "reconstructed request exceeds request cap");
  assert.ok(encodedBytes(base) < MAX_PROFILE_ROW_BYTES, "base profile exceeds D1 row safety cap");
  for (const [bucket, answers] of shards.entries()) {
    assert.ok(encodedBytes(answers) < MAX_PROFILE_ROW_BYTES, `answer bucket ${bucket} exceeds D1 row safety cap`);
  }
  assert.equal(shards.reduce((sum, answers) => sum + Object.keys(answers).length, 0), 5_537);
});
