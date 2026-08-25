import assert from "node:assert/strict";
import test from "node:test";
import {
  emptyProfile,
  mergeStudyProfiles,
  normalizeProfile,
  PROFILE_STORAGE_KEY,
  recordAnswerAttempt,
  withPreferenceUpdate,
} from "../app/lib/profile-model.ts";
import { learningDayKey } from "../app/domain/learning-day.ts";

test("the shared profile model exposes one current storage schema", () => {
  assert.equal(PROFILE_STORAGE_KEY, "knowing-word:course-progress:v5");
  assert.deepEqual(emptyProfile(), {
    version: 5,
    name: "",
    grade: 5,
    courseId: "chinese-grade-5-volume-1",
    theme: "light",
    favorites: [],
    preferenceUpdatedAt: {},
    completed: { words: [], split: [], honglan: [], structure: [] },
    last: { words: null, split: null, honglan: null, structure: null },
    answers: {},
    memory: {},
    errorCounts: {},
    learnedComponents: [],
    recentComponents: [],
    readLessons: [],
    readingEvidence: {},
    introducedByDay: {},
    reviewedByDay: {},
    daily: {},
  });
});

test("normalization keeps current data valid and adds learning evidence", () => {
  const profile = normalizeProfile({
    version: 4,
    mastered: ["旧"],
    name: "一位名字特别特别特别特别长的学习者",
    grade: -1,
    theme: "night",
    favorites: ["桂", "桂", 3],
    completed: { words: ["桂", "桂", null], split: ["拆"] },
    last: {
      words: { lessonId: "l1", characterId: "桂", questionIndex: 2 },
      split: { lessonId: "l1", characterId: "桂", questionIndex: -1 },
    },
    answers: {
      q1: { attempts: 2.8, correct: 1, lastCorrect: true, lastAt: "2026-08-23T00:00:00Z" },
      broken: { attempts: 1 },
    },
    learnedComponents: ["木", "木", "圭"],
    recentComponents: Array.from({ length: 30 }, (_, index) => `p${index}`),
    readLessons: ["g5v1-l01", "g5v1-l01", "g5v1-l02"],
    readingEvidence: {
      "g5v1-l01": { attempts: 2, accurate: 1, needsPractice: 1, lastAt: "2026-08-23T00:00:00Z", lastAccuracy: "accurate", verificationSource: "self" },
    },
    daily: {
      "2026-08-23": { attempts: 3.9, correct: 2, skips: -2, readSessions: 1 },
      yesterday: { attempts: 9 },
    },
    memory: {
      桂: {
        recognition: {
          status: "review",
          dueAt: "2026-08-24T00:00:00Z",
          intervalDays: 3.8,
          lapses: 1,
          correctStreak: 2,
          independentStreak: 1,
          lastAt: "2026-08-23T00:00:00Z",
          lastIndependentCorrectAt: "2026-08-23T00:00:00Z",
        },
      },
    },
    errorCounts: { "lookalike-confusion": 2.9, unknown: 9 },
  });

  assert.equal(profile.name, "一位名字特别特别特别特别长的学习者".slice(0, 18));
  assert.equal(profile.grade, 5);
  assert.equal(profile.theme, "night");
  assert.deepEqual(profile.favorites, ["桂"]);
  assert.deepEqual(profile.completed.words, ["桂"]);
  assert.deepEqual(profile.completed.split, ["拆"]);
  assert.deepEqual(profile.last.words, { lessonId: "l1", characterId: "桂", questionIndex: 2 });
  assert.equal(profile.last.split, null);
  assert.deepEqual(profile.answers.q1, {
    attempts: 2,
    correct: 1,
    lastCorrect: true,
    lastAt: "2026-08-23T00:00:00Z",
  });
  assert.equal(profile.answers.broken, undefined);
  assert.equal(profile.memory.桂.recognition.status, "review");
  assert.equal(profile.memory.桂.recognition.intervalDays, 3);
  assert.equal(profile.memory.桂.generation, undefined);
  assert.deepEqual(profile.errorCounts, { "lookalike-confusion": 2 });
  assert.deepEqual(profile.learnedComponents, ["木", "圭"]);
  assert.equal(profile.recentComponents.length, 24);
  assert.deepEqual(profile.readLessons, ["g5v1-l01", "g5v1-l02"]);
  assert.equal(profile.readingEvidence["g5v1-l01"].lastAccuracy, "accurate");
  assert.deepEqual(profile.daily["2026-08-23"], {
    attempts: 3,
    correct: 2,
    skips: 0,
    readSessions: 1,
  });
  assert.equal(profile.daily.yesterday, undefined);

  assert.deepEqual(normalizeProfile({ mastered: ["旧"] }).completed.words, []);
});

test("legacy completion is preserved instead of being coupled to optional reviews", () => {
  const migrated = normalizeProfile({
    version: 3,
    completed: {
      words: ["只做识字", "完整学会"],
      structure: ["完整学会"],
      split: ["完整学会"],
      honglan: ["完整学会"],
    },
  });

  assert.equal(migrated.version, 5);
  assert.deepEqual(migrated.completed.words, ["只做识字", "完整学会"]);
  assert.deepEqual(migrated.completed.structure, ["完整学会"]);
});

test("today keys use the product's Shanghai learning day", () => {
  assert.equal(learningDayKey(new Date("2026-08-22T16:30:00.000Z")), "2026-08-23");
});

test("offline and server snapshots merge without erasing disjoint evidence", () => {
  const server = emptyProfile();
  server.completed.words = ["server-char"];
  server.answers.serverQuestion = {
    attempts: 1,
    correct: 1,
    lastCorrect: true,
    lastAt: "2026-08-24T00:00:00.000Z",
  };
  server.daily["2026-08-24"] = { attempts: 2, correct: 2, skips: 0, readSessions: 0 };

  const local = emptyProfile();
  local.completed.words = ["local-char"];
  local.answers.localQuestion = {
    attempts: 2,
    correct: 1,
    lastCorrect: false,
    lastAt: "2026-08-25T00:00:00.000Z",
  };
  local.daily["2026-08-24"] = { attempts: 3, correct: 2, skips: 1, readSessions: 0 };

  const merged = mergeStudyProfiles(server, local);
  assert.deepEqual(merged.completed.words, ["server-char", "local-char"]);
  assert.ok(merged.answers.serverQuestion);
  assert.ok(merged.answers.localQuestion);
  assert.deepEqual(merged.daily["2026-08-24"], {
    attempts: 3,
    correct: 2,
    skips: 1,
    readSessions: 0,
  });
});

test("profile merge keeps the latest snapshot without adding a shared base twice", () => {
  const server = emptyProfile();
  server.answers.shared = {
    attempts: 4,
    correct: 3,
    lastCorrect: false,
    lastAt: "2026-08-24T00:00:00.000Z",
  };
  const local = structuredClone(server);
  local.answers.shared = {
    attempts: 5,
    correct: 4,
    lastCorrect: true,
    lastAt: "2026-08-25T00:00:00.000Z",
  };

  const merged = mergeStudyProfiles(server, local);
  assert.deepEqual(merged.answers.shared, local.answers.shared);
});

test("two devices add exact same-question counts without losing their shared base", () => {
  const base = {
    attempts: 4,
    correct: 3,
    lastCorrect: true,
    lastAt: "2026-08-24T00:00:00.000Z",
  };
  const left = emptyProfile();
  left.answers.shared = recordAnswerAttempt(base, "deviceA", {
    correctAnswer: true,
    lastCorrect: true,
    lastAt: "2026-08-25T00:00:00.000Z",
  });
  left.answers.shared = recordAnswerAttempt(left.answers.shared, "deviceA", {
    correctAnswer: false,
    lastCorrect: false,
    lastAt: "2026-08-25T00:01:00.000Z",
  });
  const right = emptyProfile();
  right.answers.shared = recordAnswerAttempt(base, "deviceB", {
    correctAnswer: true,
    lastCorrect: true,
    lastAt: "2026-08-25T00:02:00.000Z",
  });
  right.answers.shared = recordAnswerAttempt(right.answers.shared, "deviceB", {
    correctAnswer: true,
    lastCorrect: true,
    lastAt: "2026-08-25T00:03:00.000Z",
  });

  const merged = mergeStudyProfiles(left, right);
  assert.equal(merged.answers.shared.attempts, 8);
  assert.equal(merged.answers.shared.correct, 6);
  assert.equal(merged.answers.shared.lastAt, "2026-08-25T00:03:00.000Z");
});

test("an empty local cache cannot overwrite server preferences, while an explicit removal can", () => {
  const server = emptyProfile();
  server.grade = 4;
  server.theme = "night";
  server.favorites = ["桂"];

  const fromEmptyCache = mergeStudyProfiles(server, emptyProfile());
  assert.equal(fromEmptyCache.grade, 4);
  assert.equal(fromEmptyCache.theme, "night");
  assert.deepEqual(fromEmptyCache.favorites, ["桂"]);

  let local = emptyProfile();
  local.answers.q = {
    attempts: 1,
    correct: 1,
    lastCorrect: true,
    lastAt: "2026-08-25T00:00:00.000Z",
  };
  const afterUnrelatedLearning = mergeStudyProfiles(server, local);
  assert.equal(afterUnrelatedLearning.grade, 4);
  assert.equal(afterUnrelatedLearning.theme, "night");
  assert.deepEqual(afterUnrelatedLearning.favorites, ["桂"]);

  local = withPreferenceUpdate(local, "favorites", [], "2026-08-25T00:00:01.000Z");
  assert.deepEqual(mergeStudyProfiles(server, local).favorites, []);
});
