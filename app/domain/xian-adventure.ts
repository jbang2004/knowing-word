import type { ErrorTag, SkillDimension } from "./learning-state.ts";

export const XIAN_CHARACTER_ID = "g5v1-l01-c02-u5acc";
export const XIAN_GAME_PREFIX = `${XIAN_CHARACTER_ID}-game-v1`;
export const XIAN_ACQUISITION_CUE = 1 as const;

export type XianObjectiveId =
  | "recognition"
  | "phonology"
  | "semantics"
  | "generation"
  | "discrimination"
  | "context";

export type XianObjective = {
  id: XianObjectiveId;
  questionId: string;
  dimension: SkillDimension;
};

export const xianObjectives: readonly XianObjective[] = [
  { id: "recognition", questionId: `${XIAN_GAME_PREFIX}-recognition`, dimension: "recognition" },
  { id: "phonology", questionId: `${XIAN_GAME_PREFIX}-phonology`, dimension: "phonology" },
  { id: "semantics", questionId: `${XIAN_GAME_PREFIX}-semantics`, dimension: "semantics" },
  { id: "generation", questionId: `${XIAN_GAME_PREFIX}-generation`, dimension: "generation" },
  { id: "discrimination", questionId: `${XIAN_GAME_PREFIX}-discrimination`, dimension: "discrimination" },
  { id: "context", questionId: `${XIAN_GAME_PREFIX}-context`, dimension: "context" },
] as const;

export const xianWritingQuestionId = `${XIAN_GAME_PREFIX}-writing`;

export const detectiveOptions = ["嫌", "闲", "谦", "歉"] as const;
export const soundOptions = ["xián", "xiàn", "qiān", "jiān"] as const;
export const forgeParts = ["女", "兼", "讠", "欠", "门"] as const;

export function detectiveErrorTags(value: string): ErrorTag[] {
  if (value === "闲") return ["homophone-confusion"];
  if (value === "谦") return ["lookalike-confusion", "phonetic-component"];
  if (value === "歉") return ["lookalike-confusion", "pronunciation-tone"];
  return [];
}

export function soundErrorTags(value: string): ErrorTag[] {
  return value === "xiàn" ? ["pronunciation-tone"] : ["pronunciation-initial"];
}

export function forgeErrorTags(parts: readonly string[]): ErrorTag[] {
  if (parts.length === 2 && parts[0] === "兼" && parts[1] === "女") return ["component-position"];
  const tags: ErrorTag[] = [];
  if (!parts.includes("女") || !parts.includes("兼")) tags.push("component-missing");
  if (parts.some((part) => part !== "女" && part !== "兼")) tags.push("component-extra");
  return tags.length ? tags : ["component-position"];
}

export function discriminationErrorTags(value: string): ErrorTag[] {
  if (value === "闲") return ["homophone-confusion", "context-misuse"];
  return ["lookalike-confusion", "context-misuse"];
}

export const historicalComponentNote = "“女”是历史字形中的表义部件，不表示女孩更爱嫌弃。";
