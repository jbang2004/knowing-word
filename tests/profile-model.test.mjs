import assert from "node:assert/strict";
import test from "node:test";
import {
  emptyProfile,
  normalizeProfile,
  PROFILE_STORAGE_KEY,
  todayKey,
} from "../app/lib/profile-model.ts";

test("the shared profile model exposes one current storage schema", () => {
  assert.equal(PROFILE_STORAGE_KEY, "knowing-word:course-progress:v3");
  assert.deepEqual(emptyProfile(), {
    version: 3,
    name: "",
    grade: 5,
    courseId: "chinese-grade-5-volume-1",
    theme: "light",
    favorites: [],
    completed: { words: [], split: [], honglan: [], structure: [] },
    last: { words: null, split: null, honglan: null, structure: null },
    answers: {},
    learnedComponents: [],
    recentComponents: [],
    daily: {},
    readSessions: 0,
  });
});

test("normalization keeps current data valid without reviving legacy mastered state", () => {
  const profile = normalizeProfile({
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
    daily: {
      "2026-08-23": { attempts: 3.9, correct: 2, skips: -2, readSessions: 1 },
      yesterday: { attempts: 9 },
    },
    readSessions: Number.POSITIVE_INFINITY,
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
  assert.deepEqual(profile.learnedComponents, ["木", "圭"]);
  assert.equal(profile.recentComponents.length, 24);
  assert.deepEqual(profile.daily["2026-08-23"], {
    attempts: 3,
    correct: 2,
    skips: 0,
    readSessions: 1,
  });
  assert.equal(profile.daily.yesterday, undefined);
  assert.equal(profile.readSessions, 0);

  assert.deepEqual(normalizeProfile({ mastered: ["旧"] }).completed.words, []);
});

test("today keys use the product's Shanghai learning day", () => {
  assert.equal(todayKey(new Date("2026-08-22T16:30:00.000Z")), "2026-08-23");
});
