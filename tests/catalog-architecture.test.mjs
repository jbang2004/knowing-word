import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import test from "node:test";

test("the runtime curriculum is split into one bounded module per lesson", async () => {
  const shardRoot = new URL("../app/data/generated/grade5-volume1/lessons/", import.meta.url);
  const shardNames = (await readdir(shardRoot)).filter((name) => name.endsWith(".ts")).sort();
  assert.equal(shardNames.length, 26);

  for (const shardName of shardNames) {
    const shardStat = await stat(new URL(shardName, shardRoot));
    assert.ok(shardStat.size < 300_000, `${shardName} is too large to remain a route-level content shard`);
  }

  const compatibilitySource = await readFile(
    new URL("../app/data/grade5-volume1-generated.ts", import.meta.url),
    "utf8",
  );
  assert.ok(compatibilitySource.length < 1_000);
  assert.doesNotMatch(compatibilitySource, /"exercises"\s*:/);
});

test("lesson loading keeps official and extension records in the canonical order", async () => {
  const { lessons, characters } = await import(
    new URL("../app/data/catalog.ts", import.meta.url).href,
  );
  const { loadLessonContent } = await import(
    new URL("../app/data/lesson-content.ts", import.meta.url).href,
  );

  const loaded = [];
  for (const lesson of lessons) {
    const content = await loadLessonContent(lesson.id);
    assert.ok(content);
    assert.equal(content.lesson.id, lesson.id);
    assert.ok(content.characters.every((character) => character.lessonId === lesson.id));
    loaded.push(...content.characters);
  }

  assert.deepEqual(
    new Set(loaded.map((character) => character.id)),
    new Set(characters.map((character) => character.id)),
  );
  assert.equal(loaded.length, 430);
  assert.equal(await loadLessonContent("unknown"), null);
});
