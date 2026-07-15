"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  characters,
  components,
  course,
  lessons,
  type CharacterItem,
  type ComponentItem,
  type Exercise,
} from "./data/catalog";
import {
  characterVisuals,
  getVisualOption,
  lessonVisuals,
} from "./data/illustrations";
import { heritageAssets, type AudioMark } from "./data/heritage-assets";
import {
  getMnemonicLayout,
  getMnemonicScene,
} from "./data/mnemonic-scenes";
import {
  getMnemonicStageCopy,
  getMnemonicStagePartIndices,
  mnemonicStageLabels,
  type MnemonicStage,
} from "./data/mnemonics";
import {
  isQuestionSetComplete,
  nextCandidateId,
  nextResumeIndex,
  updateCompletion,
} from "./lib/progress-model";

type Screen =
  | "home"
  | "course"
  | "lesson"
  | "character"
  | "trackMap"
  | "trackLesson"
  | "challenge"
  | "components"
  | "records"
  | "recordDetail"
  | "read"
  | "profile"
  | "playground";

type TrackId = "words" | "split" | "honglan" | "structure";

type AnswerStat = {
  attempts: number;
  correct: number;
  lastCorrect: boolean;
  lastAt: string;
};

type ResumePoint = {
  lessonId: string;
  characterId: string;
  questionIndex: number;
};

type StudyProfile = {
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
  daily: Record<string, { attempts: number; correct: number; skips: number; readSessions: number }>;
  readSessions: number;
};

type AccountIdentity = {
  displayName: string;
  email: string | null;
  mode: "workspace" | "device";
};

type PlaygroundKind = "kit" | "lesson" | "puzzle" | "quiz";

type AppRoute = {
  screen: Screen;
  lessonId?: string;
  characterId?: string;
  track?: TrackId;
  playground?: PlaygroundKind;
};

type TrackMeta = {
  id: TrackId;
  label: string;
  menu: string;
  eyebrow: string;
  copy: string;
  action: string;
  origin: string;
  glyph: string;
  tone: string;
};

const allCharacters = characters as unknown as CharacterItem[];
const allComponents = components as unknown as ComponentItem[];
const lessonList = lessons as unknown as { id: string; title: string; position: number }[];
const initialLesson = lessonList[0];
const initialCharacter =
  allCharacters.find((item) => item.lessonId === initialLesson.id && item.primary) ||
  allCharacters[0];
const trackIds: TrackId[] = ["words", "split", "honglan", "structure"];
const STORAGE_KEY = "knowing-word:course-progress:v3";
const STORAGE_UPDATED_KEY = "knowing-word:course-progress:updated-at";
const VERSION_TWO_STORAGE_KEY = "knowing-word:course-progress:v2";
const LEGACY_STORAGE_KEY = "knowing-word:local-profile:v1";

const trackMeta: Record<TrackId, TrackMeta> = {
  words: {
    id: "words",
    label: "词语表与写字表",
    menu: "识字",
    eyebrow: "理解字义，认识字形",
    copy: "从课文词语出发，先听故事、看字形，再完成一套由浅入深的小测。",
    action: "继续识字",
    origin: "识字小测",
    glyph: "字",
    tone: "coral",
  },
  split: {
    id: "split",
    label: "课后练习",
    menu: "拆字",
    eyebrow: "拆一拆，再写一写",
    copy: "把汉字拆成部首和部件，自己搭回去，再落笔写完整的字。",
    action: "继续拆字",
    origin: "拆一拆",
    glyph: "拆",
    tone: "saffron",
  },
  honglan: {
    id: "honglan",
    label: "红蓝练习",
    menu: "红蓝",
    eyebrow: "分清部首与其他部件",
    copy: "让表意的部首和其他部件穿上不同颜色，建立字形的颜色记忆。",
    action: "继续红蓝",
    origin: "红蓝字",
    glyph: "红蓝",
    tone: "lapis",
  },
  structure: {
    id: "structure",
    label: "空间结构",
    menu: "结构",
    eyebrow: "像搭积木一样看汉字",
    copy: "左右、上下、包围……先看部件怎样站位，再选出正确的空间结构。",
    action: "继续结构",
    origin: "空间结构",
    glyph: "构",
    tone: "jade",
  },
};

const trackBase: Record<Exclude<TrackId, "words">, string> = {
  split: "/split-exercise",
  honglan: "/honglan-exercise",
  structure: "/space-structure-exercise",
};

function routeForTrack(track: TrackId, lessonId?: string, characterId?: string) {
  if (track === "words") {
    if (lessonId && characterId) return `/lessons/${lessonId}/words/${characterId}/quizzes`;
    if (lessonId) return `/lessons/${lessonId}`;
    return "/lessons";
  }
  const base = trackBase[track];
  if (!lessonId) return base;
  if (!characterId) return `${base}/${lessonId}`;
  const segment = track === "split" ? "words" : "lesson_words";
  return `${base}/${lessonId}/${segment}/${characterId}`;
}

function resolveAppRoute(pathValue: string): AppRoute {
  const pathname = pathValue.split("?")[0].replace(/\/+$/, "") || "/";
  const parts = pathname.split("/").filter(Boolean);
  if (!parts.length) return { screen: "home" };
  if (parts[0] === "account") return { screen: "profile" };
  if (parts[0] === "records") {
    const track = trackIds.includes(parts[1] as TrackId) ? parts[1] as TrackId : undefined;
    const character = allCharacters.find((item) => item.id === parts[2]);
    return character && track
      ? { screen: "recordDetail", track, lessonId: character.lessonId, characterId: character.id }
      : { screen: "records", track };
  }
  if (parts[0] === "bujian") return { screen: "components" };
  if (parts[0] === "read-aloud") return { screen: "read" };
  if (parts[0] === "playground") {
    const playground = (["kit", "lesson", "puzzle", "quiz"].includes(parts[1]) ? parts[1] : "kit") as PlaygroundKind;
    return { screen: "playground", playground };
  }
  if (parts[0] === "lessons") {
    if (!parts[1]) return { screen: "course" };
    const lesson = lessonList.find((item) => item.id === parts[1]);
    if (!lesson) return { screen: "course" };
    const character = allCharacters.find((item) => item.id === parts[3] && item.lessonId === lesson.id);
    if (parts[2] === "words" && character) {
      return {
        screen: parts[4] === "quizzes" ? "challenge" : "character",
        track: "words",
        lessonId: lesson.id,
        characterId: character.id,
      };
    }
    return { screen: "lesson", lessonId: lesson.id };
  }

  const routeTrack: TrackId | undefined =
    parts[0] === "split-exercise"
      ? "split"
      : parts[0] === "honglan-exercise"
        ? "honglan"
        : parts[0] === "space-structure-exercise"
          ? "structure"
          : undefined;
  if (routeTrack) {
    if (!parts[1]) return { screen: "trackMap", track: routeTrack };
    const lesson = lessonList.find((item) => item.id === parts[1]);
    const character = allCharacters.find((item) => item.id === parts[3] && item.lessonId === lesson?.id);
    if (lesson && character) {
      return { screen: "challenge", track: routeTrack, lessonId: lesson.id, characterId: character.id };
    }
    return lesson
      ? { screen: "trackLesson", track: routeTrack, lessonId: lesson.id }
      : { screen: "trackMap", track: routeTrack };
  }
  return { screen: "home" };
}

function todayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function emptyProfile(): StudyProfile {
  return {
    version: 3,
    name: "",
    grade: course.grade,
    courseId: "chinese-grade-5-volume-1",
    theme: "light",
    favorites: [],
    completed: {
      words: [],
      split: [],
      honglan: [],
      structure: [],
    },
    last: {
      words: null,
      split: null,
      honglan: null,
      structure: null,
    },
    answers: {},
    learnedComponents: [],
    recentComponents: [],
    daily: {},
    readSessions: 0,
  };
}

function normalizeProfile(value: unknown): StudyProfile {
  const raw = (value || {}) as Partial<StudyProfile> & { mastered?: unknown };
  const fallback = emptyProfile();
  const legacyMastered = Array.isArray(raw.mastered)
    ? raw.mastered.filter((item): item is string => typeof item === "string")
    : [];

  for (const id of trackIds) {
    const rawCompleted = raw.completed?.[id];
    fallback.completed[id] = Array.isArray(rawCompleted)
      ? rawCompleted.filter((item): item is string => typeof item === "string")
      : id === "words"
        ? legacyMastered
        : [];

    const rawLast = raw.last?.[id];
    fallback.last[id] =
      rawLast &&
      typeof rawLast.lessonId === "string" &&
      typeof rawLast.characterId === "string" &&
      typeof rawLast.questionIndex === "number"
        ? rawLast
        : null;
  }

  return {
    ...fallback,
    version: 3,
    name: typeof raw.name === "string" ? raw.name.slice(0, 18) : "",
    grade: typeof raw.grade === "number" ? raw.grade : course.grade,
    courseId: typeof raw.courseId === "string" ? raw.courseId : "chinese-grade-5-volume-1",
    theme: raw.theme === "night" ? "night" : "light",
    favorites: Array.isArray(raw.favorites)
      ? raw.favorites.filter((item): item is string => typeof item === "string")
      : [],
    answers:
      raw.answers && typeof raw.answers === "object"
        ? (raw.answers as Record<string, AnswerStat>)
        : {},
    learnedComponents: Array.isArray(raw.learnedComponents)
      ? raw.learnedComponents.filter((item): item is string => typeof item === "string")
      : [],
    recentComponents: Array.isArray(raw.recentComponents)
      ? raw.recentComponents.filter((item): item is string => typeof item === "string").slice(0, 24)
      : [],
    daily: raw.daily && typeof raw.daily === "object" ? raw.daily : {},
    readSessions:
      typeof raw.readSessions === "number" && Number.isFinite(raw.readSessions)
        ? raw.readSessions
        : 0,
  };
}

function getLessonCharacters(lessonId: string) {
  return allCharacters.filter((item) => item.lessonId === lessonId && item.primary);
}

function getTrackExercises(character: CharacterItem, track: TrackId) {
  return character.exercises.filter((exercise) => exercise.origin === trackMeta[track].origin);
}

function getTrackCharacters(track: TrackId, lessonId?: string) {
  return allCharacters.filter(
    (item) =>
      item.primary &&
      (!lessonId || item.lessonId === lessonId) &&
      getTrackExercises(item, track).length > 0,
  );
}

function getWordGroups(lessonId: string) {
  const map = new Map<string, CharacterItem[]>();
  for (const item of getLessonCharacters(lessonId)) {
    const key = String(item.wordPosition) + "-" + item.word;
    const existing = map.get(key) || [];
    existing.push(item);
    map.set(key, existing);
  }
  return [...map.values()];
}

function optionText(
  option: Exercise["options"][number],
  character: CharacterItem,
  index: number,
) {
  if (option.text) return option.text;
  if (option.correct) return character.originalMeaning || "与字义相关的图意";

  const source = allCharacters.find(
    (item, sourceIndex) =>
      item.id !== character.id &&
      Boolean(item.originalMeaning) &&
      sourceIndex % 3 === index % 3,
  );
  return source?.originalMeaning || "另一种图意";
}

function questionTypeLabel(question: Exercise, track: TrackId) {
  if (question.kind === "write") return "写整字";
  if (track === "honglan") return "红蓝字";
  if (track === "split") return "组字 · 选字";
  if (question.kind === "structure") return "结构选择";
  if (question.questionType === "image_single_select") return "看图选择";
  if (question.kind === "components") return "组字 · 选字";
  return "选择题";
}

function getExpectedIds(question: Exercise, character: CharacterItem, track: TrackId) {
  if (track === "split" && question.kind === "components") {
    const inOrder = character.parts
      .map((part) =>
        question.options.find((option) => option.correct && option.text === part.char)?.id,
      )
      .filter((id): id is string => Boolean(id));
    if (inOrder.length) return inOrder;
  }
  return question.options.filter((option) => option.correct).map((option) => option.id);
}

function isAnswerCorrect(
  question: Exercise,
  character: CharacterItem,
  track: TrackId,
  selected: string[],
  wrote: boolean,
) {
  if (question.kind === "write") return wrote;
  const expected = getExpectedIds(question, character, track);
  if (track === "split" && question.kind === "components") {
    return expected.length === selected.length && expected.every((id, index) => selected[index] === id);
  }
  const current = [...selected].sort();
  const target = [...expected].sort();
  return current.length === target.length && current.every((id, index) => id === target[index]);
}

function getNextCharacter(
  track: TrackId,
  profile: StudyProfile,
  lessonId?: string,
) {
  const candidates = getTrackCharacters(track, lessonId);
  if (!candidates.length) return undefined;
  const last = profile.last[track];
  const nextId = nextCandidateId(
    candidates.map((item) => item.id),
    profile.completed[track],
    last?.characterId,
  );
  return candidates.find((item) => item.id === nextId);
}

function trackProgress(profile: StudyProfile, track: TrackId, lessonId?: string) {
  const targets = getTrackCharacters(track, lessonId);
  const completed = targets.filter((item) => profile.completed[track].includes(item.id)).length;
  return { completed, total: targets.length };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function speak(text: string, onEnd?: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.76;
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
}

export default function Home({ initialPath = "/" }: { initialPath?: string }) {
  const initialRoute = useMemo(() => resolveAppRoute(initialPath), [initialPath]);
  const [screen, setScreen] = useState<Screen>(initialRoute.screen);
  const [profile, setProfile] = useState<StudyProfile>(emptyProfile);
  const [selectedLessonId, setSelectedLessonId] = useState(initialRoute.lessonId || initialLesson.id);
  const [selectedCharacterId, setSelectedCharacterId] = useState(initialRoute.characterId || initialCharacter.id);
  const [selectedTrack, setSelectedTrack] = useState<TrackId>(initialRoute.track || "words");
  const [selectedComponentId, setSelectedComponentId] = useState(allComponents[0]?.id || "");
  const [componentSearch, setComponentSearch] = useState("");
  const [recordTrack, setRecordTrack] = useState<TrackId>(initialRoute.track || "words");
  const [playgroundKind, setPlaygroundKind] = useState<PlaygroundKind>(initialRoute.playground || "kit");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [wrote, setWrote] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [identity, setIdentity] = useState<AccountIdentity | null>(null);
  const [syncState, setSyncState] = useState<"loading" | "synced" | "local">("loading");

  const applyRoute = useCallback((route: AppRoute) => {
    setScreen(route.screen);
    if (route.lessonId) setSelectedLessonId(route.lessonId);
    if (route.characterId) setSelectedCharacterId(route.characterId);
    if (route.track) {
      setSelectedTrack(route.track);
      if (route.screen === "records" || route.screen === "recordDetail") setRecordTrack(route.track);
    }
    if (route.playground) setPlaygroundKind(route.playground);
    if (route.screen === "challenge") {
      setQuestionIndex(0);
      setSelectedOptions([]);
      setWrote(false);
      setResult(null);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      let localProfile: StudyProfile | null = null;
      let localUpdatedAt = 0;
      try {
        const stored =
          window.localStorage.getItem(STORAGE_KEY) ||
          window.localStorage.getItem(VERSION_TWO_STORAGE_KEY) ||
          window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (stored) localProfile = normalizeProfile(JSON.parse(stored));
        localUpdatedAt = Date.parse(window.localStorage.getItem(STORAGE_UPDATED_KEY) || "") || 0;
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      try {
        const response = await fetch("/api/profile", { cache: "no-store" });
        if (!response.ok) throw new Error("profile unavailable");
        const payload = await response.json() as {
          identity?: AccountIdentity;
          profile?: unknown;
          updatedAt?: string | null;
        };
        if (!active) return;
        if (payload.identity) setIdentity(payload.identity);
        const serverUpdatedAt = Date.parse(payload.updatedAt || "") || 0;
        if (payload.profile && (!localProfile || serverUpdatedAt >= localUpdatedAt)) {
          setProfile(normalizeProfile(payload.profile));
        } else if (localProfile) {
          setProfile(localProfile);
          void fetch("/api/profile", {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(localProfile),
          });
        }
        setSyncState("synced");
      } catch {
        if (active && localProfile) setProfile(localProfile);
        if (active) setSyncState("local");
      } finally {
        if (active) setHydrated(true);
      }
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    window.localStorage.setItem(STORAGE_UPDATED_KEY, new Date().toISOString());
    document.documentElement.dataset.theme = profile.theme;
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch("/api/profile", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(profile),
        });
        setSyncState(response.ok ? "synced" : "local");
      } catch {
        setSyncState("local");
      }
    }, 650);
    return () => window.clearTimeout(timer);
  }, [hydrated, profile]);

  useEffect(() => {
    const onPopState = () => applyRoute(resolveAppRoute(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [applyRoute]);

  const selectedLesson =
    lessonList.find((lesson) => lesson.id === selectedLessonId) || initialLesson;
  const selectedCharacter =
    allCharacters.find((item) => item.id === selectedCharacterId) || initialCharacter;
  const selectedComponent =
    allComponents.find((item) => item.id === selectedComponentId) || allComponents[0];
  const challengeExercises = getTrackExercises(selectedCharacter, selectedTrack);
  const currentQuestion = challengeExercises[questionIndex];
  const favoriteSet = useMemo(() => new Set(profile.favorites), [profile.favorites]);

  function navigatePath(path: string, replace = false) {
    const route = resolveAppRoute(path);
    window.history[replace ? "replaceState" : "pushState"]({}, "", path);
    applyRoute(route);
  }

  function navigate(next: Screen) {
    const path =
      next === "home" ? "/" :
      next === "course" ? "/lessons" :
      next === "lesson" ? `/lessons/${selectedLessonId}` :
      next === "character" ? `/lessons/${selectedLessonId}/words/${selectedCharacterId}` :
      next === "trackMap" ? routeForTrack(selectedTrack === "words" ? "split" : selectedTrack) :
      next === "trackLesson" ? routeForTrack(selectedTrack, selectedLessonId) :
      next === "challenge" ? routeForTrack(selectedTrack, selectedLessonId, selectedCharacterId) :
      next === "components" ? "/bujian" :
      next === "records" ? "/records" :
      next === "recordDetail" ? `/records/${recordTrack}/${selectedCharacterId}` :
      next === "read" ? "/read-aloud" :
      next === "playground" ? `/playground/${playgroundKind}` :
      "/account";
    navigatePath(path);
  }

  function updateProfile(updater: (previous: StudyProfile) => StudyProfile) {
    setProfile((previous) => updater(previous));
  }

  function openLesson(lessonId: string) {
    navigatePath(`/lessons/${lessonId}`);
  }

  function openCharacter(character: CharacterItem) {
    navigatePath(`/lessons/${character.lessonId}/words/${character.id}`);
  }

  function openTrackMap(track: TrackId) {
    navigatePath(routeForTrack(track));
  }

  function openTrackLesson(track: TrackId, lessonId: string) {
    navigatePath(routeForTrack(track, lessonId));
  }

  function openRecordDetail(character: CharacterItem, track: TrackId) {
    navigatePath(`/records/${track}/${character.id}`);
  }

  function openChallenge(track: TrackId, character: CharacterItem, index = 0) {
    const questions = getTrackExercises(character, track);
    if (!questions.length) return;
    navigatePath(routeForTrack(track, character.lessonId, character.id));
    setQuestionIndex(Math.min(Math.max(index, 0), questions.length - 1));
  }

  function continueTrack(track: TrackId) {
    const next = getNextCharacter(track, profile);
    if (next) openChallenge(track, next, profile.last[track]?.characterId === next.id ? profile.last[track]?.questionIndex || 0 : 0);
  }

  function toggleFavorite(characterId: string) {
    updateProfile((previous) => ({
      ...previous,
      favorites: previous.favorites.includes(characterId)
        ? previous.favorites.filter((item) => item !== characterId)
        : [...previous.favorites, characterId],
    }));
  }

  function chooseOption(optionId: string) {
    if (!currentQuestion || result !== null) return;
    const expected = getExpectedIds(currentQuestion, selectedCharacter, selectedTrack);
    const multiple = expected.length > 1;

    if (!multiple) {
      setSelectedOptions([optionId]);
      return;
    }

    setSelectedOptions((previous) =>
      previous.includes(optionId)
        ? previous.filter((item) => item !== optionId)
        : [...previous, optionId],
    );
  }

  function removePlacedOption(optionId: string) {
    if (result !== null) return;
    setSelectedOptions((previous) => previous.filter((item) => item !== optionId));
  }

  function logLearningEvent(payload: Record<string, unknown>) {
    void fetch("/api/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => undefined);
  }

  function checkAnswer() {
    if (!currentQuestion || result !== null) return;
    const correct = isAnswerCorrect(
      currentQuestion,
      selectedCharacter,
      selectedTrack,
      selectedOptions,
      wrote,
    );
    const questionIds = challengeExercises.map((item) => item.id);
    const now = new Date().toISOString();
    setResult(correct);
    logLearningEvent({
      action: "answer",
      track: selectedTrack,
      lessonId: selectedCharacter.lessonId,
      characterId: selectedCharacter.id,
      questionId: currentQuestion.id,
      correct,
      selected: currentQuestion.kind === "write" ? ["written"] : selectedOptions,
    });

    updateProfile((previous) => {
      const prior = previous.answers[currentQuestion.id];
      const answers = {
        ...previous.answers,
        [currentQuestion.id]: {
          attempts: (prior?.attempts || 0) + 1,
          correct: (prior?.correct || 0) + (correct ? 1 : 0),
          lastCorrect: correct,
          lastAt: now,
        },
      };
      const allCorrect = isQuestionSetComplete(
        questionIds,
        currentQuestion.id,
        correct,
        answers,
      );
      const completed = { ...previous.completed };
      completed[selectedTrack] = updateCompletion(
        completed[selectedTrack],
        selectedCharacter.id,
        allCorrect,
      );
      const date = todayKey();
      const day = previous.daily[date] || { attempts: 0, correct: 0, skips: 0, readSessions: 0 };

      return {
        ...previous,
        answers,
        completed,
        daily: {
          ...previous.daily,
          [date]: {
            ...day,
            attempts: day.attempts + 1,
            correct: day.correct + (correct ? 1 : 0),
          },
        },
        last: {
          ...previous.last,
          [selectedTrack]: {
            lessonId: selectedCharacter.lessonId,
            characterId: selectedCharacter.id,
            questionIndex: nextResumeIndex(questionIndex, challengeExercises.length, correct),
          },
        },
      };
    });
  }

  function setChallengeStep(index: number) {
    setQuestionIndex(Math.min(Math.max(index, 0), challengeExercises.length - 1));
    setSelectedOptions([]);
    setWrote(false);
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function nextChallengeStep() {
    if (!currentQuestion) return;
    if (result === false) {
      setSelectedOptions([]);
      setWrote(false);
      setResult(null);
      return;
    }

    if (questionIndex < challengeExercises.length - 1) {
      setChallengeStep(questionIndex + 1);
      return;
    }

    if (selectedTrack === "words") {
      openLesson(selectedCharacter.lessonId);
    } else {
      openTrackLesson(selectedTrack, selectedCharacter.lessonId);
    }
  }

  function previousChallengeStep() {
    if (questionIndex > 0) setChallengeStep(questionIndex - 1);
  }

  function skipChallengeStep() {
    if (!currentQuestion) return;
    logLearningEvent({
      action: "skip",
      track: selectedTrack,
      lessonId: selectedCharacter.lessonId,
      characterId: selectedCharacter.id,
      questionId: currentQuestion.id,
    });
    updateProfile((previous) => {
      const date = todayKey();
      const day = previous.daily[date] || { attempts: 0, correct: 0, skips: 0, readSessions: 0 };
      return {
        ...previous,
        daily: { ...previous.daily, [date]: { ...day, skips: day.skips + 1 } },
        last: {
          ...previous.last,
          [selectedTrack]: {
            lessonId: selectedCharacter.lessonId,
            characterId: selectedCharacter.id,
            questionIndex: Math.min(questionIndex + 1, Math.max(0, challengeExercises.length - 1)),
          },
        },
      };
    });
    if (questionIndex < challengeExercises.length - 1) {
      setChallengeStep(questionIndex + 1);
    } else if (selectedTrack === "words") {
      openLesson(selectedCharacter.lessonId);
    } else {
      openTrackLesson(selectedTrack, selectedCharacter.lessonId);
    }
  }

  function markComponentLearned(componentId: string) {
    updateProfile((previous) => ({
      ...previous,
      learnedComponents: previous.learnedComponents.includes(componentId)
        ? previous.learnedComponents
        : [...previous.learnedComponents, componentId],
      recentComponents: [componentId, ...previous.recentComponents.filter((id) => id !== componentId)].slice(0, 24),
    }));
  }

  function resetProfile() {
    if (!window.confirm("清除你的学习足迹吗？课程内容不会受影响。")) return;
    const next = { ...emptyProfile(), theme: profile.theme };
    setSyncState("loading");
    void (async () => {
      try {
        await fetch("/api/profile", { method: "DELETE" });
      } finally {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(STORAGE_UPDATED_KEY);
        setProfile(next);
      }
    })();
  }

  function completeReadSession() {
    logLearningEvent({ action: "read", lessonId: selectedLessonId });
    updateProfile((previous) => {
      const date = todayKey();
      const day = previous.daily[date] || { attempts: 0, correct: 0, skips: 0, readSessions: 0 };
      return {
        ...previous,
        readSessions: previous.readSessions + 1,
        daily: { ...previous.daily, [date]: { ...day, readSessions: day.readSessions + 1 } },
      };
    });
  }

  return (
    <main className="game-shell">
      <TopNavigation
        active={screen}
        name={profile.name}
        onNavigate={navigate}
        onProfile={() => navigate("profile")}
      />

      {screen === "home" && (
        <HomeHub
          profile={profile}
          hydrated={hydrated}
          syncState={syncState}
          onCourse={() => navigate("course")}
          onTrackMap={openTrackMap}
          onContinue={continueTrack}
          onRecords={() => navigate("records")}
          onRead={() => navigate("read")}
        />
      )}

      {screen === "course" && (
        <CourseMap
          profile={profile}
          onBack={() => navigate("home")}
          onLesson={openLesson}
        />
      )}

      {screen === "lesson" && (
        <LessonWordMap
          lesson={selectedLesson}
          profile={profile}
          onBack={() => navigate("course")}
          onCharacter={openCharacter}
          onTrackLesson={openTrackLesson}
        />
      )}

      {screen === "character" && (
        <CharacterStudy
          character={selectedCharacter}
          profile={profile}
          favorite={favoriteSet.has(selectedCharacter.id)}
          onBack={() => openLesson(selectedCharacter.lessonId)}
          onFavorite={() => toggleFavorite(selectedCharacter.id)}
          onStart={() => openChallenge("words", selectedCharacter)}
          onComponent={(glyph) => {
            const component = allComponents.find((item) => item.glyph === glyph);
            if (component) {
              setSelectedComponentId(component.id);
              markComponentLearned(component.id);
              navigate("components");
            }
          }}
        />
      )}

      {screen === "trackMap" && (
        <TrackMap
          track={selectedTrack}
          profile={profile}
          onBack={() => navigate("home")}
          onContinue={() => continueTrack(selectedTrack)}
          onLesson={(lessonId) => openTrackLesson(selectedTrack, lessonId)}
        />
      )}

      {screen === "trackLesson" && (
        <TrackLessonMap
          track={selectedTrack}
          lesson={selectedLesson}
          profile={profile}
          onBack={() => openTrackMap(selectedTrack)}
          onCharacter={(character) => openChallenge(selectedTrack, character)}
        />
      )}

      {screen === "challenge" && currentQuestion && (
        <ChallengeRoom
          track={selectedTrack}
          character={selectedCharacter}
          question={currentQuestion}
          questionIndex={questionIndex}
          total={challengeExercises.length}
          selected={selectedOptions}
          wrote={wrote}
          result={result}
          profile={profile}
          onBack={() =>
            selectedTrack === "words"
              ? openCharacter(selectedCharacter)
              : openTrackLesson(selectedTrack, selectedCharacter.lessonId)
          }
          onChoose={chooseOption}
          onRemove={removePlacedOption}
          onWrite={() => setWrote(true)}
          onClearWrite={() => setWrote(false)}
          onCheck={checkAnswer}
          onNext={nextChallengeStep}
          onPrevious={previousChallengeStep}
          onSkip={skipChallengeStep}
        />
      )}

      {screen === "components" && selectedComponent && (
        <ComponentStudio
          profile={profile}
          selected={selectedComponent}
          search={componentSearch}
          onBack={() => navigate("home")}
          onSearch={setComponentSearch}
          onSelect={(component) => {
            setSelectedComponentId(component.id);
            markComponentLearned(component.id);
          }}
          onCharacter={openCharacter}
        />
      )}

      {screen === "records" && (
        <LearningRecords
          profile={profile}
          track={recordTrack}
          onBack={() => navigate("home")}
          onTrack={(track) => navigatePath(`/records/${track}`)}
          onDetail={(character) => openRecordDetail(character, recordTrack)}
        />
      )}

      {screen === "recordDetail" && (
        <RecordDetail
          character={selectedCharacter}
          profile={profile}
          track={recordTrack}
          onBack={() => navigatePath(`/records/${recordTrack}`)}
          onPractice={(index) => openChallenge(recordTrack, selectedCharacter, index)}
        />
      )}

      {screen === "read" && (
        <ReadAloud
          profile={profile}
          onBack={() => navigate("home")}
          onSession={completeReadSession}
        />
      )}

      {screen === "profile" && (
        <ProfilePanel
          profile={profile}
          identity={identity}
          syncState={syncState}
          onBack={() => navigate("home")}
          onName={(name) => updateProfile((previous) => ({ ...previous, name }))}
          onGrade={(grade) => updateProfile((previous) => ({ ...previous, grade }))}
          onTheme={() =>
            updateProfile((previous) => ({
              ...previous,
              theme: previous.theme === "light" ? "night" : "light",
            }))
          }
          onReset={resetProfile}
        />
      )}

      {screen === "playground" && (
        <Playground
          kind={playgroundKind}
          onBack={() => navigate("home")}
          onKind={(kind) => navigatePath(`/playground/${kind}`)}
        />
      )}
    </main>
  );
}

function TopNavigation({
  active,
  name,
  onNavigate,
  onProfile,
}: {
  active: Screen;
  name: string;
  onNavigate: (screen: Screen) => void;
  onProfile: () => void;
}) {
  const nav: { label: string; screen: Screen; active: Screen[] }[] = [
    { label: "首页", screen: "home", active: ["home"] },
    { label: "课本", screen: "course", active: ["course", "lesson", "character"] },
    { label: "专项", screen: "trackMap", active: ["trackMap", "trackLesson", "challenge"] },
    { label: "部件", screen: "components", active: ["components"] },
    { label: "记录", screen: "records", active: ["records", "recordDetail"] },
  ];

  return (
    <header className="top-navigation">
      <button className="wordmark" onClick={() => onNavigate("home")} aria-label="回到 Knowing Word 首页">
        <span className="wordmark-flag">汉字学习旅程</span>
        <strong>KNOWING<br />WORD</strong>
      </button>
      <nav aria-label="主菜单">
        {nav.map((item) => (
          <button
            className={item.active.includes(active) ? "is-active" : ""}
            key={item.label}
            onClick={() => onNavigate(item.screen)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <button className="profile-pill" onClick={onProfile}>
        <span>{name ? name.slice(0, 1) : "学"}</span>
        <small>{name || "我的书包"}</small>
      </button>
    </header>
  );
}

function HomeHub({
  profile,
  hydrated,
  syncState,
  onCourse,
  onTrackMap,
  onContinue,
  onRecords,
  onRead,
}: {
  profile: StudyProfile;
  hydrated: boolean;
  syncState: "loading" | "synced" | "local";
  onCourse: () => void;
  onTrackMap: (track: TrackId) => void;
  onContinue: (track: TrackId) => void;
  onRecords: () => void;
  onRead: () => void;
}) {
  const nextWord = getNextCharacter("words", profile);
  const wordProgress = trackProgress(profile, "words");
  const name = profile.name || "小探险家";
  const today = profile.daily[todayKey()] || { attempts: 0, correct: 0, skips: 0, readSessions: 0 };

  return (
    <div className="page home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <label className="course-selector">
            <span>当前课程</span>
            <select aria-label="选择课程" value={profile.courseId} onChange={() => undefined}>
              <option value="chinese-grade-5-volume-1">语文 · 五年级上册</option>
            </select>
          </label>
          <h1>你好，{name}！<br />今天从一个字出发。</h1>
          <p>
            每个学习区都在训练不同能力：先懂字义，再会拆字、分部首、认结构。
          </p>
          <div className="hero-buttons">
            <button className="game-button primary" onClick={() => onContinue("words")}>
              {nextWord ? "继续学习「" + nextWord.hanzi + "」" : "开始识字"} <span>→</span>
            </button>
            <button className="game-button ghost" onClick={onCourse}>查看课本</button>
          </div>
          <div className="hero-status">
            <span className="pulse-dot" />
            {!hydrated
              ? "正在准备学习空间"
              : syncState === "synced"
                ? `今天已作答 ${today.attempts} 次 · 云端已同步`
                : `今天已作答 ${today.attempts} 次 · 当前离线，稍后自动同步`}
          </div>
        </div>
        <div className="hero-illustration">
          <Image
            src="/illustrations/system/home-hero.jpg"
            alt="两名孩子跟随蓝金色喜鹊，在桂花与书卷之间探索汉字"
            fill
            priority
            sizes="(max-width: 760px) 100vw, 46vw"
          />
          <div className="hero-badge">
            <span>当前识字进度</span>
            <strong>{wordProgress.completed}<small> / {wordProgress.total}</small></strong>
          </div>
        </div>
      </section>

      <section className="mission-heading">
        <div>
          <p className="kicker">今天可以做什么</p>
          <h2>四条学习路线，一起把字学扎实</h2>
        </div>
        <button className="text-button" onClick={onRecords}>查看学习记录 →</button>
      </section>

      <section className="mission-grid">
        {trackIds.map((track) => {
          const meta = trackMeta[track];
          const progress = trackProgress(profile, track);
          const next = getNextCharacter(track, profile);
          return (
            <article className={"mission-card " + meta.tone} key={track}>
              <div className="mission-card-top">
                <span className="mission-glyph">{meta.glyph}</span>
                <span className="mission-count">{progress.completed} / {progress.total}</span>
              </div>
              <p>{meta.eyebrow}</p>
              <h3>{meta.label}</h3>
              <div className="mission-next">
                <span>{next ? "上次到「" + next.hanzi + "」" : "准备开始"}</span>
                <button onClick={() => onContinue(track)}>{meta.action} →</button>
              </div>
              <button className="card-link" onClick={() => onTrackMap(track)} aria-label={"查看" + meta.label + "关卡地图"} />
            </article>
          );
        })}

        <article className="mission-card reading-card">
          <div className="mission-card-top">
            <span className="mission-glyph">读</span>
            <span className="mission-count">{profile.readSessions} 次</span>
          </div>
          <p>朗读 · 跟读 · 录音</p>
          <h3>日日朗读</h3>
          <div className="mission-next">
            <span>把课文里的句子读出声</span>
            <button onClick={onRead}>去朗读 →</button>
          </div>
        </article>
      </section>

      <section className="home-bottom-grid">
        <article className="course-glance">
          <div>
            <p className="kicker">关卡地图</p>
            <h2>跟着课文，一课一课往前走</h2>
          </div>
          <div className="lesson-dots">
            {lessonList.map((lesson) => {
              const progress = trackProgress(profile, "words", lesson.id);
              return (
                <button key={lesson.id} onClick={onCourse}>
                  <span>{String(lesson.position).padStart(2, "0")}</span>
                  <strong>{lesson.title}</strong>
                  <small>{progress.completed} / {progress.total} 字</small>
                </button>
              );
            })}
          </div>
        </article>
        <article className="learning-promise">
          <span>✦</span>
          <div>
            <p className="kicker">学习方法</p>
            <h2>看得懂字义，也能说清它是怎么搭起来的。</h2>
          </div>
        </article>
      </section>
    </div>
  );
}

function CourseMap({
  profile,
  onBack,
  onLesson,
}: {
  profile: StudyProfile;
  onBack: () => void;
  onLesson: (lessonId: string) => void;
}) {
  return (
    <div className="page course-page">
      <PageHeading
        kicker="课程地图"
        title={course.title}
        copy="按课文进入词语表：先认识词语里的每个字，再用后续专项反复巩固。"
        onBack={onBack}
      />
      <div className="lesson-route">
        {lessonList.map((lesson, index) => {
          const chars = getLessonCharacters(lesson.id);
          const progress = trackProgress(profile, "words", lesson.id);
          const illustration = lessonVisuals[lesson.id];
          return (
            <button className={"lesson-route-card lesson-tone-" + index} key={lesson.id} onClick={() => onLesson(lesson.id)}>
              <span className="route-index">第 {lesson.position} 课</span>
              <div className="route-scene">
                <Image src={illustration.src} alt={illustration.alt} fill sizes="180px" />
                <div className="route-character-cloud" aria-hidden="true">
                  {chars.slice(0, 4).map((character) => <i key={character.id}>{character.hanzi}</i>)}
                </div>
              </div>
              <div className="route-copy">
                <h2>{lesson.title}</h2>
                <p>{chars.length} 个核心字 · 已完成 {progress.completed} 个</p>
              </div>
              <span className="route-arrow">→</span>
            </button>
          );
        })}
      </div>
      <section className="course-method-card">
        <span>01</span><p>词语表中完成“认识 → 理解 → 小测”，再进入三条专项关卡重复提取记忆。</p>
      </section>
    </div>
  );
}

function LessonWordMap({
  lesson,
  profile,
  onBack,
  onCharacter,
  onTrackLesson,
}: {
  lesson: { id: string; title: string; position: number };
  profile: StudyProfile;
  onBack: () => void;
  onCharacter: (character: CharacterItem) => void;
  onTrackLesson: (track: TrackId, lessonId: string) => void;
}) {
  const groups = getWordGroups(lesson.id);
  const completed = new Set(profile.completed.words);
  const progress = trackProgress(profile, "words", lesson.id);
  const illustration = lessonVisuals[lesson.id];

  return (
    <div className="page lesson-page">
      <PageHeading
        kicker={"第 " + lesson.position + " 课"}
        title={lesson.title}
        copy={"词语表 · " + progress.completed + " / " + progress.total + " 个字已完成整套识字小测"}
        onBack={onBack}
      />

      <section className="lesson-scene-banner">
        <Image
          src={illustration.src}
          alt={illustration.alt}
          fill
          priority
          sizes="(max-width: 760px) 100vw, 920px"
        />
        <div>
          <span>课文场景</span>
          <strong>{lesson.title}</strong>
          <small>先进入画面，再从词语认识汉字</small>
        </div>
      </section>

      <section className="word-map-board">
        <div className="board-title"><span>词语表</span><i>把词语拆成一个个可理解的汉字</i></div>
        <div className="word-groups">
          {groups.map((group) => (
            <article className="word-group" key={group[0].id}>
              <p>{group[0].word}</p>
              <div>
                {group.map((character) => (
                  <button
                    className={
                      "word-chip " +
                      (completed.has(character.id) ? "is-complete " : "") +
                      (!getTrackExercises(character, "words").length ? "is-extension" : "")
                    }
                    key={character.id}
                    onClick={() => onCharacter(character)}
                  >
                    <strong>{character.hanzi}</strong>
                    {completed.has(character.id) && <small>✓</small>}
                    {!getTrackExercises(character, "words").length && !completed.has(character.id) && <em>拓</em>}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="lesson-practice-strip">
        <div>
          <p className="kicker">学完词语表，再来巩固</p>
          <h2>同一批字，换三种方式练习</h2>
        </div>
        <div className="practice-strip-items">
          {(["split", "honglan", "structure"] as TrackId[]).map((track) => {
            const meta = trackMeta[track];
            const itemProgress = trackProgress(profile, track, lesson.id);
            return (
              <button className={meta.tone} key={track} onClick={() => onTrackLesson(track, lesson.id)}>
                <span>{meta.glyph}</span>
                <strong>{meta.menu}</strong>
                <small>{itemProgress.completed}/{itemProgress.total}</small>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function NarratedDescription({ character }: { character: CharacterItem }) {
  const asset = heritageAssets[character.id];
  const audioRef = useRef<HTMLAudioElement>(null);
  const [marks, setMarks] = useState<AudioMark[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!asset?.audioMarks) return;
    const controller = new AbortController();
    const audio = audioRef.current;
    void fetch(asset.audioMarks, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("marks unavailable")))
      .then((payload: { marks?: AudioMark[] }) => {
        setMarks((payload.marks || []).filter((mark) => Number.isFinite(mark.start) && Number.isFinite(mark.end)));
      })
      .catch(() => undefined);
    return () => {
      controller.abort();
      audio?.pause();
    };
  }, [asset?.audioMarks]);

  function toggleNarration() {
    const audio = audioRef.current;
    if (!asset?.audio || !audio) {
      setPlaying(true);
      speak(character.description, () => setPlaying(false));
      return;
    }
    if (audio.paused) {
      void audio.play().then(() => setPlaying(true)).catch(() => {
        setPlaying(true);
        speak(character.description, () => setPlaying(false));
      });
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  const activeIndex = marks.findIndex((mark) => elapsed >= mark.start && elapsed < mark.end);
  const progress = duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0;

  return (
    <div className="narrated-description">
      <div className="narration-toolbar">
        <button className={playing ? "listen-button is-playing" : "listen-button"} onClick={toggleNarration} aria-pressed={playing}>
          <span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>
          {playing ? "暂停讲解" : "听字义讲解"}
        </button>
        <span>{marks.length ? "逐字跟读已开启" : "标准普通话讲解"}</span>
      </div>
      {marks.length ? (
        <p className="narration-transcript" aria-label={marks.map((mark) => mark.char).join("")}>
          {marks.map((mark, index) => (
            <span
              className={index === activeIndex ? "is-active" : mark.end <= elapsed ? "is-past" : ""}
              key={`${mark.index}-${index}`}
              aria-hidden="true"
            >
              {mark.char}
            </span>
          ))}
        </p>
      ) : (
        <p>{character.description}</p>
      )}
      <div className="narration-progress" aria-hidden="true"><i style={{ width: `${progress}%` }} /></div>
      {asset?.audio && (
        <audio
          ref={audioRef}
          src={asset.audio}
          preload="metadata"
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
          onTimeUpdate={(event) => setElapsed(event.currentTarget.currentTime)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false);
            setElapsed(0);
          }}
        />
      )}
    </div>
  );
}

function MnemonicSceneFocus({
  character,
  stage,
  compact = false,
}: {
  character: CharacterItem;
  stage: MnemonicStage;
  compact?: boolean;
}) {
  const layout = getMnemonicLayout(character);

  return (
    <div
      className={`mnemonic-scene-focus layout-${layout} focus-${stage}${compact ? " is-compact" : ""}`}
      aria-hidden="true"
    >
      {!compact && stage > 0 && stage < 3 && <span className="mnemonic-focus-wash" />}
      {!compact && stage === 0 && <span className="scene-hunt-badge">先找物体轮廓</span>}
      {!compact && stage === 3 && <span className="scene-resolved-badge">物象已经合拢</span>}
      {compact && <span className="meaning-match-badge">图形即字形 <b>✓</b></span>}
    </div>
  );
}

function MnemonicMemory({
  character,
  onComponent,
}: {
  character: CharacterItem;
  onComponent: (glyph: string) => void;
}) {
  const [stage, setStage] = useState<MnemonicStage>(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const visual = characterVisuals[character.hanzi];
  const scene = getMnemonicScene(character);
  const copy = getMnemonicStageCopy(character, stage);
  const activePartIndices = getMnemonicStagePartIndices(character, stage);
  const parts = character.parts.length
    ? character.parts
    : [{ char: character.hanzi, radical: true }];

  useEffect(() => {
    if (!autoPlay) return;
    const timer = window.setInterval(() => {
      setStage((current) => ((current + 1) % mnemonicStageLabels.length) as MnemonicStage);
    }, 2100);
    return () => window.clearInterval(timer);
  }, [autoPlay]);

  function selectStage(next: MnemonicStage) {
    setAutoPlay(false);
    setStage(next);
  }

  return (
    <section className="mnemonic-card" aria-labelledby={`mnemonic-title-${character.id}`}>
      <div className="mnemonic-heading">
        <div>
          <p className="kicker">图中嵌字 · 物象四步记忆法</p>
          <h2 id={`mnemonic-title-${character.id}`}>让“{character.hanzi}”长进画面里</h2>
          <p>先看本义场景，再观察物体本身怎样长成部首和部件；暖红、靛蓝只负责聚焦，不把大字贴在画面上。</p>
        </div>
        <button className={autoPlay ? "memory-autoplay is-playing" : "memory-autoplay"} onClick={() => setAutoPlay((value) => !value)} aria-pressed={autoPlay}>
          <span aria-hidden="true">{autoPlay ? "Ⅱ" : "▶"}</span>{autoPlay ? "暂停演示" : "自动演示"}
        </button>
      </div>

      <div className="mnemonic-layout">
        <figure
          className={`mnemonic-scene stage-${stage}`}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") selectStage(Math.max(0, stage - 1) as MnemonicStage);
            if (event.key === "ArrowRight") selectStage(Math.min(3, stage + 1) as MnemonicStage);
          }}
          aria-label={`图中嵌字演示，当前是第${stage + 1}步：${mnemonicStageLabels[stage]}。可使用左右方向键切换。`}
        >
          <div className="mnemonic-art-frame">
            <Image
              className="mnemonic-scene-backdrop"
              src={visual.src}
              alt=""
              fill
              aria-hidden="true"
              sizes="(max-width: 760px) 100vw, 720px"
            />
            <Image
              className="mnemonic-scene-art"
              src={visual.src}
              alt={`${visual.alt}。${scene.scene}`}
              fill
              priority
              sizes="(max-width: 760px) 100vw, 720px"
              style={{ objectFit: "contain", objectPosition: "center" }}
            />
            <div className="mnemonic-vignette" aria-hidden="true" />
            <MnemonicSceneFocus character={character} stage={stage} />
          </div>
          <figcaption><span>画面本身就是字形</span><strong>{visual.label}</strong></figcaption>
        </figure>

        <aside className={`mnemonic-story stage-${stage}`} aria-live="polite">
          <div className="memory-step-number"><span>0{stage + 1}</span><small>/ 04</small></div>
          <p>{copy.eyebrow}</p>
          <h3>{copy.title}</h3>
          <p className="memory-step-copy">{copy.body}</p>
          {stage === 3 && (
            <div className="memory-equation" aria-label={`完整字形：${parts.map((part) => part.char).join("加")}等于${character.hanzi}`}>
              <div>{parts.map((part, index) => <span key={`${part.char}-${index}`}>{part.char}</span>)}</div>
              <b aria-hidden="true">→</b>
              <strong>{character.hanzi}</strong>
            </div>
          )}
          <div className="memory-part-list">
            {parts.map((part, index) => {
              const isActive = activePartIndices.includes(index);
              return (
                <button
                  className={`${part.radical ? "is-radical" : "is-component"}${stage > 0 && isActive ? " is-active" : ""}${stage > 0 && !isActive ? " is-muted" : ""}`}
                  key={`${part.char}-${index}`}
                  onClick={() => onComponent(part.char)}
                >
                  <span>{part.char}</span>
                  <span><strong>{part.radical ? "表意部首" : "字形 / 读音线索"}</strong><small>{scene.cues[index] || "顺着画面中的物体轮廓找到这个部件。"}</small></span>
                </button>
              );
            })}
          </div>
          <p className="memory-keyboard-tip">提示：点击右侧部件卡可继续查看来历；键盘可用 ← → 切换观察步骤。</p>
        </aside>
      </div>

      <nav className="mnemonic-steps" aria-label="图中嵌字演示步骤">
        {mnemonicStageLabels.map((label, index) => (
          <button className={stage === index ? "is-active" : stage > index ? "is-past" : ""} key={label} onClick={() => selectStage(index as MnemonicStage)} aria-current={stage === index ? "step" : undefined}>
            <span>{index + 1}</span><strong>{label}</strong><small>{index === 0 ? "先找物象" : index === 1 ? "暖红表意" : index === 2 ? "靛蓝补形" : "离图回忆"}</small>
          </button>
        ))}
      </nav>
    </section>
  );
}

function CharacterStudy({
  character,
  profile,
  favorite,
  onBack,
  onFavorite,
  onStart,
  onComponent,
}: {
  character: CharacterItem;
  profile: StudyProfile;
  favorite: boolean;
  onBack: () => void;
  onFavorite: () => void;
  onStart: () => void;
  onComponent: (glyph: string) => void;
}) {
  const exercises = getTrackExercises(character, "words");
  const isComplete = profile.completed.words.includes(character.id);
  const completedQuestions = exercises.filter((question) => profile.answers[question.id]?.lastCorrect).length;
  const heritage = heritageAssets[character.id];
  const hasExercises = exercises.length > 0;

  return (
    <div className="page character-page">
      <div className="character-topbar">
        <button className="back-button" onClick={onBack}>← 返回词语表</button>
        <div>
          <p>{character.lessonTitle} · {character.word}</p>
          <h1>{character.hanzi}<small>{character.pinyin}</small></h1>
        </div>
        <button className={"favorite-star " + (favorite ? "is-active" : "")} onClick={onFavorite} aria-label={favorite ? "取消收藏" : "收藏这个字"}>
          {favorite ? "★" : "☆"}
        </button>
      </div>

      <section className="character-story-card">
        <div className="story-character-column">
          <div className="story-glyph">{character.hanzi}</div>
          <span className="character-pinyin">{character.pinyin}</span>
          <span className={isComplete ? "learned-badge is-complete" : "learned-badge"}>
            {isComplete ? "✓ 已学会" : "正在认识"}
          </span>
        </div>
        <div className="story-copy">
          <div className="story-meta">
            <span>{character.charType}</span>
            <span>{character.decomposition}</span>
            <span>本义：{character.originalMeaning}</span>
          </div>
          <NarratedDescription character={character} key={character.id} />
          {heritage?.stages.length ? (
            <div className="script-line" aria-label="真实字形演变资料">
              {heritage.stages.map((stage) => (
                <div key={stage.src}>
                  <span className="script-image">
                    <Image
                      src={stage.src}
                      alt={`${character.hanzi}的${stage.label}字形`}
                      fill
                      sizes="74px"
                      style={{ objectFit: "contain", objectPosition: "center" }}
                    />
                  </span>
                  <small>{stage.label}</small>
                </div>
              ))}
            </div>
          ) : (
            <div className="script-note">本字暂无可靠的古文字图版，保留现代楷书，不虚构演变形态。</div>
          )}
          <blockquote>课文原文：{character.originalText}</blockquote>
        </div>
      </section>

      <MnemonicMemory character={character} key={character.id} onComponent={onComponent} />

      <section className="character-map-card">
        <div className="map-card-heading">
          <div>
            <p className="kicker">字形推理图</p>
            <h2>点击部件，看它从哪里来</h2>
          </div>
          <span>{character.parts.length || 1} 个主要部件</span>
        </div>
        <div className="character-tree">
          <div className="tree-root">{character.hanzi}</div>
          <div className="tree-branches">
            {(character.parts.length ? character.parts : [{ char: character.hanzi, radical: true }]).map((part, index) => {
              const composition = character.compositions.find((item) => item.char === part.char);
              return (
                <div className="tree-branch" key={part.char + index}>
                  <button className={part.radical ? "is-radical" : ""} onClick={() => onComponent(part.char)}>
                    {part.char}
                    <small>{part.radical ? "表意" : "字形线索"}</small>
                  </button>
                  {composition?.children.length ? (
                    <div className="tree-children">
                      {composition.children.map((child, childIndex) => <span key={child + childIndex}>{child}</span>)}
                    </div>
                  ) : (
                    <p>{composition?.description || "这个字形部件正在等待你去发现。"}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="word-quest-card">
        <div>
          <p className="kicker">识字闯关</p>
          <h2>理解过后，马上练一练</h2>
          <p>{hasExercises
            ? `按照“本义 → 结构 → 图意 → 组字 → 书写”的顺序完成 ${exercises.length} 题。`
            : "这个拓展字已开放字义故事、红蓝和结构练习，完整识字小测稍后开放。"}</p>
          <div className="quest-dots">
            {exercises.map((exercise) => (
              <span className={profile.answers[exercise.id]?.lastCorrect ? "is-done" : ""} key={exercise.id} title={questionTypeLabel(exercise, "words")} />
            ))}
            <small>{completedQuestions} / {exercises.length}</small>
          </div>
        </div>
        <button className="game-button primary" onClick={onStart} disabled={!hasExercises}>
          {hasExercises ? (isComplete ? "再练一轮" : "学会了，练习一下") + " →" : "识字小测暂未开放"}
        </button>
      </section>
    </div>
  );
}

function TrackMap({
  track,
  profile,
  onBack,
  onContinue,
  onLesson,
}: {
  track: TrackId;
  profile: StudyProfile;
  onBack: () => void;
  onContinue: () => void;
  onLesson: (lessonId: string) => void;
}) {
  const meta = trackMeta[track];
  const next = getNextCharacter(track, profile);
  const progress = trackProgress(profile, track);

  return (
    <div className={"page track-map-page " + meta.tone}>
      <PageHeading
        kicker="专项关卡"
        title={meta.label}
        copy={meta.copy}
        onBack={onBack}
      />
      <section className={"track-hero " + meta.tone}>
        <div className="track-symbol">{meta.glyph}</div>
        <div>
          <p>上次学到</p>
          <h2>{next ? next.hanzi + " 字" : "准备开始"}</h2>
          <span>{next ? "来自第 " + next.lessonPosition + " 课 · " + next.lessonTitle : "从第一课开始闯关"}</span>
        </div>
        <button className="game-button white" onClick={onContinue}>{meta.action} →</button>
      </section>

      <section className="level-map">
        <div className="level-map-title">
          <h2>关卡地图</h2>
          <span>共 {lessonList.length} 课 · 完成 {progress.completed} / {progress.total}</span>
        </div>
        <div className="level-list">
          {lessonList.map((lesson) => {
            const itemProgress = trackProgress(profile, track, lesson.id);
            return (
              <button key={lesson.id} onClick={() => onLesson(lesson.id)}>
                <span className="level-number">第 {lesson.position} 课</span>
                <strong>{lesson.title}</strong>
                <i>{itemProgress.completed}/{itemProgress.total}</i>
                <b>→</b>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function TrackLessonMap({
  track,
  lesson,
  profile,
  onBack,
  onCharacter,
}: {
  track: TrackId;
  lesson: { id: string; title: string; position: number };
  profile: StudyProfile;
  onBack: () => void;
  onCharacter: (character: CharacterItem) => void;
}) {
  const meta = trackMeta[track];
  const chars = getTrackCharacters(track, lesson.id);
  const completed = new Set(profile.completed[track]);
  const progress = trackProgress(profile, track, lesson.id);

  return (
    <div className="page track-lesson-page">
      <PageHeading
        kicker={meta.label}
        title={lesson.title}
        copy={"选择一个字开始本关练习 · 已完成 " + progress.completed + " / " + progress.total}
        onBack={onBack}
      />
      <section className={"track-lesson-board " + meta.tone}>
        <div className="track-lesson-note">
          <span>{meta.glyph}</span>
          <p>{meta.copy}</p>
        </div>
        <div className="track-character-grid">
          {chars.map((character, index) => (
            <button
              className={completed.has(character.id) ? "is-complete" : ""}
              key={character.id}
              onClick={() => onCharacter(character)}
            >
              <small>{String(index + 1).padStart(2, "0")}</small>
              <strong>{character.hanzi}</strong>
              <i>{completed.has(character.id) ? "✓" : "开始"}</i>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function ChallengeRoom({
  track,
  character,
  question,
  questionIndex,
  total,
  selected,
  wrote,
  result,
  profile,
  onBack,
  onChoose,
  onRemove,
  onWrite,
  onClearWrite,
  onCheck,
  onNext,
  onPrevious,
  onSkip,
}: {
  track: TrackId;
  character: CharacterItem;
  question: Exercise;
  questionIndex: number;
  total: number;
  selected: string[];
  wrote: boolean;
  result: boolean | null;
  profile: StudyProfile;
  onBack: () => void;
  onChoose: (id: string) => void;
  onRemove: (id: string) => void;
  onWrite: () => void;
  onClearWrite: () => void;
  onCheck: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
}) {
  const meta = trackMeta[track];
  const expected = getExpectedIds(question, character, track);
  const needsMultiple = expected.length > 1;
  const ready = question.kind === "write" ? wrote : selected.length > 0;
  const answerText = question.questionType === "image_single_select"
    ? (characterVisuals[character.hanzi]?.label || character.originalMeaning)
    : expected
        .map((id) => question.options.find((option) => option.id === id))
        .filter(Boolean)
        .map((option) => optionText(option as Exercise["options"][number], character, 0))
        .join("、");
  const finalStep = questionIndex === total - 1;
  const record = profile.answers[question.id];

  return (
    <div className={"challenge-page track-" + meta.tone}>
      <header className="challenge-header">
        <button className="back-button" onClick={onBack}>← 返回</button>
        <div>
          <p>{meta.label} · {character.lessonTitle}</p>
          <h1>{meta.menu} · <span>{character.hanzi}</span></h1>
        </div>
        <span className="challenge-count">第 {questionIndex + 1} / {total} 题</span>
      </header>
      <div className="challenge-progress"><i style={{ width: ((questionIndex + 1) / total) * 100 + "%" }} /></div>

      <section className="challenge-board">
        <div className="challenge-question">
          <span className="question-tag">{questionTypeLabel(question, track)}</span>
          <h2>{question.prompt}</h2>
          {needsMultiple && <p>这题需要选择多个部件。</p>}
        </div>

        {question.kind === "write" ? (
          <WritingPad character={character.hanzi} onWrite={onWrite} onClear={onClearWrite} />
        ) : question.kind === "components" && track === "split" ? (
          <AssemblyExercise
            character={character}
            question={question}
            selected={selected}
            result={result}
            onChoose={onChoose}
            onRemove={onRemove}
          />
        ) : question.kind === "components" && track === "honglan" ? (
          <RedBlueExercise
            character={character}
            question={question}
            selected={selected}
            result={result}
            onChoose={onChoose}
          />
        ) : (
          <ChoiceExercise
            character={character}
            question={question}
            selected={selected}
            result={result}
            onChoose={onChoose}
          />
        )}

        <div className="challenge-footer">
          {result === null ? (
            <div className="question-navigation">
              <button className="game-button ghost" disabled={questionIndex === 0} onClick={onPrevious}>← 上一题</button>
              <button className="text-button" onClick={onSkip}>跳过这一题 →</button>
              <button className="game-button primary" disabled={!ready} onClick={onCheck}>核对答案 →</button>
            </div>
          ) : (
            <div className={"answer-feedback " + (result ? "is-correct" : "is-wrong")}>
              <span>{result ? "✓" : "!"}</span>
              <div>
                <strong>{result ? "答得真棒！" : "再试一次，慢慢来。"}</strong>
                <p>
                  {result
                    ? question.explanation || (finalStep ? "这一关完成了，回到地图看看下一站。" : "记住这个线索，再去下一题。")
                    : "正确线索是：" + (question.kind === "write" ? "在方格里写完整的“" + character.hanzi + "”" : answerText || "仔细看字形。")}
                </p>
                {record && <small>本题已尝试 {record.attempts} 次</small>}
              </div>
              <button className="game-button ghost" onClick={onNext}>
                {result ? (finalStep ? "完成本关" : "下一题 →") : "重新作答"}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ChoiceExercise({
  character,
  question,
  selected,
  result,
  onChoose,
}: {
  character: CharacterItem;
  question: Exercise;
  selected: string[];
  result: boolean | null;
  onChoose: (id: string) => void;
}) {
  const visual = question.questionType === "image_single_select";
  const showVisualCaption = question.options.some((item) => Boolean(item.text));
  return (
    <div className={"choice-grid " + (visual ? "is-visual " : "") + (visual && !showVisualCaption ? "no-visual-captions" : "")}>
      {question.options.map((option, index) => {
        const isSelected = selected.includes(option.id);
        const wrongSlot = question.options
          .slice(0, index)
          .filter((item) => !item.correct).length;
        const illustration = visual
          ? getVisualOption(character.hanzi, question.id, option.correct, wrongSlot, option.text)
          : null;
        const state =
          result === null
            ? isSelected
              ? "is-selected"
              : ""
            : option.correct
              ? "is-correct"
              : isSelected
                ? "is-wrong"
                : "";
        return (
          <button
            className={"choice-card " + state}
            key={option.id}
            onClick={() => onChoose(option.id)}
            aria-pressed={isSelected}
          >
            {visual ? (
              <span className="meaning-illustration">
                <Image
                  src={illustration!.src}
                  alt={illustration!.alt}
                  fill
                  sizes="(max-width: 760px) 82vw, 220px"
                  style={{ objectFit: "contain", objectPosition: "center" }}
                />
                {option.correct && result !== null && (
                  <MnemonicSceneFocus character={character} stage={3} compact />
                )}
              </span>
            ) : question.kind === "structure" ? (
              <StructureShape code={option.idcCode} />
            ) : (
              <span className="choice-dot" />
            )}
            {visual ? (
              showVisualCaption && <strong>{illustration!.label}</strong>
            ) : (
              <strong>{optionText(option, character, index)}</strong>
            )}
            {question.kind === "structure" && <small>{option.idcCode}</small>}
          </button>
        );
      })}
    </div>
  );
}

function AssemblyExercise({
  character,
  question,
  selected,
  result,
  onChoose,
  onRemove,
}: {
  character: CharacterItem;
  question: Exercise;
  selected: string[];
  result: boolean | null;
  onChoose: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const expected = getExpectedIds(question, character, "split");
  const slots = Math.max(expected.length, character.parts.length, 1);
  return (
    <div className="assembly-exercise">
      <div className="assembly-target">
        <span>把「{character.hanzi}」搭出来</span>
        <div className="assembly-slots">
          {Array.from({ length: slots }).map((_, index) => {
            const option = question.options.find((item) => item.id === selected[index]);
            const state =
              result === null
                ? ""
                : option?.correct && expected[index] === option.id
                  ? "is-correct"
                  : option
                    ? "is-wrong"
                    : "";
            return (
              <button
                className={"assembly-slot " + state}
                key={index}
                disabled={!option || result !== null}
                onClick={() => option && onRemove(option.id)}
              >
                {option ? optionText(option, character, index) : "？"}
              </button>
            );
          })}
        </div>
      </div>
      <div className="assembly-choices">
        {question.options.map((option) => (
          <button
            className={selected.includes(option.id) ? "is-picked" : ""}
            disabled={result !== null}
            key={option.id}
            onClick={() => onChoose(option.id)}
          >
            {optionText(option, character, 0)}
          </button>
        ))}
      </div>
    </div>
  );
}

function RedBlueExercise({
  character,
  question,
  selected,
  result,
  onChoose,
}: {
  character: CharacterItem;
  question: Exercise;
  selected: string[];
  result: boolean | null;
  onChoose: (id: string) => void;
}) {
  const redBlueAsset = heritageAssets[character.id]?.redBlue;
  return (
    <div className="redblue-exercise">
      {redBlueAsset ? (
        <div className="redblue-word is-composed" aria-label={"“" + character.hanzi + "”的红蓝合字"}>
          <Image
            src={redBlueAsset}
            alt={`${character.hanzi}字中部首与其他部件的红蓝标记`}
            fill
            sizes="190px"
            style={{ objectFit: "contain", objectPosition: "center" }}
          />
        </div>
      ) : (
        <div className="redblue-word" aria-label={"“" + character.hanzi + "”的红蓝字形"}>
          {(character.parts.length ? character.parts : [{ char: character.hanzi, radical: true }]).map((part, index) => (
            <span className={part.radical ? "is-red" : "is-blue"} key={part.char + index}>{part.char}</span>
          ))}
        </div>
      )}
      <p><i className="red-key" /> 表意部首　<i className="blue-key" /> 其他部件</p>
      <div className="redblue-options">
        {question.options.map((option, index) => {
          const isSelected = selected.includes(option.id);
          const state =
            result === null
              ? isSelected
                ? "is-selected"
                : ""
              : option.correct
                ? "is-correct"
                : isSelected
                  ? "is-wrong"
                  : "";
          return (
            <button className={state} key={option.id} disabled={result !== null} onClick={() => onChoose(option.id)}>
              <span className={option.radical ? "is-red" : "is-blue"}>{optionText(option, character, index)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StructureShape({ code }: { code: string }) {
  const type =
    code === "⿰" || code === "⿲"
      ? "side"
      : code === "⿱" || code === "⿳"
        ? "stack"
        : code.includes("⿴")
          ? "surround"
          : code
            ? "half"
            : "single";
  return (
    <span className={"structure-shape " + type} aria-hidden="true">
      <i /><i /><i />
    </span>
  );
}

function WritingPad({
  character,
  onWrite,
  onClear,
}: {
  character: string;
  onWrite: () => void;
  onClear: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const strokeLengthRef = useRef(0);
  const totalLengthRef = useRef(0);
  const acceptedRef = useRef(false);
  const [strokeCount, setStrokeCount] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const setup = () => {
      const context = canvas.getContext("2d");
      if (!context) return;
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      context.scale(ratio, ratio);
      context.strokeStyle = "#263b64";
      context.lineWidth = 5;
      context.lineCap = "round";
      context.lineJoin = "round";
    };
    setup();
    const observer = new ResizeObserver(setup);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  function position(event: ReactPointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function start(event: ReactPointerEvent<HTMLCanvasElement>) {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    const point = position(event);
    drawingRef.current = true;
    lastPointRef.current = point;
    strokeLengthRef.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(point.x, point.y);
  }

  function draw(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    const point = position(event);
    const previous = lastPointRef.current;
    if (previous) {
      const distance = Math.hypot(point.x - previous.x, point.y - previous.y);
      strokeLengthRef.current += distance;
      totalLengthRef.current += distance;
      if (!acceptedRef.current && totalLengthRef.current >= 34) {
        acceptedRef.current = true;
        onWrite();
      }
    }
    lastPointRef.current = point;
    context.lineTo(point.x, point.y);
    context.stroke();
  }

  function stop() {
    if (drawingRef.current && strokeLengthRef.current >= 7) {
      setStrokeCount((count) => count + 1);
    }
    drawingRef.current = false;
    lastPointRef.current = null;
    strokeLengthRef.current = 0;
  }

  function clear() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawingRef.current = false;
    lastPointRef.current = null;
    strokeLengthRef.current = 0;
    totalLengthRef.current = 0;
    acceptedRef.current = false;
    setStrokeCount(0);
    onClear();
  }

  return (
    <div className="writing-board">
      <div className="writing-guide" aria-hidden="true">{character}</div>
      <canvas
        ref={canvasRef}
        aria-label={"书写“" + character + "”"}
        onPointerDown={start}
        onPointerMove={draw}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
      />
      <div className="writing-footer">
        <span className={strokeCount ? "writing-status has-ink" : "writing-status"}>
          {strokeCount ? `已记录 ${strokeCount} 笔，继续把字写完整` : "沿着浅色字形认真描写，轻点一下不会算作完成"}
        </span>
        <button onClick={clear}>重新写</button>
      </div>
    </div>
  );
}

function ComponentStudio({
  profile,
  selected,
  search,
  onBack,
  onSearch,
  onSelect,
  onCharacter,
}: {
  profile: StudyProfile;
  selected: ComponentItem;
  search: string;
  onBack: () => void;
  onSearch: (value: string) => void;
  onSelect: (component: ComponentItem) => void;
  onCharacter: (character: CharacterItem) => void;
}) {
  const [sortMode, setSortMode] = useState<"frequency" | "recent">("frequency");
  const useCount = useMemo(() => {
    const map = new Map<string, number>();
    allCharacters.forEach((character) =>
      character.parts.forEach((part) => map.set(part.char, (map.get(part.char) || 0) + 1)),
    );
    return map;
  }, []);
  const visible = allComponents
    .filter((component) => {
      const term = search.trim().toLocaleLowerCase();
      return !term || [component.title, component.glyph, component.examples.join(" ")].join(" ").toLocaleLowerCase().includes(term);
    })
    .sort((a, b) => {
      if (sortMode === "recent") {
        const aIndex = profile.recentComponents.indexOf(a.id);
        const bIndex = profile.recentComponents.indexOf(b.id);
        const aRank = aIndex < 0 ? Number.MAX_SAFE_INTEGER : aIndex;
        const bRank = bIndex < 0 ? Number.MAX_SAFE_INTEGER : bIndex;
        return aRank - bRank || a.sequence - b.sequence;
      }
      return (useCount.get(b.glyph) || 0) - (useCount.get(a.glyph) || 0) || a.sequence - b.sequence;
    });
  const connected = allCharacters.filter((character) => character.parts.some((part) => part.char === selected.glyph));
  const recent = allComponents.find((component) => component.id === profile.recentComponents[0]);

  return (
    <div className="page components-page">
      <PageHeading
        kicker="部件精讲"
        title="从常见部件入手，识字更轻松"
        copy="先按课内出现次数排序，再把一个部件放回真实的词语中理解。"
        onBack={onBack}
      />
      {recent && (
        <section className="component-resume">
          <span>上次学到</span><strong>{recent.glyph}</strong><p>{recent.title}</p>
          <button className="game-button ghost" onClick={() => onSelect(recent)}>继续 →</button>
        </section>
      )}
      <div className="component-layout">
        <section className="component-browser">
          <div className="component-browser-toolbar">
            <div className="component-sort-tabs">
              <button className={sortMode === "frequency" ? "is-active" : ""} onClick={() => setSortMode("frequency")}>按出现次数</button>
              <button className={sortMode === "recent" ? "is-active" : ""} onClick={() => setSortMode("recent")}>最近学习</button>
            </div>
            <label>
              <i>⌕</i>
              <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="搜部件或例字" />
            </label>
          </div>
          <div className="component-card-grid">
            {visible.map((component) => (
              <button
                className={
                  (component.id === selected.id ? "is-selected " : "") +
                  (profile.learnedComponents.includes(component.id) ? "is-learned" : "")
                }
                key={component.id}
                onClick={() => onSelect(component)}
              >
                <strong>{component.glyph}</strong>
                <span>{component.title}</span>
                <small>课内 {useCount.get(component.glyph) || 0} 次</small>
              </button>
            ))}
          </div>
        </section>

        <aside className="component-story">
          <div className="component-story-glyph">{selected.glyph}</div>
          <p className="kicker">部件精讲</p>
          <h2>{selected.title}</h2>
          <p>{selected.description}</p>
          <section>
            <span>常见例字</span>
            <div>{selected.examples.map((item) => <i key={item}>{item}</i>)}</div>
          </section>
          <section>
            <span>本册里遇见它</span>
            <div className="component-linked-list">
              {connected.length ? connected.map((character) => (
                <button key={character.id} onClick={() => onCharacter(character)}>
                  <b>{character.hanzi}</b><small>{character.word}</small>
                </button>
              )) : <p>这个部件会在后续词语里出现。</p>}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function LearningRecords({
  profile,
  track,
  onBack,
  onTrack,
  onDetail,
}: {
  profile: StudyProfile;
  track: TrackId;
  onBack: () => void;
  onTrack: (track: TrackId) => void;
  onDetail: (character: CharacterItem) => void;
}) {
  const meta = trackMeta[track];
  const trackQuestionIds = new Set(
    getTrackCharacters(track).flatMap((character) =>
      getTrackExercises(character, track).map((question) => question.id),
    ),
  );
  const allStats = Object.entries(profile.answers)
    .filter(([id]) => trackQuestionIds.has(id))
    .map(([, stat]) => stat);
  const correct = allStats.reduce((sum, item) => sum + item.correct, 0);
  const attempts = allStats.reduce((sum, item) => sum + item.attempts, 0);

  return (
    <div className="page records-page">
      <PageHeading
        kicker="学习记录"
        title="看见自己一步一步学会的过程"
        copy="每道题记录做了几次、答对几次，以及最后一次是否答对。"
        onBack={onBack}
      />
      <section className="record-stat-row">
        <div><span>已完成</span><strong>{profile.completed[track].length}</strong><small>个本关字</small></div>
        <div><span>累计作答</span><strong>{attempts}</strong><small>次</small></div>
        <div><span>答对次数</span><strong>{correct}</strong><small>次</small></div>
      </section>
      <div className="record-tabs">
        {trackIds.map((id) => (
          <button className={id === track ? "is-active" : ""} key={id} onClick={() => onTrack(id)}>
            {trackMeta[id].menu}
          </button>
        ))}
      </div>
      <section className="record-lessons">
        {lessonList.map((lesson) => {
          const chars = getTrackCharacters(track, lesson.id);
          const hasRecords = chars.some((character) =>
            getTrackExercises(character, track).some((question) => profile.answers[question.id]),
          );
          return (
            <article className="record-lesson" key={lesson.id}>
              <header>
                <div><p>第 {lesson.position} 课</p><h2>{lesson.title}</h2></div>
                <span>{trackProgress(profile, track, lesson.id).completed}/{chars.length} 已完成</span>
              </header>
              {hasRecords ? (
                <div className="record-character-list">
                  {chars.filter((character) => getTrackExercises(character, track).some((question) => profile.answers[question.id])).map((character) => (
                    <button key={character.id} onClick={() => onDetail(character)}>
                      <strong>{character.hanzi}</strong>
                      <div>
                        <b>{profile.completed[track].includes(character.id) ? "已完成" : "正在练习"}</b>
                        <span>{getTrackExercises(character, track).map((question) => {
                          const stat = profile.answers[question.id];
                          return stat ? (stat.lastCorrect ? "✓" : "·") : "○";
                        }).join(" ")}</span>
                      </div>
                      <small>查看 →</small>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="record-empty">这一课的{meta.menu}记录，会在第一次闯关后出现在这里。</div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}

function RecordDetail({
  character,
  profile,
  track,
  onBack,
  onPractice,
}: {
  character: CharacterItem;
  profile: StudyProfile;
  track: TrackId;
  onBack: () => void;
  onPractice: (index: number) => void;
}) {
  const meta = trackMeta[track];
  const exercises = getTrackExercises(character, track);
  const completed = profile.completed[track].includes(character.id);
  const correctCount = exercises.filter((question) => profile.answers[question.id]?.lastCorrect).length;

  return (
    <div className="page record-detail-page">
      <PageHeading
        kicker={meta.label + " · 学习记录"}
        title={"“" + character.hanzi + "”的闯关足迹"}
        copy={"来自第 " + character.lessonPosition + " 课《" + character.lessonTitle + "》；每一题都保留最后一次作答状态。"}
        onBack={onBack}
      />
      <section className={"record-detail-summary " + meta.tone}>
        <div className="record-detail-glyph">{character.hanzi}</div>
        <div>
          <p>{completed ? "这一关已完成" : "还差几步，就能完成这一关"}</p>
          <h2>{correctCount} / {exercises.length} 题最后一次答对</h2>
          <span>{meta.copy}</span>
        </div>
      </section>
      <section className="record-question-list">
        {exercises.map((question, index) => {
          const stat = profile.answers[question.id];
          const status = !stat ? "is-new" : stat.lastCorrect ? "is-correct" : "is-wrong";
          return (
            <article className={status} key={question.id}>
              <span className="record-question-index">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p>{questionTypeLabel(question, track)}</p>
                <h2>{question.prompt}</h2>
                {stat ? (
                  <small>
                    已作答 {stat.attempts} 次 · 答对 {stat.correct} 次 · 最后一次 {stat.lastCorrect ? "答对" : "待再试"}
                    {stat.lastAt ? " · " + formatDate(stat.lastAt) : ""}
                  </small>
                ) : (
                  <small>还没有开始这一题</small>
                )}
              </div>
              <button className="game-button ghost" onClick={() => onPractice(index)}>
                {stat?.lastCorrect ? "再练" : stat ? "继续" : "开始"}
              </button>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function ReadAloud({
  profile,
  onBack,
  onSession,
}: {
  profile: StudyProfile;
  onBack: () => void;
  onSession: () => void;
}) {
  const [lessonId, setLessonId] = useState(initialLesson.id);
  const [activeText, setActiveText] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<"idle" | "saving" | "saved" | "local">("idle");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const lesson = lessonList.find((item) => item.id === lessonId) || initialLesson;
  const sentences = [...new Set(getLessonCharacters(lesson.id).map((item) => item.originalText).filter(Boolean))].slice(0, 4);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (recordingUrl?.startsWith("blob:")) URL.revokeObjectURL(recordingUrl);
    };
  }, [recordingUrl]);

  useEffect(() => {
    let active = true;
    void fetch(`/api/recordings?lessonId=${encodeURIComponent(lessonId)}`, { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload: { recordings?: { url: string }[] }) => {
        if (active && payload.recordings?.[0]) {
          setRecordingUrl(payload.recordings[0].url);
          setRecordingStatus("saved");
        } else if (active) {
          setRecordingUrl(null);
          setRecordingStatus("idle");
        }
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [lessonId]);

  function play(text: string) {
    setActiveText(text);
    setSpeaking(true);
    speak(text, () => setSpeaking(false));
  }

  function selectLesson(nextLessonId: string) {
    setRecordingUrl(null);
    setRecordingStatus("idle");
    setLessonId(nextLessonId);
  }

  async function toggleRecording() {
    if (recording && recorderRef.current) {
      recorderRef.current.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        const contentType = recorder.mimeType || chunksRef.current[0]?.type || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: contentType });
        if (recordingUrl?.startsWith("blob:")) URL.revokeObjectURL(recordingUrl);
        const localUrl = URL.createObjectURL(blob);
        setRecordingUrl(localUrl);
        setRecordingStatus("saving");
        setRecording(false);
        stream.getTracks().forEach((track) => track.stop());
        onSession();
        try {
          const response = await fetch(`/api/recordings?lessonId=${encodeURIComponent(lesson.id)}`, {
            method: "POST",
            headers: { "content-type": blob.type || "audio/webm" },
            body: blob,
          });
          if (!response.ok) throw new Error("save failed");
          const payload = await response.json() as { recording: { url: string } };
          URL.revokeObjectURL(localUrl);
          setRecordingUrl(payload.recording.url);
          setRecordingStatus("saved");
        } catch {
          setRecordingStatus("local");
        }
      };
      recorder.start();
      setRecording(true);
    } catch {
      window.alert("麦克风没有开启。你也可以先使用“范读”跟读。");
    }
  }

  return (
    <div className="page read-page">
      <PageHeading
        kicker="日日朗读"
        title="先听一遍，再把句子读出来"
        copy={"已完成 " + profile.readSessions + " 次朗读练习。登录状态下，录音可跨设备回听。"}
        onBack={onBack}
      />
      <div className="read-lesson-tabs">
        {lessonList.map((item) => (
          <button className={item.id === lesson.id ? "is-active" : ""} key={item.id} onClick={() => selectLesson(item.id)}>
            第 {item.position} 课 · {item.title}
          </button>
        ))}
      </div>
      <section className="read-studio">
        <div className="read-mascot">读</div>
        <div>
          <p className="kicker">跟读小任务</p>
          <h2>{lesson.title}</h2>
          <p>选择一句，先听范读，再按下录音键读一遍。</p>
        </div>
        <button className={"game-button " + (recording ? "recording" : "primary")} onClick={toggleRecording}>
          {recording ? "■ 结束录音" : "● 开始录音"}
        </button>
      </section>
      <div className="sentence-list">
        {sentences.map((text) => (
          <article className={activeText === text ? "is-speaking" : ""} key={text}>
            <p>“{text}”</p>
            <button onClick={() => play(text)}>{speaking && activeText === text ? "正在范读…" : "▷ 范读"}</button>
          </article>
        ))}
      </div>
      {recordingUrl && (
        <section className="recording-result">
          <span>✓</span>
          <div><strong>{recordingStatus === "saving" ? "正在保存录音…" : "这次朗读已经录好"}</strong><p>{recordingStatus === "saved" ? "录音已安全同步，可以稍后回来继续听。" : recordingStatus === "local" ? "当前网络不可用，录音暂存在本页。" : "你可以在这里回听。"}</p></div>
          <audio controls src={recordingUrl} />
        </section>
      )}
    </div>
  );
}

function ProfilePanel({
  profile,
  identity,
  syncState,
  onBack,
  onName,
  onGrade,
  onTheme,
  onReset,
}: {
  profile: StudyProfile;
  identity: AccountIdentity | null;
  syncState: "loading" | "synced" | "local";
  onBack: () => void;
  onName: (name: string) => void;
  onGrade: (grade: number) => void;
  onTheme: () => void;
  onReset: () => void;
}) {
  const totalCompleted = trackIds.reduce((sum, track) => sum + profile.completed[track].length, 0);
  return (
    <div className="page profile-page">
      <PageHeading
        kicker="我的账户"
        title="这是属于你的学习空间"
        copy={syncState === "synced" ? "学习进度已经安全同步，换设备后也能从上次的位置继续。" : "当前处于离线模式，恢复网络后会自动同步。"}
        onBack={onBack}
      />
      <section className="account-identity-card">
        <div><span>{identity?.mode === "workspace" ? "已登录账户" : "本设备学习身份"}</span><strong>{identity?.email || identity?.displayName || "小探险家"}</strong></div>
        <i className={syncState === "synced" ? "is-synced" : ""}>{syncState === "synced" ? "● 已同步" : "○ 离线"}</i>
      </section>
      <section className="profile-card">
        <div className="profile-avatar">{profile.name ? profile.name.slice(0, 1) : "学"}</div>
        <div>
          <label>学习小名<input value={profile.name} onChange={(event) => onName(event.target.value)} placeholder="给自己取一个名字" maxLength={18} /></label>
          <label>孩子年级
            <select value={profile.grade} onChange={(event) => onGrade(Number(event.target.value))}>
              {[1, 2, 3, 4, 5, 6].map((grade) => <option value={grade} key={grade}>{grade} 年级</option>)}
            </select>
          </label>
          <p>已完成 {totalCompleted} 个学习关卡 · 认识 {profile.learnedComponents.length} 个部件</p>
        </div>
      </section>
      <div className="profile-actions">
        <button onClick={onTheme}><span>{profile.theme === "light" ? "◐" : "◑"}</span>{profile.theme === "light" ? "切换夜读模式" : "切换日间模式"}</button>
        <button className="is-danger" onClick={onReset}><span>↺</span>清除学习记录</button>
        {identity?.mode === "workspace" && <Link className="account-signout" href="/signout-with-chatgpt?return_to=%2F"><span>↗</span>退出登录</Link>}
      </div>
    </div>
  );
}

function Playground({
  kind,
  onBack,
  onKind,
}: {
  kind: PlaygroundKind;
  onBack: () => void;
  onKind: (kind: PlaygroundKind) => void;
}) {
  const [presses, setPresses] = useState(0);
  const [grade, setGrade] = useState("一年级");
  const [puzzle, setPuzzle] = useState<string[]>([]);
  const [quiz, setQuiz] = useState<string | null>(null);
  const labels: Record<PlaygroundKind, string> = { kit: "组件 Kit", lesson: "课程动效", puzzle: "拆字拼图", quiz: "答题反馈" };
  return (
    <div className="page playground-page">
      <PageHeading kicker="设计实验室" title={labels[kind]} copy="用于验证游戏化组件、动效、触控和学习反馈的内部体验页面。" onBack={onBack} />
      <nav className="playground-tabs" aria-label="实验页面">
        {(Object.keys(labels) as PlaygroundKind[]).map((id) => <button className={id === kind ? "is-active" : ""} key={id} onClick={() => onKind(id)}>{labels[id]}</button>)}
      </nav>
      {kind === "kit" && (
        <section className="playground-board">
          <h2>GameButton · 变体</h2>
          <div className="kit-buttons">
            <button className="game-button primary" onClick={() => setPresses((value) => value + 1)}>🚀 开始啦</button>
            <button className="game-button success">✓ 正确</button>
            <button className="game-button ghost">☁ 天空</button>
            <button className="game-button ghost" disabled>禁用</button>
          </div>
          <p>主按钮被按了 {presses} 次</p>
          <label>Selector · 年级<select value={grade} onChange={(event) => setGrade(event.target.value)}>{["一年级", "二年级", "三年级"].map((item) => <option key={item}>{item}</option>)}</select></label>
        </section>
      )}
      {kind === "lesson" && (
        <section className="playground-board lesson-demo">
          <span className="demo-sun">日</span><span className="demo-arrow">→</span><span className="demo-glyph">字</span>
          <h2>一句讲清字形，再把线索放回课文</h2>
          <p>动效遵循“出现—聚焦—连接—完成”的节奏，不让装饰抢走学习注意力。</p>
        </section>
      )}
      {kind === "puzzle" && (
        <section className="playground-board puzzle-demo">
          <h2>把“桂”字搭出来</h2>
          <div className="puzzle-slots"><span>{puzzle[0] || "?"}</span><b>＋</b><span>{puzzle[1] || "?"}</span></div>
          <div className="kit-buttons">{["木", "圭", "女", "寸"].map((part) => <button className={puzzle.includes(part) ? "is-selected" : ""} key={part} disabled={puzzle.length >= 2 && !puzzle.includes(part)} onClick={() => setPuzzle((value) => value.includes(part) ? value.filter((item) => item !== part) : [...value, part])}>{part}</button>)}</div>
          <p>{puzzle.join("") === "木圭" ? "✓ 搭对了！木表意，圭提示读音。" : "选择两个部件，顺序也很重要。"}</p>
        </section>
      )}
      {kind === "quiz" && (
        <section className="playground-board quiz-demo">
          <h2>“桂”是什么结构？</h2>
          <div className="kit-buttons">{["左右结构", "上下结构", "独体字", "半包围结构"].map((option) => <button className={quiz === option ? (option === "左右结构" ? "is-correct" : "is-wrong") : ""} key={option} onClick={() => setQuiz(option)}>{option}</button>)}</div>
          {quiz && <p>{quiz === "左右结构" ? "✓ 正确，木和圭左右站立。" : "再看看两个部件的位置。"}</p>}
        </section>
      )}
    </div>
  );
}

function PageHeading({
  kicker,
  title,
  copy,
  onBack,
}: {
  kicker: string;
  title: string;
  copy: string;
  onBack: () => void;
}) {
  return (
    <header className="page-heading">
      <button className="back-button" onClick={onBack}>← 返回</button>
      <div>
        <p className="kicker">{kicker}</p>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
    </header>
  );
}
