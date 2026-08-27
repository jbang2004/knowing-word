import assert from "node:assert/strict";
import test from "node:test";
import { createLearningEventOutbox } from "../app/application/learning-event-outbox.ts";
import {
  createProfileClient,
  PROFILE_ANSWER_CACHE_PREFIX,
  PROFILE_BASE_CACHE_KEY,
} from "../app/application/profile-client.ts";
import { emptyProfile } from "../app/lib/profile-model.ts";
import { recordingExtension } from "../app/server/services/recording-service.ts";

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    get: (key) => values.get(key) ?? null,
    set: (key, value) => values.set(key, value),
    remove: (key) => values.delete(key),
    values,
  };
}

test("profile persistence is portable across storage and transport adapters", async () => {
  const storage = memoryStorage();
  const requests = [];
  const profile = emptyProfile();
  profile.name = "小禾";
  const client = createProfileClient({
    storage,
    connectivity: { onOnline() { return () => undefined; } },
    transport: {
      async request(path, options) {
        requests.push({ path, options });
        if (options?.method === "PUT") return { profile: JSON.parse(options.body) };
        if (options?.method === "DELETE") return { ok: true };
        return { profile };
      },
    },
  });

  client.writeCache(profile);
  assert.ok(storage.values.has(PROFILE_BASE_CACHE_KEY));
  assert.ok(storage.values.has(`${PROFILE_ANSWER_CACHE_PREFIX}0`));
  assert.equal(client.readCache().name, "小禾");
  assert.equal((await client.load()).profile.name, "小禾");
  assert.equal((await client.save(JSON.stringify(profile))).name, "小禾");
  await client.reset();
  assert.deepEqual(requests.map(({ options }) => options?.method ?? "GET"), ["GET", "PUT", "DELETE"]);
  client.clearCache();
  assert.equal(client.readCache(), null);
});

test("learning event outbox keeps failed work and drains it after reconnect", async () => {
  const storage = memoryStorage();
  let available = false;
  const delivered = [];
  let reconnect = () => undefined;
  const outbox = createLearningEventOutbox({
    storage,
    createId: () => "00000000-0000-4000-8000-000000000001",
    connectivity: { onOnline(listener) { reconnect = listener; return () => undefined; } },
    transport: {
      async request(_path, options) {
        if (!available) throw new Error("offline");
        delivered.push(JSON.parse(options.body));
        return { ok: true };
      },
    },
  });

  const id = outbox.queue({ action: "read", lessonId: "g5v1-l01" });
  await outbox.flush();
  assert.equal(outbox.read().length, 1);
  available = true;
  reconnect();
  await outbox.flush();
  assert.equal(outbox.read().length, 0);
  assert.deepEqual(delivered.map((event) => event.eventId), [id]);
});

test("learning event outbox discards a permanently rejected event", async () => {
  const storage = memoryStorage();
  const outbox = createLearningEventOutbox({
    storage,
    createId: () => "00000000-0000-4000-8000-000000000002",
    connectivity: { onOnline() { return () => undefined; } },
    transport: {
      async request() {
        throw Object.assign(new Error("invalid event"), { status: 400 });
      },
    },
  });

  outbox.queue({ action: "read", lessonId: "g5v1-l01" });
  await outbox.flush();
  assert.equal(outbox.read().length, 0);
});

test("recording service accepts both browser and mini-program audio formats", () => {
  assert.equal(recordingExtension("audio/webm; codecs=opus"), "webm");
  assert.equal(recordingExtension("audio/mpeg"), "mp3");
  assert.equal(recordingExtension("audio/aac"), "aac");
  assert.equal(recordingExtension("audio/wav"), "wav");
  assert.equal(recordingExtension("video/mp4"), undefined);
});
