import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { POST as saveRecording } from "../app/api/recordings/route.ts";
import { getDb } from "../app/lib/server-store.ts";
import { runWithRuntimeEnv } from "../app/lib/runtime-env.ts";

test("runtime bindings remain isolated across concurrent requests", async () => {
  const left = { label: "left" };
  const right = { label: "right" };
  const [leftResult, rightResult] = await Promise.all([
    runWithRuntimeEnv({ DB: left }, async () => {
      await new Promise((resolve) => setTimeout(resolve, 4));
      return getDb();
    }),
    runWithRuntimeEnv({ DB: right }, async () => {
      await Promise.resolve();
      return getDb();
    }),
  ]);
  assert.equal(leftResult, left);
  assert.equal(rightResult, right);
  assert.throws(() => getDb(), /binding DB is unavailable/);
});

test("a failed recording transaction removes its newly written R2 object", async () => {
  const deleted = [];
  const media = {
    async put(_key, body) { await new Response(body).arrayBuffer(); },
    async delete(key) { deleted.push(key); },
  };
  const db = {
    prepare(sql) {
      return {
        bind() {
          return {
            async first() { return { byte_size: 0 }; },
            async all() { return { results: [] }; },
            async run() {
              if (sql.includes("INSERT INTO recordings")) throw new Error("simulated D1 failure");
              return { meta: { changes: 1 } };
            },
          };
        },
      };
    },
  };
  const request = new Request("https://example.test/api/recordings?lessonId=g5v1-l01", {
    method: "POST",
    headers: {
      "content-type": "audio/webm; codecs=opus",
      "content-length": "3",
      "oai-authenticated-user-id": "runtime-test-user",
    },
    body: new Uint8Array([1, 2, 3]),
  });
  const originalError = console.error;
  console.error = () => undefined;
  const response = await runWithRuntimeEnv({ DB: db, MEDIA: media }, () => saveRecording(request));
  console.error = originalError;
  const payload = await response.json();
  assert.equal(response.status, 503);
  assert.equal(payload.error, "暂时无法保存录音");
  assert.ok(payload.requestId);
  assert.equal(deleted.length, 1);
  assert.match(deleted[0], /^recordings\/[a-f0-9]{24}\/[a-f0-9-]+\.webm$/u);
  assert.doesNotMatch(JSON.stringify(payload), /simulated D1 failure/u);
});

test("the production worker exposes D1 only within its request scope", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", "runtime-env-suite");
  const worker = (await import(workerUrl.href)).default;
  const db = {
    prepare() {
      return {
        bind() {
          return {
            async first() { return null; },
            async all() { return { results: [] }; },
          };
        },
      };
    },
  };
  const response = await worker.fetch(
    new Request("http://localhost/api/profile"),
    { DB: db },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(response.status, 200);
  assert.equal((await response.json()).profile, null);
  assert.throws(() => getDb(), /binding DB is unavailable/);
});

test("built-in narration is published directly instead of tunneling through user recordings", async () => {
  const [worker, publisher] = await Promise.all([
    readFile(new URL("../worker/index.ts", import.meta.url), "utf8"),
    readFile(new URL("../scripts/preseed-narration-media.mjs", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(worker, /__KNOWING_WORD_ENV__|migrateSeededNarration|builtin:narration/u);
  assert.match(worker, /runWithRuntimeEnv/u);
  assert.match(publisher, /r2[\s\S]*object[\s\S]*put/u);
  assert.doesNotMatch(publisher, /\/api\/recordings|SEED_COOKIE/u);
});
