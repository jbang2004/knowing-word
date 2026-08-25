import { learningDayKey } from "../domain/learning-day.ts";
import type { LearningAttempt } from "../domain/learning-state.ts";
import { scheduleReviewEvidence } from "../domain/review-scheduler.ts";
import {
  characterMemoryFromProfile,
  recordAnswerAttempt,
  type StudyProfile,
} from "./profile-model.ts";

/** The single profile mutation used by scored game checkpoints. */
export function applyLearningAttempt(
  profile: StudyProfile,
  actorId: string,
  attempt: LearningAttempt,
): StudyProfile {
  // A positive self-check is activity evidence, not an objective score. An
  // explicit "cannot verify" diagnosis still schedules a short retry without
  // entering objective accuracy statistics.
  if (attempt.correct === null) {
    if (!attempt.errorTags.length) return profile;
    const priorMemory = characterMemoryFromProfile(profile, attempt.characterId);
    const storedMemory = profile.memory[attempt.characterId] ?? {};
    const errorCounts = { ...profile.errorCounts };
    for (const tag of attempt.errorTags) errorCounts[tag] = (errorCounts[tag] ?? 0) + 1;
    return {
      ...profile,
      memory: {
        ...profile.memory,
        [attempt.characterId]: {
          ...storedMemory,
          ...scheduleReviewEvidence(priorMemory, attempt),
        },
      },
      errorCounts,
    };
  }
  const prior = profile.answers[attempt.questionId];
  const priorMemory = characterMemoryFromProfile(profile, attempt.characterId);
  const storedMemory = profile.memory[attempt.characterId] ?? {};
  const scheduledMemory = scheduleReviewEvidence(priorMemory, attempt);
  // Replaying the guided story is useful practice, but it must never erase a
  // stronger stable state earned by delayed, cue-free retrieval.
  if (
    attempt.correct === true &&
    attempt.cueLevel > 0 &&
    priorMemory[attempt.dimension].status === "stable"
  ) {
    scheduledMemory[attempt.dimension] = priorMemory[attempt.dimension];
  }
  const errorCounts = { ...profile.errorCounts };
  for (const tag of attempt.errorTags) errorCounts[tag] = (errorCounts[tag] ?? 0) + 1;
  const date = learningDayKey(new Date(attempt.occurredAt));
  const day = profile.daily[date] ?? { attempts: 0, correct: 0, skips: 0, readSessions: 0 };

  return {
    ...profile,
    answers: {
      ...profile.answers,
      [attempt.questionId]: recordAnswerAttempt(prior, actorId, {
        lastCorrect: attempt.correct,
        lastAt: attempt.occurredAt,
        lastLatencyMs: attempt.latencyMs,
        lastCueLevel: attempt.cueLevel,
        lastErrorTags: attempt.errorTags,
        correctAnswer: attempt.correct,
      }),
    },
    memory: {
      ...profile.memory,
      [attempt.characterId]: {
        ...storedMemory,
        ...scheduledMemory,
      },
    },
    errorCounts,
    daily: {
      ...profile.daily,
      [date]: {
        ...day,
        attempts: day.attempts + 1,
        correct: day.correct + Number(attempt.correct),
      },
    },
  };
}
