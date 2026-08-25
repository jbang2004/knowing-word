import {
  emptyCharacterMemory,
  errorTags,
  skillDimensions,
  type CharacterMemory,
  type ErrorTag,
} from "../domain/learning-state.ts";

export type TrackId = "words" | "split" | "honglan" | "structure";

export type AnswerStat = {
  attempts: number;
  correct: number;
  lastCorrect: boolean;
  lastAt: string;
  lastLatencyMs?: number;
  lastCueLevel?: 0 | 1 | 2 | 3;
  lastErrorTags?: ErrorTag[];
  actorCounts?: Record<string, { attempts: number; correct: number }>;
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

export type ReadingEvidence = {
  attempts: number;
  accurate: number;
  needsPractice: number;
  lastAt: string;
  lastAccuracy: "accurate" | "needs-practice";
  verificationSource: "self";
};

export type ProfilePreference = "name" | "grade" | "courseId" | "theme" | "favorites";

export type StudyProfile = {
  version: 5;
  name: string;
  grade: number;
  courseId: string;
  theme: "light" | "night";
  favorites: string[];
  preferenceUpdatedAt: Partial<Record<ProfilePreference, string>>;
  completed: Record<TrackId, string[]>;
  last: Record<TrackId, ResumePoint | null>;
  answers: Record<string, AnswerStat>;
  memory: Record<string, Partial<CharacterMemory>>;
  errorCounts: Partial<Record<ErrorTag, number>>;
  learnedComponents: string[];
  recentComponents: string[];
  readLessons: string[];
  readingEvidence: Record<string, ReadingEvidence>;
  introducedByDay: Record<string, string[]>;
  reviewedByDay: Record<string, string[]>;
  daily: Record<string, DailyActivity>;
};

export const trackIds: TrackId[] = ["words", "split", "honglan", "structure"];
export const PROFILE_STORAGE_KEY = "knowing-word:course-progress:v5";
export const LEGACY_PROFILE_STORAGE_KEYS = [
  "knowing-word:course-progress:v4",
  "knowing-word:course-progress:v3",
] as const;

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

function optionalCountValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : undefined;
}

function cueLevelValue(value: unknown): 0 | 1 | 2 | 3 | undefined {
  return value === 0 || value === 1 || value === 2 || value === 3 ? value : undefined;
}

function normalizeErrorTags(value: unknown) {
  return Array.isArray(value)
    ? [...new Set(value.filter((item): item is ErrorTag => errorTags.includes(item as ErrorTag)))]
    : [];
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
    const actorCounts: NonNullable<AnswerStat["actorCounts"]> = {};
    for (const [actorId, counts] of Object.entries(recordValue(raw.actorCounts))) {
      if (!/^[a-zA-Z0-9_-]{1,32}$/.test(actorId)) continue;
      const actor = recordValue(counts);
      const attempts = countValue(actor.attempts);
      const correct = Math.min(attempts, countValue(actor.correct));
      if (attempts > 0) actorCounts[actorId] = { attempts, correct };
    }
    const actorAttempts = Object.values(actorCounts).reduce((sum, item) => sum + item.attempts, 0);
    const actorCorrect = Object.values(actorCounts).reduce((sum, item) => sum + item.correct, 0);
    answers[questionId] = {
      attempts: actorAttempts || countValue(raw.attempts),
      correct: actorAttempts ? actorCorrect : countValue(raw.correct),
      lastCorrect: raw.lastCorrect,
      lastAt: raw.lastAt,
      ...(optionalCountValue(raw.lastLatencyMs) === undefined ? {} : { lastLatencyMs: optionalCountValue(raw.lastLatencyMs) }),
      ...(cueLevelValue(raw.lastCueLevel) === undefined ? {} : { lastCueLevel: cueLevelValue(raw.lastCueLevel) }),
      ...(normalizeErrorTags(raw.lastErrorTags).length ? { lastErrorTags: normalizeErrorTags(raw.lastErrorTags) } : {}),
      ...(actorAttempts ? { actorCounts } : {}),
    };
  }
  return answers;
}

export function recordAnswerAttempt(
  previous: AnswerStat | undefined,
  actorId: string,
  latest: Omit<AnswerStat, "attempts" | "correct" | "actorCounts"> & { correctAnswer: boolean },
): AnswerStat {
  if (!/^[a-zA-Z0-9_-]{1,32}$/.test(actorId)) throw new Error("invalid profile actor id");
  const actorCounts = previous?.actorCounts
    ? structuredClone(previous.actorCounts)
    : previous?.attempts
      ? { legacy: { attempts: previous.attempts, correct: previous.correct } }
      : {};
  const actor = actorCounts[actorId] ?? { attempts: 0, correct: 0 };
  actorCounts[actorId] = {
    attempts: actor.attempts + 1,
    correct: actor.correct + Number(latest.correctAnswer),
  };
  const attempts = Object.values(actorCounts).reduce((sum, item) => sum + item.attempts, 0);
  const correct = Object.values(actorCounts).reduce((sum, item) => sum + item.correct, 0);
  const { correctAnswer, ...metadata } = latest;
  void correctAnswer;
  return { ...metadata, attempts, correct, actorCounts };
}

function isoStringOrNull(value: unknown) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value)) ? value : null;
}

function normalizeMemory(value: unknown) {
  const normalized: Record<string, Partial<CharacterMemory>> = {};
  for (const [characterId, entry] of Object.entries(recordValue(value))) {
    if (!characterId || characterId.length > 80) continue;
    const rawDimensions = recordValue(entry);
    const character: Partial<CharacterMemory> = {};
    for (const dimension of skillDimensions) {
      if (!Object.hasOwn(rawDimensions, dimension)) continue;
      const raw = recordValue(rawDimensions[dimension]);
      const status = raw.status === "learning" || raw.status === "review" || raw.status === "stable"
        ? raw.status
        : "new";
      character[dimension] = {
        status,
        dueAt: typeof raw.dueAt === "string" && !Number.isNaN(Date.parse(raw.dueAt)) ? raw.dueAt : "",
        intervalDays: countValue(raw.intervalDays),
        lapses: countValue(raw.lapses),
        correctStreak: countValue(raw.correctStreak),
        independentStreak: countValue(raw.independentStreak),
        lastAt: isoStringOrNull(raw.lastAt),
        lastIndependentCorrectAt: isoStringOrNull(raw.lastIndependentCorrectAt),
      };
    }
    normalized[characterId] = character;
  }
  return normalized;
}

export function characterMemoryFromProfile(
  profile: Pick<StudyProfile, "memory">,
  characterId: string,
): CharacterMemory {
  const stored = profile.memory[characterId] ?? {};
  return {
    ...emptyCharacterMemory(),
    ...stored,
  };
}

function normalizeErrorCounts(value: unknown) {
  const normalized: Partial<Record<ErrorTag, number>> = {};
  const raw = recordValue(value);
  for (const tag of errorTags) {
    const count = optionalCountValue(raw[tag]);
    if (count !== undefined && count > 0) normalized[tag] = count;
  }
  return normalized;
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

function normalizeIntroducedByDay(value: unknown) {
  const normalized: Record<string, string[]> = {};
  for (const [date, entries] of Object.entries(recordValue(value))) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const ids = stringList(entries);
    if (ids.length) normalized[date] = ids;
  }
  return Object.fromEntries(
    Object.entries(normalized)
      .sort(([left], [right]) => right.localeCompare(left))
      .slice(0, 120),
  );
}

function normalizeReadingEvidence(value: unknown) {
  const normalized: Record<string, ReadingEvidence> = {};
  for (const [lessonId, entry] of Object.entries(recordValue(value))) {
    if (!lessonId || lessonId.length > 32) continue;
    const raw = recordValue(entry);
    if (
      (raw.lastAccuracy !== "accurate" && raw.lastAccuracy !== "needs-practice") ||
      typeof raw.lastAt !== "string"
    ) continue;
    normalized[lessonId] = {
      attempts: countValue(raw.attempts),
      accurate: countValue(raw.accurate),
      needsPractice: countValue(raw.needsPractice),
      lastAt: raw.lastAt,
      lastAccuracy: raw.lastAccuracy,
      verificationSource: "self",
    };
  }
  return normalized;
}

export function emptyProfile(): StudyProfile {
  return {
    version: 5,
    name: "",
    grade: DEFAULT_GRADE,
    courseId: DEFAULT_COURSE_ID,
    theme: "light",
    favorites: [],
    preferenceUpdatedAt: {},
    completed: { words: [], split: [], honglan: [], structure: [] },
    last: { words: null, split: null, honglan: null, structure: null },
    answers: {},
    memory: {},
    errorCounts: {},
    learnedComponents: [],
    recentComponents: [],
    readLessons: [],
    readingEvidence: {},
    introducedByDay: {},
    reviewedByDay: {},
    daily: {},
  };
}

export function normalizeProfile(value: unknown): StudyProfile {
  const raw = recordValue(value);
  const completed = recordValue(raw.completed);
  const last = recordValue(raw.last);
  const profile = emptyProfile();
  const rawPreferenceUpdatedAt = recordValue(raw.preferenceUpdatedAt);
  const preferenceUpdatedAt: StudyProfile["preferenceUpdatedAt"] = {};
  for (const field of ["name", "grade", "courseId", "theme", "favorites"] as const) {
    const updatedAt = isoStringOrNull(rawPreferenceUpdatedAt[field]);
    if (updatedAt) preferenceUpdatedAt[field] = updatedAt;
  }

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
    preferenceUpdatedAt,
    answers: normalizeAnswers(raw.answers),
    memory: normalizeMemory(raw.memory),
    errorCounts: normalizeErrorCounts(raw.errorCounts),
    learnedComponents: stringList(raw.learnedComponents),
    recentComponents: stringList(raw.recentComponents, 24),
    readLessons: stringList(raw.readLessons),
    readingEvidence: normalizeReadingEvidence(raw.readingEvidence),
    introducedByDay: normalizeIntroducedByDay(raw.introducedByDay),
    reviewedByDay: normalizeIntroducedByDay(raw.reviewedByDay),
    daily: normalizeDaily(raw.daily),
  };
}

function unionStrings(left: string[], right: string[]) {
  return [...new Set([...left, ...right])];
}

function laterTimestamp(left?: string | null, right?: string | null) {
  const leftTime = left ? Date.parse(left) : Number.NEGATIVE_INFINITY;
  const rightTime = right ? Date.parse(right) : Number.NEGATIVE_INFINITY;
  return rightTime >= leftTime ? "right" : "left";
}

function legacyPreferenceHasIntent(profile: StudyProfile, field: ProfilePreference) {
  if (field === "name") return profile.name.length > 0;
  if (field === "grade") return profile.grade !== DEFAULT_GRADE;
  if (field === "courseId") return profile.courseId !== DEFAULT_COURSE_ID;
  if (field === "theme") return profile.theme !== "light";
  return profile.favorites.length > 0;
}

function preferenceSource(
  server: StudyProfile,
  local: StudyProfile,
  field: ProfilePreference,
) {
  const serverAt = server.preferenceUpdatedAt[field];
  const localAt = local.preferenceUpdatedAt[field];
  if (serverAt || localAt) return laterTimestamp(serverAt, localAt);
  // Legacy snapshots have no field clock. Only a non-default local value can
  // prove preference intent; unrelated offline learning must not reset it.
  return legacyPreferenceHasIntent(local, field) ? "right" : "left";
}

export function withPreferenceUpdate<Field extends ProfilePreference>(
  profile: StudyProfile,
  field: Field,
  value: StudyProfile[Field],
  updatedAt = new Date().toISOString(),
): StudyProfile {
  return {
    ...profile,
    [field]: value,
    preferenceUpdatedAt: {
      ...profile.preferenceUpdatedAt,
      [field]: updatedAt,
    },
  };
}

/**
 * Monotonic merge for an offline/local snapshot and a server snapshot.
 * Achievements and evidence only grow; latest per-question and per-dimension
 * state wins. This prevents a stale full-profile PUT from erasing work done on
 * another device without inventing additive attempt counts from common data.
 */
export function mergeStudyProfiles(
  serverValue: unknown,
  localValue: unknown,
): StudyProfile {
  const server = normalizeProfile(serverValue);
  const local = normalizeProfile(localValue);
  const merged = emptyProfile();
  for (const field of ["name", "grade", "courseId", "theme", "favorites"] as const) {
    const source = preferenceSource(server, local, field);
    if (field === "favorites") merged.favorites = source === "right" ? local.favorites : server.favorites;
    else if (field === "name") merged.name = source === "right" ? local.name : server.name;
    else if (field === "grade") merged.grade = source === "right" ? local.grade : server.grade;
    else if (field === "courseId") merged.courseId = source === "right" ? local.courseId : server.courseId;
    else merged.theme = source === "right" ? local.theme : server.theme;
    const updatedAt = source === "right"
      ? local.preferenceUpdatedAt[field]
      : server.preferenceUpdatedAt[field];
    if (updatedAt) merged.preferenceUpdatedAt[field] = updatedAt;
  }
  merged.learnedComponents = unionStrings(server.learnedComponents, local.learnedComponents);
  merged.recentComponents = unionStrings(local.recentComponents, server.recentComponents).slice(0, 24);
  merged.readLessons = unionStrings(server.readLessons, local.readLessons);

  for (const track of trackIds) {
    merged.completed[track] = unionStrings(server.completed[track], local.completed[track]);
    merged.last[track] = local.last[track] ?? server.last[track];
  }

  for (const questionId of new Set([
    ...Object.keys(server.answers),
    ...Object.keys(local.answers),
  ])) {
    const left = server.answers[questionId];
    const right = local.answers[questionId];
    if (!left) {
      merged.answers[questionId] = right;
      continue;
    }
    if (!right) {
      merged.answers[questionId] = left;
      continue;
    }
    const latest = laterTimestamp(left.lastAt, right.lastAt) === "right" ? right : left;
    if (left.actorCounts || right.actorCounts) {
      const leftCounts = left.actorCounts ?? { legacy: { attempts: left.attempts, correct: left.correct } };
      const rightCounts = right.actorCounts ?? { legacy: { attempts: right.attempts, correct: right.correct } };
      const actorCounts: NonNullable<AnswerStat["actorCounts"]> = {};
      for (const actorId of new Set([...Object.keys(leftCounts), ...Object.keys(rightCounts)])) {
        const leftActor = leftCounts[actorId] ?? { attempts: 0, correct: 0 };
        const rightActor = rightCounts[actorId] ?? { attempts: 0, correct: 0 };
        actorCounts[actorId] = {
          attempts: Math.max(leftActor.attempts, rightActor.attempts),
          correct: Math.max(leftActor.correct, rightActor.correct),
        };
      }
      merged.answers[questionId] = {
        ...latest,
        actorCounts,
        attempts: Object.values(actorCounts).reduce((sum, item) => sum + item.attempts, 0),
        correct: Object.values(actorCounts).reduce((sum, item) => sum + item.correct, 0),
      };
    } else {
      merged.answers[questionId] = {
        ...latest,
        attempts: Math.max(left.attempts, right.attempts),
        correct: Math.max(left.correct, right.correct),
      };
    }
  }

  for (const characterId of new Set([
    ...Object.keys(server.memory),
    ...Object.keys(local.memory),
  ])) {
    const dimensions: Partial<CharacterMemory> = {};
    for (const dimension of skillDimensions) {
      const left = server.memory[characterId]?.[dimension];
      const right = local.memory[characterId]?.[dimension];
      if (!left && !right) continue;
      dimensions[dimension] = !left
        ? right
        : !right
          ? left
          : laterTimestamp(left.lastAt, right.lastAt) === "right" ? right : left;
    }
    merged.memory[characterId] = dimensions;
  }

  for (const tag of errorTags) {
    const count = Math.max(server.errorCounts[tag] ?? 0, local.errorCounts[tag] ?? 0);
    if (count > 0) merged.errorCounts[tag] = count;
  }

  for (const lessonId of new Set([
    ...Object.keys(server.readingEvidence),
    ...Object.keys(local.readingEvidence),
  ])) {
    const left = server.readingEvidence[lessonId];
    const right = local.readingEvidence[lessonId];
    if (!left) {
      merged.readingEvidence[lessonId] = right;
      continue;
    }
    if (!right) {
      merged.readingEvidence[lessonId] = left;
      continue;
    }
    const latest = laterTimestamp(left.lastAt, right.lastAt) === "right" ? right : left;
    merged.readingEvidence[lessonId] = {
      ...latest,
      attempts: Math.max(left.attempts, right.attempts),
      accurate: Math.max(left.accurate, right.accurate),
      needsPractice: Math.max(left.needsPractice, right.needsPractice),
    };
  }

  for (const date of new Set([
    ...Object.keys(server.daily),
    ...Object.keys(local.daily),
  ])) {
    const left = server.daily[date] ?? { attempts: 0, correct: 0, skips: 0, readSessions: 0 };
    const right = local.daily[date] ?? { attempts: 0, correct: 0, skips: 0, readSessions: 0 };
    merged.daily[date] = {
      attempts: Math.max(left.attempts, right.attempts),
      correct: Math.max(left.correct, right.correct),
      skips: Math.max(left.skips, right.skips),
      readSessions: Math.max(left.readSessions, right.readSessions),
    };
  }

  for (const date of new Set([
    ...Object.keys(server.introducedByDay),
    ...Object.keys(local.introducedByDay),
  ])) {
    merged.introducedByDay[date] = unionStrings(
      server.introducedByDay[date] ?? [],
      local.introducedByDay[date] ?? [],
    );
  }

  for (const date of new Set([
    ...Object.keys(server.reviewedByDay),
    ...Object.keys(local.reviewedByDay),
  ])) {
    merged.reviewedByDay[date] = unionStrings(
      server.reviewedByDay[date] ?? [],
      local.reviewedByDay[date] ?? [],
    );
  }

  return merged;
}
