import assert from "node:assert/strict";
import test from "node:test";
import {
  isQuestionSetComplete,
  nextCandidateId,
  nextResumeIndex,
  updateCompletion,
} from "../app/lib/progress-model.ts";

test("resume stays on an unfinished character and the exact unanswered question", () => {
  assert.equal(nextCandidateId(["桂", "花", "故"], ["桂"], "花"), "花");
  assert.equal(nextResumeIndex(2, 5, false), 2);
  assert.equal(nextResumeIndex(2, 5, true), 3);
  assert.equal(nextResumeIndex(4, 5, true), 4);
});

test("completed state reflects the latest full question set", () => {
  const latest = { q1: { lastCorrect: true }, q2: { lastCorrect: true } };
  assert.equal(isQuestionSetComplete(["q1", "q2"], "q2", true, latest), true);
  assert.deepEqual(updateCompletion([], "桂", true), ["桂"]);

  const afterWrong = { ...latest, q2: { lastCorrect: false } };
  assert.equal(isQuestionSetComplete(["q1", "q2"], "q2", false, afterWrong), false);
  assert.deepEqual(updateCompletion(["桂", "花"], "桂", false), ["花"]);
});
