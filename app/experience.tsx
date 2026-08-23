"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  CircleStop,
  CheckCircle2,
  Home as HomeIcon,
  LayoutGrid,
  LogOut,
  Map as MapIcon,
  Mic2,
  MoonStar,
  RotateCcw,
  Sparkles,
  SunMedium,
  UserRound,
  Volume2,
  type LucideIcon,
} from "lucide-react";
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
  type LessonItem,
} from "./data/catalog";
import {
  characterVisuals,
  getVisualOption,
  lessonVisuals,
} from "./data/illustrations";
import { heritageAssets, type AudioMark } from "./data/heritage-assets";
import { narrationAssets } from "./data/narration-assets";
import { releasedNarrationTranscripts } from "./data/released-narration-transcripts.generated";
import {
  LESSON_THREE_ID,
  getLessonThreeKnowledge,
  qianPhoneticFamily,
  type LessonThreeKnowledge,
} from "./data/lesson3-literacy";
import {
  getMnemonicLayout,
  getMnemonicScene,
} from "./data/mnemonic-scenes";
import { getPartFocusRegions, mergeFocusRegions } from "./lib/mnemonic-focus";
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
  advanceResumeIndex,
  updateCompletion,
} from "./lib/progress-model";
import {
  activeNarrationMarkIndices,
  activeNarrationPhraseIndex,
  buildNarrationTokens,
  narrationPhraseIndexByMark,
} from "./lib/narration";

type Screen =
  | "home"
  | "practice"
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
const lessonList = lessons as unknown as LessonItem[];
const initialLesson = lessonList[0];
const initialCharacter =
  allCharacters.find((item) => item.lessonId === initialLesson.id && item.primary) ||
  allCharacters[0];
const trackIds: TrackId[] = ["words", "split", "honglan", "structure"];
const practiceTrackIds: Exclude<TrackId, "words">[] = ["split", "honglan", "structure"];
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

const courseUnits = [
  { label: "第一单元", start: 1, end: 4 },
  { label: "第二单元", start: 5, end: 8 },
  { label: "第三单元", start: 9, end: 11 },
  { label: "第四单元", start: 12, end: 14 },
  { label: "第五单元", start: 15, end: 17 },
  { label: "第六单元", start: 18, end: 20 },
  { label: "第七单元", start: 21, end: 24 },
  { label: "第八单元", start: 25, end: 26 },
];

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
  if (parts[0] === "practice") return { screen: "practice" };
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

function getOfficialLessonCharacters(lessonId: string) {
  return getLessonCharacters(lessonId).filter((item) => item.official !== false);
}

function getExtensionLessonCharacters(lessonId: string) {
  return getLessonCharacters(lessonId).filter((item) => item.official === false);
}

function getTrackExercises(character: CharacterItem, track: TrackId) {
  const exercises = character.exercises.filter((exercise) => exercise.origin === trackMeta[track].origin);
  if (character.lessonId !== LESSON_THREE_ID || track !== "words") return exercises;

  const knowledge = getLessonThreeKnowledge(character.hanzi);
  if (!knowledge) return exercises;

  const noImageExercises = exercises.filter((exercise) => exercise.questionType !== "image_single_select");
  const methodExercise = createLessonThreeMethodExercise(character, knowledge);
  // The generated question set always begins with the course-word context check.
  // Keep that curriculum anchor first, then add the human-authored method check.
  const insertAt = Math.min(1, noImageExercises.length);
  return [
    ...noImageExercises.slice(0, insertAt),
    methodExercise,
    ...noImageExercises.slice(insertAt),
  ];
}

function exerciseOption(id: string, text: string, correct = false): Exercise["options"][number] {
  return { id, text, correct, radical: false, idcCode: "" };
}

function createLessonThreeMethodExercise(
  character: CharacterItem,
  knowledge: LessonThreeKnowledge,
): Exercise {
  const id = `${character.id}-words-method`;
  if (knowledge.method === "phonosemantic") {
    const phonetic = knowledge.components.find((component) => component.role === "phonetic")!;
    const semantic = knowledge.components.find((component) => component.role === "semantic")!;
    return {
      id,
      origin: "words",
      kind: "single",
      questionType: "lesson3_method_select",
      prompt: `“${character.hanzi}”中，哪个部件主要提示读音？`,
      options: [
        exerciseOption(`${id}-phonetic`, `${phonetic.glyph}：${phonetic.note}`, true),
        exerciseOption(`${id}-semantic`, `${semantic.glyph}：${semantic.note}`),
        exerciseOption(`${id}-picture`, "整张插图：看见画面就能确定读音"),
        exerciseOption(`${id}-story`, "记忆故事：故事里的每件物品都表音"),
      ],
      explanation: `${knowledge.explanation} 形旁和声旁都只是线索，还要放回“${character.word}”核对。`,
    };
  }

  return {
    id,
    origin: "words",
    kind: "single",
    questionType: "lesson3_method_select",
    prompt: `学习“${character.hanzi}”时，哪一种记法最可靠？`,
    options: [
      exerciseOption(`${id}-route`, knowledge.recallCue, true),
      exerciseOption(`${id}-origin`, "把助记图片当作这个字的真实历史来源"),
      exerciseOption(`${id}-guess`, "只记一张漂亮图片，不观察部件位置"),
      exerciseOption(`${id}-sound`, "把每个部件都当成准确的读音提示"),
    ],
    explanation: `${knowledge.explanation} ${knowledge.evidence}`,
  };
}

function stableOptionOrder(options: Exercise["options"], seed: string) {
  const hash = [...seed].reduce((value, char) => ((value * 31) + char.charCodeAt(0)) >>> 0, 2166136261);
  return [...options]
    .map((option, index) => ({ option, rank: ((hash ^ ((index + 1) * 2654435761)) >>> 0) }))
    .sort((a, b) => a.rank - b.rank)
    .map(({ option }) => option);
}

function getTrackCharacters(track: TrackId, lessonId?: string) {
  return allCharacters.filter(
    (item) =>
      item.primary &&
      item.official !== false &&
      (!lessonId || item.lessonId === lessonId) &&
      getTrackExercises(item, track).length > 0,
  );
}

function getWordGroups(lessonId: string, tier: "all" | "curriculum" | "extension" = "all") {
  const map = new Map<string, CharacterItem[]>();
  const source = tier === "curriculum"
    ? getOfficialLessonCharacters(lessonId)
    : tier === "extension"
      ? getExtensionLessonCharacters(lessonId)
      : getLessonCharacters(lessonId);
  for (const item of source) {
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
  const [sessionResults, setSessionResults] = useState<boolean[]>([]);
  const [celebration, setCelebration] = useState(false);

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
      setSessionResults([]);
      setCelebration(false);
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
          setSyncState("synced");
        } else if (localProfile) {
          setProfile(localProfile);
          try {
            // Only report "synced" once the cloud actually accepted the local
            // profile; a failed upload must surface as "local", not as success.
            const putResponse = await fetch("/api/profile", {
              method: "PUT",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(localProfile),
            });
            if (active) setSyncState(putResponse.ok ? "synced" : "local");
          } catch {
            if (active) setSyncState("local");
          }
        } else {
          setSyncState("synced");
        }
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
  // One deterministic display order shared by the exercise renderer and the
  // keyboard shortcuts, so pressing a key always hits the option on screen.
  const orderedOptions = useMemo(
    () =>
      currentQuestion && currentQuestion.kind !== "write"
        ? stableOptionOrder(currentQuestion.options, currentQuestion.id)
        : [],
    [currentQuestion],
  );

  useEffect(() => {
    if (screen !== "challenge" || celebration || !currentQuestion) return;
    function onKeyboardEvent(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === "Enter") {
        event.preventDefault();
        if (result === null) {
          const ready = currentQuestion.kind === "write" ? wrote : orderedOptions.length > 0 && selectedOptions.length > 0;
          if (ready) checkAnswer();
        } else {
          nextChallengeStep();
        }
        return;
      }
      if (result !== null) return;
      const keys = "123456789abcdefghijklmnopqrstuvwxyz";
      const index = keys.indexOf(event.key.toLowerCase());
      if (index >= 0 && index < orderedOptions.length) chooseOption(orderedOptions[index].id);
    }
    window.addEventListener("keydown", onKeyboardEvent);
    return () => window.removeEventListener("keydown", onKeyboardEvent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, celebration, currentQuestion, result, selectedOptions, wrote, orderedOptions]);

  useEffect(() => {
    if (screen === "home") window.location.replace("/");
  }, [screen]);

  function navigatePath(path: string, replace = false) {
    const route = resolveAppRoute(path);
    if (route.screen === "home") {
      // The path home lives at "/" as its own server-rendered route; a
      // client-side push would leave the engine showing an empty shell.
      window.location[replace ? "replace" : "assign"]("/");
      return;
    }
    window.history[replace ? "replaceState" : "pushState"]({}, "", path);
    applyRoute(route);
  }

  function navigate(next: Screen) {
    const path =
      next === "home" ? "/" :
      next === "practice" ? "/practice" :
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
    setSessionResults((previous) => [...previous, correct]);
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

    // Finishing the last question lands on a celebration summary instead of an
    // abrupt jump back to the map.
    setCelebration(true);
  }

  function restartChallenge() {
    setQuestionIndex(0);
    setSelectedOptions([]);
    setWrote(false);
    setResult(null);
    setSessionResults([]);
    setCelebration(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function finishChallengeCelebration() {
    setCelebration(false);
    if (selectedTrack === "words") openLesson(selectedCharacter.lessonId);
    else openTrackLesson(selectedTrack, selectedCharacter.lessonId);
  }

  function nextCharacterFromCelebration() {
    setCelebration(false);
    const candidates = getTrackCharacters(selectedTrack, selectedCharacter.lessonId);
    const nextId = nextCandidateId(
      candidates.map((item) => item.id),
      profile.completed[selectedTrack],
      selectedCharacter.id,
    );
    const next = candidates.find((item) => item.id === nextId);
    if (next && next.id !== selectedCharacter.id) openChallenge(selectedTrack, next, 0);
    else finishChallengeCelebration();
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
            questionIndex: advanceResumeIndex(questionIndex, challengeExercises.length),
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

  const immersive = screen === "character";

  return (
    <main className={immersive ? "game-shell is-immersive" : "game-shell"}>
      {!immersive && (
        <TopNavigation
          active={screen}
          name={profile.name}
          onNavigate={navigate}
          onProfile={() => navigate("profile")}
        />
      )}

      {screen === "practice" && (
        <PracticeHub
          profile={profile}
          onBack={() => navigate("home")}
          onTrack={openTrackMap}
          onLesson={openTrackLesson}
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
          key={selectedCharacter.id}
          character={selectedCharacter}
          profile={profile}
          favorite={favoriteSet.has(selectedCharacter.id)}
          onBack={() => openLesson(selectedCharacter.lessonId)}
          onFavorite={() => toggleFavorite(selectedCharacter.id)}
          onStart={() => openChallenge("words", selectedCharacter)}
          onReadAloud={() => navigate("read")}
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
          onBack={() => navigate("practice")}
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
          orderedOptions={orderedOptions}
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

      {screen === "challenge" && celebration && (
        <CelebrationOverlay
          track={selectedTrack}
          character={selectedCharacter}
          results={sessionResults}
          total={challengeExercises.length}
          onReplay={restartChallenge}
          onNextCharacter={nextCharacterFromCelebration}
          onFinish={finishChallengeCelebration}
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
  const nav: { label: string; screen: Screen; active: Screen[]; icon: LucideIcon }[] = [
    { label: "学习", screen: "home", active: ["home"], icon: HomeIcon },
    { label: "课本", screen: "course", active: ["course", "lesson", "character"], icon: BookOpenText },
    { label: "练习", screen: "practice", active: ["practice", "trackMap", "trackLesson", "challenge", "components"], icon: LayoutGrid },
    { label: "我的", screen: "profile", active: ["profile", "records", "recordDetail", "read"], icon: UserRound },
  ];

  return (
    <header className={`top-navigation${active === "challenge" ? " is-focus" : ""}`}>
      <button className="wordmark" onClick={() => onNavigate("home")} aria-label="回到 Knowing Word 首页">
        <span className="brand-seal" aria-hidden="true">知</span>
        <span className="wordmark-copy">
          <strong>KNOWING WORD</strong>
          <span className="wordmark-flag">从一个字，看见一方世界</span>
        </span>
      </button>
      <nav aria-label="主菜单">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={item.active.includes(active) ? "is-active" : ""}
              key={item.label}
              onClick={() => onNavigate(item.screen)}
            >
              <Icon aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <button className="profile-pill" onClick={onProfile} aria-label={`打开${name || "我的"}学习空间`}>
        <span>{name ? name.slice(0, 1) : "学"}</span>
        <small>{name || "学习空间"}</small>
      </button>
    </header>
  );
}

function PracticeHub({
  profile,
  onBack,
  onTrack,
  onLesson,
}: {
  profile: StudyProfile;
  onBack: () => void;
  onTrack: (track: TrackId) => void;
  onLesson: (track: TrackId, lessonId: string) => void;
}) {
  const nextWord = getNextCharacter("words", profile);
  const currentLesson = lessonList.find((lesson) => lesson.id === nextWord?.lessonId) || initialLesson;
  const lessonWordProgress = trackProgress(profile, "words", currentLesson.id);

  return (
    <div className="page practice-hub-page">
      <PageHeading
        kicker="巩固练习"
        title="同一批字，换三种眼光再看一遍"
        copy="拆字看组成，红蓝看部件分工，结构看空间站位。三种方法服务于同一个目标：离开图片后，仍然能把字想起来。"
        onBack={onBack}
      />

      <section className="practice-context-band" aria-label="当前课程">
        <div>
          <span>当前建议</span>
          <h2>练习第 {currentLesson.position} 课《{currentLesson.title}》</h2>
          <p>本课识字已完成 {lessonWordProgress.completed}/{lessonWordProgress.total} 个，练习会围绕同一批字展开。</p>
        </div>
        <i>{nextWord?.hanzi || "字"}</i>
      </section>

      <section className="practice-route-grid" aria-label="三种巩固方式">
        {practiceTrackIds.map((track, index) => {
          const meta = trackMeta[track];
          const lessonProgress = trackProgress(profile, track, currentLesson.id);
          const totalProgress = trackProgress(profile, track);
          return (
            <article className={`practice-route-card ${meta.tone}`} key={track}>
              <div className="practice-route-top">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <i>{meta.glyph}</i>
              </div>
              <p>{meta.eyebrow}</p>
              <h2>{meta.label}</h2>
              <div className="practice-route-progress">
                <span>本课 {lessonProgress.completed}/{lessonProgress.total}</span>
                <span>全册 {totalProgress.completed}/{totalProgress.total}</span>
              </div>
              <div className="practice-route-actions">
                <button className="game-button primary" onClick={() => onLesson(track, currentLesson.id)}>
                  练习本课 <ArrowRight aria-hidden="true" />
                </button>
                <button className="text-button" onClick={() => onTrack(track)}>全部课程</button>
              </div>
            </article>
          );
        })}
      </section>

      <section className="practice-sequence-note">
        <span><Sparkles aria-hidden="true" /></span>
        <div><p className="kicker">建议顺序</p><h2>先拆组成，再辨功能，最后看空间。</h2></div>
        <ol><li>拆一拆</li><li>涂红蓝</li><li>认结构</li></ol>
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
        copy="新版五年级上册共 26 课：按官方会认、会写和多音字清单学习，再用专项关卡反复巩固。"
        onBack={onBack}
      />
      <div className="course-units">
        {courseUnits.map((unit) => {
          const unitLessons = lessonList.filter((lesson) => lesson.position >= unit.start && lesson.position <= unit.end);
          const unitProgress = unitLessons.reduce(
            (summary, lesson) => {
              const progress = trackProgress(profile, "words", lesson.id);
              return { completed: summary.completed + progress.completed, total: summary.total + progress.total };
            },
            { completed: 0, total: 0 },
          );
          return (
            <section className="course-unit" key={unit.label}>
              <header>
                <div><span>{unit.label}</span><h2>第 {unit.start}—{unit.end} 课</h2></div>
                <p>已认识 {unitProgress.completed}/{unitProgress.total} 个字</p>
              </header>
              <div className="lesson-route">
                {unitLessons.map((lesson) => {
                  const chars = getOfficialLessonCharacters(lesson.id);
                  const extensionCount = getExtensionLessonCharacters(lesson.id).length;
                  const progress = trackProgress(profile, "words", lesson.id);
                  const illustration = lessonVisuals[lesson.id];
                  return (
                    <button className={`lesson-route-card lesson-tone-${(lesson.position - 1) % 4}${lesson.skimming ? " is-skimming" : ""}`} key={lesson.id} onClick={() => onLesson(lesson.id)}>
                      <span className="route-index">第 {lesson.position} 课{lesson.skimming ? " · 略读" : ""}</span>
                      <div className="route-scene">
                        <Image src={illustration.src} alt={illustration.alt} fill sizes="180px" />
                        <div className="route-character-cloud" aria-hidden="true">
                          {chars.slice(0, 4).map((character) => <i key={character.id}>{character.hanzi}</i>)}
                        </div>
                      </div>
                      <div className="route-copy">
                        <h2>{lesson.title}</h2>
                        <p>{chars.length} 个课内字 · 已完成 {progress.completed} 个{extensionCount ? ` · ${extensionCount} 个拓展字` : ""}</p>
                      </div>
                      <span className="route-arrow">→</span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
      <section className="course-method-card">
        <span>26</span><p>精读课分会认、会写与多音字；略读课以会认和理解为主。教材正文不复制，所有讲解和练习都经过重新组织。</p>
      </section>
    </div>
  );
}

function lessonThreeReviewState(character: CharacterItem, profile: StudyProfile) {
  const records = getTrackExercises(character, "words")
    .map((exercise) => profile.answers[exercise.id])
    .filter((record): record is AnswerStat => Boolean(record));
  if (!records.length) return { label: "未开始", due: false, tone: "new" };
  if (records.some((record) => !record.lastCorrect)) return { label: "现在复习", due: true, tone: "due" };

  const latest = records.reduce((current, record) => record.lastAt > current.lastAt ? record : current);
  const intervalDays = records.every((record) => record.attempts >= 3) ? 7 : records.every((record) => record.attempts >= 2) ? 3 : 1;
  const dueAt = new Date(latest.lastAt).getTime() + intervalDays * 86_400_000;
  if (!Number.isFinite(dueAt) || dueAt <= Date.now()) return { label: "今天复习", due: true, tone: "due" };
  const remainingDays = Math.max(1, Math.ceil((dueAt - Date.now()) / 86_400_000));
  return { label: `${remainingDays} 天后`, due: false, tone: "later" };
}

function LessonThreeMethodOverview({
  characters,
  profile,
  onCharacter,
}: {
  characters: CharacterItem[];
  profile: StudyProfile;
  onCharacter: (character: CharacterItem) => void;
}) {
  const phonosemantic = characters.filter((character) => getLessonThreeKnowledge(character.hanzi)?.method === "phonosemantic");
  const structural = characters.filter((character) => getLessonThreeKnowledge(character.hanzi)?.method === "structure");
  const reviewStates = characters.map((character) => ({ character, ...lessonThreeReviewState(character, profile) }));
  const dueCount = reviewStates.filter((item) => item.due).length;
  const startedCount = reviewStates.filter((item) => item.tone !== "new").length;
  const visibleReviewStates = [...reviewStates]
    .sort((left, right) => Number(right.due) - Number(left.due))
    .slice(0, 6);

  return (
    <section className="pilot-method-overview" aria-labelledby="pilot-method-title">
      <div className="pilot-overview-heading">
        <div>
          <p className="kicker">第三课 · 识字方法试点</p>
          <h2 id="pilot-method-title">先分方法，再使用图片</h2>
          <p>本课 11 个课内字按构形关系分组：图片只在开始时搭桥，最后必须离图认读和回忆。</p>
        </div>
        <span className="pilot-source-badge">规范字形教学拆分<br /><small>不等同历史字源</small></span>
      </div>

      <div className="pilot-method-grid">
        <article className="pilot-method-lane is-phonetic">
          <div><span>01</span><p><strong>形旁 + 声旁</strong><small>{phonosemantic.length} 个字 · 用字族迁移</small></p></div>
          <div className="pilot-character-list">
            {phonosemantic.map((character) => {
              const knowledge = getLessonThreeKnowledge(character.hanzi)!;
              return <button key={character.id} onClick={() => onCharacter(character)}><strong>{character.hanzi}</strong><small>{knowledge.equation}</small></button>;
            })}
          </div>
        </article>
        <article className="pilot-method-lane is-structure">
          <div><span>02</span><p><strong>部件 + 位置</strong><small>{structural.length} 个字 · 不强编字源</small></p></div>
          <div className="pilot-character-list">
            {structural.map((character) => {
              const knowledge = getLessonThreeKnowledge(character.hanzi)!;
              return <button key={character.id} onClick={() => onCharacter(character)}><strong>{character.hanzi}</strong><small>{knowledge.equation}</small></button>;
            })}
          </div>
        </article>
      </div>

      <div className="pilot-overview-bottom">
        <article className="pilot-family-card">
          <div><span>声旁家族</span><strong>佥</strong><small>读音只提供线索，不保证完全相同</small></div>
          <div className="pilot-family-flow">
            {qianPhoneticFamily.map((member) => (
              <span className={member.active ? "is-active" : ""} key={member.hanzi}>
                <b>{member.semantic}</b><i>+</i><b>佥</b><i>→</i><strong>{member.hanzi}</strong><small>{member.word} · {member.lesson}</small>
              </span>
            ))}
          </div>
        </article>
        <article className="pilot-review-card">
          <div><span>间隔复习</span><strong>{dueCount ? `${dueCount} 个待复习` : startedCount ? "今日已安排" : `${characters.length} 个待学习`}</strong><small>答错立即再练；答对后按 1、3、7 天拉开间隔</small></div>
          <div className="pilot-review-list">
            {visibleReviewStates.map(({ character, label, tone }) => (
              <button className={`is-${tone}`} key={character.id} onClick={() => onCharacter(character)}><b>{character.hanzi}</b><small>{label}</small></button>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function LessonWordMap({
  lesson,
  profile,
  onBack,
  onCharacter,
  onTrackLesson,
}: {
  lesson: LessonItem;
  profile: StudyProfile;
  onBack: () => void;
  onCharacter: (character: CharacterItem) => void;
  onTrackLesson: (track: TrackId, lessonId: string) => void;
}) {
  const groups = getWordGroups(lesson.id, "curriculum");
  const extensionGroups = getWordGroups(lesson.id, "extension");
  const completed = new Set(profile.completed.words);
  const progress = trackProgress(profile, "words", lesson.id);
  const illustration = lessonVisuals[lesson.id];
  const isLessonThreePilot = lesson.id === LESSON_THREE_ID;

  return (
    <div className="page lesson-page">
      <PageHeading
        kicker={"第 " + lesson.position + " 课" + (lesson.skimming ? " · 略读" : "")}
        title={lesson.title}
        copy={`${lesson.skimming ? "会认字" : "识字写字表"} · ${progress.completed} / ${progress.total} 个课内字已完成整套识字小测`}
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
          <small>{lesson.context || "先进入画面，再从词语认识汉字"}</small>
        </div>
      </section>

      <section className="lesson-learning-path" aria-label={`${lesson.title}内容理解路线`}>
        <div className="learning-path-heading">
          <span>{lesson.mode || "课文理解"}</span>
          <div><strong>先读懂课文，再把字放回故事里</strong><small>{lesson.skimming ? "略读课：抓住关键变化，练习复述" : "精读课：沿内容顺序理解、识字、巩固"}</small></div>
        </div>
        <ol>
          {(lesson.learningPath || []).map((step, index) => (
            <li key={step}><i>{index + 1}</i><span>{step}</span></li>
          ))}
        </ol>
      </section>

      {isLessonThreePilot && (
        <LessonThreeMethodOverview characters={getOfficialLessonCharacters(lesson.id)} profile={profile} onCharacter={onCharacter} />
      )}

      <section className="word-map-board">
        <div className="board-title"><span>{lesson.skimming ? "课内会认字" : "课内识字写字表"}</span><i>把官方字表放回词语，区分会认、会写与多音字</i></div>
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
                    {!completed.has(character.id) && <em>{character.polyphonic ? "多" : character.curriculumRole === "write" ? "写" : "认"}</em>}
                    {isLessonThreePilot && <span className="pilot-chip-method">{getLessonThreeKnowledge(character.hanzi)?.method === "phonosemantic" ? "形声" : "部件"}</span>}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {extensionGroups.length > 0 && (
        <section className="word-map-board extension-board">
          <div className="board-title"><span>课文语境拓展</span><i>保留原有深度字卡，不计入官方字表进度</i></div>
          <div className="word-groups">
            {extensionGroups.map((group) => (
              <article className="word-group" key={group[0].id}>
                <p>{group[0].word}</p>
                <div>
                  {group.map((character) => (
                    <button className="word-chip is-extension" key={character.id} onClick={() => onCharacter(character)}>
                      <strong>{character.hanzi}</strong><em>拓</em>
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

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

function withAssetVersion(source: string | undefined, version: string) {
  if (!source) return undefined;
  return `${source}${source.includes("?") ? "&" : "?"}v=${encodeURIComponent(version)}`;
}

function narrationMediaSource(source: string | undefined) {
  if (!source?.startsWith("/narration/")) return source;
  return `/media/narration/v3/${source.slice("/narration/".length)}`;
}

function NarrationTheatre({
  character,
  onClose,
  onFinished,
  onReadAloud,
}: {
  character: CharacterItem;
  onClose: () => void;
  onFinished: () => void;
  onReadAloud: () => void;
}) {
  const narrationAsset = narrationAssets[character.id];
  const releasedTranscript = releasedNarrationTranscripts[character.id]?.transcript || character.description;
  const narrationVersion = "narration-v3-qwen3-4bit-r37e955a";
  const audioSource = withAssetVersion(narrationMediaSource(narrationAsset?.audio), narrationVersion);
  const audioMarksSource = withAssetVersion(narrationMediaSource(narrationAsset?.audioMarks), narrationVersion);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [marks, setMarks] = useState<AudioMark[]>([]);
  const [transcriptText, setTranscriptText] = useState(releasedTranscript);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing || !audioSource) return;
    let frame = 0;
    let lastSample = 0;
    const sampleAudioTime = (timestamp: number) => {
      const audio = audioRef.current;
      if (audio && !audio.paused && timestamp - lastSample >= 32) {
        setElapsed(audio.currentTime);
        lastSample = timestamp;
      }
      frame = window.requestAnimationFrame(sampleAudioTime);
    };
    frame = window.requestAnimationFrame(sampleAudioTime);
    return () => window.cancelAnimationFrame(frame);
  }, [audioSource, playing]);

  useEffect(() => {
    if (!audioMarksSource) return;
    const controller = new AbortController();
    const audio = audioRef.current;
    void fetch(audioMarksSource, { signal: controller.signal })
      .then((response) => response.ok
        ? response.json() as Promise<{ marks?: AudioMark[]; transcript?: string }>
        : Promise.reject(new Error("marks unavailable")))
      .then((payload: { marks?: AudioMark[]; transcript?: string }) => {
        setMarks((payload.marks || []).filter((mark) => Number.isFinite(mark.start) && Number.isFinite(mark.end)));
        setTranscriptText(payload.transcript || "");
      })
      .catch(() => undefined);
    return () => {
      controller.abort();
      audio?.pause();
    };
  }, [audioMarksSource]);

  function toggleNarration() {
    const audio = audioRef.current;
    if (!audioSource || !audio) {
      setPlaying(true);
      speak(releasedTranscript, () => setPlaying(false));
      return;
    }
    if (audio.paused) {
      const audioDuration = Number.isFinite(audio.duration) ? audio.duration : duration;
      if (audio.ended || (audioDuration > 0 && audio.currentTime >= audioDuration - 0.08)) {
        audio.currentTime = 0;
        setElapsed(0);
      }
      void audio.play().then(() => setPlaying(true)).catch(() => {
        setPlaying(true);
        speak(releasedTranscript, () => setPlaying(false));
      });
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  const activeMarkIndices = useMemo(
    () => new Set(activeNarrationMarkIndices(marks, elapsed)),
    [marks, elapsed],
  );
  const transcript = useMemo(() => buildNarrationTokens(marks, transcriptText), [marks, transcriptText]);
  const phraseByMark = useMemo(() => narrationPhraseIndexByMark(transcript), [transcript]);
  const activePhraseIndex = useMemo(
    () => activeNarrationPhraseIndex(marks, elapsed, phraseByMark),
    [marks, elapsed, phraseByMark],
  );
  const timelineDuration = duration || marks.at(-1)?.end || 0;
  const completedCount = marks.reduce((count, mark) => count + (mark.end <= elapsed ? 1 : 0), 0);
  const finished = marks.length > 0 && completedCount === marks.length && !playing;
  const progress = timelineDuration > 0 ? Math.min(100, (elapsed / timelineDuration) * 100) : 0;
  const narrationStatus = finished
    ? "讲解完成 · 点击可重听"
    : playing && marks.length
      ? `正在跟读 · ${completedCount} / ${marks.length} 字`
      : playing
        ? "正在讲解"
      : elapsed > 0 && marks.length
        ? `已读 ${completedCount} / ${marks.length} 字 · 点击继续`
        : marks.length
          ? "逐字跟读已就绪"
          : "标准普通话讲解";

  const visual = characterVisuals[character.hanzi];
  const spokenSeconds = timelineDuration || 0;
  // Bar heights must be identical on the server and the client, so derive them
  // from the record id rather than Math.random.
  const waveBars = useMemo(() => {
    const base = [...character.id].reduce((total, char) => (total * 31 + char.charCodeAt(0)) % 100000, 7);
    return Array.from({ length: 18 }, (_, index) => {
      const mixed = (base + index * 2654435761) % 2147483648;
      return 26 + ((mixed >> 8) % 74);
    });
  }, [character.id]);

  function seekToPhraseStart(offset: number) {
    const audio = audioRef.current;
    if (!audio || !marks.length) return;
    const current = activePhraseIndex >= 0 ? activePhraseIndex : 0;
    const target = Math.max(0, current + offset);
    const markIndex = phraseByMark.findIndex((phrase) => phrase === target);
    audio.currentTime = markIndex >= 0 ? marks[markIndex]?.start ?? 0 : 0;
    setElapsed(audio.currentTime);
  }

  return (
    <div className="narration-theatre">
      {visual && (
        <div
          className="narration-theatre-backdrop"
          style={{ backgroundImage: `url(${visual.src})` }}
          aria-hidden="true"
        />
      )}

      <div className="narration-theatre-bar">
        <button onClick={onClose} aria-label="收起讲解">
          <ArrowLeft aria-hidden="true" size={20} />
        </button>
        <span>字义讲解 · 逐字跟读</span>
        <span aria-hidden="true">{marks.length ? `${completedCount}/${marks.length}` : ""}</span>
      </div>

      <div className="narration-theatre-chip">
        <div>
          <strong>{character.hanzi} · {character.pinyin}</strong>
          <small>{finished ? "讲解完成，可以进入物象四步" : narrationStatus}</small>
        </div>
        <i className="narration-equalizer" aria-hidden="true"><b /><b /><b /></i>
      </div>

      <div className="narration-theatre-text">
        {marks.length ? (
          <p aria-label={transcript.map((token) => token.text).join("")}>
            {transcript.map((token, index) => {
              if (token.kind === "punctuation") return null;
              const completed = token.completionTime <= elapsed;
              const currentPhrase = phraseByMark[token.markIndex] === activePhraseIndex;
              const punctuation = transcript[index + 1]?.kind === "punctuation" ? transcript[index + 1] : null;
              const className = `narration-token${activeMarkIndices.has(token.markIndex) ? " is-active" : completed ? " is-complete" : " is-upcoming"}`;
              return (
                <span
                  className={`narration-unit${currentPhrase ? " is-current-phrase" : ""}`}
                  key={`${token.kind}-${token.markIndex}-${index}`}
                  aria-hidden="true"
                >
                  <span className={className}>{token.text}</span>
                  {punctuation && (
                    <span className={`narration-token is-punctuation${completed ? " is-complete" : ""}`}>
                      {punctuation.text}
                    </span>
                  )}
                </span>
              );
            })}
          </p>
        ) : (
          <p>{releasedTranscript}</p>
        )}
      </div>

      <div className="narration-theatre-controls">
        <div className="narration-wave" aria-hidden="true">
          {waveBars.map((height, index) => (
            <i
              className={progress >= ((index + 1) / waveBars.length) * 100 ? "is-played" : ""}
              key={index}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>

        <div className="narration-theatre-time">
          <span>{formatClock(elapsed)}</span>
          <span>{marks.length ? `已读 ${completedCount} / ${marks.length} 字` : "标准普通话讲解"}</span>
          <span>{formatClock(spokenSeconds)}</span>
        </div>

        <div className="narration-theatre-buttons">
          <button onClick={() => seekToPhraseStart(-1)} disabled={!marks.length}>
            <RotateCcw aria-hidden="true" size={20} />
            <small>上一句</small>
          </button>
          {finished ? (
            <button className="is-play" onClick={onFinished} aria-label="进入物象四步">
              <ArrowRight aria-hidden="true" size={26} />
            </button>
          ) : (
            <button className="is-play" onClick={toggleNarration} aria-label={playing ? "暂停讲解" : "播放讲解"} aria-pressed={playing}>
              {playing ? <CircleStop aria-hidden="true" size={26} /> : <Volume2 aria-hidden="true" size={26} />}
            </button>
          )}
          <button className="is-record" onClick={onReadAloud}>
            <Mic2 aria-hidden="true" size={20} />
            <small>我来读</small>
          </button>
        </div>
      </div>

      {audioSource && (
        <audio
          ref={audioRef}
          preload="metadata"
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
          onTimeUpdate={(event) => setElapsed(event.currentTarget.currentTime)}
          onPlay={(event) => {
            setElapsed(event.currentTarget.currentTime);
            setPlaying(true);
          }}
          onPause={(event) => {
            setElapsed(event.currentTarget.currentTime);
            setPlaying(false);
          }}
          onEnded={(event) => {
            setPlaying(false);
            setElapsed(event.currentTarget.duration || marks.at(-1)?.end || 0);
          }}
        >
          <source src={audioSource} type='audio/webm; codecs="opus"' />
        </audio>
      )}
    </div>
  );
}

function formatClock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
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

function MemoryStage({
  character,
  onClose,
  onComponent,
  onFinish,
}: {
  character: CharacterItem;
  onClose: () => void;
  onComponent: (glyph: string) => void;
  onFinish: () => void;
}) {
  const [stage, setStage] = useState<MnemonicStage>(0);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const visual = characterVisuals[character.hanzi];
  const scene = getMnemonicScene(character);
  const copy = getMnemonicStageCopy(character, stage);
  const activePartIndices = getMnemonicStagePartIndices(character, stage);
  const parts = character.parts.length
    ? character.parts
    : [{ char: character.hanzi, radical: true }];
  const lastStage = (mnemonicStageLabels.length - 1) as MnemonicStage;

  const regions = useMemo(
    () => getPartFocusRegions(character.decomposition, parts.length),
    [character.decomposition, parts.length],
  );
  // Stage 0 shows the whole picture and stage 4 takes it away, so only the two
  // middle stages aim a spotlight.
  const focus = useMemo(
    () =>
      stage === 0 || stage === lastStage
        ? null
        : mergeFocusRegions(activePartIndices.map((index) => regions[index]).filter(Boolean)),
    [activePartIndices, lastStage, regions, stage],
  );

  const accent = stage === 1 ? "var(--n-radical)" : stage === 2 ? "var(--n-part)" : "var(--n-action)";
  const glow =
    stage === 1
      ? "rgba(255, 122, 82, 0.13)"
      : stage === 2
        ? "rgba(95, 180, 220, 0.13)"
        : "rgba(53, 194, 149, 0.11)";

  function go(next: number) {
    setStage(Math.min(lastStage, Math.max(0, next)) as MnemonicStage);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    swipeStart.current = { x: event.clientX, y: event.clientY };
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const origin = swipeStart.current;
    swipeStart.current = null;
    if (!origin) return;
    const dx = event.clientX - origin.x;
    const dy = event.clientY - origin.y;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
    go(dx < 0 ? stage + 1 : stage - 1);
  }

  return (
    <div
      className="memory-stage"
      style={{ ["--stage-accent" as string]: accent, ["--stage-glow" as string]: glow }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") go(stage - 1);
        if (event.key === "ArrowRight") go(stage + 1);
      }}
      tabIndex={0}
      role="group"
      aria-label={`物象四步，第 ${stage + 1} 步：${mnemonicStageLabels[stage]}`}
    >
      <div className="memory-stage-progress" aria-hidden="true">
        {mnemonicStageLabels.map((label, index) => (
          <i className={index < stage ? "is-past" : index === stage ? "is-current" : ""} key={label} />
        ))}
      </div>

      <div className="memory-stage-bar">
        <button onClick={() => (stage === 0 ? onClose() : go(stage - 1))} aria-label="上一步">
          <ArrowLeft aria-hidden="true" size={20} />
        </button>
        <span>物象四步 · {character.hanzi}</span>
        <button onClick={onClose} aria-label="退出演示">
          <ArrowRight aria-hidden="true" size={20} />
        </button>
      </div>

      {stage === lastStage ? (
        <>
          <div className="memory-stage-recall">
            {visual && <Image src={visual.src} alt="" aria-hidden="true" width={44} height={44} />}
            <span>
              <strong>图片先收起来了</strong>
              <small>能离开画面想起字形，才算记住</small>
            </span>
            <button onClick={() => go(0)}>再看图</button>
          </div>

          <div className="memory-stage-equation" aria-label={`${parts.map((part) => part.char).join("加")}等于${character.hanzi}`}>
            <div className={`memory-stage-parts${character.decomposition?.includes("左右") ? " is-beside" : ""}`}>
              {parts.map((part, index) => (
                <span className={part.radical ? "is-radical" : "is-component"} key={`${part.char}-${index}`}>
                  {part.char}
                </span>
              ))}
            </div>
            <ArrowRight aria-hidden="true" size={30} color="rgba(244,240,230,.5)" />
            <span className="memory-stage-result">{character.hanzi}</span>
          </div>

          <div className="memory-stage-legend" aria-hidden="true">
            <span><i style={{ background: "var(--n-radical)" }} />表意部首</span>
            <span><i style={{ background: "var(--n-part)" }} />形音部件</span>
            <span>{character.decomposition}</span>
          </div>

          <p className="memory-stage-copy" style={{ paddingTop: 26 }}>{copy.body}</p>
        </>
      ) : (
        <>
          <figure className="memory-stage-scene">
            <span className="memory-stage-art">
              {visual && (
                <Image
                  src={visual.src}
                  alt={`${visual.alt}。${scene.scene}`}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 520px"
                  style={{ objectFit: "contain", objectPosition: "center" }}
                />
              )}
            </span>
            {focus && (
              <>
                <span
                  className="memory-stage-spot"
                  aria-hidden="true"
                  style={{
                    background: `radial-gradient(ellipse ${focus.w / 2}% ${focus.h / 2}% at ${focus.x}% ${focus.y}%, rgba(15,22,20,0) 0%, rgba(15,22,20,0) 62%, rgba(15,22,20,.66) 100%)`,
                  }}
                />
                <span
                  className="memory-stage-tint"
                  aria-hidden="true"
                  style={{
                    background: `radial-gradient(ellipse ${focus.w / 2}% ${focus.h / 2}% at ${focus.x}% ${focus.y}%, ${stage === 1 ? "rgba(217,84,47,.26)" : "rgba(46,108,138,.26)"} 0%, transparent 72%)`,
                  }}
                />
                <span
                  className="memory-stage-ring"
                  aria-hidden="true"
                  style={{
                    top: `${focus.y}%`,
                    left: `${focus.x}%`,
                    width: `${focus.w}%`,
                    height: `${focus.h}%`,
                  }}
                />
              </>
            )}
          </figure>

          <div className="memory-stage-copy">
            <p className="memory-stage-eyebrow"><b>{stage + 1}</b>{copy.eyebrow}</p>
            <h2>{copy.title}</h2>
            <p>{copy.body}</p>
          </div>
        </>
      )}

      <div className="study-spacer" />

      <div className="memory-stage-foot">
        {stage !== lastStage && (
          <div className="memory-stage-chips">
            {parts.map((part, index) => {
              const isActive = activePartIndices.includes(index);
              return (
                <button
                  className={`${part.radical ? "is-radical" : "is-component"}${stage > 0 && isActive ? " is-active" : ""}`}
                  key={`${part.char}-${index}`}
                  onClick={() => onComponent(part.char)}
                >
                  <span>{part.char}</span>
                  <span>
                    <strong>{part.radical ? "表意部首" : "形音部件"}</strong>
                    <small>{stage > 0 && isActive ? "正在看" : scene.cues[index] ? "点开看来历" : "字形线索"}</small>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {stage === lastStage ? (
          <>
            <button className="memory-stage-next is-finish" onClick={onFinish}>
              学会了，去练一练
              <ArrowRight aria-hidden="true" size={20} />
            </button>
            <button className="memory-stage-secondary" onClick={onClose}>回到这个字</button>
          </>
        ) : (
          <>
            <button className="memory-stage-next" onClick={() => go(stage + 1)}>
              看下一步
              <ArrowRight aria-hidden="true" size={19} />
            </button>
            <p className="memory-stage-hint">左右滑动也可以切换四步</p>
          </>
        )}
      </div>
    </div>
  );
}


function LessonThreeMemory({
  character,
  onComponent,
}: {
  character: CharacterItem;
  onComponent: (glyph: string) => void;
}) {
  const knowledge = getLessonThreeKnowledge(character.hanzi)!;
  const visual = characterVisuals[character.hanzi];
  const [stage, setStage] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const labels = ["图字同现", "图片淡出", "只看汉字", "词语回忆"];
  const maskedWord = character.word.split(character.hanzi).join("□");

  function selectStage(next: number) {
    setStage(next);
    if (next === 3) setRevealed(false);
  }

  return (
    <section className="pilot-memory-card" aria-labelledby={`pilot-memory-${character.id}`}>
      <div className="pilot-memory-heading">
        <div>
          <p className="kicker">图片是桥梁 · 不是答案</p>
          <h2 id={`pilot-memory-${character.id}`}>从画面走到无图回忆</h2>
          <p>每次向后一步，图片提示都会减少；最后只凭词义、结构和读音把字找回来。</p>
        </div>
        <span>{knowledge.methodLabel}</span>
      </div>

      <div className={`pilot-memory-stage stage-${stage}`}>
        <div className="pilot-memory-visual">
          {stage <= 1 && (
            <div className="pilot-memory-image">
              <Image src={visual.src} alt={stage === 0 ? visual.alt : "逐渐淡出的助记画面"} fill priority sizes="(max-width: 760px) 100vw, 620px" style={{ objectFit: "contain" }} />
              <span>构形助记图 · 非字源图</span>
            </div>
          )}
          {stage === 0 && <strong className="pilot-memory-glyph is-over-image">{character.hanzi}</strong>}
          {stage === 1 && (
            <div className="pilot-memory-equation-on-image">
              {knowledge.components.map((component) => <span key={component.glyph}>{component.glyph}<small>{component.label}</small></span>)}
            </div>
          )}
          {stage === 2 && (
            <div className="pilot-memory-glyph-only">
              <span>图片已经拿走</span><strong>{character.hanzi}</strong><small>{character.pinyin} · {character.word}</small>
            </div>
          )}
          {stage === 3 && (
            <div className="pilot-memory-recall">
              <span>不看图片，补出方框里的字</span>
              <strong>{revealed ? character.word : maskedWord}</strong>
              <small>{character.pinyin} · {character.originalMeaning}</small>
              <button onClick={() => setRevealed((value) => !value)}>{revealed ? "再次遮住" : "显示答案"}</button>
            </div>
          )}
        </div>

        <aside className="pilot-memory-copy" aria-live="polite">
          <span className="pilot-step-index">0{stage + 1} / 04</span>
          {stage === 0 && <><h3>先把字放进词义画面</h3><p>观察“{character.word}”的意思，同时保持规范汉字清楚可见。图片只负责建立第一次联系。</p></>}
          {stage === 1 && <><h3>图片退后，部件站出来</h3><p>{knowledge.explanation}</p></>}
          {stage === 2 && <><h3>只留下规范汉字</h3><p>{knowledge.recallCue} 现在用手指沿字形空写一遍。</p></>}
          {stage === 3 && <><h3>从词语主动提取</h3><p>{revealed ? `答案是“${character.hanzi}”。核对结构后，再遮住重来一次。` : "先读词义和拼音，在心里写出答案，再点击核对。"}</p></>}

          {stage < 3 && (
            <div className="pilot-component-roles">
              {knowledge.components.map((component) => (
                <button key={component.glyph} onClick={() => onComponent(component.glyph)}>
                  <strong>{component.glyph}</strong><span><b>{component.label}</b><small>{component.note}</small></span>
                </button>
              ))}
            </div>
          )}
          <div className="pilot-evidence-note"><b>依据说明</b><span>{knowledge.evidence}</span></div>
        </aside>
      </div>

      <nav className="pilot-memory-nav" aria-label="图片提示逐步撤除">
        {labels.map((label, index) => (
          <button className={stage === index ? "is-active" : stage > index ? "is-past" : ""} key={label} onClick={() => selectStage(index)} aria-current={stage === index ? "step" : undefined}>
            <span>{index + 1}</span><strong>{label}</strong><small>{index === 0 ? "图 + 字" : index === 1 ? "图淡化" : index === 2 ? "仅字形" : "无图提取"}</small>
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
  onReadAloud,
}: {
  character: CharacterItem;
  profile: StudyProfile;
  favorite: boolean;
  onBack: () => void;
  onFavorite: () => void;
  onStart: () => void;
  onComponent: (glyph: string) => void;
  onReadAloud: () => void;
}) {
  // One screen, one thing: the picture and a single primary action. Reference
  // material — component origins, script history, the textbook sentence — lives
  // in a pull-up drawer instead of seven stacked cards.
  const [view, setView] = useState<"study" | "listen" | "memory">("study");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const exercises = getTrackExercises(character, "words");
  const isComplete = profile.completed.words.includes(character.id);
  const completedQuestions = exercises.filter((question) => profile.answers[question.id]?.lastCorrect).length;
  const heritage = heritageAssets[character.id];
  const hasExercises = exercises.length > 0;
  const pilotKnowledge = character.lessonId === LESSON_THREE_ID ? getLessonThreeKnowledge(character.hanzi) : undefined;
  const visual = characterVisuals[character.hanzi];
  const scene = !pilotKnowledge ? getMnemonicScene(character) : undefined;
  const narrationSeconds = releasedNarrationTranscripts[character.id]?.transcript?.length;
  const narrationVersion = "narration-v3-qwen3-4bit-r37e955a";
  const narrationHref = withAssetVersion(
    narrationMediaSource(narrationAssets[character.id]?.audio),
    narrationVersion,
  );
  const parts = character.parts.length
    ? character.parts
    : [{ char: character.hanzi, radical: true }];
  const roleLabel = character.official === false
    ? "语境拓展"
    : character.polyphonic
      ? character.curriculumRole === "write" ? "会写 · 多音字" : "会认 · 多音字"
      : character.curriculumRole === "write"
        ? "课内会写"
        : "课内会认";

  if (view === "listen") {
    return (
      <NarrationTheatre
        character={character}
        key={character.id}
        onClose={() => setView("study")}
        onFinished={() => setView(visual && !pilotKnowledge ? "memory" : "study")}
        onReadAloud={onReadAloud}
      />
    );
  }

  if (view === "memory" && visual && !pilotKnowledge) {
    return (
      <MemoryStage
        character={character}
        key={character.id}
        onClose={() => setView("study")}
        onComponent={onComponent}
        onFinish={onStart}
      />
    );
  }

  return (
    <main className="study-shell">
      {narrationHref && <link rel="prefetch" as="audio" href={narrationHref} />}

      <div className="study-topbar">
        <button onClick={onBack} aria-label="返回词语表">
          <ArrowLeft aria-hidden="true" size={22} />
        </button>
        <div className="study-breadcrumb">
          <span>{character.lessonTitle}</span>
          <i aria-hidden="true" />
          <span>{character.word}</span>
        </div>
        <button
          className={"favorite-star " + (favorite ? "is-active" : "")}
          onClick={onFavorite}
          aria-label={favorite ? "取消收藏" : "收藏这个字"}
        >
          {favorite ? "★" : "☆"}
        </button>
      </div>

      <div className="study-body">
        <figure className={visual ? "study-scene" : "study-scene is-glyph"}>
          {visual ? (
            <>
              <span className="study-scene-art">
                <Image
                  src={visual.src}
                  alt={`${visual.alt}${scene ? `。${scene.scene}` : ""}`}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 520px"
                  style={{ objectFit: "contain", objectPosition: "center" }}
                />
              </span>
              <figcaption className="study-scene-caption">
                <Sparkles aria-hidden="true" />
                画面本身就是字形
              </figcaption>
            </>
          ) : (
            <strong>{character.hanzi}</strong>
          )}
        </figure>

        <div>
          <div className="study-identity">
            <span className="study-glyph">{character.hanzi}</span>
            <div>
              <span className="study-reading">
                <b>{character.pinyin}</b>
                <button onClick={() => speak(character.hanzi)} aria-label={`朗读${character.hanzi}`}>
                  <Volume2 aria-hidden="true" size={14} />
                </button>
              </span>
              <span className="study-tags">
                <span className="is-role">{roleLabel}</span>
                <span>{pilotKnowledge?.methodLabel || character.charType}</span>
                <span>{character.decomposition}</span>
              </span>
            </div>
          </div>

          <p className="study-meaning">
            {character.official === false ? character.originalMeaning : `本课词语「${character.word}」：${character.originalMeaning}`}
          </p>

          <div className="study-spacer" />

          <div className="study-launch">
            <button className="study-listen-button" onClick={() => setView("listen")}>
              <span className="study-equalizer" aria-hidden="true"><b /><b /><b /><b /><b /></span>
              <span>
                <strong>听字义讲解</strong>
                <small>{narrationSeconds ? `${narrationSeconds} 字 · 逐字跟读` : "标准普通话讲解"}</small>
              </span>
              <ArrowRight aria-hidden="true" size={20} />
            </button>

            {visual && !pilotKnowledge && (
              <button className="study-next-steps" onClick={() => setView("memory")}>
                <small>接着是</small>
                <div>
                  {mnemonicStageLabels.map((label, index) => (
                    <span
                      className={index === 1 ? "is-radical" : index === 2 ? "is-part" : ""}
                      key={label}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </button>
            )}

            <button className="study-drawer-handle" onClick={() => setDrawerOpen(true)}>
              <ArrowLeft aria-hidden="true" size={18} style={{ transform: "rotate(90deg)" }} />
              上滑查看部件、语境与书写
            </button>
          </div>
        </div>
      </div>

      {drawerOpen && (
        <button
          className="study-drawer-backdrop"
          onClick={() => setDrawerOpen(false)}
          aria-label="收起更多内容"
        />
      )}

      <section
        className={drawerOpen ? "study-drawer is-open" : "study-drawer"}
        aria-label="更多助记内容"
        aria-hidden={drawerOpen ? undefined : true}
        inert={drawerOpen ? undefined : true}
      >
          <span className="study-drawer-grip" aria-hidden="true" />

          {pilotKnowledge ? (
            <>
              <h2>本课构形说明</h2>
              <div className="study-note">
                <Sparkles aria-hidden="true" size={19} />
                <div>
                  <strong>{pilotKnowledge.explanation}</strong>
                  <small>{pilotKnowledge.evidence}</small>
                </div>
              </div>
              <div className="study-legacy-panel">
                <LessonThreeMemory character={character} onComponent={onComponent} />
              </div>
            </>
          ) : (
            <>
              <h2>部件来历</h2>
              <div className="study-part-list">
                {parts.map((part, index) => {
                  const composition = character.compositions.find((item) => item.char === part.char);
                  return (
                    <button
                      className={part.radical ? "is-radical" : "is-component"}
                      key={`${part.char}-${index}`}
                      onClick={() => onComponent(part.char)}
                    >
                      <span className="study-part-glyph">{part.char}</span>
                      <span className="study-part-copy">
                        <strong>{part.char} · {part.radical ? "表意部首" : "形音部件"}</strong>
                        <small>{composition?.description || scene?.cues[index] || "顺着画面里的物体轮廓找到这个部件。"}</small>
                      </span>
                      <ArrowRight aria-hidden="true" size={18} />
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <h2>字形演变</h2>
          {heritage?.stages.length ? (
            <div className="study-script-line" aria-label="真实字形演变资料">
              {heritage.stages.map((stage) => (
                <div key={stage.src}>
                  <span className="study-script-image">
                    <Image
                      src={stage.src}
                      alt={`${character.hanzi}的${stage.label}字形`}
                      fill
                      sizes="78px"
                      style={{ objectFit: "contain", objectPosition: "center" }}
                    />
                  </span>
                  <small>{stage.label}</small>
                </div>
              ))}
            </div>
          ) : (
            <div className="study-note">
              <CheckCircle2 aria-hidden="true" size={19} />
              <div>
                <strong>本字暂无可靠的古文字图版</strong>
                <small>保留现代楷书，不虚构演变形态。</small>
              </div>
            </div>
          )}

          <h2>课文语境</h2>
          <div className="study-quote">
            <p>{character.originalText}</p>
            <small>《{character.lessonTitle}》· 本课词语「{character.word}」</small>
          </div>

          <h2>接着可以做</h2>
          <div className="study-drawer-actions">
            <button onClick={onStart} disabled={!hasExercises}>
              <MapIcon aria-hidden="true" size={21} color="var(--n-action)" />
              <span>
                <strong>{hasExercises ? (isComplete ? "再练一轮" : "识字小测") : "小测暂未开放"}</strong>
                <small>{hasExercises ? `${completedQuestions} / ${exercises.length} 题` : "拓展字稍后开放"}</small>
              </span>
            </button>
            <button onClick={onReadAloud}>
              <Mic2 aria-hidden="true" size={21} color="var(--n-warn)" />
              <span>
                <strong>朗读录音</strong>
                <small>读一遍本课词语</small>
              </span>
            </button>
          </div>
        </section>
    </main>
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
      <div className="track-map-layout">
        <section className="level-map">
          <div className="level-map-title">
            <h2>选择课次</h2>
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
                  <b><ArrowRight aria-hidden="true" /></b>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="track-map-aside">
          <section className={"track-hero " + meta.tone}>
            <div className="track-symbol">{meta.glyph}</div>
            <div>
              <p>上次学到</p>
              <h2>{next ? next.hanzi + " 字" : "准备开始"}</h2>
              <span>{next ? "来自第 " + next.lessonPosition + " 课 · " + next.lessonTitle : "从第一课开始闯关"}</span>
            </div>
            <button className="game-button white" onClick={onContinue}>{meta.action} <ArrowRight aria-hidden="true" /></button>
          </section>
          <section className="track-method-card">
            <p className="kicker">这项练习在训练什么</p>
            <h2>{meta.eyebrow}</h2>
            <p>{meta.copy}</p>
          </section>
        </aside>
      </div>
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

function CelebrationOverlay({
  track,
  character,
  results,
  total,
  onReplay,
  onNextCharacter,
  onFinish,
}: {
  track: TrackId;
  character: CharacterItem;
  results: boolean[];
  total: number;
  onReplay: () => void;
  onNextCharacter: () => void;
  onFinish: () => void;
}) {
  // Reaching this overlay means every question ended up correct; results holds
  // one entry per ATTEMPT, so extra tries are the mistakes.
  const attempts = results.length;
  const mistakes = Math.max(0, attempts - total);
  const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
  const firstTryRate = Math.min(100, Math.round((total * 100) / Math.max(attempts, total)));
  return (
    <div className="celebration-overlay" role="dialog" aria-label="本关完成">
      <div className={"celebration-card track-" + trackMeta[track].tone}>
        <div className="celebration-confetti" aria-hidden="true">
          {Array.from({ length: 26 }).map((_, index) => (
            <i
              key={index}
              className={"confetti-piece piece-" + (index % 4)}
              style={{
                left: ((index * 37 + 13) % 100) + "%",
                animationDelay: ((index % 8) * 0.14).toFixed(2) + "s",
              }}
            />
          ))}
        </div>
        <p className="celebration-kicker">{trackMeta[track].menu} · {character.lessonTitle}</p>
        <div className="celebration-stars" aria-label={stars + " 颗星"}>
          {[0, 1, 2].map((index) => (
            <span key={index} className={index < stars ? "star is-lit" : "star"} style={{ animationDelay: index * 0.18 + "s" }}>★</span>
          ))}
        </div>
        <h2>{mistakes === 0 ? "完美通关！" : "本关完成！"}</h2>
        <div className="celebration-glyph" aria-hidden="true">{character.hanzi}</div>
        <dl className="celebration-stats">
          <div><dt>题目</dt><dd>{total} 题</dd></div>
          <div><dt>尝试</dt><dd>{attempts} 次</dd></div>
          <div><dt>首次答对</dt><dd>{firstTryRate}%</dd></div>
        </dl>
        <p className="celebration-note">
          {stars === 3
            ? "一次全对，这个字已经稳稳住进记忆里了。"
            : stars === 2
              ? "只错了一点点，再练一轮就能拿满三颗星。"
              : "慢慢来，把答错的题再看一遍线索。"}
        </p>
        <div className="celebration-actions">
          <button className="game-button ghost" onClick={onReplay}><RotateCcw aria-hidden="true" /> 再练一轮</button>
          <button className="game-button primary" onClick={onNextCharacter}>下一个字 →</button>
          <button className="text-button" onClick={onFinish}>返回课文地图</button>
        </div>
      </div>
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
  orderedOptions,
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
  orderedOptions: Exercise["options"];
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
    <div className={"challenge-page challenge-centered track-" + meta.tone}>
      <header className="challenge-bar">
        <button className="challenge-close" onClick={onBack} aria-label="退出练习">
          <ArrowLeft aria-hidden="true" size={21} />
        </button>
        <div
          className="challenge-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={questionIndex + (result === null ? 0 : 1)}
          aria-label={`${meta.menu} · ${character.hanzi}`}
        >
          <i style={{ width: ((result === null ? questionIndex : questionIndex + 1) / total) * 100 + "%" }} />
        </div>
        <span className="challenge-count">{questionIndex + 1}/{total}</span>
      </header>

      <section className="challenge-board">
        <div className="challenge-question">
          <span className="question-tag">{questionTypeLabel(question, track)}</span>
          <h2>{question.prompt}</h2>
          {needsMultiple && (
            <p className="multi-hint">
              这题需要选择多个部件 · 已选 <b>{selected.length}</b> / 需要 <b>{expected.length}</b> 个
            </p>
          )}
        </div>

        {question.kind === "write" ? (
          <WritingPad
            character={character.hanzi}
            guided={character.lessonId !== LESSON_THREE_ID}
            revealAnswer={result !== null}
            onWrite={onWrite}
            onClear={onClearWrite}
          />
        ) : question.kind === "components" && track === "split" ? (
          <AssemblyExercise
            character={character}
            question={question}
            orderedOptions={orderedOptions}
            selected={selected}
            result={result}
            onChoose={onChoose}
            onRemove={onRemove}
          />
        ) : question.kind === "components" && track === "honglan" ? (
          <RedBlueExercise
            character={character}
            question={question}
            orderedOptions={orderedOptions}
            selected={selected}
            result={result}
            onChoose={onChoose}
          />
        ) : (
          <ChoiceExercise
            character={character}
            question={question}
            orderedOptions={orderedOptions}
            selected={selected}
            result={result}
            onChoose={onChoose}
          />
        )}

      </section>

      {result === null ? (
        <div className="challenge-actions">
          <button className="game-button primary" disabled={!ready} onClick={onCheck}>核对答案</button>
          <div className="challenge-actions-row">
            <button className="text-button" disabled={questionIndex === 0} onClick={onPrevious}>← 上一题</button>
            <span className="key-hint">按 <kbd>A</kbd>–<kbd>D</kbd> 选择 · <kbd>Enter</kbd> 确认</span>
            <button className="text-button" onClick={onSkip}>跳过这一题 →</button>
          </div>
        </div>
      ) : (
        <div className={"answer-sheet " + (result ? "is-correct" : "is-wrong")} role="status">
          <div className="answer-sheet-head">
            <span className="answer-sheet-mark" aria-hidden="true">
              {result
                ? <CheckCircle2 size={24} strokeWidth={2.6} />
                : <RotateCcw size={22} strokeWidth={2.6} />}
            </span>
            <strong>
              {result
                ? (question.kind === "write" && character.lessonId === LESSON_THREE_ID ? "已记录书写，请对照自查" : "答对了")
                : "再看一眼"}
            </strong>
            {record && <small>已尝试 {record.attempts} 次</small>}
          </div>
          <p>
            {result
              ? question.explanation || (finalStep ? "这一关完成了，回到地图看看下一站。" : "记住这个线索，再去下一题。")
              : "正确答案是：" + (question.kind === "write" ? "在方格里写完整的「" + character.hanzi + "」" : answerText || "仔细看字形。")}
          </p>
          <button className="game-button primary" onClick={onNext}>
            {result ? (finalStep ? "查看成绩" : "继续") : "知道了"}
          </button>
        </div>
      )}
    </div>
  );
}

function ChoiceExercise({
  character,
  question,
  orderedOptions,
  selected,
  result,
  onChoose,
}: {
  character: CharacterItem;
  question: Exercise;
  orderedOptions: Exercise["options"];
  selected: string[];
  result: boolean | null;
  onChoose: (id: string) => void;
}) {
  const visual = question.questionType === "image_single_select";
  // Captions on picture options can name the answer; reveal them only after
  // the question has been graded.
  const showVisualCaption = result !== null && question.options.some((item) => Boolean(item.text));
  const displayedOptions = orderedOptions.length ? orderedOptions : stableOptionOrder(question.options, question.id);
  const keyLabels = "ABCDEFGH";
  return (
    <div className={"choice-grid " + (visual ? "is-visual " : "") + (visual && !showVisualCaption ? "no-visual-captions" : "")}>
      {displayedOptions.map((option, index) => {
        const isSelected = selected.includes(option.id);
        const wrongSlot = displayedOptions
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
            <span className="choice-key" aria-hidden="true">{keyLabels[index] || index + 1}</span>
            {visual ? (
              <span className="meaning-illustration">
                <Image
                  src={illustration!.src}
                  alt={showVisualCaption ? illustration!.alt : "选项图片"}
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
            ) : null}
            {visual ? (
              showVisualCaption && <strong>{illustration!.label}</strong>
            ) : (
              <strong>{optionText(option, character, index)}</strong>
            )}
            {question.kind === "structure" && <small aria-hidden="true">{option.idcCode}</small>}
          </button>
        );
      })}
    </div>
  );
}

function AssemblyExercise({
  character,
  question,
  orderedOptions,
  selected,
  result,
  onChoose,
  onRemove,
}: {
  character: CharacterItem;
  question: Exercise;
  orderedOptions: Exercise["options"];
  selected: string[];
  result: boolean | null;
  onChoose: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const expected = getExpectedIds(question, character, "split");
  const slots = Math.max(expected.length, character.parts.length, 1);
  const choices = orderedOptions.length ? orderedOptions : stableOptionOrder(question.options, question.id);
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
        {result === null && <small className="assembly-hint">按顺序点选部件；点错了就点上面的格子撤销。</small>}
      </div>
      <div className="assembly-choices">
        {choices.map((option) => (
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
  orderedOptions,
  selected,
  result,
  onChoose,
}: {
  character: CharacterItem;
  question: Exercise;
  orderedOptions: Exercise["options"];
  selected: string[];
  result: boolean | null;
  onChoose: (id: string) => void;
}) {
  const redBlueAsset = heritageAssets[character.id]?.redBlue;
  const choices = orderedOptions.length ? orderedOptions : stableOptionOrder(question.options, question.id);
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
        {choices.map((option, index) => {
          const isSelected = selected.includes(option.id);
          // Chips stay color-neutral before grading; coloring radicals red up
          // front would give the answer away before checking.
          const revealColors = result !== null;
          const chipColor = revealColors ? (option.radical ? " is-red" : " is-blue") : "";
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
            <button className={chipColor.trim() + " " + state} key={option.id} disabled={result !== null} onClick={() => onChoose(option.id)}>
              <span className={revealColors ? (option.radical ? "is-red" : "is-blue") : ""}>{optionText(option, character, index)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StructureShape({ code }: { code: string }) {
  const shape =
    code === "⿰" ? "side"
    : code === "⿲" ? "triside"
    : code === "⿱" ? "stack"
    : code === "⿳" ? "tristack"
    : code === "⿴" ? "enclose"
    : code === "⿵" ? "open-top"
    : code === "⿶" ? "open-bottom"
    : code === "⿷" ? "open-right"
    : code === "⿸" ? "corner-tl"
    : code === "⿹" ? "corner-tr"
    : code === "⿺" ? "corner-bl"
    : code === "⿻" ? "cross"
    : "single";
  return (
    <span className={"structure-shape ss-" + shape} aria-hidden="true">
      <i /><i /><i />
    </span>
  );
}

function WritingPad({
  character,
  guided,
  revealAnswer,
  onWrite,
  onClear,
}: {
  character: string;
  guided: boolean;
  revealAnswer: boolean;
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
      if (guided && !acceptedRef.current && totalLengthRef.current >= 34) {
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
      const nextStrokeCount = strokeCount + 1;
      setStrokeCount(nextStrokeCount);
      if (!guided && !acceptedRef.current && nextStrokeCount >= 2 && totalLengthRef.current >= 80) {
        acceptedRef.current = true;
        onWrite();
      }
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
    <div className={`writing-board${guided ? "" : " is-unguided"}${revealAnswer ? " is-answer-revealed" : ""}`}>
      {(guided || revealAnswer) && <div className="writing-guide" aria-hidden="true">{character}</div>}
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
          {revealAnswer
            ? "规范字已显示：请逐部件对照是否漏笔、错位"
            : strokeCount
              ? `已记录 ${strokeCount} 笔，继续把字写完整`
              : guided
                ? "沿着浅色字形认真描写，轻点一下不会算作完成"
                : "空白书写：至少完成两笔后才能核对答案"}
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
      .then((response) => response.ok
        ? response.json() as Promise<{ recordings?: { url: string }[] }>
        : Promise.reject())
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
          {recording ? <><CircleStop aria-hidden="true" />结束录音</> : <><Mic2 aria-hidden="true" />开始录音</>}
        </button>
      </section>
      <div className="sentence-list">
        {sentences.map((text) => (
          <article className={activeText === text ? "is-speaking" : ""} key={text}>
            <p>“{text}”</p>
            <button onClick={() => play(text)}><Volume2 aria-hidden="true" />{speaking && activeText === text ? "正在范读…" : "范读"}</button>
          </article>
        ))}
      </div>
      {recordingUrl && (
        <section className="recording-result">
          <span><CheckCircle2 aria-hidden="true" /></span>
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
        <button onClick={onTheme}>{profile.theme === "light" ? <MoonStar aria-hidden="true" /> : <SunMedium aria-hidden="true" />}{profile.theme === "light" ? "切换夜读模式" : "切换日间模式"}</button>
        <button className="is-danger" onClick={onReset}><RotateCcw aria-hidden="true" />清除学习记录</button>
        {identity?.mode === "workspace" && <Link className="account-signout" href="/signout-with-chatgpt?return_to=%2F"><LogOut aria-hidden="true" />退出登录</Link>}
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
      <button className="back-button" onClick={onBack}><ArrowLeft aria-hidden="true" />返回</button>
      <div>
        <p className="kicker">{kicker}</p>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      <MapIcon className="page-heading-mark" aria-hidden="true" />
    </header>
  );
}
