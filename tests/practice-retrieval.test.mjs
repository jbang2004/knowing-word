import assert from "node:assert/strict";
import test from "node:test";
import {
  concealTargetText,
  isPracticeAnswerCorrect,
  practiceCueLevel,
  stableOptionOrder,
  updatePracticeSelection,
  writingRetrievalText,
} from "../app/domain/practice.ts";
import {
  handwritingErrorTags,
  isHandwritingComplete,
  isHandwritingCorrect,
} from "../app/domain/handwriting.ts";

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

test("split assembly can reuse a component when the written form repeats it", () => {
  const repeatedCharacter = {
    ...character,
    hanzi: "幽",
    parts: [
      { char: "幺", radical: true },
      { char: "幺", radical: true },
      { char: "山", radical: false },
    ],
  };
  const repeatedQuestion = {
    ...writeQuestion,
    kind: "components",
    options: [
      { id: "silk", text: "幺", correct: true, radical: true, idcCode: "" },
      { id: "mountain", text: "山", correct: true, radical: false, idcCode: "" },
      { id: "wood", text: "木", correct: false, radical: false, idcCode: "" },
    ],
  };
  let selected = updatePracticeSelection(repeatedQuestion, repeatedCharacter, "split", [], "silk");
  selected = updatePracticeSelection(repeatedQuestion, repeatedCharacter, "split", selected, "silk");
  selected = updatePracticeSelection(repeatedQuestion, repeatedCharacter, "split", selected, "mountain");
  assert.deepEqual(selected, ["silk", "silk", "mountain"]);
  assert.equal(isPracticeAnswerCorrect(repeatedQuestion, repeatedCharacter, "split", selected, false), true);
});

test("handwriting is correct after every expected stroke is eventually accepted", () => {
  const correctAttempt = {
    acceptedStrokes: 8,
    expectedStrokes: 8,
    mistakes: 0,
    backwardsMistakes: 0,
    complete: true,
  };
  assert.equal(isPracticeAnswerCorrect(writeQuestion, character, "split", [], true), false);
  assert.equal(
    isPracticeAnswerCorrect(writeQuestion, character, "split", [], true, {
      ...correctAttempt,
      acceptedStrokes: 7,
      complete: false,
    }),
    false,
  );
  assert.equal(
    isPracticeAnswerCorrect(writeQuestion, character, "split", [], true, {
      ...correctAttempt,
      mistakes: 1,
    }),
    true,
  );
  assert.equal(
    isPracticeAnswerCorrect(writeQuestion, character, "split", [], true, {
      ...correctAttempt,
      backwardsMistakes: 1,
    }),
    true,
  );
  assert.equal(isPracticeAnswerCorrect(writeQuestion, character, "split", [], false, correctAttempt), false);
  assert.equal(isPracticeAnswerCorrect(writeQuestion, character, "split", [], true, correctAttempt), true);
  assert.equal(isHandwritingCorrect(correctAttempt), true);
  assert.equal(isHandwritingCorrect({ ...correctAttempt, mistakes: 2, backwardsMistakes: 1 }), true);
  assert.equal(isHandwritingComplete({ ...correctAttempt, acceptedStrokes: 7, complete: false }), false);
  assert.equal(isHandwritingComplete({ ...correctAttempt, mistakes: 2, backwardsMistakes: 1 }), true);
});

test("verified handwriting failures record stroke-specific error tags", () => {
  assert.deepEqual(
    handwritingErrorTags({
      acceptedStrokes: 4,
      expectedStrokes: 8,
      mistakes: 0,
      backwardsMistakes: 0,
      complete: false,
    }),
    ["stroke-missing"],
  );
  assert.deepEqual(
    handwritingErrorTags({
      acceptedStrokes: 4,
      expectedStrokes: 8,
      mistakes: 2,
      backwardsMistakes: 0,
      complete: false,
    }),
    ["stroke-missing", "stroke-extra"],
  );
  assert.deepEqual(handwritingErrorTags({
    acceptedStrokes: 8,
    expectedStrokes: 8,
    mistakes: 2,
    backwardsMistakes: 1,
    complete: true,
  }), []);
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
