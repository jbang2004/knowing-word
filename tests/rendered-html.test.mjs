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

test("server-renders the course-first Knowing Word learning experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Knowing Word/i);
  assert.match(html, /五年级上册 26 课汉字学习地图/);
  assert.match(html, /KNOWING/);
  assert.match(html, /五条线索/);
  assert.match(html, /词语表与写字表/);
  assert.match(html, /课后练习/);
  assert.match(html, /红蓝练习/);
  assert.match(html, /空间结构/);
  assert.match(html, /日日朗读/);
});

test("character pages render the complete picture-to-character memory flow", async () => {
  const response = await render(
    "/lessons/g5v1-l01/words/g5v1-l01-c01-u9e6d",
  );
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /图中嵌字/);
  assert.match(html, /长进画面里/);
  assert.match(html, /先看本义场景/);
  assert.match(html, /找部首/);
  assert.match(html, /找部件/);
  assert.match(html, /合成字/);
  assert.match(html, /听字义讲解/);
  assert.match(html, /audio\/webm; codecs=&quot;opus&quot;/);
  assert.match(html, /audio\.webm\?v=child-first-v2/);
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
    "/playground/kit",
    "/playground/lesson",
    "/playground/puzzle",
    "/playground/quiz",
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
  assert.equal(routes.length, 2007);
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
      const copy = getMnemonicStageCopy(character, stage);
      assert.ok(copy.eyebrow && copy.title && copy.body, `missing stage copy for ${character.hanzi}`);
      const activeParts = getMnemonicStagePartIndices(character, stage);
      assert.ok(activeParts.every((index) => index >= 0 && index < parts));
    }
  }
});

test("mnemonic artwork is never cropped or hidden by its caption", async () => {
  const pageSource = await readFile(
    new URL("../app/page.tsx", import.meta.url),
    "utf8",
  );
  const stylesheet = await readFile(
    new URL("../app/globals.css", import.meta.url),
    "utf8",
  );

  assert.match(pageSource, /className="mnemonic-art-frame"/);
  assert.match(pageSource, /className="mnemonic-scene-art"/);
  assert.equal(
    (pageSource.match(/objectFit: "contain", objectPosition: "center"/g) ?? []).length,
    4,
    "all full-view learning image families need an inline contain override",
  );
  assert.match(stylesheet, /\.mnemonic-scene-art\s*\{[^}]*object-fit:\s*contain/s);
  assert.match(stylesheet, /\.meaning-illustration img\s*\{[^}]*object-fit:\s*contain/s);
  assert.doesNotMatch(stylesheet, /\.mnemonic-scene\.stage-[^{]+\{[^}]*transform:\s*scale/s);
  assert.doesNotMatch(stylesheet, /\.choice-card:hover \.meaning-illustration img\s*\{[^}]*transform:/s);
  assert.match(stylesheet, /\.mnemonic-scene figcaption\s*\{[^}]*background:\s*#18223a/s);
});

test("the public learning catalog preserves the course and practice-route structure", async () => {
  const catalog = await readFile(
    new URL("../app/data/catalog.ts", import.meta.url),
    "utf8",
  );

  assert.match(catalog, /"characters": \[/);
  assert.match(catalog, /"components": \[/);
  assert.match(catalog, /"识字小测"/);
  assert.match(catalog, /"拆一拆"/);
  assert.match(catalog, /"红蓝字"/);
  assert.match(catalog, /"空间结构"/);
  assert.doesNotMatch(catalog, /auth_key|course-assets|access_token/i);
  assert.doesNotMatch(catalog, /password\s*[:=]|account\s*[:=]/i);

  const { characters, components, lessons } = await import(
    new URL("../app/data/catalog.ts", import.meta.url).href,
  );
  const primary = characters.filter((character) => character.primary);
  const official = characters.filter((character) => character.official !== false);
  const countWithOrigin = (origin) =>
    primary.filter((character) =>
      character.exercises.some((exercise) => exercise.origin === origin),
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
  assert.equal(countWithOrigin("识字小测"), 394);
  assert.equal(countWithOrigin("拆一拆"), 394);
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
    ...(record.audio ? [record.audio] : []),
    ...(record.audioMarks ? [record.audioMarks] : []),
  ]);

  assert.equal(records.length, 58);
  assert.equal(paths.length, 438);
  assert.equal(new Set(paths).size, paths.length);
  for (const path of paths) await access(new URL(`../public${path}`, import.meta.url));

  const markedRecords = records.filter((record) => record.audioMarks);
  assert.equal(markedRecords.length, 53);
  for (const record of markedRecords) {
    const payload = JSON.parse(
      await readFile(new URL(`../public${record.audioMarks}`, import.meta.url), "utf8"),
    );
    assert.ok(Array.isArray(payload.marks) && payload.marks.length > 0);
    payload.marks.forEach((mark, index) => {
      assert.equal(typeof mark.char, "string");
      assert.ok(mark.end >= mark.start, `invalid timing mark ${index}`);
    });
  }

  const source = await readFile(new URL("../app/data/heritage-assets.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /auth_key|access_token|authorization|password|account_number/i);
});

test("narration timing becomes a punctuated, persistent reading transcript", async () => {
  const { buildNarrationTokens } = await import(
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

  const pageSource = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(pageSource, /requestAnimationFrame\(sampleAudioTime\)/);
  assert.match(pageSource, /is-complete/);
  assert.match(pageSource, /withAssetVersion/);
  assert.match(pageSource, /character\.official !== false \? "child-first-v2" : "child-first-v1"/);
  assert.doesNotMatch(pageSource, /onEnded=\{\(\) => \{[\s\S]*setElapsed\(0\)/);
});

test("all narration scripts use the child-first four-beat teaching structure", async () => {
  const { characters } = await import(
    new URL("../app/data/catalog.ts", import.meta.url).href,
  );
  const { heritageAssets } = await import(
    new URL("../app/data/heritage-assets.ts", import.meta.url).href,
  );
  const { narrationScripts } = await import(
    new URL("../app/data/narration-scripts.ts", import.meta.url).href,
  );
  const { buildNarrationTokens } = await import(
    new URL("../app/lib/narration.ts", import.meta.url).href,
  );

  const uniqueCharacters = [...new Map(
    characters.map((character) => [character.hanzi, character]),
  ).values()];
  assert.equal(uniqueCharacters.length, 423);
  assert.deepEqual(new Set(Object.keys(narrationScripts)), new Set(uniqueCharacters.map((item) => item.hanzi)));

  const longestSharedSpan = (left, right) => {
    const a = Array.from(left);
    const b = Array.from(right);
    const previous = new Uint16Array(b.length + 1);
    const current = new Uint16Array(b.length + 1);
    let longest = 0;
    for (let row = 1; row <= a.length; row += 1) {
      current.fill(0);
      for (let column = 1; column <= b.length; column += 1) {
        if (a[row - 1] === b[column - 1]) {
          current[column] = previous[column - 1] + 1;
          longest = Math.max(longest, current[column]);
        }
      }
      previous.set(current);
    }
    return longest;
  };

  for (const character of uniqueCharacters) {
    const script = narrationScripts[character.hanzi];
    const length = Array.from(script).length;
    const [minimumLength, maximumLength] = character.official !== false
      ? [80, 230]
      : [33, 115];
    assert.ok(
      length >= minimumLength && length <= maximumLength,
      `wrong child-first length for ${character.hanzi}: ${length}`,
    );
    if (character.polyphonic) {
      assert.ok(script.startsWith(`先读“${character.word}”`), `missing contextual opening for ${character.hanzi}`);
    } else {
      assert.ok(script.startsWith(`${character.hanzi}，`), `missing spoken opening for ${character.hanzi}`);
    }
    assert.ok((script.match(/[。！？]/gu) || []).length >= 4, `missing four teaching beats for ${character.hanzi}`);
    assert.notEqual(script, character.description, `catalog prose copied verbatim into ${character.hanzi}`);
    assert.ok(longestSharedSpan(script, character.originalText) <= 18, `lesson text copied into ${character.hanzi}`);
    assert.doesNotMatch(script, /声符[“"]?貧|刺瞎|就是这样造出来|真正的造字过程/u);
    assert.doesNotMatch(script, /看图找部件|故事道具|轮廓像/u);

    const sourceMarksPath = heritageAssets[character.id]?.audioMarks;
    if (sourceMarksPath) {
      const payload = JSON.parse(
        await readFile(new URL(`../public${sourceMarksPath}`, import.meta.url), "utf8"),
      );
      const sourceTranscript = buildNarrationTokens(payload.marks).map((token) => token.text).join("");
      assert.ok(longestSharedSpan(script, sourceTranscript) <= 12, `source narration copied into ${character.hanzi}`);
    }
  }

  for (const character of uniqueCharacters) {
    const words = characters.filter((item) => item.hanzi === character.hanzi).map((item) => item.word);
    assert.ok(
      words.some((word) => narrationScripts[character.hanzi].includes(word))
        || words.some((word) => word.includes(character.hanzi)),
      `missing course context for ${character.hanzi}`,
    );
  }
});

test("every character record has a complete Feng-voice narration and authored timeline", async () => {
  const { characters } = await import(
    new URL("../app/data/catalog.ts", import.meta.url).href,
  );
  const { narrationAssets } = await import(
    new URL("../app/data/narration-assets.ts", import.meta.url).href,
  );
  const { narrationScripts } = await import(
    new URL("../app/data/narration-scripts.ts", import.meta.url).href,
  );
  const { buildNarrationTokens } = await import(
    new URL("../app/lib/narration.ts", import.meta.url).href,
  );

  assert.equal(characters.length, 430);
  assert.equal(Object.keys(narrationAssets).length, characters.length);
  assert.equal(new Set(Object.values(narrationAssets).map((asset) => asset.audio)).size, 423);

  const audioByGlyph = new Map();
  for (const character of characters) {
    const asset = narrationAssets[character.id];
    assert.ok(asset, `missing narration mapping for ${character.hanzi} (${character.id})`);
    assert.equal(asset.voice, "封");
    assert.match(asset.audio, /\/audio\.webm$/u);
    await access(new URL(`../public${asset.audio}`, import.meta.url));
    await access(new URL(`../public${asset.audioMarks}`, import.meta.url));

    const priorAudio = audioByGlyph.get(character.hanzi);
    if (priorAudio) assert.equal(asset.audio, priorAudio, `duplicate glyph audio differs for ${character.hanzi}`);
    else audioByGlyph.set(character.hanzi, asset.audio);

    const payload = JSON.parse(
      await readFile(new URL(`../public${asset.audioMarks}`, import.meta.url), "utf8"),
    );
    assert.equal(payload.voice_reference, "封");
    assert.equal(
      payload.script_version,
      character.official !== false ? "child-first-v2" : "child-first-v1",
    );
    assert.equal(payload.transcript, narrationScripts[character.hanzi]);
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

  assert.equal(audioByGlyph.size, 423);
  const feng = characters.find((character) => character.hanzi === "封");
  assert.equal(
    narrationAssets[feng.id].audio,
    "/narration/019f0554-ea22-762e-966c-32d678fd6bf6/audio.webm",
  );
});

test("production output excludes superseded heritage narration copies", async () => {
  const { readdir } = await import("node:fs/promises");
  const heritageRoot = new URL("../dist/client/heritage/", import.meta.url);
  const entries = await readdir(heritageRoot, { recursive: true });
  assert.ok(entries.length > 0, "heritage glyph assets are missing");
  assert.ok(!entries.some((entry) => /(^|\/)audio(?:-marks\.json|\.mp3)$/u.test(entry)));
});
