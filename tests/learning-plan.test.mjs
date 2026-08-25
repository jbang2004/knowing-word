import assert from "node:assert/strict";
import test from "node:test";
import { homeCandidates } from "../app/data/home-index.generated.ts";
import {
  isLessonLearningComplete,
  learningTrackProgress,
  nextLessonActivity,
  recommendedLessonId,
} from "../app/domain/learning-plan.ts";
import { getPracticeSteps, getTrackExercises } from "../app/domain/practice.ts";
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
  assert.equal(recommendedLessonId(profile), firstLessonId);

  // Optional specialist reviews keep independent progress without becoming a
  // gate between the mastered words and the lesson reading finish.
  profile.completed.structure = [...profile.completed.words];
  profile.completed.split = [...profile.completed.words];
  profile.completed.honglan = [...profile.completed.words];
  assert.deepEqual(nextLessonActivity(profile, firstLessonId), { track: null, candidate: null });
  assert.equal(recommendedLessonId(profile), firstLessonId);
  profile.readLessons = [firstLessonId];
  assert.equal(recommendedLessonId(profile), "g5v1-l02");
});

test("lesson learning completes when every character passes the full mastery round", () => {
  const profile = emptyProfile();
  const words = homeCandidates.words.filter((candidate) => candidate.lessonId === firstLessonId);

  profile.completed.words = words.map((candidate) => candidate.id);
  assert.equal(isLessonLearningComplete(profile, firstLessonId), true);
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

test("the recognition check no longer repeats specialist structure, component, or writing items", async () => {
  const content = await loadLessonContent(firstLessonId);
  const character = content.characters.find((item) => item.primary && item.official !== false);
  const exercises = getTrackExercises(character, "words");

  assert.ok(exercises.length >= 2);
  assert.ok(exercises.every((exercise) => exercise.kind === "single"));
  assert.ok(getTrackExercises(character, "structure").some((exercise) => exercise.kind === "structure"));
  assert.ok(getTrackExercises(character, "split").some((exercise) => exercise.kind === "components"));
});

test("the character-card mastery check includes every canonical track without duplicate questions", async () => {
  const content = await loadLessonContent(firstLessonId);
  const characters = content.characters.filter((item) => item.primary && item.official !== false);

  for (const character of characters) {
    const steps = getPracticeSteps(character, "words", "mastery");
    const expected = ["words", "structure", "split", "honglan"]
      .flatMap((track) => getTrackExercises(character, track));
    assert.deepEqual(steps.map(({ exercise }) => exercise.id), expected.map((exercise) => exercise.id));
    assert.equal(new Set(steps.map(({ exercise }) => exercise.id)).size, steps.length);
    assert.ok(steps.length >= 5 && steps.length <= 7);
  }
});

test("every official character has one complete five-to-seven-question mastery check", () => {
  const distribution = new Map();
  for (const character of characters.filter((item) => item.official !== false)) {
    const steps = getPracticeSteps(character, "words", "mastery");
    assert.equal(new Set(steps.map(({ exercise }) => exercise.id)).size, steps.length);
    assert.ok(steps.length >= 5 && steps.length <= 7, `${character.hanzi} has ${steps.length} steps`);
    distribution.set(steps.length, (distribution.get(steps.length) ?? 0) + 1);
  }
  assert.deepEqual(Object.fromEntries(distribution), { 5: 130, 6: 234, 7: 1 });
});
