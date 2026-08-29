import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { characters } from "../app/data/catalog.ts";

const dataRoot = new URL("../public/hanzi-data/", import.meta.url);

test("every curriculum writing character ships validated local Hanzi Writer data", async () => {
  const expectedCharacters = [...new Set(
    characters
      .filter((character) => character.exercises.some((exercise) => exercise.kind === "write"))
      .map((character) => character.hanzi),
  )];
  const manifest = JSON.parse(
    await readFile(new URL("manifest.json", dataRoot), "utf8"),
  );
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.source, "hanzi-writer-data@2.0.1");
  assert.equal(manifest.characters.length, expectedCharacters.length);
  assert.deepEqual(
    new Set(manifest.characters.map((entry) => entry.character)),
    new Set(expectedCharacters),
  );

  await Promise.all(manifest.characters.map(async (entry) => {
    assert.match(entry.file, /^u[0-9a-f-]+\.json$/u);
    assert.match(entry.sha256, /^[0-9a-f]{16}$/u);
    const data = JSON.parse(await readFile(new URL(entry.file, dataRoot), "utf8"));
    assert.ok(data.strokes.length > 0, `${entry.character} has no strokes`);
    assert.equal(data.strokes.length, data.medians.length, `${entry.character} stroke data mismatch`);
    assert.equal(entry.strokes, data.strokes.length, `${entry.character} manifest stroke count mismatch`);
  }));
});
