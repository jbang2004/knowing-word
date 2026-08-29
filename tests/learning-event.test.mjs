import assert from "node:assert/strict";
import test from "node:test";
import { parseLearningEvent } from "../app/domain/learning-event.ts";
import { resolveIdentity } from "../app/lib/server-store.ts";

const eventId = "d7fae486-d377-4ab4-8c50-31cc486dc15d";

test("learning events require a known lesson-character pair and bounded payload", () => {
  assert.deepEqual(parseLearningEvent({
    eventId,
    action: "answer",
    track: "words",
    lessonId: "g5v1-l01",
    characterId: "g5v1-l01-c05-u55dc",
    questionId: "g5v1-l01-c05-u55dc-words-context",
    correct: true,
    selected: ["answer-1"],
    dimension: "semantics",
    cueLevel: 0,
    answerMode: "choice",
    latencyMs: 1825.9,
    errorTags: [],
  }), {
    eventId,
    action: "answer",
    track: "words",
    lessonId: "g5v1-l01",
    characterId: "g5v1-l01-c05-u55dc",
    questionId: "g5v1-l01-c05-u55dc-words-context",
    correct: true,
    selected: ["answer-1"],
    dimension: "semantics",
    cueLevel: 0,
    answerMode: "choice",
    latencyMs: 1825,
  });

  assert.equal(parseLearningEvent({ eventId, action: "read", lessonId: "unknown" }), null);
  assert.deepEqual(parseLearningEvent({
    eventId,
    action: "read",
    lessonId: "g5v1-l01",
    readingReflection: "needs-practice",
    latencyMs: 12_000,
  }), {
    eventId,
    action: "read",
    lessonId: "g5v1-l01",
    readingReflection: "needs-practice",
    latencyMs: 12_000,
  });
  assert.deepEqual(parseLearningEvent({
    eventId,
    action: "read",
    lessonId: "g5v1-l01",
    readingAccuracy: "accurate",
  }), {
    eventId,
    action: "read",
    lessonId: "g5v1-l01",
    readingReflection: "comfortable",
  });
  assert.equal(parseLearningEvent({
    eventId,
    action: "skip",
    track: "words",
    lessonId: "g5v1-l02",
    characterId: "g5v1-l01-c05-u55dc",
    questionId: "q1",
  }), null);
  assert.equal(parseLearningEvent({
    eventId: "not-idempotent",
    action: "read",
    lessonId: "g5v1-l01",
  }), null);
});

test("workspace identity uses the stable platform user id instead of mutable email", () => {
  const identity = resolveIdentity(new Request("https://example.com/api/profile", {
    headers: {
      "oai-authenticated-user-id": "user_123",
      "oai-authenticated-user-email": "Learner@Example.com",
    },
  }));
  assert.equal(identity.userId, "workspace:user_123");
  assert.equal(identity.email, "learner@example.com");
  assert.equal(identity.cookie, undefined);
});
