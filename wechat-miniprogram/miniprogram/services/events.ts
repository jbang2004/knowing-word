import type { TrackId } from "../types/models";
import { apiRequest } from "./api";
import { getSessionToken } from "./session";

function uuid() {
  const pattern = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
  return pattern.replace(/[xy]/g, (token) => {
    const value = Math.floor(Math.random() * 16);
    return (token === "x" ? value : (value & 0x3) | 0x8).toString(16);
  });
}

export function sendAnswerEvent(input: {
  track: TrackId;
  lessonId: string;
  characterId: string;
  questionId: string;
  correct: boolean;
  selected: string[];
  dimension?: string;
  answerMode?: string;
  cueLevel?: 0 | 1 | 2 | 3;
  latencyMs?: number;
}) {
  if (!getSessionToken()) return;
  void apiRequest("/api/events", {
    method: "POST",
    data: { eventId: uuid(), action: "answer", ...input },
    header: { "content-type": "application/json" },
  }).catch((error) => console.info("Learning event queued locally", error));
}

export function sendReadingEvent(lessonId: string, accurate: boolean) {
  if (!getSessionToken()) return;
  void apiRequest("/api/events", {
    method: "POST",
    data: {
      eventId: uuid(),
      action: "read",
      lessonId,
      readingAccuracy: accurate ? "accurate" : "needs-practice",
    },
    header: { "content-type": "application/json" },
  }).catch((error) => console.info("Reading event queued locally", error));
}
