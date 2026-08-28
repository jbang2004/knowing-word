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

test("native mini-program routes functional icons through local WeChat-compatible assets", async () => {
  const app = JSON.parse(await readFile(new URL("miniprogram/app.json", root), "utf8"));
  const iconTemplate = await readFile(new URL("miniprogram/components/knowing-icon/index.wxml", root), "utf8");
  const iconScript = await readFile(new URL("miniprogram/components/knowing-icon/index.ts", root), "utf8");
  const iconStyles = await readFile(new URL("miniprogram/components/knowing-icon/index.wxss", root), "utf8");
  const flameAsset = await readFile(new URL("miniprogram/assets/icons/flame-light.svg", root), "utf8");
  const retiredManualIcons = /(?:nav-back-icon|ui-icon|streak-flame|search-icon|reader-chevron|record-mark|audio-icon|record-spark|hub-spark-icon|sparkles-icon|icon-(?:collapse|replay-small|stop|volume|book|check-card|microphone)|history-icon|memory-close-icon)/u;

  assert.match(iconTemplate, /<image[\s\S]*name === 'flame'[\s\S]*flame-\{\{tone/u);
  assert.match(iconTemplate, /\{\{glyph\}\}/u);
  assert.match(iconScript, /const ICON_GLYPHS: Record<string, string>/u);
  assert.match(iconScript, /"assignment-check": "\\uE08A"/u);
  assert.doesNotMatch(iconStyles, /::(?:before|after)/u);
  assert.match(flameAsset, /<svg[\s\S]*<path/u);

  for (const page of app.pages) {
    const template = await readFile(new URL(`miniprogram/${page}.wxml`, root), "utf8");
    const styles = await readFile(new URL(`miniprogram/${page}.wxss`, root), "utf8");
    assert.doesNotMatch(template, retiredManualIcons, `${page}.wxml must use knowing-icon for functional icons`);
    assert.doesNotMatch(styles, retiredManualIcons, `${page}.wxss must not redraw retired functional icons`);
  }
});

test("native mini-program never blocks first paint on WeChat login", async () => {
  const appScript = await readFile(new URL("miniprogram/app.ts", root), "utf8");
  assert.match(appScript, /onLaunch\(\) \{/u);
  assert.doesNotMatch(appScript, /async onLaunch\(\)/u);
  assert.doesNotMatch(appScript, /await ensureWechatSession\(\)/u);
  assert.match(appScript, /void ensureWechatSession\(\)\.then\(\(\) => syncProfile\(\)\)/u);
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
  const iconTemplate = await readFile(new URL("miniprogram/components/knowing-icon/index.wxml", root), "utf8");
  const iconStyles = await readFile(new URL("miniprogram/components/knowing-icon/index.wxss", root), "utf8");

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
  assert.match(practiceTemplate, /wx:key="key" class="celebration-fly/u);
  assert.match(practiceTemplate, /这一关记住了/u);
  assert.match(practiceStyles, /@keyframes celebration-fly-left/u);
  assert.match(practiceStyles, /@keyframes celebration-seal/u);
  assert.match(practiceStyles, /@keyframes answer-sheet-rise/u);
  assert.match(practiceStyles, /@keyframes choice-nudge/u);
  assert.match(practiceScript, /currentAttempts: this\.data\.currentAttempts \+ 1/u);
  assert.match(practiceScript, /key: `\$\{part\.char\}-\$\{index\}-\$\{sessionSalt\}`/u);
  assert.match(practiceScript, /celebrationParts: this\.data\.celebrationParts\.map/u);
  assert.match(practiceScript, /this\.prepareQuestion\(true\)/u);
  assert.equal(app.usingComponents["ki-icon"], "/components/knowing-icon/index");
  assert.match(tabTemplate, /<ki-icon name="\{\{item\.icon\}\}" size="26"/u);
  assert.match(iconTemplate, /knowing-icon-\{\{name\}\}/u);
  assert.match(iconStyles, /data:font\/woff2;base64,/u);
  assert.doesNotMatch(iconStyles, /https?:\/\//u);
  assert.match(homeTemplate, /class="path-seal-wrap"/u);
  assert.doesNotMatch(homeTemplate, /<button class="path-seal"/u);
  assert.match(homeStyles, /\.path-seal-wrap \{[^}]*width:74px;[^}]*height:74px;[^}]*transform:translateX\(var\(--node-offset\)\)/u);
  assert.match(homeStyles, /\.node-badge \{[^}]*overflow:visible;/u);
});

test("native practice keeps the Web mobile answer and completion geometry", async () => {
  const [template, styles, script] = await Promise.all([
    readFile(new URL("miniprogram/pages/practice/index.wxml", root), "utf8"),
    readFile(new URL("miniprogram/pages/practice/index.wxss", root), "utf8"),
    readFile(new URL("miniprogram/pages/practice/index.ts", root), "utf8"),
  ]);

  assert.match(template, /class="answer-sheet writing-assessment"[\s\S]*class="challenge-actions-row"/u);
  assert.doesNotMatch(template, /writing-assessment-grid/u);
  assert.match(template, /class="answer-sheet-answer \{\{resultAnswerIsGlyph/u);
  assert.match(template, /celebration-stat-label">题目<\/small><text class="celebration-stat-value"/u);
  assert.match(script, /resultAnswerIsGlyph:\s*!correct && Array\.from\(correctAnswer\)\.length <= 6/u);
  assert.match(script, /if \(!correct\) wx\.vibrateShort\(\{ type: "medium"/u);

  assert.match(styles, /\.choice-card \{[^}]*gap:13px;[^}]*padding:12px 15px;[^}]*border-radius:18px;/u);
  assert.match(styles, /\.challenge-actions-row \{[^}]*min-height:44px;[^}]*gap:12px;/u);
  assert.match(styles, /\.answer-sheet \{[^}]*gap:12px;[^}]*margin-right:-20px;[^}]*margin-left:-20px;[^}]*border-radius:28px 28px 0 0;/u);
  assert.match(styles, /\.answer-sheet-note \{[^}]*margin-top:-4px;[^}]*font-size:13px;[^}]*line-height:1\.65;/u);
  assert.match(styles, /\.writing-assessment \.game-button \{[^}]*width:auto !important;[^}]*min-height:48px;[^}]*padding:11px 18px;[^}]*border-radius:14px;[^}]*font-size:14px;/u);
  assert.match(styles, /\.celebration-card \{[^}]*width:calc\(100% - 32px\);[^}]*max-width:420px;[^}]*max-height:92vh;[^}]*gap:14px;[^}]*padding:26px 22px calc\(24px \+ env\(safe-area-inset-bottom\)\);[^}]*border-radius:30px;/u);
  assert.match(styles, /\.celebration-actions \{[^}]*flex-direction:column;[^}]*gap:9px;[^}]*margin-top:2px;/u);
  assert.match(styles, /\.celebration-actions \.game-button\.primary\.celebration-primary \{[^}]*min-height:48px;[^}]*border-radius:14px;[^}]*font-size:14px;/u);
});

test("correct feedback blooms without borrowing the retry shake", async () => {
  const [webStyles, webHaptics, miniStyles, miniScript] = await Promise.all([
    readFile(new URL("../app/challenge.css", import.meta.url), "utf8"),
    readFile(new URL("../app/infrastructure/browser/haptics.ts", import.meta.url), "utf8"),
    readFile(new URL("miniprogram/pages/practice/index.wxss", root), "utf8"),
    readFile(new URL("miniprogram/pages/practice/index.ts", root), "utf8"),
  ]);

  for (const styles of [webStyles, miniStyles]) {
    assert.match(styles, /\.answer-sheet\.is-correct \{[^}]*animation:\s*answer-sheet-success 360ms ease-out both;/u);
    assert.match(styles, /\.answer-sheet\.is-correct \.answer-sheet-mark[^\{]*\{[^}]*animation:\s*answer-mark-success 460ms var\(--ease-out\) both;/u);
    assert.match(styles, /\.answer-sheet\.is-correct \.answer-sheet-mark::after[^\{]*\{[^}]*animation:\s*answer-success-ring 520ms ease-out both;/u);
    for (const name of ["answer-sheet-success", "answer-mark-success", "answer-success-ring"]) {
      const start = styles.indexOf(`@keyframes ${name}`);
      const end = styles.indexOf("@keyframes", start + 11);
      const positiveMotion = styles.slice(start, end < 0 ? styles.length : end);
      assert.doesNotMatch(positiveMotion, /translateX|rotate/u);
    }
  }

  assert.match(webHaptics, /export function pulseRetryHaptic\(\)/u);
  assert.match(webHaptics, /navigator\.vibrate\(22\)/u);
  assert.doesNotMatch(webHaptics, /success/u);
  assert.match(miniScript, /if \(!correct\) wx\.vibrateShort\(\{ type: "medium"/u);
  assert.doesNotMatch(miniScript, /type: correct \?/u);
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
  assert.match(miniGlobal, /font-display:\s*swap/u);
  assert.match(miniGlobal, /page-arrive 620ms var\(--ease-out\)/u);

  for (const [name, duration] of [
    ["answer-sheet-rise", "260ms"],
    ["answer-sheet-success", "360ms"],
    ["answer-mark-stamp", "420ms"],
    ["answer-mark-success", "460ms"],
    ["answer-success-ring", "520ms"],
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
  assert.match(miniPractice, /\.celebration-lesson-copy \{ color:var\(--ink-soft\)/u);
  assert.match(miniPractice, /\.celebration-radical \{ color:var\(--radical-ink\)/u);
  assert.match(miniPractice, /\.celebration-part \{ color:var\(--part-ink\)/u);
  assert.match(miniPractice, /\.answer-sheet-title \{ color:inherit; font-weight:900; \}/u);
  assert.match(miniPractice, /\.celebration-stat-value \{ font-variant-numeric:tabular-nums; \}/u);
  assert.match(miniPractice, /\.celebration-stat-label \{ opacity:\.9; \}/u);
  assert.match(miniCharacter, /narration-character-cue 180ms/u);
  assert.match(miniCharacter, /narration-equalizer 520ms/u);
  assert.match(miniReader, /recording-heartbeat 1150ms/u);
  assert.match(miniComponents, /sheet-fade 220ms/u);
  assert.match(miniComponents, /transform 260ms var\(--ease-out\)/u);
});

test("native mini-program replays navigation, question, and completion motion without stale keyed nodes", async () => {
  const [
    globalStyles,
    homeTemplate,
    homeScript,
    homeStyles,
    lessonsScript,
    lessonTemplate,
    practiceHubScript,
    practiceHubTemplate,
    accountScript,
    lessonStyles,
    practiceStyles,
    practiceScript,
    characterStyles,
    readerStyles,
    learningSounds,
  ] = await Promise.all([
    readFile(new URL("miniprogram/app.wxss", root), "utf8"),
    readFile(new URL("miniprogram/pages/home/index.wxml", root), "utf8"),
    readFile(new URL("miniprogram/pages/home/index.ts", root), "utf8"),
    readFile(new URL("miniprogram/pages/home/index.wxss", root), "utf8"),
    readFile(new URL("miniprogram/pages/lessons/index.ts", root), "utf8"),
    readFile(new URL("miniprogram/pages/lesson/index.wxml", root), "utf8"),
    readFile(new URL("miniprogram/pages/practice-hub/index.ts", root), "utf8"),
    readFile(new URL("miniprogram/pages/practice-hub/index.wxml", root), "utf8"),
    readFile(new URL("miniprogram/pages/account/index.ts", root), "utf8"),
    readFile(new URL("miniprogram/pages/lesson/index.wxss", root), "utf8"),
    readFile(new URL("miniprogram/pages/practice/index.wxss", root), "utf8"),
    readFile(new URL("miniprogram/pages/practice/index.ts", root), "utf8"),
    readFile(new URL("miniprogram/pages/character/index.wxss", root), "utf8"),
    readFile(new URL("miniprogram/pages/reader/index.wxss", root), "utf8"),
    readFile(new URL("miniprogram/services/learning-sounds.ts", root), "utf8"),
  ]);

  assert.match(globalStyles, /page-arrive-a 620ms var\(--ease-out\)/u);
  assert.match(globalStyles, /page-arrive-b 620ms var\(--ease-out\)/u);
  assert.match(homeTemplate, /\{\{pageMotion\}\}/u);
  for (const script of [homeScript, lessonsScript, practiceHubScript, accountScript]) {
    assert.match(script, /pageMotion: this\.data\.pageMotion === "page-arrive-a" \? "page-arrive-b" : "page-arrive-a"/u);
  }
  assert.match(homeStyles, /transition:transform 120ms ease,box-shadow 120ms ease/u);
  assert.match(lessonTemplate, /class="primary press-card"[^>]*hover-class="is-pressed"/u);
  assert.match(practiceHubTemplate, /class="press-card"[^>]*bindtap="continueRecommended"[^>]*hover-class="is-pressed"/u);
  assert.match(practiceHubTemplate, /class="press-card"[^>]*bindtap="openRoute"[^>]*hover-class="is-pressed"/u);
  assert.match(lessonStyles, /transform 180ms var\(--ease-out\)/u);
  assert.match(practiceStyles, /question-enter-a 220ms var\(--ease-out\)/u);
  assert.match(practiceStyles, /question-enter-b 220ms var\(--ease-out\)/u);
  assert.match(practiceStyles, /celebration-assembly\.is-assembling \.celebration-fly\.from-left[^}]*animation:none/u);
  assert.match(practiceScript, /key: `\$\{part\.char\}-\$\{index\}-\$\{sessionSalt\}`/u);
  assert.match(characterStyles, /\.listen-button \{ transition:transform 160ms var\(--ease-out\)/u);
  assert.match(characterStyles, /\.memory-stage-chips button \{ transition:border-color 200ms ease,background-color 200ms ease/u);
  assert.match(readerStyles, /\.sentence-card \{ transition:transform 90ms ease,box-shadow 90ms ease,border-color 140ms ease,background-color 140ms ease/u);
  assert.match(learningSounds, /audio\.volume = 0\.78/u);
});

test("native mini-program keeps the final Web cascade across page families", async () => {
  const [
    globalStyles,
    homeTemplate,
    homeStyles,
    trackStyles,
    accountStyles,
    lessonScript,
    lessonTemplate,
    lessonStyles,
    lessonsStyles,
    practiceTemplate,
    practiceStyles,
    characterStyles,
    readerStyles,
    componentStyles,
    recordStyles,
  ] = await Promise.all([
    readFile(new URL("miniprogram/app.wxss", root), "utf8"),
    readFile(new URL("miniprogram/pages/home/index.wxml", root), "utf8"),
    readFile(new URL("miniprogram/pages/home/index.wxss", root), "utf8"),
    readFile(new URL("miniprogram/pages/track/index.wxss", root), "utf8"),
    readFile(new URL("miniprogram/pages/account/index.wxss", root), "utf8"),
    readFile(new URL("miniprogram/pages/lesson/index.ts", root), "utf8"),
    readFile(new URL("miniprogram/pages/lesson/index.wxml", root), "utf8"),
    readFile(new URL("miniprogram/pages/lesson/index.wxss", root), "utf8"),
    readFile(new URL("miniprogram/pages/lessons/index.wxss", root), "utf8"),
    readFile(new URL("miniprogram/pages/practice/index.wxml", root), "utf8"),
    readFile(new URL("miniprogram/pages/practice/index.wxss", root), "utf8"),
    readFile(new URL("miniprogram/pages/character/index.wxss", root), "utf8"),
    readFile(new URL("miniprogram/pages/reader/index.wxss", root), "utf8"),
    readFile(new URL("miniprogram/pages/components/index.wxss", root), "utf8"),
    readFile(new URL("miniprogram/pages/records/index.wxss", root), "utf8"),
  ]);

  assert.match(globalStyles, /\.theme-night \{[\s\S]*--shadow-sheet:0 -16px 44px rgba\(0,0,0,\.5\);/u);
  assert.match(globalStyles, /button:active \{ transform:translateY\(var\(--press\)\); box-shadow:none; \}/u);
  assert.match(globalStyles, /button\[disabled\]:active \{ transform:none; \}/u);
  assert.match(globalStyles, /button \{ min-width: 0; max-width:100%;/u);
  assert.match(globalStyles, /max-width:1244px;[\s\S]*@media \(min-width:1481px\)[\s\S]*margin-left:calc\(\(100% - 1008px\) \/ 2\)/u);

  assert.match(homeTemplate, /class="read-mic"/u);
  assert.match(homeStyles, /\.read-row \{[^}]*min-height:58px;[^}]*gap:12px;[^}]*border-radius:19px;[^}]*box-shadow:0 3px 0 var\(--wrong-edge\)/u);
  assert.match(homeStyles, /\.read-row\.disabled \{ opacity:\.62; box-shadow:none; \}/u);
  assert.match(trackStyles, /\.track-method-card \{ border:2px solid var\(--line\); border-radius:22px;/u);
  assert.match(trackStyles, /\.track-lesson-empty \{[^}]*border:2px dashed var\(--line-deep\);[^}]*border-radius:20px;[^}]*text-align:left;/u);
  assert.match(accountStyles, /\.danger-row>ki-icon \{ color:var\(--radical-text\); \}\.danger-row strong \{ color:var\(--ink\); \}/u);

  assert.match(lessonTemplate, /class="reader-mobile-index \{\{mobileIndexOpen/u);
  assert.match(lessonTemplate, /id="guide-section-\{\{item\.id\}\}"/u);
  assert.match(lessonTemplate, /class="lesson-tabs" style="top: \{\{navHeight\}\}px;"/u);
  assert.match(lessonScript, /showPendingGuideAnchor\(\)/u);
  assert.match(lessonScript, /duration: 220/u);
  assert.match(lessonStyles, /\.guide-section\.is-highlighted/u);
  assert.match(lessonStyles, /\.lesson-topbar \{[^}]*position:sticky;[^}]*z-index:18;[^}]*background:var\(--sky\);/u);
  assert.match(lessonStyles, /\.lesson-tabs \{[^}]*margin:8px 0 22px;/u);
  assert.match(lessonStyles, /\.lesson-tabs button \{[^}]*width:100%;[^}]*max-width:100%;[^}]*overflow:hidden;/u);
  assert.match(lessonStyles, /grid-template-columns:minmax\(0,744px\) minmax\(250px,304px\)/u);
  assert.match(lessonsStyles, /@media \(min-width:981px\) \{ \.lesson-route \{ grid-template-columns:repeat\(2,minmax\(0,1fr\)\); \} \}/u);

  assert.match(practiceTemplate, /disabled="\{\{questionIndex === 0 \|\| writingRewrite\}\}"/u);
  assert.match(practiceTemplate, /disabled="\{\{writingRewrite\}\}"/u);
  assert.match(practiceStyles, /\.challenge-streak\.streak-a,\.challenge-streak\.streak-b/u);
  assert.match(characterStyles, /\.narration-token,\.narration-token\.is-active \{ animation:none; transition:none; \}/u);
  assert.match(readerStyles, /\.sentence-card\.is-pressed \{ transform:translateY\(var\(--press\)\); box-shadow:none; \}/u);
  assert.match(componentStyles, /\.component-sheet,\.component-sheet\.open \{[^}]*border-width:2px;[^}]*border-radius:22px;[^}]*box-shadow:0 var\(--press\) 0 var\(--line\)/u);
  assert.match(recordStyles, /\.recent-list \{ display:grid; gap:8px; \}/u);
  assert.match(recordStyles, /\.record-lessons \{ display:grid; gap:13px; \}/u);
  assert.match(recordStyles, /\.lesson-characters \{ display:grid; gap:0; \}/u);
});
