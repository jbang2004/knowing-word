import { extensionCharacters } from "./extension-catalog.ts";
import {
  grade5LessonLoaders,
  type Grade5LessonId,
} from "./generated/grade5-volume1/lesson-loaders.ts";
import type { CharacterItem, LessonItem } from "./catalog-types";

const extensionCharactersByLesson = new Map<string, CharacterItem[]>();
for (const character of extensionCharacters) {
  const bucket = extensionCharactersByLesson.get(character.lessonId) ?? [];
  bucket.push(character);
  extensionCharactersByLesson.set(character.lessonId, bucket);
}

export function isGrade5LessonId(value: string): value is Grade5LessonId {
  return Object.hasOwn(grade5LessonLoaders, value);
}

export async function loadLessonContent(lessonId: string): Promise<{
  lesson: LessonItem;
  characters: CharacterItem[];
} | null> {
  if (!isGrade5LessonId(lessonId)) return null;
  const shard = await grade5LessonLoaders[lessonId]();
  return {
    lesson: shard.lesson as unknown as LessonItem,
    characters: [
      ...(shard.characters as unknown as CharacterItem[]),
      ...(extensionCharactersByLesson.get(lessonId) ?? []),
    ],
  };
}
