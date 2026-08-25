import assert from "node:assert/strict";
import test from "node:test";
import {
  detectiveErrorTags,
  detectiveOptions,
  forgeErrorTags,
  historicalComponentNote,
  XIAN_ACQUISITION_CUE,
  xianObjectives,
  xianWritingQuestionId,
} from "../app/domain/xian-adventure.ts";
import { applyLearningAttempt } from "../app/lib/apply-learning-attempt.ts";
import { emptyProfile } from "../app/lib/profile-model.ts";

test("the xian case observes every memory dimension exactly once", () => {
  assert.equal(XIAN_ACQUISITION_CUE, 1, "first-play teaching must not become independent evidence");
  assert.equal(xianObjectives.length, 6);
  assert.deepEqual(new Set(xianObjectives.map((item) => item.dimension)), new Set([
    "recognition", "phonology", "semantics", "generation", "discrimination", "context",
  ]));
  assert.equal(new Set(xianObjectives.map((item) => item.questionId)).size, 6);
  assert.match(xianWritingQuestionId, /writing$/);
});

test("detective distractors diagnose sound and shape confusions", () => {
  assert.deepEqual(detectiveOptions, ["嫌", "闲", "谦", "歉"]);
  assert.deepEqual(detectiveErrorTags("闲"), ["homophone-confusion"]);
  assert.ok(detectiveErrorTags("谦").includes("phonetic-component"));
  assert.ok(detectiveErrorTags("歉").includes("pronunciation-tone"));
});

test("blind forge distinguishes wrong parts from wrong order", () => {
  assert.deepEqual(forgeErrorTags(["兼", "女"]), ["component-position"]);
  assert.deepEqual(forgeErrorTags(["女", "门"]), ["component-missing", "component-extra"]);
});

test("the historical component note explicitly rejects a gender stereotype", () => {
  assert.match(historicalComponentNote, /历史字形/);
  assert.match(historicalComponentNote, /不表示女孩更爱嫌弃/);
});

test("an unverifiable writing self-check schedules retry without inflating accuracy", () => {
  const profile = emptyProfile();
  const next = applyLearningAttempt(profile, "testactor", {
    characterId: "g5v1-l01-c02-u5acc",
    questionId: xianWritingQuestionId,
    dimension: "generation",
    cueLevel: 3,
    answerMode: "self-check",
    correct: null,
    latencyMs: 12_000,
    errorTags: ["writing-unverified"],
    occurredAt: "2026-08-26T00:00:00.000Z",
  });
  assert.equal(next.answers[xianWritingQuestionId], undefined);
  assert.deepEqual(next.daily, {});
  assert.equal(next.memory["g5v1-l01-c02-u5acc"].generation.status, "learning");
  assert.equal(next.memory["g5v1-l01-c02-u5acc"].generation.lapses, 0);
  assert.equal(next.errorCounts["writing-unverified"], 1);
});

test("guided replay cannot erase a stable independent memory", () => {
  const profile = emptyProfile();
  profile.memory["g5v1-l01-c02-u5acc"] = {
    recognition: {
      status: "stable",
      dueAt: "2026-09-25T00:00:00.000Z",
      intervalDays: 30,
      lapses: 0,
      correctStreak: 4,
      independentStreak: 2,
      lastAt: "2026-08-25T00:00:00.000Z",
      lastIndependentCorrectAt: "2026-08-25T00:00:00.000Z",
    },
  };
  const next = applyLearningAttempt(profile, "testactor", {
    characterId: "g5v1-l01-c02-u5acc",
    questionId: xianObjectives[0].questionId,
    dimension: "recognition",
    cueLevel: 1,
    answerMode: "choice",
    correct: true,
    latencyMs: 4_000,
    errorTags: [],
    occurredAt: "2026-08-26T00:00:00.000Z",
  });
  assert.deepEqual(next.memory["g5v1-l01-c02-u5acc"].recognition, profile.memory["g5v1-l01-c02-u5acc"].recognition);
});
