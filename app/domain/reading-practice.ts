import { learningDayKey } from "./learning-day.ts";
import type { ReadingReflection } from "./learning-event.ts";
import type { StudyProfile } from "../lib/profile-model.ts";

/**
 * A reading session records participation and the learner's own feeling. It is
 * deliberately not an accuracy assessment and never gates lesson progression.
 */
export function applyReadingPractice(
  profile: StudyProfile,
  lessonId: string,
  reflection: ReadingReflection,
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
    // Kept as a compatibility field across web and mini-program profiles. It
    // means "has practiced reading", never "was assessed as accurate".
    readLessons: profile.readLessons.includes(lessonId)
      ? profile.readLessons
      : [...profile.readLessons, lessonId],
    readingEvidence: {
      ...profile.readingEvidence,
      [lessonId]: {
        sessions: (prior?.sessions ?? 0) + 1,
        comfortable: (prior?.comfortable ?? 0) + Number(reflection === "comfortable"),
        needsPractice: (prior?.needsPractice ?? 0) + Number(reflection === "needs-practice"),
        lastAt: occurredAt,
        lastReflection: reflection,
        // Rollout aliases for installed mini-program clients. Deliberately do
        // not increment them: this Web flow records practice, not accuracy.
        attempts: prior?.attempts ?? 0,
        accurate: prior?.accurate ?? 0,
      },
    },
    daily: {
      ...profile.daily,
      [date]: { ...day, readSessions: day.readSessions + 1 },
    },
  };
}
