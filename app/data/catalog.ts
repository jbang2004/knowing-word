import {
  grade5Characters,
  grade5Course,
  grade5Lessons,
} from "./grade5-volume1-generated.ts";
import { extensionCharacters } from "./extension-characters.ts";
import { components } from "./component-index.ts";
import type { CharacterItem, LessonItem } from "./catalog-types";

export type {
  CharacterItem,
  ComponentItem,
  Exercise,
  ExerciseKind,
  LessonItem,
} from "./catalog-types";

export const course = grade5Course;
export const lessons = grade5Lessons as unknown as LessonItem[];
export const characters = [
  ...(grade5Characters as unknown as CharacterItem[]),
  ...extensionCharacters,
];

export { components };
