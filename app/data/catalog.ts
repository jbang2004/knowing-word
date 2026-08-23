import {
  grade5Characters,
  grade5Components,
  grade5Course,
  grade5Lessons,
} from "./grade5-volume1-generated.ts";
import { extensionCharacters, extensionComponents } from "./extension-catalog.ts";
import type { CharacterItem, ComponentItem, LessonItem } from "./catalog-types";

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

const componentsByGlyph = new Map<string, ComponentItem>();
for (const component of grade5Components as unknown as ComponentItem[]) {
  componentsByGlyph.set(component.glyph, component);
}
for (const component of extensionComponents) {
  componentsByGlyph.set(component.glyph, component);
}
export const components = [...componentsByGlyph.values()];

const lessonsById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
const charactersById = new Map(characters.map((character) => [character.id, character]));
const lessonCharacters = new Map<string, CharacterItem[]>();

for (const character of characters) {
  const bucket = lessonCharacters.get(character.lessonId) ?? [];
  bucket.push(character);
  lessonCharacters.set(character.lessonId, bucket);
}

export function getLesson(lessonId: string) {
  return lessonsById.get(lessonId);
}

export function getCharacter(characterId: string) {
  return charactersById.get(characterId);
}

export function getLessonCharacters(lessonId: string) {
  return lessonCharacters.get(lessonId) ?? [];
}
