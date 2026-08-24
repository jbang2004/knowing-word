export type LearningSoundId =
  | "start"
  | "correct"
  | "streak"
  | "retry"
  | "encourage"
  | "complete"
  | "dailyComplete";

export const learningSounds: Record<LearningSoundId, string> = {
  start: "/sfx/start.mp3",
  correct: "/sfx/correct.mp3",
  streak: "/sfx/streak.mp3",
  retry: "/sfx/retry.mp3",
  encourage: "/sfx/encourage.mp3",
  complete: "/sfx/complete.mp3",
  dailyComplete: "/sfx/daily-complete.mp3",
};
