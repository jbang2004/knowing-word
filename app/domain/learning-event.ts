import { characterLessons, lessonIds } from "../data/route-index.generated.ts";
import { trackIds, type TrackId } from "../lib/profile-model.ts";

export type LearningEventAction = "answer" | "skip" | "read";

export type LearningEvent = {
  eventId: string;
  action: LearningEventAction;
  track?: TrackId;
  lessonId?: string;
  characterId?: string;
  questionId?: string;
  correct?: boolean;
  selected?: string[];
};

export type LearningEventInput = Omit<LearningEvent, "eventId">;

const eventIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const lessonIdSet = new Set<string>(lessonIds);

function boundedString(value: unknown, maxLength: number) {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength
    ? value
    : undefined;
}

export function parseLearningEvent(value: unknown): LearningEvent | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const eventId = boundedString(raw.eventId, 64);
  const action = raw.action;
  const track = trackIds.includes(raw.track as TrackId) ? raw.track as TrackId : undefined;
  const lessonId = boundedString(raw.lessonId, 32);
  const characterId = boundedString(raw.characterId, 80);
  const questionId = boundedString(raw.questionId, 120);
  const selected = Array.isArray(raw.selected)
    ? raw.selected.filter((item): item is string => typeof item === "string" && item.length <= 120).slice(0, 12)
    : undefined;

  if (!eventId || !eventIdPattern.test(eventId)) return null;
  if (action !== "answer" && action !== "skip" && action !== "read") return null;
  if (!lessonId || !lessonIdSet.has(lessonId)) return null;
  if (characterId && characterLessons[characterId] !== lessonId) return null;

  if (action === "read") return { eventId, action, lessonId };
  if (!track || !characterId || !questionId) return null;
  if (action === "answer" && typeof raw.correct !== "boolean") return null;

  return {
    eventId,
    action,
    track,
    lessonId,
    characterId,
    questionId,
    ...(action === "answer" ? { correct: raw.correct as boolean, selected: selected ?? [] } : {}),
  };
}
