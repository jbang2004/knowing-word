import assert from "node:assert/strict";
import test from "node:test";
import { GET } from "../app/api/catalog/route.ts";

test("mini-program catalog endpoint exposes all lesson templates and one bounded lesson shard", async () => {
  const indexResponse = await GET(new Request("https://knowing.example/api/catalog"));
  const index = await indexResponse.json();
  assert.equal(indexResponse.status, 200);
  assert.equal(index.schemaVersion, 1);
  assert.equal(index.lessons.length, 26);
  assert.match(indexResponse.headers.get("cache-control"), /public/u);

  const lessonResponse = await GET(new Request("https://knowing.example/api/catalog?lessonId=g5v1-l01"));
  const lesson = await lessonResponse.json();
  assert.equal(lesson.lesson.id, "g5v1-l01");
  assert.ok(lesson.characters.length >= 12);
  assert.ok(lesson.characters.every((character) => character.exercises.length > 0));
  assert.match(lesson.characters[0].media.visual.src, /^https:\/\/knowing\.example\/illustrations\//u);
  assert.match(lesson.characters[0].media.narration.audio, /\/audio\.m4a\?v=/u);
  assert.ok(Buffer.byteLength(JSON.stringify(lesson)) < 1_000_000);
});

test("catalog endpoint rejects unknown lessons without setting an identity cookie", async () => {
  const response = await GET(new Request("https://knowing.example/api/catalog?lessonId=missing"));
  assert.equal(response.status, 404);
  assert.equal(response.headers.get("set-cookie"), null);
});
