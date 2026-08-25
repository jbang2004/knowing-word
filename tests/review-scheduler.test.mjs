import assert from "node:assert/strict";
import test from "node:test";
import {
  fluentResponseThresholdMs,
  independentReviewIntervals,
  isDue,
  isFluentResponse,
  nextDueDimensions,
  scheduleReview,
  scheduleReviewEvidence,
} from "../app/domain/review-scheduler.ts";
import {
  emptyCharacterMemory,
  emptyDimensionMemory,
} from "../app/domain/learning-state.ts";

function attempt(overrides = {}) {
  return {
    characterId: "character-1",
    questionId: "question-1",
    dimension: "recognition",
    cueLevel: 0,
    answerMode: "choice",
    correct: true,
    latencyMs: 800,
    errorTags: [],
    occurredAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

test("confirmed errors retry after five minutes and increment lapses", () => {
  const previous = {
    ...emptyDimensionMemory(),
    status: "review",
    intervalDays: 14,
    correctStreak: 4,
    independentStreak: 4,
    lapses: 2,
    lastIndependentCorrectAt: "2025-12-25T00:00:00.000Z",
  };

  const next = scheduleReview(previous, attempt({ correct: false }));

  assert.deepEqual(next, {
    ...previous,
    status: "learning",
    dueAt: "2026-01-01T00:05:00.000Z",
    intervalDays: 0,
    lapses: 3,
    correctStreak: 0,
    independentStreak: 0,
    lastAt: "2026-01-01T00:00:00.000Z",
  });
  assert.equal(previous.lapses, 2, "the input memory is not mutated");
});

test("unverified answers retry without being counted as lapses", () => {
  const next = scheduleReview(emptyDimensionMemory(), attempt({
    correct: null,
    answerMode: "self-check",
    errorTags: ["writing-unverified"],
  }));

  assert.equal(next.dueAt, "2026-01-01T00:05:00.000Z");
  assert.equal(next.lapses, 0);
  assert.equal(next.status, "learning");
});

test("a prompted correct answer is due next day and cannot remain stable", () => {
  const previous = {
    ...emptyDimensionMemory(),
    status: "stable",
    dueAt: "2026-01-30T00:00:00.000Z",
    intervalDays: 30,
    independentStreak: 5,
  };
  const next = scheduleReview(previous, attempt({ cueLevel: 1 }));

  assert.equal(next.dueAt, "2026-01-02T00:00:00.000Z");
  assert.equal(next.intervalDays, 1);
  assert.equal(next.status, "learning");
  assert.equal(next.independentStreak, 0);
});

test("fluent-response ceilings are inclusive and slow correct answers stay at one day", () => {
  const previous = {
    ...emptyDimensionMemory(),
    status: "review",
    intervalDays: 14,
    correctStreak: 4,
    independentStreak: 4,
    lastIndependentCorrectAt: "2025-12-25T00:00:00.000Z",
  };

  const choiceBoundary = scheduleReview(previous, attempt({
    answerMode: "choice",
    latencyMs: fluentResponseThresholdMs.choice,
  }));
  const choiceSlow = scheduleReview(previous, attempt({
    answerMode: "choice",
    latencyMs: fluentResponseThresholdMs.choice + 1,
  }));
  const handwritingBoundary = scheduleReview(previous, attempt({
    answerMode: "handwriting",
    latencyMs: fluentResponseThresholdMs.handwriting,
  }));
  const handwritingSlow = scheduleReview(previous, attempt({
    answerMode: "handwriting",
    latencyMs: fluentResponseThresholdMs.handwriting + 1,
  }));

  assert.equal(choiceBoundary.intervalDays, 30);
  assert.equal(handwritingBoundary.intervalDays, 30);
  for (const slow of [choiceSlow, handwritingSlow]) {
    assert.equal(slow.status, "learning");
    assert.equal(slow.intervalDays, 1);
    assert.equal(slow.dueAt, "2026-01-02T00:00:00.000Z");
    assert.equal(slow.independentStreak, 0);
  }
  assert.equal(isFluentResponse(attempt({ answerMode: "speech", latencyMs: 15_000 })), true);
  assert.equal(isFluentResponse(attempt({ answerMode: "speech", latencyMs: 15_001 })), false);
  assert.equal(isFluentResponse(attempt({ latencyMs: -1 })), false);
});

test("unverified handwriting self-checks never count as independent mastery", () => {
  const previous = emptyDimensionMemory();
  const next = scheduleReview(previous, attempt({
    correct: true,
    cueLevel: 0,
    answerMode: "self-check",
  }));

  assert.equal(next.status, "learning");
  assert.equal(next.intervalDays, 1);
  assert.equal(next.independentStreak, 0);
  assert.equal(next.lastIndependentCorrectAt, null);
});

test("independent correct answers advance through capped review intervals", () => {
  let memory = emptyDimensionMemory();

  for (let index = 0; index < independentReviewIntervals.length + 2; index += 1) {
    const occurredAt = new Date(Date.UTC(2026, 0, 1 + index)).toISOString();
    memory = scheduleReview(memory, attempt({ occurredAt }));
    const expected = independentReviewIntervals[
      Math.min(index, independentReviewIntervals.length - 1)
    ];
    assert.equal(memory.intervalDays, expected);
    assert.equal(
      memory.dueAt,
      new Date(Date.parse(occurredAt) + expected * 86_400_000).toISOString(),
    );
  }
});

test("stable requires two consecutive independent successes separated by seven days", () => {
  const first = scheduleReview(emptyDimensionMemory(), attempt());
  const beforeBoundary = scheduleReview(first, attempt({
    occurredAt: "2026-01-07T23:59:59.999Z",
  }));
  const atBoundary = scheduleReview(first, attempt({
    occurredAt: "2026-01-08T00:00:00.000Z",
  }));

  assert.equal(first.status, "review");
  assert.equal(beforeBoundary.independentStreak, 2);
  assert.equal(beforeBoundary.status, "review");
  assert.equal(atBoundary.independentStreak, 2);
  assert.equal(atBoundary.status, "stable");
});

test("scheduling is deterministic and rejects invalid injected time", () => {
  const memory = emptyDimensionMemory();
  const evidence = attempt({ occurredAt: "2026-03-08T01:30:00-05:00" });

  assert.deepEqual(scheduleReview(memory, evidence), scheduleReview(memory, evidence));
  assert.equal(
    scheduleReview(memory, evidence).dueAt,
    "2026-03-09T06:30:00.000Z",
    "day arithmetic is elapsed-time based and independent of local DST",
  );
  assert.throws(
    () => scheduleReview(memory, attempt({ occurredAt: "not-a-date" })),
    RangeError,
  );
});

test("due checks include the exact boundary but exclude unscheduled new memory", () => {
  const unscheduled = emptyDimensionMemory();
  const scheduled = {
    ...unscheduled,
    status: "review",
    dueAt: "2026-01-02T00:00:00.000Z",
  };

  assert.equal(isDue(unscheduled, "2027-01-01T00:00:00.000Z"), false);
  assert.equal(isDue(scheduled, "2026-01-01T23:59:59.999Z"), false);
  assert.equal(isDue(scheduled, "2026-01-02T00:00:00.000Z"), true);
  assert.throws(() => isDue(scheduled, new Date("invalid")), RangeError);
});

test("due dimensions are ordered by urgency with contract order as tie-breaker", () => {
  const memory = emptyCharacterMemory();
  memory.context = {
    ...memory.context,
    status: "review",
    dueAt: "2026-01-02T00:00:00.000Z",
  };
  memory.phonology = {
    ...memory.phonology,
    status: "review",
    dueAt: "2026-01-01T00:00:00.000Z",
  };
  memory.recognition = {
    ...memory.recognition,
    status: "review",
    dueAt: "2026-01-01T00:00:00.000Z",
  };
  memory.generation = {
    ...memory.generation,
    status: "review",
    dueAt: "2026-02-01T00:00:00.000Z",
  };

  assert.deepEqual(
    nextDueDimensions(memory, "2026-01-02T00:00:00.000Z"),
    ["recognition", "phonology", "context"],
  );
  assert.throws(
    () => nextDueDimensions(memory, "not-a-date"),
    RangeError,
  );
});

test("wrong-answer evidence schedules both the observed and diagnosed target dimensions", () => {
  const memory = emptyCharacterMemory();
  const updates = scheduleReviewEvidence(memory, attempt({
    correct: false,
    dimension: "recognition",
    errorTags: ["lookalike-confusion", "lookalike-confusion"],
  }));

  assert.deepEqual(Object.keys(updates), ["recognition", "discrimination"]);
  for (const dimension of ["recognition", "discrimination"]) {
    assert.equal(updates[dimension].status, "learning");
    assert.equal(updates[dimension].dueAt, "2026-01-01T00:05:00.000Z");
    assert.equal(updates[dimension].lapses, 1);
  }
  assert.equal(memory.recognition.status, "new", "the source memory remains immutable");
  assert.equal(updates.context, undefined, "unrelated dimensions stay sparse");
});
