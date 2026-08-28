import type {
  AnswerMode,
  CharacterMemory,
  DimensionMemory,
  ErrorTag,
  Exercise,
  SkillDimension,
  StudyProfile,
  TrackId,
} from "../types/models";

const DAY_MS = 24 * 60 * 60 * 1_000;
const RETRY_DELAY_MS = 5 * 60 * 1_000;
const STABLE_EVIDENCE_GAP_MS = 7 * DAY_MS;
const independentReviewIntervals = [1, 3, 7, 14, 30] as const;
const skillDimensions: SkillDimension[] = ["recognition", "phonology", "semantics", "generation", "discrimination", "context"];
const fluentResponseThresholdMs: Record<AnswerMode, number> = {
  choice: 15_000,
  speech: 15_000,
  handwriting: 45_000,
  "self-check": 45_000,
};
const errorDimension: Record<ErrorTag, SkillDimension> = {
  "pronunciation-initial": "phonology",
  "pronunciation-final": "phonology",
  "pronunciation-tone": "phonology",
  "meaning-unknown": "semantics",
  "semantic-component": "semantics",
  "phonetic-component": "phonology",
  "component-missing": "generation",
  "component-extra": "generation",
  "component-position": "generation",
  "stroke-missing": "generation",
  "stroke-extra": "generation",
  "homophone-confusion": "discrimination",
  "lookalike-confusion": "discrimination",
  "context-misuse": "context",
  "writing-unverified": "generation",
};

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

export function characterMemory(profile: Pick<StudyProfile, "memory">, characterId: string): CharacterMemory {
  return Object.fromEntries(skillDimensions.map((dimension) => [
    dimension,
    { ...emptyDimensionMemory(), ...(profile.memory[characterId]?.[dimension] ?? {}) },
  ])) as CharacterMemory;
}

function addDays(timestamp: number, days: number) {
  return new Date(timestamp + days * DAY_MS).toISOString();
}

function scheduleDimension(previous: DimensionMemory, attempt: {
  correct: boolean;
  cueLevel: 0 | 1 | 2 | 3;
  answerMode: AnswerMode;
  latencyMs: number;
  occurredAt: string;
}) {
  const timestamp = Date.parse(attempt.occurredAt);
  if (!Number.isFinite(timestamp)) throw new RangeError("invalid learning attempt timestamp");
  const occurredAt = new Date(timestamp).toISOString();
  if (!attempt.correct) {
    return {
      ...previous,
      status: "learning" as const,
      dueAt: new Date(timestamp + RETRY_DELAY_MS).toISOString(),
      intervalDays: 0,
      lapses: previous.lapses + 1,
      correctStreak: 0,
      independentStreak: 0,
      lastAt: occurredAt,
    };
  }
  const independent = attempt.cueLevel === 0 && attempt.answerMode !== "self-check";
  const fluent = Number.isFinite(attempt.latencyMs) && attempt.latencyMs >= 0
    && attempt.latencyMs <= fluentResponseThresholdMs[attempt.answerMode];
  if (!independent || !fluent) {
    return {
      ...previous,
      status: "learning" as const,
      dueAt: addDays(timestamp, 1),
      intervalDays: 1,
      correctStreak: previous.correctStreak + 1,
      independentStreak: 0,
      lastAt: occurredAt,
    };
  }
  const independentStreak = previous.independentStreak + 1;
  const intervalDays = independentReviewIntervals[Math.min(independentStreak - 1, independentReviewIntervals.length - 1)];
  const priorIndependentAt = previous.lastIndependentCorrectAt ? Date.parse(previous.lastIndependentCorrectAt) : Number.NaN;
  const stable = independentStreak >= 2 && Number.isFinite(priorIndependentAt)
    && timestamp - priorIndependentAt >= STABLE_EVIDENCE_GAP_MS;
  return {
    ...previous,
    status: stable ? "stable" as const : "review" as const,
    dueAt: addDays(timestamp, intervalDays),
    intervalDays,
    correctStreak: previous.correctStreak + 1,
    independentStreak,
    lastAt: occurredAt,
    lastIndependentCorrectAt: occurredAt,
  };
}

export function scheduleEvidence(previous: CharacterMemory, attempt: {
  dimension: SkillDimension;
  correct: boolean;
  cueLevel: 0 | 1 | 2 | 3;
  answerMode: AnswerMode;
  latencyMs: number;
  errorTags: ErrorTag[];
  occurredAt: string;
}) {
  const dimensions = new Set<SkillDimension>([attempt.dimension]);
  if (!attempt.correct) attempt.errorTags.forEach((tag) => dimensions.add(errorDimension[tag]));
  return Object.fromEntries([...dimensions].map((dimension) => [
    dimension,
    scheduleDimension(previous[dimension], attempt),
  ])) as Partial<CharacterMemory>;
}

export function dueDimensions(profile: Pick<StudyProfile, "memory">, characterId: string, now = new Date()) {
  const timestamp = now.getTime();
  const memory = characterMemory(profile, characterId);
  return skillDimensions.filter((dimension) => {
    const dueAt = memory[dimension].dueAt;
    return dueAt !== "" && Date.parse(dueAt) <= timestamp;
  });
}

export function practiceDimension(question: Exercise, track: TrackId): SkillDimension {
  if (question.dimension) return question.dimension;
  if (question.kind === "write") return "generation";
  if (question.kind === "structure") return "discrimination";
  if (track === "honglan") return "semantics";
  if (track === "split" || question.kind === "components") return "generation";
  if (question.questionType === "image_single_select") return "semantics";
  return "recognition";
}

export function practiceAnswerMode(question: Exercise): AnswerMode {
  return question.answerMode ?? (question.kind === "write" ? "self-check" : "choice");
}

export function practiceErrorTags(question: Exercise, track: TrackId, selected: string[], writingAssessment = "") {
  if (writingAssessment === "component-error") return ["component-missing", "component-extra"] as ErrorTag[];
  if (writingAssessment === "position-error") return ["component-position"] as ErrorTag[];
  if (writingAssessment === "stroke-error") return ["stroke-missing", "stroke-extra"] as ErrorTag[];
  const tagged = selected.flatMap((id) => question.optionErrorTags?.[id] ?? []);
  if (tagged.length) return [...new Set(tagged)];
  if (question.kind === "structure") return ["component-position"] as ErrorTag[];
  if (track === "honglan") return ["semantic-component"] as ErrorTag[];
  if (track === "split" || question.kind === "components") return ["component-missing", "component-extra"] as ErrorTag[];
  const dimension = practiceDimension(question, track);
  if (dimension === "phonology") return ["pronunciation-tone"] as ErrorTag[];
  if (dimension === "semantics") return ["meaning-unknown"] as ErrorTag[];
  if (dimension === "context") return ["context-misuse"] as ErrorTag[];
  return ["lookalike-confusion"] as ErrorTag[];
}

function updateActorAnswer(
  previous: StudyProfile["answers"][string] | undefined,
  actorId: string,
  input: { correct: boolean; occurredAt: string; latencyMs: number; cueLevel: 0 | 1 | 2 | 3; errorTags: ErrorTag[] },
) {
  const actorCounts = previous?.actorCounts
    ? JSON.parse(JSON.stringify(previous.actorCounts)) as NonNullable<typeof previous.actorCounts>
    : previous?.attempts
      ? { legacy: { attempts: previous.attempts, correct: previous.correct } }
      : {};
  const actor = actorCounts[actorId] ?? { attempts: 0, correct: 0 };
  actorCounts[actorId] = { attempts: actor.attempts + 1, correct: actor.correct + Number(input.correct) };
  return {
    attempts: Object.values(actorCounts).reduce((sum, count) => sum + count.attempts, 0),
    correct: Object.values(actorCounts).reduce((sum, count) => sum + count.correct, 0),
    lastCorrect: input.correct,
    lastAt: input.occurredAt,
    lastLatencyMs: input.latencyMs,
    lastCueLevel: input.cueLevel,
    ...(input.errorTags.length ? { lastErrorTags: input.errorTags } : {}),
    actorCounts,
  };
}

export function applyAnswerTransition(profile: StudyProfile, input: {
  actorId: string;
  track: TrackId;
  lessonId: string;
  characterId: string;
  questionId: string;
  correct: boolean;
  questionIndex: number;
  questionCount: number;
  completed: boolean;
  reviewDue: boolean;
  dimension: SkillDimension;
  answerMode: AnswerMode;
  cueLevel: 0 | 1 | 2 | 3;
  latencyMs: number;
  errorTags: ErrorTag[];
  occurredAt: string;
  day: string;
}) {
  const next = JSON.parse(JSON.stringify(profile)) as StudyProfile;
  const wasCompleted = next.completed[input.track].includes(input.characterId);
  next.answers[input.questionId] = updateActorAnswer(next.answers[input.questionId], input.actorId, input);
  next.memory[input.characterId] = {
    ...(next.memory[input.characterId] ?? {}),
    ...scheduleEvidence(characterMemory(next, input.characterId), input),
  };
  for (const tag of input.errorTags) next.errorCounts[tag] = (next.errorCounts[tag] ?? 0) + 1;
  const day = next.daily[input.day] ?? { attempts: 0, correct: 0, skips: 0, readSessions: 0 };
  next.daily[input.day] = { ...day, attempts: day.attempts + 1, correct: day.correct + Number(input.correct) };
  next.last[input.track] = {
    lessonId: input.lessonId,
    characterId: input.characterId,
    questionIndex: input.correct
      ? Math.min(input.questionIndex + 1, Math.max(0, input.questionCount - 1))
      : input.questionIndex,
  };
  if (input.completed && !wasCompleted) {
    next.completed[input.track] = [...next.completed[input.track], input.characterId];
    if (input.track === "words") {
      next.introducedByDay[input.day] = [...new Set([...(next.introducedByDay[input.day] ?? []), input.characterId])];
    }
  }
  if (input.reviewDue && input.completed) {
    next.reviewedByDay[input.day] = [...new Set([...(next.reviewedByDay[input.day] ?? []), input.characterId])];
  }
  return next;
}
