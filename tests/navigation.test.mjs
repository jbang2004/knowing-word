import assert from "node:assert/strict";
import test from "node:test";
import {
  returnPathFromUrl,
  safeInternalReturnPath,
  withReturnTo,
} from "../app/lib/navigation.ts";
import { routeForTrack } from "../app/lib/app-route.ts";

test("context returns accept only known internal learning routes", () => {
  assert.equal(
    safeInternalReturnPath("/lessons/l1/words/c1?view=memory"),
    "/lessons/l1/words/c1?view=memory",
  );
  assert.equal(safeInternalReturnPath("/"), "/");
  assert.equal(
    safeInternalReturnPath("/lessons/l1?view=read#lesson-paragraph-3"),
    "/lessons/l1?view=read#lesson-paragraph-3",
  );
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

test("a card and its quiz can carry the same return context across characters", () => {
  const lessonWords = "/lessons/g5v1-l01?view=words";
  const card = withReturnTo(
    "/lessons/g5v1-l01/words/g5v1-l01-c01-u9e6d",
    lessonWords,
  );
  const quiz = withReturnTo(
    "/lessons/g5v1-l01/words/g5v1-l01-c01-u9e6d/quizzes",
    returnPathFromUrl(card),
  );
  const nextQuiz = withReturnTo(
    "/lessons/g5v1-l01/words/g5v1-l01-c02-u9e6d",
    returnPathFromUrl(quiz),
  );

  assert.equal(returnPathFromUrl(card), lessonWords);
  assert.equal(returnPathFromUrl(quiz), lessonWords);
  assert.equal(returnPathFromUrl(nextQuiz), lessonWords);
});

test("track route construction follows the filesystem router", () => {
  assert.equal(
    routeForTrack("honglan", "g5v1-l01", "g5v1-l01-c05-u55dc"),
    "/honglan-exercise/g5v1-l01/lesson_words/g5v1-l01-c05-u55dc",
  );
  assert.equal(routeForTrack("words", "g5v1-l01"), "/lessons/g5v1-l01");
});
