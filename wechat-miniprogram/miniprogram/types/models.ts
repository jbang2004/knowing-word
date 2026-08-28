export type TrackId = "words" | "split" | "honglan" | "structure";
export type SkillDimension = "recognition" | "phonology" | "semantics" | "generation" | "discrimination" | "context";
export type AnswerMode = "choice" | "speech" | "handwriting" | "self-check";
export type ErrorTag =
  | "pronunciation-initial" | "pronunciation-final" | "pronunciation-tone"
  | "meaning-unknown" | "semantic-component" | "phonetic-component"
  | "component-missing" | "component-extra" | "component-position"
  | "stroke-missing" | "stroke-extra" | "homophone-confusion"
  | "lookalike-confusion" | "context-misuse" | "writing-unverified";

export type DimensionMemory = {
  status: "new" | "learning" | "review" | "stable";
  dueAt: string;
  intervalDays: number;
  lapses: number;
  correctStreak: number;
  independentStreak: number;
  lastAt: string | null;
  lastIndependentCorrectAt: string | null;
};

export type CharacterMemory = Record<SkillDimension, DimensionMemory>;

export type CatalogLesson = {
  id: string;
  title: string;
  position: number;
  skimming?: boolean;
  context?: string;
  mode?: string;
  learningPath?: readonly string[];
  recognitionCount?: number;
  writingCount?: number;
  officialCount?: number;
  visualPath?: string;
  visual?: { src: string; label: string; alt: string } | null;
};

export type ExerciseOption = {
  id: string;
  text: string;
  correct: boolean;
  radical?: boolean;
  idcCode?: string;
};

export type Exercise = {
  id: string;
  origin: string;
  kind: "single" | "structure" | "components" | "write";
  questionType: string;
  prompt: string;
  options: ExerciseOption[];
  explanation: string;
  dimension?: SkillDimension;
  answerMode?: AnswerMode;
  cueLevel?: 0 | 1 | 2 | 3;
  concealTarget?: boolean;
  optionErrorTags?: Record<string, ErrorTag[]>;
};

export type CatalogCharacter = {
  id: string;
  lessonId: string;
  lessonTitle: string;
  lessonPosition: number;
  word: string;
  wordPosition?: number;
  hanzi: string;
  pinyin: string;
  charType: string;
  decomposition: string;
  originalMeaning?: string;
  description?: string;
  originalText?: string;
  curriculumRole?: string;
  polyphonic?: boolean;
  official?: boolean;
  primary: boolean;
  ready: boolean;
  tier?: string;
  parts?: Array<{ char: string; radical: boolean; functionText?: string; role?: string }>;
  compositions?: Array<{ char: string; description: string; charType: string; children: string[] }>;
  exercises?: Exercise[];
  media?: {
    visual: { src: string; label: string; alt: string } | null;
    scene: { scene: string; cues: readonly string[] };
    narration: { transcript: string; audio: string; marks?: string };
    practiceOptionVisuals: Record<string, { src: string; label: string; alt: string }>;
  } | null;
};

export type LessonContent = {
  schemaVersion: number;
  lesson: CatalogLesson;
  document: {
    format: "reading" | "guide";
    title?: string;
    eyebrow?: string;
    dek?: string;
    intro?: string;
    rights?: { label?: string; note?: string };
    sections: Array<{
      id?: string;
      number?: string;
      title?: string;
      paragraphs: Array<{ id?: string; text: string }>;
      question?: string;
      focusWords?: string[];
    }>;
  } | null;
  characters: CatalogCharacter[];
};

export type StudyProfile = {
  version: 5;
  name: string;
  grade: number;
  courseId: string;
  theme: "light" | "night";
  favorites: string[];
  preferenceUpdatedAt: Record<string, string>;
  completed: Record<TrackId, string[]>;
  last: Record<TrackId, { lessonId: string; characterId: string; questionIndex: number } | null>;
  answers: Record<string, {
    attempts: number;
    correct: number;
    lastCorrect: boolean;
    lastAt: string;
    lastLatencyMs?: number;
    lastCueLevel?: 0 | 1 | 2 | 3;
    lastErrorTags?: ErrorTag[];
    actorCounts?: Record<string, { attempts: number; correct: number }>;
  }>;
  memory: Record<string, Partial<CharacterMemory>>;
  errorCounts: Partial<Record<ErrorTag, number>>;
  learnedComponents: string[];
  recentComponents: string[];
  readLessons: string[];
  readingEvidence: Record<string, {
    attempts: number;
    accurate: number;
    needsPractice: number;
    lastAt: string;
    lastAccuracy: "accurate" | "needs-practice";
    verificationSource: "self";
  }>;
  introducedByDay: Record<string, string[]>;
  reviewedByDay: Record<string, string[]>;
  daily: Record<string, { attempts: number; correct: number; skips: number; readSessions: number }>;
};

export type IAppOption = {
  globalData: { sessionReady: boolean };
};
