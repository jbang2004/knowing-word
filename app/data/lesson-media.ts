import { lessonMediaLoaders } from "./generated/grade5-volume1/media-loaders.ts";
import type { LessonCharacterMedia } from "./lesson-media-types.ts";

export async function loadLessonMedia(lessonId: string) {
  const loader = lessonMediaLoaders[lessonId as keyof typeof lessonMediaLoaders];
  if (!loader) return undefined;
  const lessonModule = await loader();
  return lessonModule.characterMedia as Record<string, LessonCharacterMedia>;
}
