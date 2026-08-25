import assert from "node:assert/strict";
import test from "node:test";
import {
  applyReadingAssessment,
  canAssessReading,
  minimumReadingDurationMs,
} from "../app/domain/reading-assessment.ts";
import { emptyProfile } from "../app/lib/profile-model.ts";

test("finishing a recording does not count until accuracy is explicitly assessed", () => {
  const profile = emptyProfile();
  assert.deepEqual(profile.readLessons, []);
  assert.deepEqual(profile.readingEvidence, {});
});

test("accuracy assessment requires a non-empty recording and full replay", () => {
  assert.equal(minimumReadingDurationMs("白鹭"), 3_000);
  assert.equal(minimumReadingDurationMs("白鹭在清水田边安静地站着"), 3_000);
  assert.equal(canAssessReading("白鹭", 9_000, false), false);
  assert.equal(canAssessReading("白鹭", 2_999, true), false);
  assert.equal(canAssessReading("白鹭", 3_000, true), true);
});

test("needs-practice evidence never marks a lesson accurately read", () => {
  const profile = applyReadingAssessment(
    emptyProfile(),
    "g5v1-l01",
    "needs-practice",
    "2026-08-25T01:00:00.000Z",
  );
  assert.deepEqual(profile.readLessons, []);
  assert.deepEqual(profile.readingEvidence["g5v1-l01"], {
    attempts: 1,
    accurate: 0,
    needsPractice: 1,
    lastAt: "2026-08-25T01:00:00.000Z",
    lastAccuracy: "needs-practice",
    verificationSource: "self",
  });
  assert.equal(profile.daily["2026-08-25"].readSessions, 1);
});

test("accurate self-check records completion once while preserving all attempts", () => {
  const first = applyReadingAssessment(
    emptyProfile(),
    "g5v1-l01",
    "needs-practice",
    "2026-08-25T01:00:00.000Z",
  );
  const second = applyReadingAssessment(
    first,
    "g5v1-l01",
    "accurate",
    "2026-08-25T01:03:00.000Z",
  );
  const third = applyReadingAssessment(
    second,
    "g5v1-l01",
    "accurate",
    "2026-08-25T01:04:00.000Z",
  );

  assert.deepEqual(third.readLessons, ["g5v1-l01"]);
  assert.equal(third.readingEvidence["g5v1-l01"].attempts, 3);
  assert.equal(third.readingEvidence["g5v1-l01"].accurate, 2);
  assert.equal(third.readingEvidence["g5v1-l01"].needsPractice, 1);
  assert.equal(third.daily["2026-08-25"].readSessions, 3);
});
