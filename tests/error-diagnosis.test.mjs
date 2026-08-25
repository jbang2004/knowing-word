import assert from "node:assert/strict";
import test from "node:test";
import {
  diagnoseError,
  diagnoseErrors,
  errorDiagnosisByTag,
  remediationActivities,
  remediationGuidanceFor,
} from "../app/domain/error-diagnosis.ts";
import {
  errorTags,
  skillDimensions,
} from "../app/domain/learning-state.ts";

test("every error tag has one valid target dimension and remediation", () => {
  assert.deepEqual(Object.keys(errorDiagnosisByTag).sort(), [...errorTags].sort());

  for (const tag of errorTags) {
    const diagnosis = diagnoseError(tag);
    assert.equal(diagnosis.tag, tag);
    assert.ok(skillDimensions.includes(diagnosis.targetDimension));
    assert.ok(remediationActivities.includes(diagnosis.activity));
  }
});

test("pronunciation, form, confusion, and context errors route independently", () => {
  assert.deepEqual(diagnoseError("pronunciation-tone"), {
    tag: "pronunciation-tone",
    targetDimension: "phonology",
    activity: "pronunciation-contrast",
  });
  assert.equal(diagnoseError("component-position").targetDimension, "generation");
  assert.equal(diagnoseError("homophone-confusion").targetDimension, "discrimination");
  assert.equal(diagnoseError("context-misuse").targetDimension, "context");
});

test("diagnosing a list preserves first-seen order and removes duplicates", () => {
  assert.deepEqual(
    diagnoseErrors([
      "stroke-missing",
      "pronunciation-tone",
      "stroke-missing",
    ]).map(({ tag }) => tag),
    ["stroke-missing", "pronunciation-tone"],
  );
});

test("a diagnosis produces a concrete corrective action rather than a generic retry", () => {
  assert.deepEqual(remediationGuidanceFor(["phonetic-component"]), {
    activity: "phonetic-component-review",
    targetDimension: "phonology",
    title: "核实声旁线索",
    instruction: "用声旁猜一个大致读音，再回到词语核实；声旁只是概率线索，不保证同音同调。",
  });
  assert.match(remediationGuidanceFor(["stroke-missing"]).instruction, /空书一次/);
  assert.equal(remediationGuidanceFor([]), null);
});
