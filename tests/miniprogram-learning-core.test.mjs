import assert from "node:assert/strict";
import test from "node:test";
import { emptyCharacterMemory } from "../app/domain/learning-state.ts";
import { scheduleReviewEvidence } from "../app/domain/review-scheduler.ts";
import { emptyProfile as emptyWebProfile } from "../app/lib/profile-model.ts";
import {
  applyAnswerTransition,
  scheduleEvidence,
} from "../wechat-miniprogram/miniprogram/services/learning-core.ts";
import {
  appendOutboxEvent,
  shouldDiscardFailedEvent,
} from "../wechat-miniprogram/miniprogram/services/event-outbox-core.ts";

test("native and Web review schedulers produce the same dimension state", () => {
  const previous = emptyCharacterMemory();
  const attempt = {
    characterId: "g5v1-l01-c01-u767d",
    questionId: "q1",
    dimension: "recognition",
    cueLevel: 0,
    answerMode: "choice",
    correct: false,
    latencyMs: 2_400,
    errorTags: ["lookalike-confusion", "component-position"],
    occurredAt: "2026-08-28T03:00:00.000Z",
  };
  assert.deepEqual(scheduleEvidence(previous, attempt), scheduleReviewEvidence(previous, attempt));
});

test("native answer transition records durable review and introduction evidence", () => {
  const profile = emptyWebProfile();
  const next = applyAnswerTransition(profile, {
    actorId: "wx-device-a",
    track: "words",
    lessonId: "g5v1-l01",
    characterId: "g5v1-l01-c01-u767d",
    questionId: "q1",
    correct: true,
    questionIndex: 0,
    questionCount: 1,
    completed: true,
    reviewDue: true,
    dimension: "recognition",
    answerMode: "choice",
    cueLevel: 0,
    latencyMs: 2_400,
    errorTags: [],
    occurredAt: "2026-08-28T03:00:00.000Z",
    day: "2026-08-28",
  });
  assert.equal(next.answers.q1.attempts, 1);
  assert.equal(next.memory["g5v1-l01-c01-u767d"].recognition.status, "review");
  assert.deepEqual(next.introducedByDay["2026-08-28"], ["g5v1-l01-c01-u767d"]);
  assert.deepEqual(next.reviewedByDay["2026-08-28"], ["g5v1-l01-c01-u767d"]);
});

test("native event outbox stays bounded and only discards poisoned requests", () => {
  const queued = Array.from({ length: 105 }, (_, index) => index)
    .reduce((events, event) => appendOutboxEvent(events, event, 100), []);
  assert.equal(queued.length, 100);
  assert.equal(queued[0], 5);
  assert.equal(shouldDiscardFailedEvent(400), true);
  assert.equal(shouldDiscardFailedEvent(413), true);
  assert.equal(shouldDiscardFailedEvent(401), false);
  assert.equal(shouldDiscardFailedEvent(429), false);
  assert.equal(shouldDiscardFailedEvent(503), false);
  assert.equal(shouldDiscardFailedEvent(0), false);
});
