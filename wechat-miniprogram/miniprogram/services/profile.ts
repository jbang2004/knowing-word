import type { StudyProfile, TrackId } from "../types/models";
import { apiRequest } from "./api";
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

function laterAnswer<T extends { lastAt: string }>(left: T | undefined, right: T | undefined) {
  if (!left) return right;
  if (!right) return left;
  return Date.parse(right.lastAt) >= Date.parse(left.lastAt) ? right : left;
}

export function mergeProfiles(serverValue: unknown, localValue: unknown) {
  const server = normalizeProfile(serverValue);
  const local = normalizeProfile(localValue);
  const merged = normalizeProfile({ ...server, ...local });
  const tracks: TrackId[] = ["words", "split", "honglan", "structure"];
  for (const track of tracks) {
    merged.completed[track] = [...new Set([...server.completed[track], ...local.completed[track]])];
    merged.last[track] = local.last[track] ?? server.last[track];
  }
  merged.favorites = [...new Set([...server.favorites, ...local.favorites])];
  merged.learnedComponents = [...new Set([...server.learnedComponents, ...local.learnedComponents])];
  merged.readLessons = [...new Set([...server.readLessons, ...local.readLessons])];
  merged.answers = {};
  for (const id of new Set([...Object.keys(server.answers), ...Object.keys(local.answers)])) {
    const answer = laterAnswer(server.answers[id], local.answers[id]);
    if (answer) merged.answers[id] = answer;
  }
  merged.daily = { ...server.daily, ...local.daily };
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
  const created = `wx${Math.random().toString(36).slice(2, 14)}`;
  wx.setStorageSync(ACTOR_KEY, created);
  return created;
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
}: {
  profile: StudyProfile;
  track: TrackId;
  lessonId: string;
  characterId: string;
  questionId: string;
  correct: boolean;
  questionIndex: number;
  completed: boolean;
}) {
  const now = new Date().toISOString();
  const previous = profile.answers[questionId];
  const actorCounts = { ...(previous?.actorCounts ?? {}) };
  const actor = actorCounts[actorId()] ?? { attempts: 0, correct: 0 };
  actorCounts[actorId()] = { attempts: actor.attempts + 1, correct: actor.correct + Number(correct) };
  const day = learningDayKey();
  const daily = profile.daily[day] ?? { attempts: 0, correct: 0, skips: 0, readSessions: 0 };
  const next = normalizeProfile(profile);
  next.answers = {
    ...profile.answers,
    [questionId]: {
      attempts: Object.values(actorCounts).reduce((sum, count) => sum + count.attempts, 0),
      correct: Object.values(actorCounts).reduce((sum, count) => sum + count.correct, 0),
      lastCorrect: correct,
      lastAt: now,
      actorCounts,
    },
  };
  next.last = { ...profile.last, [track]: { lessonId, characterId, questionIndex } };
  next.daily = { ...profile.daily, [day]: { ...daily, attempts: daily.attempts + 1, correct: daily.correct + Number(correct) } };
  if (completed && !next.completed[track].includes(characterId)) {
    next.completed[track] = [...next.completed[track], characterId];
  }
  return saveProfile(next);
}

export function recordReading(lessonId: string, accurate: boolean) {
  const profile = loadProfile();
  const day = learningDayKey();
  const daily = profile.daily[day] ?? { attempts: 0, correct: 0, skips: 0, readSessions: 0 };
  profile.daily = { ...profile.daily, [day]: { ...daily, readSessions: daily.readSessions + 1 } };
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
