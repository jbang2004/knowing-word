export type TrackId = "words" | "split" | "honglan" | "structure";

export type AnswerStat = {
  attempts: number;
  correct: number;
  lastCorrect: boolean;
  lastAt: string;
};

export type ResumePoint = {
  lessonId: string;
  characterId: string;
  questionIndex: number;
};

export type DailyActivity = {
  attempts: number;
  correct: number;
  skips: number;
  readSessions: number;
};

export type StudyProfile = {
  version: 3;
  name: string;
  grade: number;
  courseId: string;
  theme: "light" | "night";
  favorites: string[];
  completed: Record<TrackId, string[]>;
  last: Record<TrackId, ResumePoint | null>;
  answers: Record<string, AnswerStat>;
  learnedComponents: string[];
  recentComponents: string[];
  daily: Record<string, DailyActivity>;
  readSessions: number;
};

export const trackIds: TrackId[] = ["words", "split", "honglan", "structure"];
export const PROFILE_STORAGE_KEY = "knowing-word:course-progress:v3";
export const PROFILE_UPDATED_STORAGE_KEY = "knowing-word:course-progress:updated-at";

const DEFAULT_COURSE_ID = "chinese-grade-5-volume-1";
const DEFAULT_GRADE = 5;

function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function stringList(value: unknown, limit?: number) {
  if (!Array.isArray(value)) return [];
  const unique = [...new Set(value.filter((item): item is string => typeof item === "string" && item.length > 0))];
  return typeof limit === "number" ? unique.slice(0, limit) : unique;
}

function countValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : 0;
}

function normalizeResume(value: unknown): ResumePoint | null {
  const raw = recordValue(value);
  return typeof raw.lessonId === "string" &&
    typeof raw.characterId === "string" &&
    typeof raw.questionIndex === "number" &&
    Number.isInteger(raw.questionIndex) &&
    raw.questionIndex >= 0
    ? {
        lessonId: raw.lessonId,
        characterId: raw.characterId,
        questionIndex: raw.questionIndex,
      }
    : null;
}

function normalizeAnswers(value: unknown) {
  const answers: Record<string, AnswerStat> = {};
  for (const [questionId, entry] of Object.entries(recordValue(value))) {
    const raw = recordValue(entry);
    if (
      typeof raw.lastCorrect !== "boolean" ||
      typeof raw.lastAt !== "string"
    ) continue;
    answers[questionId] = {
      attempts: countValue(raw.attempts),
      correct: countValue(raw.correct),
      lastCorrect: raw.lastCorrect,
      lastAt: raw.lastAt,
    };
  }
  return answers;
}

function normalizeDaily(value: unknown) {
  const daily: Record<string, DailyActivity> = {};
  for (const [date, entry] of Object.entries(recordValue(value))) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const raw = recordValue(entry);
    daily[date] = {
      attempts: countValue(raw.attempts),
      correct: countValue(raw.correct),
      skips: countValue(raw.skips),
      readSessions: countValue(raw.readSessions),
    };
  }
  return daily;
}

export function emptyProfile(): StudyProfile {
  return {
    version: 3,
    name: "",
    grade: DEFAULT_GRADE,
    courseId: DEFAULT_COURSE_ID,
    theme: "light",
    favorites: [],
    completed: { words: [], split: [], honglan: [], structure: [] },
    last: { words: null, split: null, honglan: null, structure: null },
    answers: {},
    learnedComponents: [],
    recentComponents: [],
    daily: {},
    readSessions: 0,
  };
}

// Only the current schema is accepted. There is no deployed learning history,
// so keeping v1/v2 migration branches would add ambiguity without protecting
// real data.
export function normalizeProfile(value: unknown): StudyProfile {
  const raw = recordValue(value);
  const completed = recordValue(raw.completed);
  const last = recordValue(raw.last);
  const profile = emptyProfile();

  for (const track of trackIds) {
    profile.completed[track] = stringList(completed[track]);
    profile.last[track] = normalizeResume(last[track]);
  }

  return {
    ...profile,
    name: typeof raw.name === "string" ? raw.name.slice(0, 18) : "",
    grade: typeof raw.grade === "number" && Number.isInteger(raw.grade) && raw.grade > 0
      ? raw.grade
      : DEFAULT_GRADE,
    courseId: typeof raw.courseId === "string" && raw.courseId.length > 0
      ? raw.courseId
      : DEFAULT_COURSE_ID,
    theme: raw.theme === "night" ? "night" : "light",
    favorites: stringList(raw.favorites),
    answers: normalizeAnswers(raw.answers),
    learnedComponents: stringList(raw.learnedComponents),
    recentComponents: stringList(raw.recentComponents, 24),
    daily: normalizeDaily(raw.daily),
    readSessions: countValue(raw.readSessions),
  };
}

export function todayKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
