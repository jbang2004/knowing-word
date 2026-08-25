import type { ReadingAccuracy } from "./learning-event.ts";
import { learningDayKey } from "./learning-day.ts";
import type { StudyProfile } from "../lib/profile-model.ts";

export function minimumReadingDurationMs(text: string) {
  const readableCharacters = [...text].filter((character) => /[\p{L}\p{N}]/u.test(character)).length;
  // This is only an anti-empty-recording guard, not a fluency score. A child
  // may always read more slowly without penalty.
  return Math.max(3_000, readableCharacters * 150);
}

export function canAssessReading(
  text: string,
  durationMs: number,
  listenedToEnd: boolean,
) {
  return listenedToEnd && durationMs >= minimumReadingDurationMs(text);
}

/**
 * Recording audio is evidence of participation, not of accurate reading.
 * Only the learner's explicit accuracy check completes the reading lesson.
 */
export function applyReadingAssessment(
  profile: StudyProfile,
  lessonId: string,
  accuracy: ReadingAccuracy,
  occurredAt: string,
): StudyProfile {
  const date = learningDayKey(new Date(occurredAt));
  const day = profile.daily[date] ?? {
    attempts: 0,
    correct: 0,
    skips: 0,
    readSessions: 0,
  };
  const prior = profile.readingEvidence[lessonId];
  return {
    ...profile,
    readLessons: accuracy === "accurate" && !profile.readLessons.includes(lessonId)
      ? [...profile.readLessons, lessonId]
      : profile.readLessons,
    readingEvidence: {
      ...profile.readingEvidence,
      [lessonId]: {
        attempts: (prior?.attempts ?? 0) + 1,
        accurate: (prior?.accurate ?? 0) + Number(accuracy === "accurate"),
        needsPractice: (prior?.needsPractice ?? 0) + Number(accuracy === "needs-practice"),
        lastAt: occurredAt,
        lastAccuracy: accuracy,
        verificationSource: "self",
      },
    },
    daily: {
      ...profile.daily,
      [date]: { ...day, readSessions: day.readSessions + 1 },
    },
  };
}
