"use client";

import type { LearningEvent, LearningEventInput } from "../../domain/learning-event";

const OUTBOX_KEY = "knowing-word:learning-event-outbox:v1";
const MAX_PENDING_EVENTS = 100;

let flushing: Promise<void> | null = null;
let listening = false;

function readOutbox(): LearningEvent[] {
  try {
    const value = JSON.parse(window.localStorage.getItem(OUTBOX_KEY) ?? "[]");
    return Array.isArray(value) ? value.slice(-MAX_PENDING_EVENTS) : [];
  } catch {
    window.localStorage.removeItem(OUTBOX_KEY);
    return [];
  }
}

function writeOutbox(events: LearningEvent[]) {
  if (events.length) {
    window.localStorage.setItem(OUTBOX_KEY, JSON.stringify(events.slice(-MAX_PENDING_EVENTS)));
  } else {
    window.localStorage.removeItem(OUTBOX_KEY);
  }
}

async function flushOutbox() {
  if (flushing) return flushing;
  flushing = (async () => {
    while (true) {
      const event = readOutbox()[0];
      if (!event) break;
      let response: Response;
      try {
        response = await fetch("/api/events", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(event),
        });
      } catch {
        break;
      }
      if (!response.ok && response.status >= 500) break;
      // Re-read before removal: another tab or a user action may have appended
      // events while this request was in flight. Removing by id never erases
      // those newer events.
      writeOutbox(readOutbox().filter((item) => item.eventId !== event.eventId));
    }
  })().finally(() => {
    flushing = null;
  });
  return flushing;
}

function listenForReconnect() {
  if (listening) return;
  listening = true;
  window.addEventListener("online", () => void flushOutbox());
  window.addEventListener("storage", (event) => {
    if (event.key === OUTBOX_KEY && event.newValue) void flushOutbox();
  });
}

export function queueLearningEvent(input: LearningEventInput) {
  const event: LearningEvent = { ...input, eventId: crypto.randomUUID() };
  writeOutbox([...readOutbox(), event]);
  listenForReconnect();
  void flushOutbox();
  return event.eventId;
}
