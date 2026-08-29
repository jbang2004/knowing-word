import type { AnswerMode, ErrorTag, ReadingReflection, SkillDimension, TrackId } from "../types/models";
import { ApiError, apiRequest } from "./api";
import { getSessionToken } from "./session";
import { appendOutboxEvent, shouldDiscardFailedEvent } from "./event-outbox-core";

const OUTBOX_KEY = "knowing-word:learning-event-outbox:v1";
const MAX_OUTBOX_EVENTS = 100;

type LearningEventPayload = {
  eventId: string;
  action: "answer" | "read";
  track?: TrackId;
  lessonId: string;
  characterId?: string;
  questionId?: string;
  correct?: boolean;
  selected?: string[];
  dimension?: SkillDimension;
  answerMode?: AnswerMode;
  cueLevel?: 0 | 1 | 2 | 3;
  latencyMs?: number;
  errorTags?: ErrorTag[];
  readingReflection?: ReadingReflection;
};

let pendingFlush: Promise<void> | null = null;

function readOutbox() {
  const value = wx.getStorageSync<unknown>(OUTBOX_KEY);
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is LearningEventPayload => (
    Boolean(item && typeof item === "object" && !Array.isArray(item))
    && typeof (item as { eventId?: unknown }).eventId === "string"
  )).slice(-MAX_OUTBOX_EVENTS);
}

function writeOutbox(events: LearningEventPayload[]) {
  if (events.length) wx.setStorageSync(OUTBOX_KEY, events.slice(-MAX_OUTBOX_EVENTS));
  else wx.removeStorageSync(OUTBOX_KEY);
}

function secureRandomBytes(length: number) {
  return new Promise<Uint8Array>((resolve, reject) => {
    wx.getRandomValues({
      length,
      success: (result) => resolve(new Uint8Array(result.randomValues)),
      fail: reject,
    });
  });
}

async function uuid() {
  const bytes = await secureRandomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

async function enqueue(input: Omit<LearningEventPayload, "eventId">) {
  const event = { ...input, eventId: await uuid() } as LearningEventPayload;
  writeOutbox(appendOutboxEvent(readOutbox(), event, MAX_OUTBOX_EVENTS));
  await flushLearningEvents();
}

export function flushLearningEvents() {
  if (pendingFlush) return pendingFlush;
  pendingFlush = (async () => {
    if (!getSessionToken()) return;
    const events = readOutbox();
    while (events.length) {
      try {
        await apiRequest("/api/events", {
          method: "POST",
          data: events[0],
          header: { "content-type": "application/json" },
        });
        events.shift();
        writeOutbox(events);
      } catch (error) {
        if (error instanceof ApiError && shouldDiscardFailedEvent(error.statusCode)) {
          events.shift();
          writeOutbox(events);
          continue;
        }
        console.info("Learning event sync deferred", error);
        break;
      }
    }
  })().finally(() => { pendingFlush = null; });
  return pendingFlush;
}

export function sendAnswerEvent(input: {
  track: TrackId;
  lessonId: string;
  characterId: string;
  questionId: string;
  correct: boolean;
  selected: string[];
  dimension?: SkillDimension;
  answerMode?: AnswerMode;
  cueLevel?: 0 | 1 | 2 | 3;
  latencyMs?: number;
  errorTags?: ErrorTag[];
}) {
  void enqueue({ action: "answer", ...input }).catch((error) => console.info("Unable to queue learning event", error));
}

export function sendReadingEvent(lessonId: string, readingReflection: ReadingReflection) {
  void enqueue({
    action: "read",
    lessonId,
    readingReflection,
  }).catch((error) => console.info("Unable to queue reading event", error));
}
