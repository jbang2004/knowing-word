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
    const pending = readOutbox();
    while (pending.length) {
      let response: Response;
      try {
        response = await fetch("/api/events", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(pending[0]),
        });
      } catch {
        break;
      }
      if (!response.ok && response.status >= 500) break;
      pending.shift();
      writeOutbox(pending);
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
}

export function queueLearningEvent(input: LearningEventInput) {
  const event: LearningEvent = { ...input, eventId: crypto.randomUUID() };
  writeOutbox([...readOutbox(), event]);
  listenForReconnect();
  void flushOutbox();
  return event.eventId;
}
