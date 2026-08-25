import { grade5ExtensionCharacters } from "./generated/grade5-volume1/extension-learning.ts";
import {
  grade5LessonLoaders,
  type Grade5LessonId,
} from "./generated/grade5-volume1/lesson-loaders.ts";
import type { CharacterItem, LessonItem } from "./catalog-types";
import {
  getPublishableLessonDocument,
  type LessonDocument,
} from "./lesson-documents.ts";

const extensionCharactersByLesson = new Map<string, CharacterItem[]>();
for (const character of grade5ExtensionCharacters as unknown as CharacterItem[]) {
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
  document?: LessonDocument;
} | null> {
  if (!isGrade5LessonId(lessonId)) return null;
  const shard = await grade5LessonLoaders[lessonId]();
  return {
    lesson: shard.lesson as unknown as LessonItem,
    characters: [
      ...(shard.characters as unknown as CharacterItem[]),
      ...(extensionCharactersByLesson.get(lessonId) ?? []).map((character) => ({
        ...character,
        // Legacy extension records once carried textbook excerpts here. The
        // public card now receives the project's short, original lesson context.
        originalText: (shard.lesson as { context?: string }).context ?? "",
      })),
    ],
    document: getPublishableLessonDocument(lessonId),
  };
}
