import type { AnswerMode, ErrorTag, SkillDimension, StudyProfile, TrackId } from "../types/models";
import { apiRequest } from "./api";
import { applyAnswerTransition } from "./learning-core";
import { getSessionToken } from "./session";

const PROFILE_KEY = "knowing-word:course-progress:v5";
const ACTOR_KEY = "knowing-word:profile-actor:v1";
let saveTimer: number | null = null;

function uniqueStrings(value: unknown) {
  return Array.isArray(value)
    ? [...new Set(value.filter((item): item is string => typeof item === "string" && item.length > 0))]
    : [];
}

export function emptyProfile(): StudyProfile {
  return {
    version: 5,
    name: "",
    grade: 5,
    courseId: "chinese-grade-5-volume-1",
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
  const base = emptyProfile();
  if (!value || typeof value !== "object" || Array.isArray(value)) return base;
  const raw = value as Partial<StudyProfile>;
  const completed = raw.completed ?? base.completed;
  return {
    ...base,
    ...raw,
    version: 5,
    name: typeof raw.name === "string" ? raw.name.slice(0, 18) : "",
    grade: typeof raw.grade === "number" ? raw.grade : 5,
    theme: raw.theme === "night" ? "night" : "light",
    favorites: uniqueStrings(raw.favorites),
    preferenceUpdatedAt: raw.preferenceUpdatedAt ?? {},
    completed: {
      words: uniqueStrings(completed.words),
      split: uniqueStrings(completed.split),
      honglan: uniqueStrings(completed.honglan),
      structure: uniqueStrings(completed.structure),
    },
    last: { ...base.last, ...(raw.last ?? {}) },
    answers: raw.answers ?? {},
    memory: raw.memory ?? {},
    errorCounts: raw.errorCounts ?? {},
    learnedComponents: uniqueStrings(raw.learnedComponents),
    recentComponents: uniqueStrings(raw.recentComponents).slice(0, 24),
    readLessons: uniqueStrings(raw.readLessons),
    readingEvidence: raw.readingEvidence ?? {},
    introducedByDay: raw.introducedByDay ?? {},
    reviewedByDay: raw.reviewedByDay ?? {},
    daily: raw.daily ?? {},
  };
}

export function loadProfile() {
  return normalizeProfile(wx.getStorageSync<unknown>(PROFILE_KEY));
}

function laterTimestamp(left?: string | null, right?: string | null) {
  const leftTime = left ? Date.parse(left) : Number.NEGATIVE_INFINITY;
  const rightTime = right ? Date.parse(right) : Number.NEGATIVE_INFINITY;
  return rightTime >= leftTime ? "right" : "left";
}

function preferenceSource(server: StudyProfile, local: StudyProfile, field: "name" | "grade" | "courseId" | "theme" | "favorites") {
  const serverAt = server.preferenceUpdatedAt[field];
  const localAt = local.preferenceUpdatedAt[field];
  if (serverAt || localAt) return laterTimestamp(serverAt, localAt);
  const localHasIntent = field === "name" ? local.name.length > 0
    : field === "grade" ? local.grade !== 5
      : field === "courseId" ? local.courseId !== "chinese-grade-5-volume-1"
        : field === "theme" ? local.theme !== "light"
          : local.favorites.length > 0;
  return localHasIntent ? "right" : "left";
}

export function mergeProfiles(serverValue: unknown, localValue: unknown) {
  const server = normalizeProfile(serverValue);
  const local = normalizeProfile(localValue);
  const merged = normalizeProfile({ ...server, ...local });
  const nameSource = preferenceSource(server, local, "name");
  const gradeSource = preferenceSource(server, local, "grade");
  const courseSource = preferenceSource(server, local, "courseId");
  const themeSource = preferenceSource(server, local, "theme");
  const favoritesSource = preferenceSource(server, local, "favorites");
  merged.name = nameSource === "right" ? local.name : server.name;
  merged.grade = gradeSource === "right" ? local.grade : server.grade;
  merged.courseId = courseSource === "right" ? local.courseId : server.courseId;
  merged.theme = themeSource === "right" ? local.theme : server.theme;
  merged.favorites = favoritesSource === "right" ? local.favorites : server.favorites;
  merged.preferenceUpdatedAt = {};
  for (const [field, source] of [
    ["name", nameSource],
    ["grade", gradeSource],
    ["courseId", courseSource],
    ["theme", themeSource],
    ["favorites", favoritesSource],
  ] as const) {
    const updatedAt = source === "right" ? local.preferenceUpdatedAt[field] : server.preferenceUpdatedAt[field];
    if (updatedAt) merged.preferenceUpdatedAt[field] = updatedAt;
  }
  const tracks: TrackId[] = ["words", "split", "honglan", "structure"];
  for (const track of tracks) {
    merged.completed[track] = [...new Set([...server.completed[track], ...local.completed[track]])];
    merged.last[track] = local.last[track] ?? server.last[track];
  }
  merged.learnedComponents = [...new Set([...server.learnedComponents, ...local.learnedComponents])];
  merged.readLessons = [...new Set([...server.readLessons, ...local.readLessons])];
  merged.answers = {};
  for (const id of new Set([...Object.keys(server.answers), ...Object.keys(local.answers)])) {
    const left = server.answers[id];
    const right = local.answers[id];
    if (!left && right) merged.answers[id] = right;
    else if (left && !right) merged.answers[id] = left;
    else if (left && right) {
      const latest = laterTimestamp(left.lastAt, right.lastAt) === "right" ? right : left;
      const leftCounts = left.actorCounts ?? { legacy: { attempts: left.attempts, correct: left.correct } };
      const rightCounts = right.actorCounts ?? { legacy: { attempts: right.attempts, correct: right.correct } };
      const actorCounts: NonNullable<typeof latest.actorCounts> = {};
      for (const actorId of new Set([...Object.keys(leftCounts), ...Object.keys(rightCounts)])) {
        const leftActor = leftCounts[actorId] ?? { attempts: 0, correct: 0 };
        const rightActor = rightCounts[actorId] ?? { attempts: 0, correct: 0 };
        actorCounts[actorId] = {
          attempts: Math.max(leftActor.attempts, rightActor.attempts),
          correct: Math.max(leftActor.correct, rightActor.correct),
        };
      }
      merged.answers[id] = {
        ...latest,
        actorCounts,
        attempts: Object.values(actorCounts).reduce((sum, count) => sum + count.attempts, 0),
        correct: Object.values(actorCounts).reduce((sum, count) => sum + count.correct, 0),
      };
    }
  }
  merged.memory = {};
  for (const characterId of new Set([...Object.keys(server.memory), ...Object.keys(local.memory)])) {
    const dimensions = { ...(server.memory[characterId] ?? {}) };
    for (const [dimension, right] of Object.entries(local.memory[characterId] ?? {})) {
      const key = dimension as keyof typeof dimensions;
      const left = dimensions[key];
      if (!left || laterTimestamp(left.lastAt, right?.lastAt) === "right") dimensions[key] = right;
    }
    merged.memory[characterId] = dimensions;
  }
  merged.errorCounts = { ...server.errorCounts };
  for (const [tag, count] of Object.entries(local.errorCounts)) {
    const key = tag as keyof StudyProfile["errorCounts"];
    merged.errorCounts[key] = Math.max(merged.errorCounts[key] ?? 0, count ?? 0);
  }
  merged.daily = {};
  for (const day of new Set([...Object.keys(server.daily), ...Object.keys(local.daily)])) {
    const left = server.daily[day] ?? { attempts: 0, correct: 0, skips: 0, readSessions: 0 };
    const right = local.daily[day] ?? { attempts: 0, correct: 0, skips: 0, readSessions: 0 };
    merged.daily[day] = {
      attempts: Math.max(left.attempts, right.attempts),
      correct: Math.max(left.correct, right.correct),
      skips: Math.max(left.skips, right.skips),
      readSessions: Math.max(left.readSessions, right.readSessions),
    };
  }
  merged.introducedByDay = mergeDailyIds(server.introducedByDay, local.introducedByDay);
  merged.reviewedByDay = mergeDailyIds(server.reviewedByDay, local.reviewedByDay);
  merged.readingEvidence = { ...server.readingEvidence };
  for (const [lessonId, right] of Object.entries(local.readingEvidence)) {
    const left = merged.readingEvidence[lessonId];
    if (!left) merged.readingEvidence[lessonId] = right;
    else {
      const latest = laterTimestamp(left.lastAt, right.lastAt) === "right" ? right : left;
      merged.readingEvidence[lessonId] = {
        ...latest,
        attempts: Math.max(left.attempts, right.attempts),
        accurate: Math.max(left.accurate, right.accurate),
        needsPractice: Math.max(left.needsPractice, right.needsPractice),
      };
    }
  }
  return merged;
}

function mergeDailyIds(left: Record<string, string[]>, right: Record<string, string[]>) {
  const merged: Record<string, string[]> = {};
  for (const day of new Set([...Object.keys(left), ...Object.keys(right)])) {
    merged[day] = [...new Set([...(left[day] ?? []), ...(right[day] ?? [])])];
  }
  return merged;
}

function persist(profile: StudyProfile) {
  wx.setStorageSync(PROFILE_KEY, profile);
}

async function pushProfile(profile: StudyProfile) {
  if (!getSessionToken()) return;
  try {
    const response = await apiRequest<{ profile?: unknown }>("/api/profile", {
      method: "PUT",
      data: profile,
      header: { "content-type": "application/json" },
    });
    if (response.profile) persist(mergeProfiles(response.profile, profile));
  } catch (error) {
    console.info("Profile sync deferred", error);
  }
}

export function saveProfile(profile: StudyProfile, immediate = false) {
  persist(profile);
  if (saveTimer !== null) clearTimeout(saveTimer);
  if (immediate) {
    saveTimer = null;
    void pushProfile(profile);
  } else {
    saveTimer = setTimeout(() => {
      saveTimer = null;
      void pushProfile(loadProfile());
    }, 900) as unknown as number;
  }
  return profile;
}

export async function syncProfile() {
  const local = loadProfile();
  if (!getSessionToken()) return local;
  try {
    const response = await apiRequest<{ profile?: unknown }>("/api/profile");
    const merged = mergeProfiles(response.profile, local);
    persist(merged);
    if (JSON.stringify(merged) !== JSON.stringify(response.profile ?? {})) await pushProfile(merged);
    return merged;
  } catch (error) {
    console.info("Using local profile while sync is unavailable", error);
    return local;
  }
}

function actorId() {
  const stored = wx.getStorageSync<string>(ACTOR_KEY);
  if (/^[a-zA-Z0-9_-]{8,32}$/u.test(stored)) return stored;
  const created = `wx${Date.now().toString(36)}`;
  wx.setStorageSync(ACTOR_KEY, created);
  return created;
}

export function ensureProfileActor() {
  const stored = wx.getStorageSync<string>(ACTOR_KEY);
  if (/^[a-zA-Z0-9_-]{8,32}$/u.test(stored)) return Promise.resolve(stored);
  return new Promise<string>((resolve) => {
    wx.getRandomValues({
      length: 10,
      success: (result) => {
        const created = `wx${Array.from(new Uint8Array(result.randomValues), (value) => value.toString(16).padStart(2, "0")).join("")}`;
        wx.setStorageSync(ACTOR_KEY, created);
        resolve(created);
      },
      fail: () => resolve(actorId()),
    });
  });
}

export function learningDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function recordAnswer({
  profile,
  track,
  lessonId,
  characterId,
  questionId,
  correct,
  questionIndex,
  completed,
  questionCount,
  reviewDue = false,
  dimension,
  answerMode,
  cueLevel,
  latencyMs,
  errorTags,
}: {
  profile: StudyProfile;
  track: TrackId;
  lessonId: string;
  characterId: string;
  questionId: string;
  correct: boolean;
  questionIndex: number;
  completed: boolean;
  questionCount: number;
  reviewDue?: boolean;
  dimension: SkillDimension;
  answerMode: AnswerMode;
  cueLevel: 0 | 1 | 2 | 3;
  latencyMs: number;
  errorTags: ErrorTag[];
}) {
  const now = new Date().toISOString();
  return saveProfile(applyAnswerTransition(normalizeProfile(profile), {
    actorId: actorId(),
    track,
    lessonId,
    characterId,
    questionId,
    correct,
    questionIndex,
    questionCount,
    completed,
    reviewDue,
    dimension,
    answerMode,
    cueLevel,
    latencyMs,
    errorTags,
    occurredAt: now,
    day: learningDayKey(),
  }));
}

export function recordReading(lessonId: string, accurate: boolean) {
  const profile = loadProfile();
  const day = learningDayKey();
  const now = new Date().toISOString();
  const daily = profile.daily[day] ?? { attempts: 0, correct: 0, skips: 0, readSessions: 0 };
  profile.daily = { ...profile.daily, [day]: { ...daily, readSessions: daily.readSessions + 1 } };
  const previous = profile.readingEvidence[lessonId] ?? {
    attempts: 0,
    accurate: 0,
    needsPractice: 0,
    lastAt: now,
    lastAccuracy: "needs-practice" as const,
    verificationSource: "self" as const,
  };
  profile.readingEvidence = {
    ...profile.readingEvidence,
    [lessonId]: {
      attempts: previous.attempts + 1,
      accurate: previous.accurate + Number(accurate),
      needsPractice: previous.needsPractice + Number(!accurate),
      lastAt: now,
      lastAccuracy: accurate ? "accurate" : "needs-practice",
      verificationSource: "self",
    },
  };
  if (accurate && !profile.readLessons.includes(lessonId)) profile.readLessons = [...profile.readLessons, lessonId];
  return saveProfile(profile, true);
}

export function resetLocalProfile() {
  const profile = emptyProfile();
  persist(profile);
  return profile;
}

export async function resetEverywhere() {
  if (getSessionToken()) await apiRequest<{ ok: true }>("/api/profile", { method: "DELETE" });
  return resetLocalProfile();
}
