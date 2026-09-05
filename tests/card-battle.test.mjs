import assert from "node:assert/strict";
import test from "node:test";

const {
  BATTLE_BOSSES, BATTLE_CARDS, buildBattleQuestions, createBattleState,
  getCurrentQuestion, getBossIntent, selectBattleCard, cancelBattleCard,
  answerBattleQuestion, advanceBattle,
} = await import(process.env.CARD_BATTLE_MODULE || "../app/lib/card-battle.ts");
const { grade5Characters } = await import(process.env.CARD_BATTLE_CATALOG || "../app/data/generated/grade5-volume1/all-characters.ts");
const questions = buildBattleQuestions(grade5Characters);
const play = (state, id = "ember", correct = true) => {
  const selected = selectBattleCard(state, id);
  const answer = getCurrentQuestion(selected).options.find((option) => option.correct === correct);
  return answerBattleQuestion(selected, answer.id);
};

test("all 26 lessons supply real textual single-answer questions without altering source", () => {
  assert.equal(new Set(questions.map((question) => question.lessonId)).size, 26);
  assert.equal(new Set(questions.map((question) => question.id)).size, questions.length);
  const original = new Map(grade5Characters.flatMap((character) => character.exercises.map((exercise) => [exercise.id, exercise])));
  for (const question of questions) {
    const source = original.get(question.id);
    assert.equal(question.prompt, source.prompt);
    assert.equal(question.explanation, source.explanation);
    assert.equal(question.options.filter((option) => option.correct).length, 1);
    assert.ok(question.options.every((option) => option.text.trim()));
    assert.equal(source.options.find((option) => option.correct).id, question.options.find((option) => option.correct).id);
  }
  assert.deepEqual(buildBattleQuestions(grade5Characters, 14), buildBattleQuestions(grade5Characters, 14));
  assert.notDeepEqual(buildBattleQuestions(grade5Characters, 14).slice(0, 4), questions.slice(0, 4));
});

test("answer commits once and invalid actions cannot skip turns or consume cards", () => {
  const start = createBattleState(questions);
  assert.equal(answerBattleQuestion(start, "invalid"), start);
  assert.equal(advanceBattle(start), start);
  const selected = selectBattleCard(start, "ember");
  assert.equal(answerBattleQuestion(selected, "invalid"), selected);
  assert.equal(cancelBattleCard(selected).phase, "ready");
  const result = play(start);
  assert.equal(result.bossHp, 74);
  assert.equal(result.playerHp, 92);
  assert.equal(result.answeredQuestions, 1);
  assert.equal(answerBattleQuestion(result, result.lastResult.optionId), result);
  assert.equal(start.bossHp, 96);
});

test("wrong answers fail the spell, reset combos, and incur the announced attack plus six", () => {
  const start = { ...createBattleState(questions), combo: 3, playerHp: 60 };
  const result = play(start, "bloom", false);
  assert.equal(result.bossHp, start.bossHp);
  assert.equal(result.playerHp, 46);
  assert.equal(result.combo, 0);
  assert.equal(result.lastResult.healed, 0);
  assert.equal(result.lastResult.correct, false);
});

test("shield absorbs heavy attacks and healing never exceeds player max health", () => {
  const start = { ...createBattleState(questions), turn: 3 };
  assert.equal(getBossIntent(start).damage, 20);
  const defended = play(start, "aegis");
  assert.equal(defended.lastResult.blocked, 18);
  assert.equal(defended.playerHp, 98);
  const healed = play({ ...start, playerHp: 96, turn: 2 }, "bloom");
  assert.equal(healed.playerHp, 100);
  assert.equal(healed.lastResult.healed, 4);
});

test("cooldowns require the advertised number of intervening turns", () => {
  let state = advanceBattle(play(createBattleState(questions), "thunder"));
  assert.equal(state.cooldowns.thunder, 2);
  assert.equal(selectBattleCard(state, "thunder"), state);
  state = advanceBattle(play(state, "aegis"));
  assert.equal(state.cooldowns.thunder, 1);
  state = advanceBattle(play(state, "aegis"));
  assert.equal(state.cooldowns.thunder, 0);
  assert.equal(selectBattleCard(state, "thunder").phase, "question");
});

test("three boss run is winnable, bosses grant recovery and victory cannot advance", () => {
  let state = createBattleState(questions);
  let defeated = 0;
  let safety = 0;
  while (state.phase !== "victory" && safety++ < 80) {
    const intent = getBossIntent(state);
    const card = intent.damage >= 20 ? "aegis" : state.playerHp < 78 && !state.cooldowns.bloom
      ? "bloom" : !state.cooldowns.thunder ? "thunder" : "ember";
    state = play(state, card);
    assert.notEqual(state.phase, "defeat");
    if (state.phase === "boss-defeated") {
      defeated++;
      const oldHp = state.playerHp;
      const next = advanceBattle(state);
      assert.equal(next.playerHp, Math.min(100, oldHp + 24));
      assert.equal(next.bossHp, BATTLE_BOSSES[next.bossIndex].maxHp);
      state = next;
    } else state = advanceBattle(state);
  }
  assert.equal(defeated, 2);
  assert.equal(state.phase, "victory");
  assert.equal(state.bossHp, 0);
  assert.equal(advanceBattle(state), state);
  assert.ok(state.correctAnswers > 10);
});

test("repeated mistakes lose and restart clears all transient state", () => {
  let state = createBattleState(questions);
  for (let i = 0; i < 30 && state.phase !== "defeat"; i++) state = advanceBattle(play(state, "ember", false));
  assert.equal(state.phase, "defeat");
  assert.equal(state.playerHp, 0);
  assert.equal(selectBattleCard(state, "ember"), state);
  const restarted = createBattleState(state.questions);
  assert.equal(restarted.playerHp, 100);
  assert.equal(restarted.bossIndex, 0);
  assert.equal(restarted.lastResult, null);
  assert.equal(restarted.answeredQuestions, 0);
  assert.ok(BATTLE_CARDS.every((card) => restarted.cooldowns[card.id] === 0));
  assert.throws(() => createBattleState([]), /至少一道/);
});
