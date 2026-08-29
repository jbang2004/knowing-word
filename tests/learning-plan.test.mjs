import assert from "node:assert/strict";
import test from "node:test";
import { homeCandidates } from "../app/data/home-index.generated.ts";
import {
  isLessonLearningComplete,
  learningTrackProgress,
  nextLessonActivity,
  pendingReadingLessonId,
  recommendedLessonId,
} from "../app/domain/learning-plan.ts";
import { getPracticeSteps, getTrackExercises } from "../app/domain/practice.ts";
import { nextTrackCandidate } from "../app/domain/catalog-progress.ts";
import { loadLessonContent } from "../app/data/lesson-content.ts";
import { characters } from "../app/data/catalog.ts";
import { emptyProfile } from "../app/lib/profile-model.ts";

const firstLessonId = "g5v1-l01";

test("the guided plan treats full-character mastery as the required lesson path", () => {
  const profile = emptyProfile();
  const words = homeCandidates.words.filter((candidate) => candidate.lessonId === firstLessonId);

  assert.equal(recommendedLessonId(profile), firstLessonId);
  assert.deepEqual(nextLessonActivity(profile, firstLessonId), {
    track: "words",
    candidate: words[0],
  });

  profile.completed.words = words.map((candidate) => candidate.id);
  profile.last.words = { lessonId: firstLessonId, characterId: words.at(-1).id, questionIndex: 1 };
  assert.deepEqual(nextLessonActivity(profile, firstLessonId), { track: null, candidate: null });
  assert.equal(recommendedLessonId(profile), "g5v1-l02");
  assert.equal(pendingReadingLessonId(profile), firstLessonId);

  // Optional specialist reviews keep independent progress without becoming a
  // gate between mastered words and the next lesson.
  profile.completed.structure = [...profile.completed.words];
  profile.completed.split = [...profile.completed.words];
  profile.completed.honglan = [...profile.completed.words];
  assert.deepEqual(nextLessonActivity(profile, firstLessonId), { track: null, candidate: null });
  assert.equal(recommendedLessonId(profile), "g5v1-l02");
  profile.readLessons = [firstLessonId];
  assert.equal(recommendedLessonId(profile), "g5v1-l02");
  assert.equal(pendingReadingLessonId(profile), undefined);
});

test("lesson learning completes when every character passes the full mastery round", () => {
  const profile = emptyProfile();
  const words = homeCandidates.words.filter((candidate) => candidate.lessonId === firstLessonId);

  profile.completed.words = words.map((candidate) => candidate.id);
  assert.equal(isLessonLearningComplete(profile, firstLessonId), true);
});

test("a stale resume pointer cannot skip unfinished words or lessons", () => {
  const profile = emptyProfile();
  const firstLessonWords = homeCandidates.words.filter((candidate) => candidate.lessonId === firstLessonId);
  const secondLessonWords = homeCandidates.words.filter((candidate) => candidate.lessonId === "g5v1-l02");

  profile.completed.words = firstLessonWords.map((candidate) => candidate.id);
  profile.completed.words.push(secondLessonWords[0].id, secondLessonWords[1].id);
  profile.last.words = {
    lessonId: "g5v1-l02",
    characterId: secondLessonWords[5].id,
    questionIndex: 2,
  };

  assert.equal(recommendedLessonId(profile), "g5v1-l02");
  assert.equal(nextTrackCandidate("words", profile)?.id, secondLessonWords[2].id);
  assert.deepEqual(nextLessonActivity(profile, "g5v1-l02"), {
    track: "words",
    candidate: secondLessonWords[2],
  });

  profile.completed.words = [];
  assert.equal(recommendedLessonId(profile), firstLessonId);
  assert.equal(nextTrackCandidate("words", profile)?.id, firstLessonWords[0].id);
});

test("specialist progress contains learned characters only", () => {
  const profile = emptyProfile();
  const first = homeCandidates.words.find((candidate) => candidate.lessonId === firstLessonId);
  profile.completed.words = [first.id];

  assert.deepEqual(learningTrackProgress(profile, "structure", firstLessonId), {
    completed: 0,
    total: 1,
  });
});

test("the words stage keeps one guided writing pass but not specialist structure or component items", async () => {
  const content = await loadLessonContent(firstLessonId);
  const character = content.characters.find((item) =>
    item.primary && item.official !== false && item.curriculumRole === "write"
  );
  const exercises = getTrackExercises(character, "words");

  assert.ok(exercises.length >= 2);
  assert.ok(exercises.every((exercise) => exercise.kind === "single" || exercise.kind === "write"));
  assert.ok(exercises.some((exercise) => exercise.kind === "write"));
  assert.ok(exercises.filter((exercise) => exercise.kind === "write").every((exercise) => exercise.cueLevel > 0));
  assert.ok(getTrackExercises(character, "structure").some((exercise) => exercise.kind === "structure"));
  assert.ok(getTrackExercises(character, "split").some((exercise) => exercise.kind === "components"));
});

test("the character-card mastery check selects one best reachable item per dimension", async () => {
  const content = await loadLessonContent(firstLessonId);
  const characters = content.characters.filter((item) => item.primary && item.official !== false);

  for (const character of characters) {
    const steps = getPracticeSteps(character, "words", "mastery");
    assert.equal(new Set(steps.map(({ exercise }) => exercise.id)).size, steps.length);
    assert.deepEqual(
      [...new Set(steps.map(({ exercise }) => exercise.dimension))].sort(),
      ["context", "discrimination", "generation", "phonology", "recognition", "semantics"],
    );
    assert.ok(steps.length === 6 || steps.length === 8);
  }
});

test("every official character has a compact six-dimension mastery check", () => {
  const distribution = new Map();
  for (const character of characters.filter((item) => item.official !== false)) {
    const steps = getPracticeSteps(character, "words", "mastery");
    assert.equal(new Set(steps.map(({ exercise }) => exercise.id)).size, steps.length);
    assert.ok(steps.length === 6 || steps.length === 8, `${character.hanzi} has ${steps.length} steps`);
    distribution.set(steps.length, (distribution.get(steps.length) ?? 0) + 1);
  }
  assert.deepEqual(Object.fromEntries(distribution), { 6: 145, 8: 220 });
});
