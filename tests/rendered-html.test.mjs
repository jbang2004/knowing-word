import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

let workerPromise;

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", "route-suite");
  workerPromise ||= import(workerUrl.href).then((module) => module.default);
  const worker = await workerPromise;

  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the task-first Knowing Word learning experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Knowing Word/i);
  assert.match(html, /五年级上册 26 课汉字学习地图/);
  // The landing is one path: the current lesson, its characters in order, and
  // the lesson ends in one integrated reinforcement plan.
  assert.match(html, /第 1 课/);
  assert.match(html, /白鹭/);
  assert.match(html, /拆字复习/);
  assert.match(html, /红蓝复习/);
  assert.match(html, /结构复习/);
  assert.match(html, /整课巩固 · 选做/);
  assert.match(html, /本课生字后解锁/);
  assert.match(html, /path-workspace/);
  // One seal per character, carrying the glyph and its state only.
  assert.match(html, /path-node is-current/);
  assert.match(html, /class="path-seal"/);
  assert.match(html, /path-chapter-rule/);
  // Primary navigation is thumb-reachable and the top bar is gone for good.
  assert.match(html, /class="app-tabbar"/);
  assert.match(html, /class="app-sidebar"/);
  assert.doesNotMatch(html, /top-navigation|path-tabs|path-mobile-progress/);
  assert.doesNotMatch(html, /喜鹊向导|path-node-guide|path-node-callout/);

  const practiceResponse = await render("/practice");
  assert.equal(practiceResponse.status, 200);
  const practiceHtml = await practiceResponse.text();
  assert.match(practiceHtml, /先逐字过关，再按需要复习/);
  assert.match(practiceHtml, /完整过关.*结构复习.*拆字复习.*红蓝复习.*自由朗读/);
  assert.match(practiceHtml, /自由朗读/);
});

test("secondary tools server-render with a contextual return query", async () => {
  const characterPath = "/lessons/g5v1-l01/words/g5v1-l01-c01-u9e6d";
  const componentResponse = await render(`/bujian?returnTo=${encodeURIComponent(characterPath)}`);
  assert.equal(componentResponse.status, 200);
  assert.match(await componentResponse.text(), /从常见部件入手，识字更轻松/);

  const readResponse = await render(`/read-aloud?returnTo=${encodeURIComponent(characterPath)}`);
  assert.equal(readResponse.status, 200);
  assert.match(await readResponse.text(), /朗读/);

  const accountResponse = await render("/account");
  assert.equal(accountResponse.status, 200);
  assert.match(await accountResponse.text(), /学习记录与错题重练/);
});

test("the lesson guide connects reading clues to cards and back", async () => {
  const lessonResponse = await render("/lessons/g5v1-l01");
  assert.equal(lessonResponse.status, 200);
  const lessonHtml = await lessonResponse.text();
  assert.match(lessonHtml, /读《白鹭》，看见朴素之美/);
  assert.match(lessonHtml, /原创课文导读/);
  assert.match(lessonHtml, /不展示教材正文/);
  assert.match(lessonHtml, /课文导读/);
  assert.match(lessonHtml, /先带着问题读/);
  assert.match(lessonHtml, /本段重点词/);
  assert.match(lessonHtml, /这些比较让你看见了怎样的白鹭/);
  assert.match(lessonHtml, /reader-focus-word/);
  assert.doesNotMatch(lessonHtml, /喜鹊向导/);
  assert.match(lessonHtml, /生字表/);
  assert.match(lessonHtml, /复习巩固/);
  assert.match(lessonHtml, /lesson-paragraph-1/);
  assert.match(lessonHtml, /returnTo=%2Flessons%2Fg5v1-l01%23lesson-paragraph-1/);

  const practiceResponse = await render("/lessons/g5v1-l01?view=practice");
  const practiceHtml = await practiceResponse.text();
  assert.match(practiceHtml, /本课复习方式/);
  assert.match(practiceHtml, /识字/);
  assert.match(practiceHtml, /结构/);
  assert.match(practiceHtml, /拆字/);
  assert.match(practiceHtml, /红蓝/);

  const wordsResponse = await render("/lessons/g5v1-l01?view=words");
  assert.equal(wordsResponse.status, 200);
  const wordsHtml = await wordsResponse.text();
  assert.match(wordsHtml, /课内识字写字表/);
  assert.doesNotMatch(wordsHtml, /lesson-reader-layout/);
  assert.match(wordsHtml, /returnTo=%2Flessons%2Fg5v1-l01%3Fview%3Dwords/);

  const returnTo = encodeURIComponent("/lessons/g5v1-l01#lesson-paragraph-1");
  const cardResponse = await render(
    `/lessons/g5v1-l01/words/g5v1-l01-c01-u9e6d?returnTo=${returnTo}`,
  );
  assert.equal(cardResponse.status, 200);
  assert.match(await cardResponse.text(), /返回《白鹭》导读/);

  for (const [lessonId, documentTitle] of [
    ["g5v1-l02", "读《落花生》，读懂朴素的分量"],
    ["g5v1-l14", "读《圆明园的毁灭》，在盛景与毁灭之间"],
    ["g5v1-l26", "读《我的“长生果”》，看阅读怎样长成文字"],
  ]) {
    const response = await render(`/lessons/${lessonId}`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, new RegExp(documentTitle));
    assert.match(html, /原创课文导读/);
    assert.match(html, /lesson-reader-paper reader-genre-.* is-guide/);
  }
});

test("dense pages keep progressive and shareable responsive contracts", async () => {
  const componentResponse = await render("/bujian");
  const componentHtml = await componentResponse.text();
  assert.match(componentHtml, /显示 36 \/ 401/);
  assert.match(componentHtml, /component-load-more/);

  const recordsResponse = await render("/records/words");
  const recordsHtml = await recordsResponse.text();
  assert.match(recordsHtml, /record-zero-state/);
  assert.match(recordsHtml, /显示全部 26 课/);

  const readResponse = await render("/read-aloud?lessonId=g5v1-l05");
  const readHtml = await readResponse.text();
  assert.match(readHtml, /read-lesson-picker/);
  assert.match(readHtml, /value="g5v1-l05" selected=""/);

  const courseResponse = await render("/lessons");
  const courseHtml = await courseResponse.text();
  assert.equal((courseHtml.match(/id="course-unit-/g) ?? []).length, 8);

  const layoutSource = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const globalCss = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const homeCss = await readFile(new URL("../app/home-path.css", import.meta.url), "utf8");
  const utilityCss = await readFile(new URL("../app/utility-pages.css", import.meta.url), "utf8");
  const readerCss = await readFile(new URL("../app/lesson-reader.css", import.meta.url), "utf8");
  const solidBlocksCss = await readFile(new URL("../app/solid-blocks.css", import.meta.url), "utf8");
  assert.match(layoutSource, /\.\/catalog\.css/);
  assert.match(layoutSource, /\.\/solid-blocks\.css/);
  assert.doesNotMatch(layoutSource, /home-redesign/);
  assert.doesNotMatch(globalCss, /\.home-hero|\.mission-card|\.read-lesson-tabs/);
  // The retired top bar leaves nothing behind.
  assert.doesNotMatch(globalCss, /\.top-navigation|\.wordmark|\.profile-pill/);
  // Four semantic roles; the decorative hues survive only as aliases.
  assert.match(globalCss, /--action: #17b686/);
  assert.match(globalCss, /--radical: #ff5b34/);
  assert.match(globalCss, /--part: #2fa8e0/);
  assert.match(globalCss, /--wrong: #ffb020/);
  assert.match(globalCss, /--coral: var\(--radical\)/);
  // Solid blocks: depth comes from a hard bottom edge, not a blur.
  assert.match(globalCss, /--shadow: 0 3px 0 var\(--line\)/);
  assert.match(globalCss, /\.record-detail-summary\.action \{\s*--track: var\(--action\)/);
  assert.match(globalCss, /\.celebration-card\.track-action/);
  assert.match(globalCss, /\.celebration-card\.track-wrong/);
  assert.doesNotMatch(globalCss, /\.celebration-stars|@keyframes star-pop/);
  assert.match(solidBlocksCss, /\.word-map-board,[\s\S]*?box-shadow: 0 var\(--press\) 0 var\(--line\)/);
  assert.match(solidBlocksCss, /\.choice-card:not\(:disabled\):active[\s\S]*?box-shadow: none/);
  // Generic white surfaces must never override components whose captions are
  // intentionally inverse. These regressions render as white text on white.
  assert.doesNotMatch(solidBlocksCss, /\.lesson-practice-strip/);
  assert.doesNotMatch(solidBlocksCss, /\.practice-strip-items/);
  assert.doesNotMatch(solidBlocksCss, /\.reader-mobile-index summary/);
  assert.match(globalCss, /--ink-faint: #5e6e68/);
  const shellCss = await readFile(new URL("../app/app-shell.css", import.meta.url), "utf8");
  assert.match(shellCss, /\.app-tabbar \{[\s\S]*?position: fixed/);
  assert.match(shellCss, /@media \(min-width: 900px\)[\s\S]*?\.app-tabbar \{\s*display: none/);
  assert.match(homeCss, /\.path-seal \{[\s\S]*?border-radius: 24px 24px 24px 8px/);
  assert.match(homeCss, /\.path-node\.is-current \.path-seal[\s\S]*?box-shadow: 0 5px 0/);
  assert.doesNotMatch(homeCss, /is-mobile-hidden/);
  assert.match(utilityCss, /\.component-story-sheet[\s\S]*position: fixed/);
  assert.match(utilityCss, /\.read-lesson-picker[\s\S]*min-height: 44px/);
  assert.match(readerCss, /\.reader-mobile-index[\s\S]*position: fixed/);
  assert.match(readerCss, /max-height: min\(56vh, 450px\)/);
  assert.match(readerCss, /max-height: 700px/);
  assert.match(readerCss, /animation: none/);
  assert.match(readerCss, /\.reader-focus-words[\s\S]*grid-template-columns/);
  assert.match(readerCss, /\.reader-section\.is-guide-clue > p[\s\S]*text-indent: 0/);

  const practiceSource = await readFile(
    new URL("../app/features/practice-session/practice-session-view.tsx", import.meta.url),
    "utf8",
  );
  const practiceRouteSource = await readFile(
    new URL("../app/features/practice-session/practice-session-route.tsx", import.meta.url),
    "utf8",
  );
  const characterRouteSource = await readFile(
    new URL("../app/features/character-study/character-study-route.tsx", import.meta.url),
    "utf8",
  );
  assert.match(practiceSource, /aria-modal="true"/);
  assert.match(practiceSource, /<main className=\{"challenge-page challenge-centered track-"/);
  assert.match(practiceSource, /<h1>\{writingText\.prompt\}<\/h1>/);
  assert.match(practiceSource, /aria-label=\{`选项 \$\{keyLabels\[index\]/);
  assert.match(practiceSource, /alt=""\s+aria-hidden="true"/);
  assert.match(practiceSource, /character\.charType\.includes\("形声"\)/);
  assert.match(practiceSource, /补充字形线索/);
  // Dynamic character routes must never inherit the previous character's
  // question index, round results, celebration, drawer or memory state.
  assert.match(practiceRouteSource, /key=\{`\$\{mode\}:\$\{track\}:\$\{review \?\? "regular"\}:\$\{character\.id\}/);
  assert.match(characterRouteSource, /key=\{character\.id\}/);
  const characterPageSource = await readFile(
    new URL("../app/features/character-study/character-study.tsx", import.meta.url),
    "utf8",
  );
  assert.match(characterPageSource, /<h1 className="study-glyph">\{character\.hanzi\}<\/h1>/);
  assert.match(practiceRouteSource, /passedQuestionIds/);
  assert.doesNotMatch(practiceRouteSource, /firstIncompleteQuestionIndex/);
});

test("unknown paths no longer fall through to the learning client", async () => {
  const response = await render("/this-route-does-not-exist");
  assert.equal(response.status, 404);
});

test("character pages render the complete picture-to-character memory flow", async () => {
  const response = await render(
    "/lessons/g5v1-l01/words/g5v1-l01-c01-u9e6d",
  );
  assert.equal(response.status, 200);
  const html = await response.text();
  // The 物象图 remains the screen while narration is mounted in place. The
  // launcher makes that continuity explicit instead of routing to a theatre.
  assert.match(html, /画面本身就是字形/);
  assert.match(html, /听字义讲解/);
  assert.match(html, /留在画面边看边听/);
  assert.match(html, /物象四步/);
  assert.match(html, /看意象 · 找部首 · 找部件 · 合成字/);
  // The quiz is the point of the page, so it renders on the page itself
  // rather than at the bottom of a drawer.
  assert.match(html, /class="study-actions"/);
  // Reference material sits in the drawer but still server-renders, so every
  // learning URL stays a complete, shareable page.
  assert.match(html, /部件来历/);
  assert.match(html, /字形演变/);
  assert.match(html, /本课主题语境/);
  // The audio element now lives on the study page, so the first user click can
  // play directly without mounting or navigating to a second screen.
  assert.match(html, /<audio/);
  assert.match(html, /\/media\/narration\/v5\//);
  assert.match(html, /audio\.webm\?v=narration-v5-fish-s2\.1-pro-free-20260824/);

  const pageSource = await readFile(
    new URL("../app/features/character-study/character-study.tsx", import.meta.url),
    "utf8",
  );
  assert.match(pageSource, /function InlineNarrationPlayer/);
  assert.match(pageSource, /可选辅助 · 不影响字画页/);
  assert.doesNotMatch(pageSource, /setView\("listen"\)/);
  // On short mobile viewports the expanded player follows the visible area,
  // while reduced-motion users get the same layout without smooth movement.
  assert.match(pageSource, /player\.scrollIntoView/);
  assert.match(pageSource, /prefers-reduced-motion: reduce/);
  assert.match(pageSource, /visualViewport\?\.addEventListener\("resize"/);
  assert.match(pageSource, /study-shell\$\{narrationActive \? " is-listening"/);
  assert.match(pageSource, /type='audio\/webm; codecs="opus"'/);

  const studyCss = await readFile(
    new URL("../app/study.css", import.meta.url),
    "utf8",
  );
  const globalCss = await readFile(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );
  // Root scrolling is vertical-only even in narrow Android webviews or under
  // browser zoom. Purposeful chip rails keep their own horizontal scrolling.
  assert.match(globalCss, /html \{[^}]*overflow-x: clip;/s);
  assert.match(globalCss, /body \{[^}]*min-width: 0;[^}]*overflow-x: clip;/s);
  assert.match(studyCss, /\.study-shell \{[^}]*max-width: 100%;[^}]*overflow-x: clip;/s);
  assert.match(studyCss, /scroll-margin-block:[^;]*safe-area-inset-bottom/);
  assert.match(studyCss, /@media \(max-width: 899px\) and \(max-height: 760px\)/);
  assert.match(studyCss, /@media \(max-width: 899px\) and \(max-height: 620px\)/);
  // The column has exactly one elastic member — the picture — so no rule has
  // to predict how tall the furniture below it is. Guessing a budget is what
  // previously left a gap under the actions when collapsed and pushed them off
  // the screen when the narration player opened.
  assert.match(studyCss, /\.study-body \{[^}]*flex: 1 1 auto;[^}]*flex-direction: column;/s);
  assert.match(studyCss, /\.study-scene \{[^}]*flex: 1 1 auto;[^}]*aspect-ratio: 1;/s);
  assert.doesNotMatch(studyCss, /--scene-height/);
  // Listening lowers the picture's floor rather than assigning it a height.
  assert.match(studyCss, /\.study-shell\.is-listening \.study-scene \{\s*min-height:/);
  // No frame, no mat: the box hugs the artwork and its edges fade to paper.
  assert.doesNotMatch(studyCss, /\.study-scene \{[^}]*border-radius:/s);
  assert.match(studyCss, /\.study-transcript-text \{[^}]*min-height: 0;/s);
});

test("lesson 3 uses the same bounded learning flow as every other lesson", async () => {
  const lessonResponse = await render("/lessons/g5v1-l03?view=words");
  assert.equal(lessonResponse.status, 200);
  const lessonHtml = await lessonResponse.text();
  assert.match(lessonHtml, /课内识字写字表/);
  assert.doesNotMatch(lessonHtml, /识字方法试点|pilot-/);

  const { characters } = await import(
    new URL("../app/data/catalog.ts", import.meta.url).href,
  );
  const pickup = characters.find(
    (character) => character.lessonId === "g5v1-l03" && character.hanzi === "捡" && character.primary,
  );
  assert.ok(pickup);

  const characterResponse = await render(`/lessons/g5v1-l03/words/${pickup.id}`);
  assert.equal(characterResponse.status, 200);
  const characterHtml = await characterResponse.text();
  assert.match(characterHtml, /画面本身就是字形/);
  assert.match(characterHtml, /部件来历/);
  assert.doesNotMatch(characterHtml, /pilot-|第三课 · 识字方法试点/);
});

test("all catalog routes server-render with real, shareable URLs", async () => {
  const { characters, lessons } = await import(
    new URL("../app/data/catalog.ts", import.meta.url).href,
  );
  const sourceCharacters = characters.filter((character) => character.primary);
  const routes = [
    "/",
    "/account",
    "/lessons",
    "/records",
    "/bujian",
    "/honglan-exercise",
    "/split-exercise",
    "/space-structure-exercise",
    "/read-aloud",
  ];

  for (const lesson of lessons) {
    routes.push(
      `/lessons/${lesson.id}`,
      `/honglan-exercise/${lesson.id}`,
      `/split-exercise/${lesson.id}`,
      `/space-structure-exercise/${lesson.id}`,
    );
  }
  for (const character of sourceCharacters) {
    routes.push(`/lessons/${character.lessonId}/words/${character.id}`);
    if (character.official !== false) {
      routes.push(
        `/lessons/${character.lessonId}/words/${character.id}/quizzes`,
        `/honglan-exercise/${character.lessonId}/lesson_words/${character.id}`,
        `/split-exercise/${character.lessonId}/words/${character.id}`,
        `/space-structure-exercise/${character.lessonId}/lesson_words/${character.id}`,
      );
    }
  }

  assert.equal(sourceCharacters.length, 430);
  assert.equal(routes.length, 2003);
  assert.equal(new Set(routes).size, routes.length);

  for (let offset = 0; offset < routes.length; offset += 20) {
    const batch = routes.slice(offset, offset + 20);
    const responses = await Promise.all(batch.map((route) => render(route)));
    responses.forEach((response, index) => {
      assert.equal(response.status, 200, `route failed: ${batch[index]}`);
      assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
    });
  }
});

test("every image-based literacy question has a generated visual asset", async () => {
  const { characters, lessons } = await import(
    new URL("../app/data/catalog.ts", import.meta.url).href,
  );
  const { characterVisuals, supplementalVisuals, lessonVisuals, getVisualOption } = await import(
    new URL("../app/data/illustrations.ts", import.meta.url).href,
  );

  const visualCharacters = characters.filter(
    (character) =>
      character.primary &&
      character.exercises.some(
        (exercise) => exercise.questionType === "image_single_select",
      ),
  );
  const uniqueGlyphs = new Set(visualCharacters.map((character) => character.hanzi));
  const officialGlyphs = new Set(
    characters.filter((character) => character.official !== false).map((character) => character.hanzi),
  );
  const allGlyphs = new Set(characters.map((character) => character.hanzi));

  assert.equal(officialGlyphs.size, 359);
  assert.ok(uniqueGlyphs.size >= officialGlyphs.size);
  assert.equal(allGlyphs.size, 423);
  assert.equal(Object.keys(characterVisuals).length, allGlyphs.size);
  assert.deepEqual(new Set(Object.keys(characterVisuals)), allGlyphs);
  assert.equal(
    new Set(Object.values(characterVisuals).map((visual) => visual.src)).size,
    allGlyphs.size,
  );
  assert.equal(supplementalVisuals.length, 6);
  assert.equal(
    new Set([
      ...Object.values(characterVisuals).map((visual) => visual.src),
      ...supplementalVisuals.map((visual) => visual.src),
    ]).size,
    allGlyphs.size + supplementalVisuals.length,
  );
  assert.ok(Object.keys(lessonVisuals).length >= lessons.length);

  for (const glyph of allGlyphs) {
    const visual = characterVisuals[glyph];
    assert.ok(visual, `missing character-study visual for ${glyph}`);
    assert.match(
      visual.src,
      /^\/illustrations\/(?:mnemonics\/(?:m\d+\.webp|g5-u[0-9a-f]+\.svg)|mnemonics-v2\/g5-u[0-9a-f]+\.webp)$/,
    );
    await access(new URL(`../public${visual.src}`, import.meta.url));
  }

  for (const visual of supplementalVisuals) {
    await access(new URL(`../public${visual.src}`, import.meta.url));
  }

  const supplementalSources = new Set(
    supplementalVisuals.map((visual) => visual.src),
  );
  const usedSupplementalSources = new Set();

  for (const character of visualCharacters) {
    assert.ok(characterVisuals[character.hanzi], `missing visual for ${character.hanzi}`);
    for (const exercise of character.exercises.filter(
      (item) => item.questionType === "image_single_select",
    )) {
      let wrongSlot = 0;
      for (const option of exercise.options) {
        const visual = getVisualOption(
          character.hanzi,
          exercise.id,
          option.correct,
          wrongSlot,
        );
        assert.ok(visual?.src, `missing option visual for ${character.hanzi}`);
        await access(new URL(`../public${visual.src}`, import.meta.url));
        if (supplementalSources.has(visual.src)) {
          usedSupplementalSources.add(visual.src);
        }
        if (!option.correct) wrongSlot += 1;
      }
    }
  }

  assert.equal(usedSupplementalSources.size, supplementalVisuals.length);

  for (const lesson of lessons) {
    const visual = lessonVisuals[lesson.id];
    assert.ok(visual, `missing lesson visual for ${lesson.title}`);
    await access(new URL(`../public${visual.src}`, import.meta.url));
  }

  const illustrationSource = await readFile(
    new URL("../app/data/illustrations.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(
    illustrationSource,
    /auth_key|course-assets|access_token|password\s*[:=]/i,
  );
});

test("every source character has a complete, authored object-shaped mnemonic", async () => {
  const { characters } = await import(
    new URL("../app/data/catalog.ts", import.meta.url).href,
  );
  const { getMnemonicStageCopy, getMnemonicStagePartIndices, mnemonicStageLabels } = await import(
    new URL("../app/data/mnemonics.ts", import.meta.url).href,
  );
  const { getMnemonicLayout, getMnemonicScene, mnemonicScenes } = await import(
    new URL("../app/data/mnemonic-scenes.ts", import.meta.url).href,
  );
  const { mnemonicQualityPlans } = await import(
    new URL("../app/data/mnemonic-quality.ts", import.meta.url).href,
  );
  const sourceCharacters = [...new Map(
    characters.map((character) => [character.hanzi, character]),
  ).values()];

  assert.deepEqual(mnemonicStageLabels, ["看意象", "找部首", "找部件", "合成字"]);
  assert.equal(sourceCharacters.length, 423);
  assert.equal(Object.keys(mnemonicScenes).length, sourceCharacters.length);
  const officialCharacters = sourceCharacters.filter((character) => character.official !== false);
  assert.equal(officialCharacters.length, 359);
  assert.deepEqual(
    new Set(Object.keys(mnemonicQualityPlans)),
    new Set(officialCharacters.map((character) => character.hanzi)),
  );
  for (const character of officialCharacters) {
    const plan = mnemonicQualityPlans[character.hanzi];
    assert.ok(plan.meaning.length >= 8, `mnemonic meaning is too vague for ${character.hanzi}`);
    assert.ok(plan.scene.length >= 18, `mnemonic scene is too vague for ${character.hanzi}`);
    for (const [partIndex, part] of character.parts.map((item) => item.char).entries()) {
      assert.ok(plan.scene.includes(part), `mnemonic scene for ${character.hanzi} misses ${part}`);
      const description = character.compositions[partIndex]?.description ?? "";
      assert.ok(description.includes(part), `component copy for ${character.hanzi} misses ${part}`);
      assert.doesNotMatch(description, /故事道具|轮廓像|专属画面/u);
    }
  }
  for (const character of sourceCharacters) {
    const parts = character.parts.length || 1;
    const scene = getMnemonicScene(character);
    assert.equal(scene, mnemonicScenes[character.hanzi], `generic mnemonic fallback for ${character.hanzi}`);
    assert.equal(scene.cues.length, parts, `wrong mnemonic cue count for ${character.hanzi}`);
    assert.ok(scene.scene.length >= 18, `mnemonic scene is too vague for ${character.hanzi}`);
    assert.ok(["left-right", "top-bottom", "surround", "single"].includes(getMnemonicLayout(character)));
    for (let stage = 0; stage < 4; stage += 1) {
      const copy = getMnemonicStageCopy(character, scene, stage);
      assert.ok(copy.eyebrow && copy.title && copy.body, `missing stage copy for ${character.hanzi}`);
      const activeParts = getMnemonicStagePartIndices(character, stage);
      assert.ok(activeParts.every((index) => index >= 0 && index < parts));
    }
  }
});

test("mnemonic artwork is never cropped or hidden by its caption", async () => {
  const pageSource = (await Promise.all([
    "../app/features/character-study/character-study.tsx",
    "../app/features/practice-session/practice-session-view.tsx",
  ].map((path) => readFile(new URL(path, import.meta.url), "utf8")))).join("\n");
  const stylesheet = await readFile(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );
  const studySheet = await readFile(
    new URL("../app/study.css", import.meta.url),
    "utf8",
  );

  assert.match(pageSource, /className="study-scene-art"/);
  assert.match(pageSource, /className="memory-stage-art"/);
  assert.equal(
    (pageSource.match(/objectFit: "contain", objectPosition: "center"/g) ?? []).length,
    5,
    "all full-view learning image families need an inline contain override",
  );
  assert.match(studySheet, /\.study-scene img\s*\{[^}]*object-fit:\s*contain/s);
  assert.match(studySheet, /\.memory-stage-scene img\s*\{[^}]*object-fit:\s*contain/s);
  assert.match(stylesheet, /\.meaning-illustration img\s*\{[^}]*object-fit:\s*contain/s);
  // The spotlight dims with a gradient; it must never scale or crop the plate.
  assert.doesNotMatch(studySheet, /\.memory-stage-scene[^{]*\{[^}]*transform:\s*scale/s);
  assert.doesNotMatch(stylesheet, /\.choice-card:hover \.meaning-illustration img\s*\{[^}]*transform:/s);
  // The caption is a pill in the corner, not a bar across the artwork.
  assert.match(studySheet, /\.study-scene-caption\s*\{[^}]*position:\s*absolute/s);
});

test("the public learning catalog preserves the course and practice-route structure", async () => {
  const publicCatalogSources = await Promise.all([
    "../app/data/grade5-volume1-generated.ts",
    "../app/data/extension-characters.ts",
    "../app/data/extension-components.ts",
    "../app/data/generated/grade5-volume1/lessons/g5v1-l01.ts",
  ].map((path) => readFile(new URL(path, import.meta.url), "utf8")));
  const publicCatalog = publicCatalogSources.join("\n");

  assert.match(publicCatalog, /grade5Characters|extensionCharacters/);
  assert.match(publicCatalog, /grade5Components|extensionComponents/);
  assert.match(publicCatalog, /"识字小测"/);
  assert.match(publicCatalog, /"拆一拆"/);
  assert.match(publicCatalog, /"红蓝字"/);
  assert.match(publicCatalog, /"空间结构"/);
  assert.doesNotMatch(publicCatalog, /auth_key|course-assets|access_token/i);
  assert.doesNotMatch(publicCatalog, /password\s*[:=]|account\s*[:=]/i);

  const { characters, components, lessons } = await import(
    new URL("../app/data/catalog.ts", import.meta.url).href,
  );
  const { getTrackExercises } = await import(
    new URL("../app/domain/practice.ts", import.meta.url).href,
  );
  const primary = characters.filter((character) => character.primary);
  const official = characters.filter((character) => character.official !== false);
  const countWithOrigin = (origin) =>
    primary.filter((character) =>
      character.exercises.some((exercise) => exercise.origin === origin),
    ).length;
  const countWithAnyOrigin = (origins) =>
    primary.filter((character) =>
      character.exercises.some((exercise) => origins.includes(exercise.origin)),
    ).length;

  assert.equal(lessons.length, 26);
  assert.equal(characters.length, 430);
  assert.equal(new Set(characters.map((character) => character.hanzi)).size, 423);
  assert.equal(official.length, 365);
  assert.equal(new Set(official.map((character) => character.hanzi)).size, 359);
  assert.ok(components.length >= 379);
  assert.equal(lessons.reduce((sum, lesson) => sum + lesson.recognitionCount, 0), 200);
  assert.equal(lessons.reduce((sum, lesson) => sum + lesson.polyphonicCount, 0), 16);
  assert.equal(lessons.reduce((sum, lesson) => sum + lesson.writingCount, 0), 220);
  assert.equal(lessons.filter((lesson) => lesson.skimming).length, 6);
  for (const lesson of lessons) {
    assert.ok(lesson.mode, `missing lesson mode for ${lesson.title}`);
    assert.equal(lesson.learningPath?.length, 3, `missing learning path for ${lesson.title}`);
  }
  for (const lesson of lessons.filter((item) => item.skimming)) {
    assert.equal(lesson.writingCount, 0, `skimming lesson should not require writing: ${lesson.title}`);
  }
  assert.equal(countWithAnyOrigin(["识字小测", "科学复习"]), 430);
  assert.equal(countWithOrigin("拆一拆"), 394);
  assert.equal(primary.filter((character) => getTrackExercises(character, "split").length > 0).length, 430);
  assert.equal(countWithOrigin("红蓝字"), 430);
  assert.equal(countWithOrigin("空间结构"), 430);

  const polyphonic = official.filter((character) => character.polyphonic);
  assert.equal(polyphonic.length, 16);
  const expectedPolyphonicContexts = {
    "5:间": ["间隔", "jiàn"],
    "6:强": ["强迫", "qiǎng"],
    "6:划": ["计划", "huà"],
    "6:削": ["削弱", "xuē"],
    "7:冠": ["冠军", "guàn"],
    "8:任": ["任丘", "rén"],
    "10:落": ["落在后边", "là"],
    "15:哼": ["哼", "hng"],
    "21:更": ["一更", "gēng"],
    "23:悄": ["悄没声儿", "qiǎo"],
    "23:累": ["累累", "léi"],
    "24:识": ["默而识之", "zhì"],
    "25:传": ["传记", "zhuàn"],
    "25:卷": ["试卷", "juàn"],
    "26:差": ["差事", "chāi"],
    "26:奔": ["奔向", "bēn"],
  };
  for (const character of polyphonic) {
    assert.deepEqual(
      [character.word, character.pinyin],
      expectedPolyphonicContexts[`${character.lessonPosition}:${character.hanzi}`],
      `wrong textbook reading for ${character.hanzi}`,
    );
    const question = character.exercises.find((exercise) => exercise.id.endsWith("words-pronunciation"));
    assert.ok(question, `missing pronunciation question for ${character.hanzi}`);
    assert.equal(question.options.filter((option) => option.correct).length, 1);
    assert.equal(question.options.find((option) => option.correct)?.text, character.pinyin);
  }

  for (const character of primary.filter((item) =>
    item.exercises.some((exercise) => exercise.origin === "识字小测"),
  )) {
    const kinds = new Set(
      character.exercises
        .filter((exercise) => exercise.origin === "识字小测")
        .map((exercise) => exercise.kind),
    );
    assert.ok(kinds.has("single"));
    assert.ok(kinds.has("structure"));
    if (character.curriculumRole === "write" || character.official === false) {
      assert.ok(kinds.has("write"));
    } else {
      assert.ok(!kinds.has("write"));
    }
  }
});

test("localized historical glyph, red-blue, pronunciation, and timing resources are complete and unsigned", async () => {
  const { heritageAssets } = await import(
    new URL("../app/data/heritage-assets.ts", import.meta.url).href,
  );
  const records = Object.values(heritageAssets);
  const paths = records.flatMap((record) => [
    ...record.stages.map((stage) => stage.src),
    ...(record.redBlue ? [record.redBlue] : []),
  ]);

  assert.equal(records.length, 58);
  assert.equal(paths.length, 332);
  assert.equal(new Set(paths).size, paths.length);
  for (const path of paths) await access(new URL(`../public${path}`, import.meta.url));

  const source = await readFile(new URL("../app/data/heritage-assets.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /auth_key|access_token|authorization|password|account_number/i);
});

test("narration timing becomes a punctuated, phrase-paced reading transcript", async () => {
  const {
    activeNarrationMarkIndices,
    activeNarrationPhraseIndex,
    buildNarrationTokens,
    narrationPhraseIndexByMark,
  } = await import(
    new URL("../app/lib/narration.ts", import.meta.url).href,
  );
  const marks = [
    { char: "封", start: 0.42, end: 0.68 },
    { char: "封", start: 1.3, end: 1.46 },
    { char: "锁", start: 1.54, end: 1.62 },
    { char: "的", start: 1.68, end: 1.74 },
    { char: "封", start: 1.82, end: 2 },
    { char: "会", start: 2.82, end: 2.98 },
    { char: "意", start: 3.06, end: 3.12 },
    { char: "字", start: 3.26, end: 3.38 },
  ];
  const tokens = buildNarrationTokens(marks);

  assert.equal(tokens.map((token) => token.text).join(""), "封，封锁的封。会意字。");
  assert.equal(tokens.filter((token) => token.kind === "character").length, marks.length);
  assert.ok(tokens.every((token) => token.completionTime >= 0));

  const authoredTokens = buildNarrationTokens(marks, "封，封锁的封。会意字。");
  assert.equal(authoredTokens.map((token) => token.text).join(""), "封，封锁的封。会意字。");
  const phraseByMark = narrationPhraseIndexByMark(authoredTokens);
  assert.deepEqual(phraseByMark, [0, 1, 1, 1, 1, 2, 2, 2]);
  assert.equal(activeNarrationPhraseIndex(marks, 1.55, phraseByMark), 1);
  assert.equal(activeNarrationPhraseIndex(marks, 2.5, phraseByMark), 2);
  assert.equal(activeNarrationPhraseIndex(marks, 4, phraseByMark), 2);

  const groupedMarks = [
    { char: "默", start: 0, end: 1, alignment_group: 7, alignment_group_text: "默而" },
    { char: "而", start: 0.8, end: 1.8, alignment_group: 7, alignment_group_text: "默而" },
    { char: "识", start: 2, end: 3 },
  ];
  assert.deepEqual(activeNarrationMarkIndices(groupedMarks, 0.5), [0, 1]);
  assert.deepEqual(activeNarrationMarkIndices(groupedMarks, 2.5), [2]);
  assert.deepEqual(activeNarrationMarkIndices(groupedMarks, 3), []);

  const pageSource = await Promise.all([
    "../app/features/character-study/character-study.tsx",
    "../app/domain/narration-media.ts",
  ].map((path) => readFile(new URL(path, import.meta.url), "utf8"))).then((sources) => sources.join("\n"));
  assert.match(pageSource, /requestAnimationFrame\(sampleAudioTime\)/);
  assert.match(pageSource, /is-complete/);
  assert.match(pageSource, /activeMarkIndices\.has\(token\.markIndex\)/);
  assert.match(pageSource, /narration-v5-fish-s2\.1-pro-free-20260824/);
  assert.match(pageSource, /is-current-phrase/);
  assert.doesNotMatch(pageSource, /onEnded=\{\(\) => \{[\s\S]*setElapsed\(0\)/);
});

test("every character record has a complete Feng-voice narration and authored timeline", async () => {
  const { characters } = await import(
    new URL("../app/data/catalog.ts", import.meta.url).href,
  );
  const { narrationAssets } = await import(
    new URL("../app/data/narration-assets.ts", import.meta.url).href,
  );
  const { buildNarrationTokens } = await import(
    new URL("../app/lib/narration.ts", import.meta.url).href,
  );
  const { releasedNarrationTranscripts } = await import(
    new URL("../app/data/released-narration-transcripts.generated.ts", import.meta.url).href,
  );

  assert.equal(characters.length, 430);
  assert.equal(Object.keys(narrationAssets).length, characters.length);
  assert.equal(Object.keys(releasedNarrationTranscripts).length, characters.length);
  assert.equal(new Set(Object.values(narrationAssets).map((asset) => asset.audio)).size, 430);

  for (const character of characters) {
    const asset = narrationAssets[character.id];
    assert.ok(asset, `missing narration mapping for ${character.hanzi} (${character.id})`);
    assert.equal(asset.voice, "封");
    assert.match(asset.audio, /\/audio\.webm$/u);
    await access(new URL(`../release${asset.audio}`, import.meta.url));
    await access(new URL(`../release${asset.audioMarks}`, import.meta.url));

    const payload = JSON.parse(
      await readFile(new URL(`../release${asset.audioMarks}`, import.meta.url), "utf8"),
    );
    assert.equal(payload.voice_reference, "封");
    if (payload.script_version === "narration-fish-v1") {
      assert.equal(payload.model, "fishaudio/s2.1-pro-free");
      assert.equal(payload.model_revision, "s2.1-pro-free");
      assert.equal(payload.timing_source, "qwen3-forced-aligner");
    } else {
      assert.equal(payload.script_version, "narration-v3");
      assert.equal(payload.model, "mlx-community/Qwen3-TTS-12Hz-1.7B-Base-4bit");
      assert.equal(payload.model_revision, "37e955a1deb861c088ae5f3a67043185f3d1a60c");
    }
    assert.equal(payload.transcript, releasedNarrationTranscripts[character.id].transcript);
    assert.ok(Array.isArray(payload.marks) && payload.marks.length > 0, `missing marks for ${character.hanzi}`);
    assert.ok(typeof payload.transcript === "string" && payload.transcript.length > 0);
    assert.match(payload.transcript, /[，。！？；：、]/u, `missing punctuation for ${character.hanzi}`);
    const spokenCount = Array.from(payload.transcript)
      .filter((char) => /[\p{L}\p{N}\p{Script=Han}]/u.test(char)).length;
    assert.equal(payload.marks.length, spokenCount, `incomplete marks for ${character.hanzi}`);
    assert.ok(
      payload.duration >= Math.max(2, spokenCount * 0.11)
        && payload.duration <= Math.max(5, spokenCount * 0.66 + 1.5) + 0.15,
      `unnatural narration duration for ${character.hanzi}: ${payload.duration}s`,
    );

    let priorStart = -1;
    for (const [index, mark] of payload.marks.entries()) {
      assert.equal(mark.index, index, `wrong mark index for ${character.hanzi}`);
      assert.equal(typeof mark.char, "string");
      assert.ok(Number.isFinite(mark.start) && Number.isFinite(mark.end));
      assert.ok(mark.start >= priorStart, `non-monotonic marks for ${character.hanzi}`);
      assert.ok(mark.end >= mark.start, `invalid mark duration for ${character.hanzi}`);
      priorStart = mark.start;
    }

    const renderedTranscript = buildNarrationTokens(payload.marks, payload.transcript)
      .map((token) => token.text)
      .join("");
    assert.equal(renderedTranscript, payload.transcript.replace(/\s/gu, ""));
  }

  const feng = characters.find((character) => character.hanzi === "封");
  assert.equal(
    narrationAssets[feng.id].audio,
    "/narration/019f0554-ea22-762e-966c-32d678fd6bf6/audio.webm",
  );
});

test("production output excludes release-only narration and superseded heritage copies", async () => {
  const { readdir } = await import("node:fs/promises");
  const heritageRoot = new URL("../dist/client/heritage/", import.meta.url);
  const entries = await readdir(heritageRoot, { recursive: true });
  assert.ok(entries.length > 0, "heritage glyph assets are missing");
  assert.ok(!entries.some((entry) => /(^|\/)audio(?:-marks\.json|\.mp3)$/u.test(entry)));
  await assert.rejects(
    access(new URL("../dist/client/narration/", import.meta.url)),
    (error) => error?.code === "ENOENT",
  );
});

test("route clients stay split instead of rebuilding a full learning engine", async () => {
  const { readdir, stat } = await import("node:fs/promises");
  const assetsRoot = new URL("../dist/client/assets/", import.meta.url);
  const entries = await readdir(assetsRoot);
  const homeEntry = entries.find((entry) => /^home-client-.*\.js$/u.test(entry));
  const experienceEntry = entries.find((entry) => /^experience-.*\.js$/u.test(entry));
  assert.ok(homeEntry, "compact home client entry is missing");
  assert.equal(experienceEntry, undefined, "legacy full learning engine was emitted again");
  const homeStat = await stat(new URL(homeEntry, assetsRoot));
  assert.ok(homeStat.size < 150_000, `home entry is too large: ${homeStat.size}`);
  const clientEntries = entries.filter((entry) => entry.endsWith(".js"));
  const clientStats = await Promise.all(clientEntries.map(async (entry) => ({
    entry,
    size: (await stat(new URL(entry, assetsRoot))).size,
  })));
  const largest = clientStats.sort((left, right) => right.size - left.size)[0];
  assert.ok(largest.size < 900_000, `route chunk is too large: ${largest.entry} (${largest.size})`);
});

test("versioned assets run through the cache-header worker path", async () => {
  const config = JSON.parse(
    await readFile(new URL("../dist/server/wrangler.json", import.meta.url), "utf8"),
  );
  assert.equal(config.assets.binding, "ASSETS");
  assert.deepEqual(config.assets.run_worker_first, [
    "/assets/*",
    "/fonts/*",
    "/illustrations/*",
    "/heritage/*",
    "/media/narration/*",
    "/sfx/*",
    "/og-cover.jpg",
  ]);
  const assetHeaders = await readFile(new URL("../dist/client/_headers", import.meta.url), "utf8");
  assert.match(assetHeaders, /\/fonts\/\*[\s\S]*Access-Control-Allow-Origin: \*/u);
});

test("mini-program font assets expose immutable CORS-safe responses", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", "font-suite");
  workerPromise ||= import(workerUrl.href).then((module) => module.default);
  const worker = await workerPromise;
  const response = await worker.fetch(
    new Request("http://localhost/fonts/lxgw-wenkai-subset.woff2"),
    {
      ASSETS: {
        fetch() {
          return Promise.resolve(new Response("font", {
            headers: { "content-type": "application/octet-stream" },
          }));
        },
      },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
  assert.equal(response.headers.get("content-type"), "font/woff2");
  assert.equal(response.headers.get("cache-control"), "public, max-age=31536000, immutable");
});

test("R2 narration delivery supports immutable byte ranges", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", "media-suite");
  workerPromise ||= import(workerUrl.href).then((module) => module.default);
  const worker = await workerPromise;
  const bytes = new TextEncoder().encode("knowing-word-narration");
  const media = {
    async head() {
      return { size: bytes.byteLength, httpEtag: '"narration-etag"' };
    },
    async get(_key, options) {
      const offset = options?.range?.offset || 0;
      const length = options?.range?.length || bytes.byteLength;
      return {
        body: new Response(bytes.slice(offset, offset + length)).body,
      };
    },
  };
  const response = await worker.fetch(
    new Request(
      "http://localhost/media/narration/v5/g5v1-l01-c01-u9e6d/audio.webm?v=test",
      { headers: { range: "bytes=0-6" } },
    ),
    { MEDIA: media },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(response.status, 206);
  assert.equal(response.headers.get("content-range"), `bytes 0-6/${bytes.byteLength}`);
  assert.equal(response.headers.get("cache-control"), "public, max-age=31536000, immutable");
  assert.equal(response.headers.get("x-knowing-word-media"), "r2");
  assert.equal((await response.arrayBuffer()).byteLength, 7);
});

test("mini-program M4A narration falls back to immutable Site assets", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", "media-suite");
  workerPromise ||= import(workerUrl.href).then((module) => module.default);
  const worker = await workerPromise;
  const response = await worker.fetch(
    new Request("http://localhost/media/narration/v5/g5v1-l01-c01-u9e6d/audio.m4a"),
    {
      MEDIA: { async head() { return null; } },
      ASSETS: {
        async fetch(request) {
          assert.equal(new URL(request.url).pathname, "/media/narration/v5/g5v1-l01-c01-u9e6d/audio.m4a");
          return new Response("m4a-bytes", { headers: { "content-type": "application/octet-stream" } });
        },
      },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "audio/mp4");
  assert.equal(response.headers.get("cache-control"), "public, max-age=31536000, immutable");
  assert.equal(response.headers.get("x-knowing-word-media"), "assets");
  assert.equal(await response.text(), "m4a-bytes");
});

test("missing mini-program narration is mirrored into Sites R2 with byte ranges", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", "media-suite");
  workerPromise ||= import(workerUrl.href).then((module) => module.default);
  const worker = await workerPromise;
  const bytes = new TextEncoder().encode("mirrored-m4a-bytes");
  let storedKey = "";
  let sourceUrl = "";
  const response = await worker.fetch(
    new Request("http://localhost/media/narration/v5/g5v1-l01-c01-u9e6d/audio.m4a", {
      headers: { range: "bytes=2-5" },
    }),
    {
      MEDIA: {
        async head() { return null; },
        async put(key, value, options) {
          storedKey = key;
          assert.equal(value.byteLength, bytes.byteLength);
          assert.equal(options.httpMetadata.contentType, "audio/mp4");
          return { httpEtag: '"mirrored-etag"' };
        },
      },
      ASSETS: { async fetch() { return new Response("missing", { status: 404 }); } },
      NARRATION_SOURCE: {
        async fetch(request) {
          sourceUrl = request.url;
          return new Response(bytes, {
            headers: { "content-length": String(bytes.byteLength) },
          });
        },
      },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(response.status, 206);
  assert.equal(response.headers.get("content-range"), `bytes 2-5/${bytes.byteLength}`);
  assert.equal(response.headers.get("x-knowing-word-media"), "r2");
  assert.equal(await response.text(), "rror");
  assert.equal(storedKey, "built-in/narration/v5/g5v1-l01-c01-u9e6d/audio.m4a");
  assert.match(sourceUrl, /\/0e30da7f66f68b92bc06dcfed857cfc31a64b89d\/release\/miniprogram-narration-aac32\//u);
});
