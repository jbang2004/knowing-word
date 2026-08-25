import assert from "node:assert/strict";
import test from "node:test";
import {
  getPracticeSteps,
  selectDueReviewSteps,
  selectRemediationStep,
} from "../app/domain/practice.ts";

function exercise(id, dimension, {
  answerMode = "choice",
  cueLevel = 0,
  concealTarget = false,
  kind = "single",
} = {}) {
  return {
    id,
    origin: "识字小测",
    kind,
    questionType: "single_select",
    prompt: id,
    options: [],
    explanation: "",
    dimension,
    answerMode,
    cueLevel,
    concealTarget,
  };
}

function step(id, dimension, options) {
  return {
    track: "words",
    exercise: exercise(id, dimension, options),
  };
}

test("due review filters non-due dimensions and emits one item per due dimension", () => {
  const selected = selectDueReviewSteps([
    step("recognition-not-due", "recognition"),
    step("context-first", "context"),
    step("context-duplicate", "context", { cueLevel: 1 }),
    step("generation-prompted", "generation", {
      answerMode: "handwriting",
      cueLevel: 3,
      kind: "write",
    }),
    step("generation-independent", "generation", {
      answerMode: "handwriting",
      cueLevel: 0,
      concealTarget: true,
      kind: "write",
    }),
  ], ["context", "generation", "context"]);

  assert.deepEqual(
    selected.map(({ exercise: item }) => item.id),
    ["context-first", "generation-independent"],
  );
  assert.equal(new Set(selected.map(({ exercise: item }) => item.dimension)).size, 2);
});

test("due review prefers cue-free active retrieval and preserves urgency order", () => {
  const selected = selectDueReviewSteps([
    step("meaning-choice", "semantics"),
    step("meaning-speech", "semantics", { answerMode: "speech" }),
    step("shape-cued", "discrimination", { cueLevel: 1 }),
    step("shape-independent", "discrimination", { cueLevel: 0 }),
  ], ["discrimination", "semantics"]);

  assert.deepEqual(
    selected.map(({ exercise: item }) => item.id),
    ["shape-independent", "meaning-speech"],
  );
  assert.deepEqual(selectDueReviewSteps(selected, ["phonology"]), []);
});

test("objective generation is primary evidence while both writing passes remain in mastery", () => {
  const objective = {
    ...exercise("objective-components", "generation", {
      answerMode: "choice",
      cueLevel: 0,
    }),
    origin: "科学复习",
  };
  const guided = {
    ...exercise("guided-copy", "generation", {
      answerMode: "handwriting",
      cueLevel: 3,
      kind: "write",
    }),
    origin: "识字小测",
  };
  const concealed = {
    ...exercise("concealed-write", "generation", {
      answerMode: "handwriting",
      cueLevel: 0,
      concealTarget: true,
      kind: "write",
    }),
    origin: "拆一拆",
  };
  const candidates = [
    { exercise: concealed, track: "split" },
    { exercise: objective, track: "words" },
  ];

  assert.equal(
    selectDueReviewSteps(candidates, ["generation"])[0].exercise.id,
    "objective-components",
  );
  assert.deepEqual(
    getPracticeSteps({ exercises: [guided, objective, concealed] }, "words", "mastery")
      .map(({ exercise: item }) => item.id),
    ["guided-copy", "objective-components", "concealed-write"],
  );
});

test("diagnosed remediation changes activity and targets the diagnosed dimension", () => {
  const sameDimension = selectRemediationStep([
    step("failed-meaning", "semantics", { answerMode: "speech" }),
    step("meaning-in-a-new-form", "semantics", { cueLevel: 1 }),
    step("unrelated-shape", "discrimination"),
  ], ["meaning-unknown"], "failed-meaning");

  assert.equal(sameDimension.targetDimension, "semantics");
  assert.equal(sameDimension.activity, "meaning-retrieval");
  assert.equal(sameDimension.step.exercise.id, "meaning-in-a-new-form");

  const crossDimension = selectRemediationStep([
    step("failed-structure", "discrimination"),
    step("generation-cued", "generation", { cueLevel: 2 }),
    step("generation-rebuild", "generation", { cueLevel: 0 }),
  ], ["component-position"], "failed-structure");

  assert.equal(crossDimension.targetDimension, "generation");
  assert.equal(crossDimension.activity, "component-rebuild");
  assert.equal(crossDimension.step.exercise.id, "generation-rebuild");
  assert.equal(selectRemediationStep([], ["component-position"], "failed"), null);
});
