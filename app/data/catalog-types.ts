export type ExerciseKind = "single" | "structure" | "components" | "write";

export type Exercise = {
  id: string;
  origin: string;
  kind: ExerciseKind;
  questionType: string;
  prompt: string;
  options: {
    id: string;
    text: string;
    correct: boolean;
    radical: boolean;
    idcCode: string;
  }[];
  explanation: string;
};

export type CharacterItem = {
  id: string;
  lessonId: string;
  lessonTitle: string;
  lessonPosition: number;
  word: string;
  wordPosition: number;
  hanzi: string;
  primary: boolean;
  ready: boolean;
  pinyin: string;
  charType: string;
  decomposition: string;
  originalMeaning: string;
  description: string;
  originalText: string;
  parts: { char: string; radical: boolean }[];
  compositions: {
    char: string;
    description: string;
    charType: string;
    children: string[];
  }[];
  exercises: Exercise[];
  curriculumRole?: "write" | "recognize" | "polyphonic" | "extension";
  polyphonic?: boolean;
  official?: boolean;
  tier?: "curriculum" | "extension";
};

export type LessonItem = {
  id: string;
  title: string;
  position: number;
  skimming?: boolean;
  context?: string;
  mode?: string;
  learningPath?: readonly string[];
  recognitionCount?: number;
  polyphonicCount?: number;
  writingCount?: number;
  officialCount?: number;
};

export type ComponentItem = {
  id: string;
  title: string;
  glyph: string;
  examples: string[];
  description: string;
  characterSet: string[];
  group: number;
  sequence: number;
};
