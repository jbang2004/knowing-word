import assert from "node:assert/strict";
import test from "node:test";

test("lesson 3 has a complete, conservative teaching plan for all official glyphs", async () => {
  const { characters } = await import(
    new URL("../app/data/catalog.ts", import.meta.url).href,
  );
  const { LESSON_THREE_ID, lessonThreeKnowledge } = await import(
    new URL("../app/data/lesson3-literacy.ts", import.meta.url).href,
  );

  const officialGlyphs = characters
    .filter((character) => character.lessonId === LESSON_THREE_ID && character.primary && character.official !== false)
    .map((character) => character.hanzi);

  assert.deepEqual(new Set(Object.keys(lessonThreeKnowledge)), new Set(officialGlyphs));
  assert.equal(officialGlyphs.length, 11);

  const plans = Object.values(lessonThreeKnowledge);
  assert.equal(plans.filter((plan) => plan.method === "phonosemantic").length, 7);
  assert.equal(plans.filter((plan) => plan.method === "structure").length, 4);

  for (const plan of plans) {
    assert.ok(plan.explanation.length >= 20, `${plan.hanzi} needs a child-friendly explanation`);
    assert.match(plan.evidence, /字形|字源|历史/);
    assert.ok(plan.components.length >= 2, `${plan.hanzi} needs explicit component roles`);
    if (plan.method === "phonosemantic") {
      assert.ok(plan.components.some((component) => component.role === "semantic"));
      assert.ok(plan.components.some((component) => component.role === "phonetic"));
    } else {
      assert.equal(plan.components.some((component) => component.role === "phonetic"), false);
    }
  }
});

test("lesson 3 structural routes do not turn mnemonic pictures into etymology", async () => {
  const { lessonThreeKnowledge } = await import(
    new URL("../app/data/lesson3-literacy.ts", import.meta.url).href,
  );

  for (const glyph of ["兰", "浸", "缠", "茶"]) {
    const plan = lessonThreeKnowledge[glyph];
    assert.equal(plan.method, "structure");
    assert.match(plan.evidence, /不|只/);
    assert.doesNotMatch(plan.explanation, /造字时|演变成|最初画的是/);
  }
});
