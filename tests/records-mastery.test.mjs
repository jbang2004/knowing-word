import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { emptyDimensionMemory, skillDimensions } from "../app/domain/learning-state.ts";
import {
  characterMemoryFromProfile,
  emptyProfile,
} from "../app/lib/profile-model.ts";

test("record views can read a sparse Profile v5 memory as six dimensions", () => {
  const profile = emptyProfile();
  profile.memory.example = {
    recognition: {
      ...emptyDimensionMemory(),
      status: "stable",
      dueAt: "2026-09-01T00:00:00.000Z",
      independentStreak: 3,
    },
  };

  const memory = characterMemoryFromProfile(profile, "example");
  assert.deepEqual(Object.keys(memory), [...skillDimensions]);
  assert.equal(memory.recognition.status, "stable");
  assert.equal(memory.recognition.independentStreak, 3);
  assert.equal(memory.generation.status, "new");
  assert.equal(memory.generation.lastIndependentCorrectAt, null);
});

test("the character record separates mastery evidence from route achievements", async () => {
  const source = await readFile(
    new URL("../app/features/records/records-routes.tsx", import.meta.url),
    "utf8",
  );

  for (const label of ["认读", "读音", "字义", "字形重构", "辨析", "情境"]) {
    assert.match(source, new RegExp(`label: "${label}"`));
  }
  for (const status of ["new", "learning", "review", "stable"]) {
    assert.match(source, new RegExp(`${status}: "`));
  }

  assert.match(source, /characterMemoryFromProfile\(profile, character\.id\)/);
  assert.match(source, /skillDimensions\.map\(\(dimension\)/);
  assert.match(source, /state\.dueAt/);
  assert.match(source, /state\.independentStreak/);
  assert.match(source, /state\.lapses/);
  assert.match(source, /尚无独立提取证据，当前不能显示为已稳定/);
  assert.match(source, /首次学完是永久保留的练习成就/);
  assert.match(source, /首次学完 ≠ 当前已稳定/);
  assert.match(source, /routeFootprints = trackIds\.map/);
  assert.match(source, /四条历史路线/);
  assert.match(source, /这些统计记录做过什么，不替代当前掌握/);
});

test("six-dimension records stay legible on desktop and mobile", async () => {
  const css = await readFile(
    new URL("../app/utility-pages.css", import.meta.url),
    "utf8",
  );

  assert.match(css, /\.record-mastery-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,/s);
  assert.match(css, /\.record-mastery-card\.is-stable/);
  assert.match(css, /\.record-footprints > div\s*\{[^}]*grid-template-columns:\s*repeat\(4,/s);
  assert.match(css, /@media \(max-width: 430px\)[\s\S]*\.record-mastery-grid\s*\{[^}]*grid-template-columns:\s*1fr/s);
});
