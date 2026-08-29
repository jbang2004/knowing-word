import { characterLessons, lessonIds } from "../data/route-index.generated.ts";
import { trackIds, type TrackId } from "../lib/profile-model.ts";
import {
  answerModes,
  errorTags,
  skillDimensions,
  type AnswerMode,
  type ErrorTag,
  type SkillDimension,
} from "./learning-state.ts";

export type LearningEventAction = "answer" | "skip" | "read";
export type ReadingReflection = "comfortable" | "needs-practice";

export type LearningEvent = {
  eventId: string;
  action: LearningEventAction;
  track?: TrackId;
  lessonId?: string;
  characterId?: string;
  questionId?: string;
  correct?: boolean;
  selected?: string[];
  dimension?: SkillDimension;
  cueLevel?: 0 | 1 | 2 | 3;
  answerMode?: AnswerMode;
  latencyMs?: number;
  errorTags?: ErrorTag[];
  readingReflection?: ReadingReflection;
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
  const dimension = skillDimensions.includes(raw.dimension as SkillDimension)
    ? raw.dimension as SkillDimension
    : undefined;
  const cueLevel = raw.cueLevel === 0 || raw.cueLevel === 1 || raw.cueLevel === 2 || raw.cueLevel === 3
    ? raw.cueLevel
    : undefined;
  const answerMode = answerModes.includes(raw.answerMode as AnswerMode)
    ? raw.answerMode as AnswerMode
    : undefined;
  const latencyMs = typeof raw.latencyMs === "number" && Number.isFinite(raw.latencyMs) && raw.latencyMs >= 0
    ? Math.min(Math.floor(raw.latencyMs), 3_600_000)
    : undefined;
  const parsedErrorTags = Array.isArray(raw.errorTags)
    ? [...new Set(raw.errorTags.filter((item): item is ErrorTag => errorTags.includes(item as ErrorTag)))].slice(0, 8)
    : [];
  // Accept queued events from the former self-accuracy UI, but normalize them
  // into a non-evaluative reflection before they reach storage.
  const readingReflection = raw.readingReflection === "comfortable" || raw.readingReflection === "needs-practice"
    ? raw.readingReflection
    : raw.readingAccuracy === "accurate"
      ? "comfortable"
      : raw.readingAccuracy === "needs-practice"
        ? "needs-practice"
        : undefined;

  if (!eventId || !eventIdPattern.test(eventId)) return null;
  if (action !== "answer" && action !== "skip" && action !== "read") return null;
  if (!lessonId || !lessonIdSet.has(lessonId)) return null;
  if (characterId && characterLessons[characterId] !== lessonId) return null;

  if (action === "read") {
    return {
      eventId,
      action,
      lessonId,
      ...(readingReflection ? { readingReflection } : {}),
      ...(latencyMs === undefined ? {} : { latencyMs }),
    };
  }
  if (!track || !characterId || !questionId) return null;
  if (action === "answer" && typeof raw.correct !== "boolean") return null;

  return {
    eventId,
    action,
    track,
    lessonId,
    characterId,
    questionId,
    ...(action === "answer" ? {
      correct: raw.correct as boolean,
      selected: selected ?? [],
      ...(dimension ? { dimension } : {}),
      ...(cueLevel === undefined ? {} : { cueLevel }),
      ...(answerMode ? { answerMode } : {}),
      ...(latencyMs === undefined ? {} : { latencyMs }),
      ...(parsedErrorTags.length ? { errorTags: parsedErrorTags } : {}),
    } : {}),
  };
}
