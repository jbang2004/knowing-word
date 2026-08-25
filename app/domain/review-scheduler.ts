import {
  isIndependentAttempt,
  skillDimensions,
  type AnswerMode,
  type CharacterMemory,
  type DimensionMemory,
  type LearningAttempt,
} from "./learning-state.ts";
import { diagnoseErrors } from "./error-diagnosis.ts";

const DAY_MS = 24 * 60 * 60 * 1_000;
const RETRY_DELAY_MS = 5 * 60 * 1_000;
const STABLE_EVIDENCE_GAP_MS = 7 * DAY_MS;

export const independentReviewIntervals = [1, 3, 7, 14, 30] as const;

// Choice and spoken answers should normally be retrievable within a short
// pause. Handwriting legitimately needs more motor time. Crossing these
// conservative ceilings still counts as correct, but not yet fluent enough
// to justify a multi-day interval.
export const fluentResponseThresholdMs: Record<AnswerMode, number> = {
  choice: 15_000,
  speech: 15_000,
  handwriting: 45_000,
  "self-check": 45_000,
};

export function isFluentResponse(
  attempt: Pick<LearningAttempt, "answerMode" | "latencyMs">,
) {
  return Number.isFinite(attempt.latencyMs) &&
    attempt.latencyMs >= 0 &&
    attempt.latencyMs <= fluentResponseThresholdMs[attempt.answerMode];
}

function parseOccurredAt(occurredAt: string) {
  const timestamp = Date.parse(occurredAt);
  if (!Number.isFinite(timestamp)) {
    throw new RangeError(`Invalid attempt occurredAt: ${occurredAt}`);
  }
  return timestamp;
}

function parseClock(now: string | Date) {
  const timestamp = now instanceof Date ? now.getTime() : Date.parse(now);
  if (!Number.isFinite(timestamp)) {
    throw new RangeError(`Invalid review clock: ${String(now)}`);
  }
  return timestamp;
}

function toIso(timestamp: number) {
  return new Date(timestamp).toISOString();
}

function addDays(timestamp: number, days: number) {
  return toIso(timestamp + days * DAY_MS);
}

function nextIndependentInterval(independentStreak: number) {
  const index = Math.min(
    Math.max(independentStreak - 1, 0),
    independentReviewIntervals.length - 1,
  );
  return independentReviewIntervals[index];
}

function hasSevenDayIndependentEvidence(
  previousIndependentCorrectAt: string | null,
  currentTimestamp: number,
) {
  if (!previousIndependentCorrectAt) return false;
  const previousTimestamp = Date.parse(previousIndependentCorrectAt);
  return Number.isFinite(previousTimestamp) &&
    currentTimestamp - previousTimestamp >= STABLE_EVIDENCE_GAP_MS;
}

/**
 * Applies one attempt to one skill dimension.
 *
 * The attempt timestamp is the injected clock. This function deliberately never
 * reads the system clock, making replay and server/client reconciliation
 * deterministic.
 */
export function scheduleReview(
  previous: DimensionMemory,
  attempt: LearningAttempt,
): DimensionMemory {
  const timestamp = parseOccurredAt(attempt.occurredAt);
  const occurredAt = toIso(timestamp);

  if (attempt.correct !== true) {
    return {
      ...previous,
      status: "learning",
      dueAt: toIso(timestamp + RETRY_DELAY_MS),
      intervalDays: 0,
      lapses: previous.lapses + (attempt.correct === false ? 1 : 0),
      correctStreak: 0,
      independentStreak: 0,
      lastAt: occurredAt,
    };
  }

  if (!isIndependentAttempt(attempt) || !isFluentResponse(attempt)) {
    return {
      ...previous,
      status: "learning",
      dueAt: addDays(timestamp, 1),
      intervalDays: 1,
      correctStreak: previous.correctStreak + 1,
      independentStreak: 0,
      lastAt: occurredAt,
    };
  }

  const independentStreak = previous.independentStreak + 1;
  const intervalDays = nextIndependentInterval(independentStreak);
  const stable = independentStreak >= 2 && hasSevenDayIndependentEvidence(
    previous.lastIndependentCorrectAt,
    timestamp,
  );

  return {
    ...previous,
    status: stable ? "stable" : "review",
    dueAt: addDays(timestamp, intervalDays),
    intervalDays,
    correctStreak: previous.correctStreak + 1,
    independentStreak,
    lastAt: occurredAt,
    lastIndependentCorrectAt: occurredAt,
  };
}

/**
 * Schedule the observed question dimension plus every distinct dimension
 * diagnosed from a wrong answer. The sparse result can be merged directly
 * into Profile v5 memory without materialising all six dimension records.
 */
export function scheduleReviewEvidence(
  previous: CharacterMemory,
  attempt: LearningAttempt,
): Partial<CharacterMemory> {
  const dimensions = new Set([attempt.dimension]);
  if (attempt.correct !== true) {
    for (const diagnosis of diagnoseErrors(attempt.errorTags)) {
      dimensions.add(diagnosis.targetDimension);
    }
  }

  return Object.fromEntries([...dimensions].map((dimension) => [
    dimension,
    scheduleReview(previous[dimension], { ...attempt, dimension }),
  ])) as Partial<CharacterMemory>;
}

export function isDue(memory: DimensionMemory, now: string | Date) {
  const timestamp = parseClock(now);
  if (!memory.dueAt) return false;
  const dueTimestamp = Date.parse(memory.dueAt);
  return Number.isFinite(dueTimestamp) && dueTimestamp <= timestamp;
}

export function nextDueDimensions(
  characterMemory: CharacterMemory,
  now: string | Date,
) {
  const timestamp = parseClock(now);
  return skillDimensions
    .filter((dimension) => {
      const dueAt = characterMemory[dimension].dueAt;
      return dueAt !== "" && Date.parse(dueAt) <= timestamp;
    })
    .sort((left, right) => {
      const dueDifference = Date.parse(characterMemory[left].dueAt) -
        Date.parse(characterMemory[right].dueAt);
      return dueDifference || skillDimensions.indexOf(left) - skillDimensions.indexOf(right);
    });
}
