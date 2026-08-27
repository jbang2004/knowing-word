"use client";

import { createLearningEventOutbox } from "../../application/learning-event-outbox";
import type { LearningEventInput } from "../../domain/learning-event";
import {
  browserConnectivity,
  browserStorage,
  browserStorageEvents,
  browserTransport,
} from "../../platform/web";

const browserOutbox = createLearningEventOutbox({
  storage: browserStorage,
  transport: browserTransport,
  connectivity: browserConnectivity,
  storageEvents: browserStorageEvents,
  createId: () => crypto.randomUUID(),
});

export function queueLearningEvent(input: LearningEventInput) {
  return browserOutbox.queue(input);
}

export function flushLearningEventOutbox() {
  return browserOutbox.flush();
}
