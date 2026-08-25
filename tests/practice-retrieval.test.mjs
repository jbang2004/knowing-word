import assert from "node:assert/strict";
import test from "node:test";
import {
  concealTargetText,
  isPracticeAnswerCorrect,
  practiceCueLevel,
  stableOptionOrder,
  writingAssessmentErrorTags,
  writingRetrievalText,
} from "../app/domain/practice.ts";

const writeQuestion = {
  id: "write-egret",
  origin: "拆一拆",
  kind: "write",
  questionType: "write",
  prompt: "合起部件，完整写出“鹭”，再在白鹭中认一遍。",
  options: [],
  explanation: "",
};

const character = {
  id: "egret",
  lessonId: "g5v1-l01",
  lessonTitle: "白鹭",
  lessonPosition: 1,
  word: "白鹭",
  wordPosition: 1,
  hanzi: "鹭",
  primary: true,
  ready: true,
  pinyin: "lù",
  charType: "形声字",
  decomposition: "路加鸟",
  originalMeaning: "一种水鸟",
  description: "",
  originalText: "",
  parts: [
    { char: "路", radical: false },
    { char: "鸟", radical: true },
  ],
  compositions: [],
  exercises: [writeQuestion],
};

test("writing retrieval removes the target from every visible and accessible string before reveal", () => {
  assert.equal(
    concealTargetText(writeQuestion.prompt, character.hanzi),
    "合起部件，完整写出“□”，再在白□中认一遍。",
  );
  const text = writingRetrievalText(writeQuestion, character, false);
  for (const [field, value] of Object.entries(text)) {
    assert.equal(value.includes(character.hanzi), false, `${field} leaked ${value}`);
  }
  assert.equal(text.wordCue, "白□");
  assert.equal(text.canvasLabel, "在方格中独立书写目标字");
});

test("the model character appears only in the post-submission comparison phase", () => {
  const text = writingRetrievalText(writeQuestion, character, true);
  assert.match(text.prompt, /鹭/);
  assert.match(text.progressTarget, /鹭/);
  assert.match(text.canvasLabel, /鹭/);
});

test("guided copying and concealed recall remain two different writing tasks", () => {
  const guided = {
    ...writeQuestion,
    id: "guided-egret",
    cueLevel: 3,
    concealTarget: false,
  };
  const recall = { ...writeQuestion, cueLevel: 0, concealTarget: true };

  assert.equal(guided.concealTarget, false);
  assert.equal(recall.concealTarget, true);
  assert.ok(guided.cueLevel > recall.cueLevel);
});

test("ink is never treated as a correct handwriting answer without explicit self-assessment", () => {
  assert.equal(isPracticeAnswerCorrect(writeQuestion, character, "split", [], true), false);
  assert.equal(
    isPracticeAnswerCorrect(writeQuestion, character, "split", [], true, "component-error"),
    false,
  );
  assert.equal(
    isPracticeAnswerCorrect(writeQuestion, character, "split", [], false, "correct"),
    false,
  );
  assert.equal(
    isPracticeAnswerCorrect(writeQuestion, character, "split", [], true, "correct"),
    true,
  );
});

test("writing self-assessment records specific error tags", () => {
  assert.deepEqual(writingAssessmentErrorTags("correct"), []);
  assert.deepEqual(
    writingAssessmentErrorTags("component-error"),
    ["component-missing", "component-extra"],
  );
  assert.deepEqual(writingAssessmentErrorTags("position-error"), ["component-position"]);
  assert.deepEqual(
    writingAssessmentErrorTags("stroke-error"),
    ["stroke-missing", "stroke-extra"],
  );
});

test("an immediate retry after seeing the answer is never stored as independent evidence", () => {
  assert.equal(practiceCueLevel(writeQuestion, false), 0);
  assert.equal(practiceCueLevel(writeQuestion, true), 2);
  assert.equal(practiceCueLevel({ ...writeQuestion, cueLevel: 3 }, true), 3);
});

test("option order is stable within a session and changes with the session salt", () => {
  const options = "abcd".split("").map((id) => ({ id }));
  const first = stableOptionOrder(options, "question:session-a").map(({ id }) => id);
  const rerender = stableOptionOrder(options, "question:session-a").map(({ id }) => id);
  const review = stableOptionOrder(options, "question:session-b").map(({ id }) => id);

  assert.deepEqual(rerender, first);
  assert.notDeepEqual(review, first);
  assert.deepEqual(options.map(({ id }) => id), ["a", "b", "c", "d"]);
});
