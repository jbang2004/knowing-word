import type { TrackId } from "./profile-model.ts";

const trackBase: Record<Exclude<TrackId, "words">, string> = {
  split: "/split-exercise",
  honglan: "/honglan-exercise",
  structure: "/space-structure-exercise",
};

export function routeForTrack(track: TrackId, lessonId?: string, characterId?: string) {
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
