import { characterLessons, lessonIds } from "../data/route-index.generated.ts";
import { returnPathFromUrl } from "./navigation.ts";
import { trackIds, type TrackId } from "./profile-model.ts";

export type Screen =
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

export type PlaygroundKind = "kit" | "lesson" | "puzzle" | "quiz";

export type AppRoute = {
  screen: Screen;
  lessonId?: string;
  characterId?: string;
  track?: TrackId;
  playground?: PlaygroundKind;
  returnTo?: string;
};

const lessonIdSet = new Set<string>(lessonIds);
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

function knownCharacter(characterId: string | undefined, lessonId?: string) {
  return Boolean(characterId && characterLessons[characterId] === lessonId);
}

export function resolveAppRoute(pathValue: string): AppRoute {
  const pathname = pathValue.split("?")[0].replace(/\/+$/, "") || "/";
  const parts = pathname.split("/").filter(Boolean);
  if (!parts.length) return { screen: "home" };
  if (parts[0] === "account") return { screen: "profile" };
  if (parts[0] === "practice") return { screen: "practice" };
  if (parts[0] === "records") {
    const track = trackIds.includes(parts[1] as TrackId) ? parts[1] as TrackId : undefined;
    const lessonId = parts[2] ? characterLessons[parts[2]] : undefined;
    return lessonId && track
      ? { screen: "recordDetail", track, lessonId, characterId: parts[2] }
      : { screen: "records", track };
  }
  if (parts[0] === "bujian") return { screen: "components", returnTo: returnPathFromUrl(pathValue) };
  if (parts[0] === "read-aloud") return { screen: "read", returnTo: returnPathFromUrl(pathValue) };
  if (parts[0] === "playground") {
    const playground = (["kit", "lesson", "puzzle", "quiz"].includes(parts[1]) ? parts[1] : "kit") as PlaygroundKind;
    return { screen: "playground", playground };
  }
  if (parts[0] === "lessons") {
    if (!parts[1]) return { screen: "course" };
    const lessonId = lessonIdSet.has(parts[1]) ? parts[1] : undefined;
    if (!lessonId) return { screen: "course" };
    if (parts[2] === "words" && knownCharacter(parts[3], lessonId)) {
      return {
        screen: parts[4] === "quizzes" ? "challenge" : "character",
        track: "words",
        lessonId,
        characterId: parts[3],
      };
    }
    return { screen: "lesson", lessonId };
  }

  const track: TrackId | undefined =
    parts[0] === "split-exercise"
      ? "split"
      : parts[0] === "honglan-exercise"
        ? "honglan"
        : parts[0] === "space-structure-exercise"
          ? "structure"
          : undefined;
  if (!track) return { screen: "home" };
  if (!parts[1]) return { screen: "trackMap", track };
  const lessonId = lessonIdSet.has(parts[1]) ? parts[1] : undefined;
  if (lessonId && knownCharacter(parts[3], lessonId)) {
    return { screen: "challenge", track, lessonId, characterId: parts[3] };
  }
  return lessonId
    ? { screen: "trackLesson", track, lessonId }
    : { screen: "trackMap", track };
}
