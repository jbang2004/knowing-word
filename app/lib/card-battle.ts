import type { CharacterItem, Exercise } from "../data/catalog-types.ts";

export type BattleCardId = "ember" | "thunder" | "aegis" | "bloom" | "star";
export type BattleCard = {
  id: BattleCardId; name: string; subtitle: string; kind: "attack" | "shield" | "heal";
  damage: number; shield: number; heal: number; cooldown: number; description: string;
};
export const BATTLE_CARDS: readonly BattleCard[] = [
  { id: "ember", name: "焰羽斩", subtitle: "PHOENIX STRIKE", kind: "attack", damage: 22, shield: 0, heal: 0, cooldown: 0, description: "造成 22 点伤害" },
  { id: "aegis", name: "月华结界", subtitle: "LUNAR AEGIS", kind: "shield", damage: 8, shield: 18, heal: 0, cooldown: 0, description: "获得 18 点护盾，造成 8 点伤害" },
  { id: "thunder", name: "天雷敕", subtitle: "CELESTIAL THUNDER", kind: "attack", damage: 34, shield: 0, heal: 0, cooldown: 2, description: "造成 34 点伤害 · 冷却 2 回合" },
  { id: "bloom", name: "森灵赐福", subtitle: "SPIRIT BLOOM", kind: "heal", damage: 6, shield: 0, heal: 18, cooldown: 1, description: "恢复 18 点生命，造成 6 点伤害 · 冷却 1 回合" },
  { id: "star", name: "星河共鸣", subtitle: "ASTRAL RESONANCE", kind: "heal", damage: 16, shield: 0, heal: 8, cooldown: 0, description: "造成 16 点伤害，恢复 8 点生命" },
];
export type BossIntent = { name: string; damage: number; description: string; kind: "attack" | "charge" | "heavy" };
export type BattleBoss = { id: string; name: string; title: string; subtitle: string; maxHp: number; description: string; intents: readonly BossIntent[] };
export const BATTLE_BOSSES: readonly BattleBoss[] = [
  { id: "mist", name: "墨羽书灵", title: "第一章 · 墨隐之庭", subtitle: "THE INK GUARDIAN", maxHp: 96, description: "守护文字的书灵，盘踞于失落书庭。",
    intents: [{ name: "墨息", damage: 8, description: "下次结算造成 8 点伤害", kind: "attack" }, { name: "凝墨", damage: 0, description: "本回合蓄力，下回合施放墨潮", kind: "charge" }, { name: "墨潮", damage: 20, description: "下次结算造成 20 点伤害，适合使用护盾", kind: "heavy" }] },
  { id: "moon", name: "月蚀霜龙", title: "第二章 · 霜月秘境", subtitle: "THE MOON VEIL", maxHp: 128, description: "以幻象扰乱字形，在月下等待破绽。",
    intents: [{ name: "霜刃", damage: 12, description: "下次结算造成 12 点伤害", kind: "attack" }, { name: "月蚀", damage: 22, description: "下次结算造成 22 点伤害，注意保护生命", kind: "heavy" }, { name: "镜月", damage: 0, description: "幻象凝聚中，趁机进攻或治疗", kind: "charge" }, { name: "霜袭", damage: 14, description: "下次结算造成 14 点伤害", kind: "attack" }] },
  { id: "void", name: "烬日神凰", title: "终章 · 星烬王座", subtitle: "THE ASHEN SOVEREIGN", maxHp: 160, description: "守在文字星河尽头的最后一位神凰。",
    intents: [{ name: "烬火", damage: 14, description: "下次结算造成 14 点伤害", kind: "attack" }, { name: "星陨", damage: 26, description: "下次结算造成 26 点伤害，护盾可抵挡", kind: "heavy" }, { name: "聚焰", damage: 0, description: "正在聚焰，这是恢复生命的机会", kind: "charge" }, { name: "焚天", damage: 30, description: "下次结算造成 30 点伤害，准备防御", kind: "heavy" }] },
];

export type BattleQuestion = {
  id: string; characterId: string; hanzi: string; lessonId: string; lessonTitle: string;
  prompt: string; explanation: string; dimension: Exercise["dimension"];
  options: { id: string; text: string; correct: boolean }[];
};

function shuffle<T>(values: readonly T[], seed: number): T[] {
  const result = [...values];
  let state = seed >>> 0;
  for (let i = result.length - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = Math.floor((state / 4294967296) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Adapt canonical textual choice exercises, excluding image-only and multi-answer items. */
export function buildBattleQuestions(characters: readonly CharacterItem[], seed = 2026): BattleQuestion[] {
  const seen = new Set<string>();
  const questions = characters.flatMap((character) => character.exercises.flatMap((exercise) => {
    if (seen.has(exercise.id) || exercise.kind === "write" ||
      (exercise.answerMode && exercise.answerMode !== "choice") ||
      exercise.options.length < 2 || exercise.options.some((option) => !option.text.trim()) ||
      exercise.options.filter((option) => option.correct).length !== 1) return [];
    seen.add(exercise.id);
    return [{ id: exercise.id, characterId: character.id, hanzi: character.hanzi,
      lessonId: character.lessonId, lessonTitle: character.lessonTitle, prompt: exercise.prompt,
      explanation: exercise.explanation, dimension: exercise.dimension,
      options: shuffle(exercise.options.map(({ id, text, correct }) => ({ id, text, correct })), seed + seen.size * 31) }];
  }));
  return shuffle(questions, seed);
}

export type BattlePhase = "ready" | "question" | "result" | "boss-defeated" | "victory" | "defeat";
export type BattleResult = {
  correct: boolean; optionId: string; correctOptionId: string; cardId: BattleCardId;
  damageDealt: number; damageTaken: number; healed: number; shieldGained: number; blocked: number;
};
export type BattleState = {
  phase: BattlePhase; playerHp: number; playerMaxHp: number; shield: number; bossIndex: number;
  bossHp: number; turn: number; combo: number; correctAnswers: number; answeredQuestions: number;
  questionIndex: number; questions: readonly BattleQuestion[]; selectedCardId: BattleCardId | null;
  cooldowns: Record<BattleCardId, number>; lastResult: BattleResult | null;
};
export function createBattleState(questions: readonly BattleQuestion[]): BattleState {
  if (!questions.length) throw new Error("卡牌试炼需要至少一道有效题目");
  return { phase: "ready", playerHp: 100, playerMaxHp: 100, shield: 0, bossIndex: 0,
    bossHp: BATTLE_BOSSES[0].maxHp, turn: 1, combo: 0, correctAnswers: 0, answeredQuestions: 0,
    questionIndex: 0, questions, selectedCardId: null,
    cooldowns: { ember: 0, thunder: 0, aegis: 0, bloom: 0, star: 0 }, lastResult: null };
}
export function getCurrentQuestion(state: BattleState): BattleQuestion {
  return state.questions[state.questionIndex % state.questions.length];
}
export function getBossIntent(state: BattleState): BossIntent {
  const boss = BATTLE_BOSSES[state.bossIndex];
  return boss.intents[(state.turn - 1) % boss.intents.length];
}
export function selectBattleCard(state: BattleState, cardId: BattleCardId): BattleState {
  if (state.phase !== "ready" || !BATTLE_CARDS.some((card) => card.id === cardId) || state.cooldowns[cardId] > 0) return state;
  return { ...state, phase: "question", selectedCardId: cardId };
}
export function cancelBattleCard(state: BattleState): BattleState {
  return state.phase === "question" ? { ...state, phase: "ready", selectedCardId: null } : state;
}
export function answerBattleQuestion(state: BattleState, optionId: string): BattleState {
  if (state.phase !== "question" || !state.selectedCardId) return state;
  const question = getCurrentQuestion(state);
  const option = question.options.find((candidate) => candidate.id === optionId);
  if (!option) return state;
  const card = BATTLE_CARDS.find((candidate) => candidate.id === state.selectedCardId)!;
  const correct = option.correct;
  const combo = correct ? state.combo + 1 : 0;
  const damageDealt = correct ? Math.min(state.bossHp, card.damage + Math.min(12, (combo - 1) * 4)) : 0;
  const bossHp = state.bossHp - damageDealt;
  const healed = correct ? Math.min(state.playerMaxHp - state.playerHp, card.heal) : 0;
  const shieldGained = correct ? Math.min(36 - state.shield, card.shield) : 0;
  const incoming = bossHp === 0 ? 0 : getBossIntent(state).damage + (correct ? 0 : 6);
  const blocked = Math.min(state.shield + shieldGained, incoming);
  const damageTaken = Math.min(state.playerHp + healed, incoming - blocked);
  const playerHp = state.playerHp + healed - damageTaken;
  const phase: BattlePhase = playerHp === 0 ? "defeat" : bossHp === 0
    ? state.bossIndex === BATTLE_BOSSES.length - 1 ? "victory" : "boss-defeated" : "result";
  return { ...state, phase, playerHp, bossHp, combo, shield: state.shield + shieldGained - blocked,
    correctAnswers: state.correctAnswers + Number(correct), answeredQuestions: state.answeredQuestions + 1,
    cooldowns: { ...state.cooldowns, [card.id]: card.cooldown + 1 },
    lastResult: { correct, optionId, correctOptionId: question.options.find((candidate) => candidate.correct)!.id,
      cardId: card.id, damageDealt, damageTaken, healed, shieldGained, blocked } };
}
export function advanceBattle(state: BattleState): BattleState {
  if (state.phase !== "result" && state.phase !== "boss-defeated") return state;
  const nextBoss = state.phase === "boss-defeated";
  const bossIndex = state.bossIndex + Number(nextBoss);
  const cooldowns = { ...state.cooldowns };
  for (const id of Object.keys(cooldowns) as BattleCardId[]) cooldowns[id] = nextBoss ? 0 : Math.max(0, cooldowns[id] - 1);
  return { ...state, phase: "ready", bossIndex, bossHp: nextBoss ? BATTLE_BOSSES[bossIndex].maxHp : state.bossHp,
    playerHp: nextBoss ? Math.min(state.playerMaxHp, state.playerHp + 24) : state.playerHp,
    turn: nextBoss ? 1 : state.turn + 1, shield: nextBoss ? 0 : state.shield,
    questionIndex: state.questionIndex + 1, selectedCardId: null, cooldowns, lastResult: null };
}
