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
  version: 4;
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
  readLessons: string[];
  daily: Record<string, DailyActivity>;
};

export const trackIds: TrackId[] = ["words", "split", "honglan", "structure"];
export const PROFILE_STORAGE_KEY = "knowing-word:course-progress:v4";
export const LEGACY_PROFILE_STORAGE_KEYS = ["knowing-word:course-progress:v3"] as const;

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
    version: 4,
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
    readLessons: [],
    daily: {},
  };
}

export function normalizeProfile(value: unknown): StudyProfile {
  const raw = recordValue(value);
  const completed = recordValue(raw.completed);
  const last = recordValue(raw.last);
  const profile = emptyProfile();

  for (const track of trackIds) {
    profile.completed[track] = stringList(completed[track]);
    profile.last[track] = normalizeResume(last[track]);
  }

  if (raw.version !== 4) {
    // Before v4, completing the short recognition check marked a word as
    // learned even when its structure, split and red-blue work was unfinished.
    // Preserve real history while upgrading "completed words" to mean that the
    // whole character has been mastered.
    const specialistCompletion = new Set(
      profile.completed.structure.filter((id) =>
        profile.completed.split.includes(id) && profile.completed.honglan.includes(id),
      ),
    );
    profile.completed.words = profile.completed.words.filter((id) => specialistCompletion.has(id));
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
    readLessons: stringList(raw.readLessons),
    daily: normalizeDaily(raw.daily),
  };
}
