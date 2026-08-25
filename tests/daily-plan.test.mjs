import assert from "node:assert/strict";
import test from "node:test";
import { homeCandidates } from "../app/data/home-index.generated.ts";
import { buildDailyLearningPlan } from "../app/domain/daily-plan.ts";
import { emptyCharacterMemory } from "../app/domain/learning-state.ts";
import { emptyProfile } from "../app/lib/profile-model.ts";

const now = new Date("2026-08-25T08:00:00.000Z");

test("daily plans put overdue independent review before new characters", () => {
  const profile = emptyProfile();
  const [first, second] = homeCandidates.words;
  profile.completed.words = [first.id];
  profile.last.words = { lessonId: first.lessonId, characterId: first.id, questionIndex: 0 };
  profile.memory[first.id] = emptyCharacterMemory();
  profile.memory[first.id].generation = {
    ...profile.memory[first.id].generation,
    status: "review",
    dueAt: "2026-08-24T08:00:00.000Z",
  };

  const plan = buildDailyLearningPlan(profile, now);
  assert.deepEqual(plan.reviews.map((item) => item.candidate.id), [first.id]);
  assert.deepEqual(plan.reviews[0].dueDimensions, ["generation"]);
  assert.equal(plan.newCharacters[0].candidate.id, second.id);
});

test("daily plans cap mixed work without treating unseen dimensions as due", () => {
  const profile = emptyProfile();
  const completed = homeCandidates.words.slice(0, 12);
  profile.completed.words = completed.map((candidate) => candidate.id);
  for (const candidate of completed) {
    profile.memory[candidate.id] = emptyCharacterMemory();
    profile.memory[candidate.id].recognition = {
      ...profile.memory[candidate.id].recognition,
      status: "review",
      dueAt: "2026-08-20T08:00:00.000Z",
    };
  }

  const plan = buildDailyLearningPlan(profile, now, { reviewLimit: 10, newLimit: 3 });
  assert.equal(plan.reviews.length, 10);
  assert.equal(plan.newCharacters.length, 3);
  assert.equal(plan.total, 13);

  profile.reviewedByDay["2026-08-25"] = completed.slice(0, 9).map((item) => item.id);
  const remaining = buildDailyLearningPlan(profile, now, { reviewLimit: 10, newLimit: 0 });
  assert.equal(remaining.reviews.length, 1, "the ten-character cap cannot refill as each review finishes");
});

test("the daily new-character allowance does not refill after each completion", () => {
  const profile = emptyProfile();
  profile.introducedByDay["2026-08-25"] = ["n1", "n2", "n3"];

  assert.equal(
    buildDailyLearningPlan(profile, now, { reviewLimit: 0, newLimit: 5 }).newCharacters.length,
    2,
  );

  profile.introducedByDay["2026-08-25"].push("n4", "n5");
  assert.equal(
    buildDailyLearningPlan(profile, now, { reviewLimit: 0, newLimit: 5 }).newCharacters.length,
    0,
  );
});

test("daily review characters are sorted by their earliest overdue dimension", () => {
  const profile = emptyProfile();
  const [first, second] = homeCandidates.words;
  profile.completed.words = [first.id, second.id];
  profile.memory[first.id] = emptyCharacterMemory();
  profile.memory[second.id] = emptyCharacterMemory();
  profile.memory[first.id].context = {
    ...profile.memory[first.id].context,
    status: "review",
    dueAt: "2026-08-25T07:00:00.000Z",
  };
  profile.memory[second.id].semantics = {
    ...profile.memory[second.id].semantics,
    status: "review",
    dueAt: "2026-08-20T08:00:00.000Z",
  };

  assert.deepEqual(
    buildDailyLearningPlan(profile, now).reviews.map((item) => item.candidate.id),
    [second.id, first.id],
  );
});
