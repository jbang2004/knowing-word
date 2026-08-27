import type { LearningEvent, LearningEventInput } from "../domain/learning-event.ts";
import type {
  Connectivity,
  JsonTransport,
  KeyValueStorage,
  StorageEvents,
} from "../platform/contracts.ts";

export const LEARNING_EVENT_OUTBOX_KEY = "knowing-word:learning-event-outbox:v1";
export const MAX_PENDING_LEARNING_EVENTS = 100;

export function createLearningEventOutbox({
  storage,
  transport,
  connectivity,
  storageEvents,
  createId,
}: {
  storage: KeyValueStorage;
  transport: JsonTransport;
  connectivity: Connectivity;
  storageEvents?: StorageEvents;
  createId: () => string;
}) {
  let flushing: Promise<void> | null = null;
  let listening = false;

  function read(): LearningEvent[] {
    try {
      const value = JSON.parse(storage.get(LEARNING_EVENT_OUTBOX_KEY) ?? "[]");
      return Array.isArray(value) ? value.slice(-MAX_PENDING_LEARNING_EVENTS) : [];
    } catch {
      storage.remove(LEARNING_EVENT_OUTBOX_KEY);
      return [];
    }
  }

  function write(events: LearningEvent[]) {
    if (events.length) {
      storage.set(
        LEARNING_EVENT_OUTBOX_KEY,
        JSON.stringify(events.slice(-MAX_PENDING_LEARNING_EVENTS)),
      );
    } else {
      storage.remove(LEARNING_EVENT_OUTBOX_KEY);
    }
  }

  function flush() {
    if (flushing) return flushing;
    const task = (async () => {
      while (true) {
        const event = read()[0];
        if (!event) break;
        try {
          await transport.request<{ ok: boolean }>("/api/events", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(event),
          });
        } catch (error) {
          const status = error && typeof error === "object" && "status" in error
            ? (error as { status?: unknown }).status
            : undefined;
          if (typeof status === "number" && status >= 400 && status < 500) {
            // The server rejected this payload permanently. Remove only this
            // event so one poisoned record cannot block newer offline work.
            write(read().filter((item) => item.eventId !== event.eventId));
            continue;
          }
          break;
        }
        // Re-read before removal so an append from another page realm is kept.
        write(read().filter((item) => item.eventId !== event.eventId));
      }
    })().finally(() => {
      if (flushing === task) flushing = null;
    });
    flushing = task;
    return task;
  }

  function listen() {
    if (listening) return;
    listening = true;
    connectivity.onOnline(() => void flush());
    storageEvents?.onChange(LEARNING_EVENT_OUTBOX_KEY, () => void flush());
  }

  return {
    read,
    flush,
    queue(input: LearningEventInput) {
      const event: LearningEvent = { ...input, eventId: createId() };
      write([...read(), event]);
      listen();
      void flush();
      return event.eventId;
    },
  };
}
