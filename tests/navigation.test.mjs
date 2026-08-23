import assert from "node:assert/strict";
import test from "node:test";
import {
  returnPathFromUrl,
  safeInternalReturnPath,
  withReturnTo,
} from "../app/lib/navigation.ts";
import { resolveAppRoute, routeForTrack } from "../app/lib/app-route.ts";

test("context returns accept only known internal learning routes", () => {
  assert.equal(
    safeInternalReturnPath("/lessons/l1/words/c1?view=memory"),
    "/lessons/l1/words/c1?view=memory",
  );
  assert.equal(safeInternalReturnPath("/"), "/");
  assert.equal(safeInternalReturnPath("https://example.com/lessons/l1"), undefined);
  assert.equal(safeInternalReturnPath("//example.com/lessons/l1"), undefined);
  assert.equal(safeInternalReturnPath("/\\example.com/lessons/l1"), undefined);
  assert.equal(safeInternalReturnPath("/api/profile"), undefined);
});

test("secondary routes preserve and recover a safe return destination", () => {
  const route = withReturnTo("/bujian", "/lessons/l1/words/c1");
  assert.equal(route, "/bujian?returnTo=%2Flessons%2Fl1%2Fwords%2Fc1");
  assert.equal(returnPathFromUrl(route), "/lessons/l1/words/c1");
  assert.equal(
    returnPathFromUrl("/bujian?returnTo=https%3A%2F%2Fexample.com"),
    undefined,
  );
});

test("route parsing is independent from the full curriculum payload", () => {
  assert.deepEqual(resolveAppRoute("/lessons/g5v1-l01"), {
    screen: "lesson",
    lessonId: "g5v1-l01",
  });
  assert.deepEqual(
    resolveAppRoute("/lessons/g5v1-l01/words/g5v1-l01-c05-u55dc"),
    {
      screen: "character",
      track: "words",
      lessonId: "g5v1-l01",
      characterId: "g5v1-l01-c05-u55dc",
    },
  );
  assert.deepEqual(resolveAppRoute("/lessons/not-a-lesson"), { screen: "course" });
  assert.equal(
    routeForTrack("honglan", "g5v1-l01", "g5v1-l01-c05-u55dc"),
    "/honglan-exercise/g5v1-l01/lesson_words/g5v1-l01-c05-u55dc",
  );
});
