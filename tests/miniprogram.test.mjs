import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import { characters, components, lessons } from "../wechat-miniprogram/miniprogram/data/catalog.ts";

const root = new URL("../wechat-miniprogram/", import.meta.url);

test("native mini-program uses a bounded set of page templates for the complete catalog", async () => {
  const app = JSON.parse(await readFile(new URL("miniprogram/app.json", root), "utf8"));
  assert.equal(app.pages.length, 9);
  assert.equal(lessons.length, 26);
  assert.equal(characters.length, 430);
  assert.equal(components.length, 401);
  assert.ok(app.pages.includes("pages/character/index"));
  assert.ok(app.pages.includes("pages/practice/index"));

  for (const page of app.pages) {
    const template = await readFile(new URL(`miniprogram/${page}.wxml`, root), "utf8");
    assert.doesNotMatch(template, /&&/u, `${page}.wxml should keep compound conditions in page data`);
    assert.doesNotMatch(
      template,
      /<(?:view|block)\b(?=[^>]*wx:(?:if|elif))(?=[^>]*wx:for)[^>]*>/u,
      `${page}.wxml should not mix conditional branches and loops on one node`,
    );
  }
});

test("mini-program ships a compact index and keeps full lesson content behind the Sites API", async () => {
  const catalogStat = await stat(new URL("miniprogram/data/catalog.ts", root));
  const config = await readFile(new URL("miniprogram/config.ts", root), "utf8");
  const catalogService = await readFile(new URL("miniprogram/services/catalog.ts", root), "utf8");
  assert.ok(catalogStat.size < 500_000);
  assert.match(config, /https:\/\/knowing-word\.jbang2004\.chatgpt\.site/u);
  assert.match(config, /platform === "devtools"[\s\S]*http:\/\/localhost:3000/u);
  assert.match(config, /return `\$\{PRODUCTION_ASSET_BASE_URL\}/u);
  assert.match(catalogService, /\/api\/catalog\?lessonId=/u);
  assert.match(catalogService, /MAX_CACHED_LESSONS = 10/u);
  assert.match(catalogService, /lesson-cache:v3/u);
  assert.ok(catalogService.includes(`includes('"http://')`));
});
