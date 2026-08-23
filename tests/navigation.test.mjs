import assert from "node:assert/strict";
import test from "node:test";
import {
  returnPathFromUrl,
  safeInternalReturnPath,
  withReturnTo,
} from "../app/lib/navigation.ts";

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
