import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import { characters, components, lessons } from "../wechat-miniprogram/miniprogram/data/catalog.ts";

const root = new URL("../wechat-miniprogram/", import.meta.url);

test("native mini-program uses a bounded set of page templates for the complete catalog", async () => {
  const app = JSON.parse(await readFile(new URL("miniprogram/app.json", root), "utf8"));
  assert.equal(app.pages.length, 11);
  assert.equal(lessons.length, 26);
  assert.equal(characters.length, 430);
  assert.equal(components.length, 401);
  assert.ok(app.pages.includes("pages/character/index"));
  assert.ok(app.pages.includes("pages/practice/index"));
  assert.ok(app.pages.includes("pages/practice-hub/index"));
  assert.ok(app.pages.includes("pages/track/index"));

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

test("mini-program ships one real reading model for every lesson", async () => {
  for (const lesson of lessons) {
    const audio = await stat(new URL(`../public/audio/reading/${lesson.id}.m4a`, import.meta.url));
    assert.ok(audio.size > 1_000, `${lesson.id} reading model should contain audio bytes`);
  }
});

test("native mini-program shares the Web visual language instead of the retired paper theme", async () => {
  const app = JSON.parse(await readFile(new URL("miniprogram/app.json", root), "utf8"));
  const globalStyles = await readFile(new URL("miniprogram/app.wxss", root), "utf8");
  const homeTemplate = await readFile(new URL("miniprogram/pages/home/index.wxml", root), "utf8");
  const homeStyles = await readFile(new URL("miniprogram/pages/home/index.wxss", root), "utf8");
  const lessonTemplate = await readFile(new URL("miniprogram/pages/lesson/index.wxml", root), "utf8");
  const characterTemplate = await readFile(new URL("miniprogram/pages/character/index.wxml", root), "utf8");
  const characterStyles = await readFile(new URL("miniprogram/pages/character/index.wxss", root), "utf8");
  const practiceHubTemplate = await readFile(new URL("miniprogram/pages/practice-hub/index.wxml", root), "utf8");
  const practiceTemplate = await readFile(new URL("miniprogram/pages/practice/index.wxml", root), "utf8");
  const practiceStyles = await readFile(new URL("miniprogram/pages/practice/index.wxss", root), "utf8");
  const practiceScript = await readFile(new URL("miniprogram/pages/practice/index.ts", root), "utf8");
  const tabTemplate = await readFile(new URL("miniprogram/custom-tab-bar/index.wxml", root), "utf8");

  assert.equal(app.tabBar.custom, true);
  assert.match(globalStyles, /--action:\s*#17b686/u);
  assert.match(globalStyles, /--radical:\s*#ff5b34/u);
  assert.match(globalStyles, /--part:\s*#2fa8e0/u);
  assert.match(globalStyles, /--wrong:\s*#ffb020/u);
  assert.doesNotMatch(globalStyles, /#f5eedd|#a6472b/iu);
  assert.match(homeTemplate, /class="lesson-banner"/u);
  assert.match(homeTemplate, /class="path-map"/u);
  assert.match(homeStyles, /box-shadow:\s*0 5px 0 var\(--action-deep\)/u);
  assert.match(lessonTemplate, /课文导读/u);
  assert.match(lessonTemplate, /生字表/u);
  assert.match(lessonTemplate, /复习巩固/u);
  assert.match(characterTemplate, /class="details/u);
  assert.match(characterTemplate, /\{\{masteryCount\}\}/u);
  assert.match(characterTemplate, /equalizer \{\{playing/u);
  assert.match(characterStyles, /@keyframes narration-equalizer/u);
  assert.match(practiceHubTemplate, /class="route-card/u);
  assert.match(practiceTemplate, /class="celebration-overlay"/u);
  assert.match(practiceTemplate, /class="celebration-assembly/u);
  assert.match(practiceTemplate, /这一关记住了/u);
  assert.match(practiceStyles, /@keyframes celebration-fly-left/u);
  assert.match(practiceStyles, /@keyframes celebration-seal/u);
  assert.match(practiceStyles, /@keyframes answer-sheet-rise/u);
  assert.match(practiceStyles, /@keyframes choice-nudge/u);
  assert.match(practiceScript, /currentAttempts: this\.data\.currentAttempts \+ 1/u);
  assert.match(practiceScript, /this\.prepareQuestion\(true\)/u);
  assert.match(tabTemplate, /icon-\{\{item\.icon\}\}/u);
});

test("native mini-program pins the Web design tokens, rhythm, and motion timings", async () => {
  const [webGlobal, webChallenge, miniGlobal, miniPractice, miniCharacter, miniReader, miniComponents] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/challenge.css", import.meta.url), "utf8"),
    readFile(new URL("miniprogram/app.wxss", root), "utf8"),
    readFile(new URL("miniprogram/pages/practice/index.wxss", root), "utf8"),
    readFile(new URL("miniprogram/pages/character/index.wxss", root), "utf8"),
    readFile(new URL("miniprogram/pages/reader/index.wxss", root), "utf8"),
    readFile(new URL("miniprogram/pages/components/index.wxss", root), "utf8"),
  ]);

  const normalizeCssValue = (value) => value.replaceAll(/\s+/gu, "").toLowerCase();
  for (const token of [
    "action", "action-deep", "action-soft", "action-edge", "action-ink", "action-text",
    "radical", "radical-deep", "radical-soft", "radical-edge", "radical-ink", "radical-text",
    "part", "part-deep", "part-soft", "part-edge", "part-ink", "part-text",
    "wrong", "wrong-deep", "wrong-soft", "wrong-edge", "wrong-ink", "wrong-text",
    "sky", "sky-deep", "paper", "paper-soft", "ink", "ink-soft", "line", "line-deep", "navy",
  ]) {
    const pattern = new RegExp(`--${token}:\\s*([^;]+);`, "u");
    const webValue = webGlobal.match(pattern)?.[1];
    const miniValue = miniGlobal.match(pattern)?.[1];
    assert.ok(webValue, `Web should define --${token}`);
    assert.ok(miniValue, `mini-program should define --${token}`);
    assert.equal(normalizeCssValue(miniValue), normalizeCssValue(webValue), `--${token} should match Web`);
  }

  assert.match(webGlobal, /--card-inline-gap:\s*12px/u);
  assert.match(webGlobal, /--card-stack-gap:\s*16px/u);
  assert.match(miniGlobal, /--card-inline-gap:\s*12px/u);
  assert.match(miniGlobal, /--card-stack-gap:\s*16px/u);
  assert.match(miniGlobal, /page-arrive 620ms var\(--ease-out\)/u);

  for (const [name, duration] of [
    ["answer-sheet-rise", "260ms"],
    ["answer-mark-stamp", "420ms"],
    ["choice-land", "320ms"],
    ["choice-nudge", "340ms"],
    ["choice-parts-in", "220ms"],
  ]) {
    assert.match(webChallenge, new RegExp(`${name} ${duration}`, "u"));
    assert.match(miniPractice, new RegExp(`${name} ${duration}`, "u"));
  }

  assert.match(miniPractice, /celebration-fade 220ms/u);
  assert.match(miniPractice, /celebration-pop 420ms/u);
  assert.match(miniPractice, /celebration-fly-left 1600ms/u);
  assert.match(miniPractice, /celebration-fly-right 1600ms/u);
  assert.match(miniPractice, /celebration-seal 1600ms/u);
  assert.match(miniPractice, /celebration-ring 1600ms/u);
  assert.match(miniCharacter, /narration-character-cue 180ms/u);
  assert.match(miniCharacter, /narration-equalizer 520ms/u);
  assert.match(miniReader, /recording-heartbeat 1150ms/u);
  assert.match(miniComponents, /sheet-fade 220ms/u);
  assert.match(miniComponents, /transform 260ms var\(--ease-out\)/u);
});
