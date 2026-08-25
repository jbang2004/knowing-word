export const skillDimensions = [
  "recognition",
  "phonology",
  "semantics",
  "generation",
  "discrimination",
  "context",
] as const;

export type SkillDimension = typeof skillDimensions[number];

export const errorTags = [
  "pronunciation-initial",
  "pronunciation-final",
  "pronunciation-tone",
  "meaning-unknown",
  "semantic-component",
  "phonetic-component",
  "component-missing",
  "component-extra",
  "component-position",
  "stroke-missing",
  "stroke-extra",
  "homophone-confusion",
  "lookalike-confusion",
  "context-misuse",
  "writing-unverified",
] as const;

export type ErrorTag = typeof errorTags[number];

export const answerModes = [
  "choice",
  "speech",
  "handwriting",
  "self-check",
] as const;

export type AnswerMode = typeof answerModes[number];

export type LearningAttempt = {
  characterId: string;
  questionId: string;
  dimension: SkillDimension;
  cueLevel: 0 | 1 | 2 | 3;
  answerMode: AnswerMode;
  correct: boolean | null;
  latencyMs: number;
  errorTags: ErrorTag[];
  occurredAt: string;
};

export type DimensionMemory = {
  status: "new" | "learning" | "review" | "stable";
  dueAt: string;
  intervalDays: number;
  lapses: number;
  correctStreak: number;
  independentStreak: number;
  lastAt: string | null;
  lastIndependentCorrectAt: string | null;
};

export type CharacterMemory = Record<SkillDimension, DimensionMemory>;

export function emptyDimensionMemory(): DimensionMemory {
  return {
    status: "new",
    dueAt: "",
    intervalDays: 0,
    lapses: 0,
    correctStreak: 0,
    independentStreak: 0,
    lastAt: null,
    lastIndependentCorrectAt: null,
  };
}

export function emptyCharacterMemory(): CharacterMemory {
  return Object.fromEntries(
    skillDimensions.map((dimension) => [dimension, emptyDimensionMemory()]),
  ) as CharacterMemory;
}

export function isIndependentAttempt(
  attempt: Pick<LearningAttempt, "cueLevel" | "correct" | "answerMode">,
) {
  // Independent evidence must be both unprompted and objectively checkable.
  // A handwriting self-check is useful practice, but the app cannot verify
  // the glyph and therefore must never promote it to long-term stable mastery.
  return attempt.correct === true &&
    attempt.cueLevel === 0 &&
    attempt.answerMode !== "self-check";
}
