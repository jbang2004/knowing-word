import assert from "node:assert/strict";
import test from "node:test";
import {
  candidatePathStates,
  firstUnpassedQuestionIndex,
  isQuestionSetComplete,
  nextCandidateId,
  nextResumeIndex,
  updatePassedQuestionIds,
  updateCompletion,
} from "../app/lib/progress-model.ts";

test("a lesson path has exactly one current item even when resume skips an unfinished item", () => {
  assert.deepEqual(
    candidatePathStates(["鹭", "嫌", "嵌", "匣"], [], "嵌"),
    { 鹭: "locked", 嫌: "locked", 嵌: "current", 匣: "locked" },
  );
  assert.deepEqual(
    candidatePathStates(["鹭", "嫌", "嵌"], ["鹭"], "missing"),
    { 鹭: "done", 嫌: "current", 嵌: "locked" },
  );
  assert.deepEqual(
    candidatePathStates(["鹭", "嫌"], ["鹭", "嫌"], "嫌"),
    { 鹭: "done", 嫌: "done" },
  );
});

test("resume stays on an unfinished character and the exact unanswered question", () => {
  assert.equal(nextCandidateId(["桂", "花", "故"], ["桂"], "花"), "花");
  assert.equal(nextResumeIndex(2, 5, false), 2);
  assert.equal(nextResumeIndex(2, 5, true), 3);
  assert.equal(nextResumeIndex(4, 5, true), 4);
});

test("a practice round tracks only questions passed in that round", () => {
  let passed = updatePassedQuestionIds([], "q1", true);
  assert.deepEqual(passed, ["q1"]);
  assert.equal(firstUnpassedQuestionIndex(["q1", "q2", "q3"], passed), 1);

  passed = updatePassedQuestionIds(passed, "q2", true);
  passed = updatePassedQuestionIds(passed, "q2", false);
  assert.deepEqual(passed, ["q1"]);
  assert.equal(firstUnpassedQuestionIndex(["q1"], passed), -1);
});

test("completion records a passed round without being erased by later review", () => {
  const latest = { q1: { lastCorrect: true }, q2: { lastCorrect: true } };
  assert.equal(isQuestionSetComplete(["q1", "q2"], "q2", true, latest), true);
  assert.deepEqual(updateCompletion([], "桂", true), ["桂"]);

  const afterWrong = { ...latest, q2: { lastCorrect: false } };
  assert.equal(isQuestionSetComplete(["q1", "q2"], "q2", false, afterWrong), false);
  assert.deepEqual(updateCompletion(["桂", "花"], "桂", false), ["桂", "花"]);
});
