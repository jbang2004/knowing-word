import assert from "node:assert/strict";
import test from "node:test";
import { applyReadingPractice } from "../app/domain/reading-practice.ts";
import { emptyProfile } from "../app/lib/profile-model.ts";

test("reading practice records participation without claiming accuracy", () => {
  const profile = applyReadingPractice(
    emptyProfile(),
    "g5v1-l01",
    "needs-practice",
    "2026-08-25T01:00:00.000Z",
  );

  assert.deepEqual(profile.readLessons, ["g5v1-l01"]);
  assert.deepEqual(profile.readingEvidence["g5v1-l01"], {
    sessions: 1,
    comfortable: 0,
    needsPractice: 1,
    lastAt: "2026-08-25T01:00:00.000Z",
    lastReflection: "needs-practice",
    attempts: 0,
    accurate: 0,
  });
  assert.equal(profile.daily["2026-08-25"].readSessions, 1);
});

test("repeat practice preserves both kinds of learner reflection", () => {
  const first = applyReadingPractice(
    emptyProfile(),
    "g5v1-l01",
    "needs-practice",
    "2026-08-25T01:00:00.000Z",
  );
  const second = applyReadingPractice(
    first,
    "g5v1-l01",
    "comfortable",
    "2026-08-25T01:03:00.000Z",
  );
  const third = applyReadingPractice(
    second,
    "g5v1-l01",
    "comfortable",
    "2026-08-25T01:04:00.000Z",
  );

  assert.deepEqual(third.readLessons, ["g5v1-l01"]);
  assert.equal(third.readingEvidence["g5v1-l01"].sessions, 3);
  assert.equal(third.readingEvidence["g5v1-l01"].comfortable, 2);
  assert.equal(third.readingEvidence["g5v1-l01"].needsPractice, 1);
  assert.equal(third.readingEvidence["g5v1-l01"].attempts, 0);
  assert.equal(third.readingEvidence["g5v1-l01"].accurate, 0);
  assert.equal(third.daily["2026-08-25"].readSessions, 3);
});
