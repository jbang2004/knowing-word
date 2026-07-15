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
  assert.match(html, /课程地图与汉字闯关/);
  assert.match(html, /KNOWING/);
  assert.match(html, /四条学习路线/);
  assert.match(html, /词语表与写字表/);
  assert.match(html, /课后练习/);
  assert.match(html, /红蓝练习/);
  assert.match(html, /空间结构/);
  assert.match(html, /日日朗读/);
});

test("all 210 source routes server-render with real, shareable URLs", async () => {
  const { characters, lessons } = await import(
    new URL("../app/data/catalog.ts", import.meta.url).href,
  );
  const sourceCharacters = characters.filter((character) => character.primary && character.ready);
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
    routes.push(
      `/lessons/${character.lessonId}/words/${character.id}`,
      `/lessons/${character.lessonId}/words/${character.id}/quizzes`,
      `/honglan-exercise/${character.lessonId}/lesson_words/${character.id}`,
      `/split-exercise/${character.lessonId}/words/${character.id}`,
      `/space-structure-exercise/${character.lessonId}/lesson_words/${character.id}`,
    );
  }

  assert.equal(sourceCharacters.length, 37);
  assert.equal(routes.length, 210);
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
  const allGlyphs = new Set(characters.map((character) => character.hanzi));

  assert.equal(uniqueGlyphs.size, 37);
  assert.equal(allGlyphs.size, 76);
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
  assert.equal(Object.keys(lessonVisuals).length, lessons.length);

  for (const glyph of allGlyphs) {
    const visual = characterVisuals[glyph];
    assert.ok(visual, `missing character-study visual for ${glyph}`);
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
  const countWithOrigin = (origin) =>
    primary.filter((character) =>
      character.exercises.some((exercise) => exercise.origin === origin),
    ).length;

  assert.equal(lessons.length, 3);
  assert.equal(characters.length, 80);
  assert.equal(components.length, 79);
  assert.equal(countWithOrigin("识字小测"), 38);
  assert.equal(countWithOrigin("拆一拆"), 38);
  assert.equal(countWithOrigin("红蓝字"), 77);
  assert.equal(countWithOrigin("空间结构"), 77);

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
    assert.ok(kinds.has("write"));
  }
});

test("localized historical glyph, red-blue, and pronunciation resources are complete and unsigned", async () => {
  const { heritageAssets } = await import(
    new URL("../app/data/heritage-assets.ts", import.meta.url).href,
  );
  const records = Object.values(heritageAssets);
  const paths = records.flatMap((record) => [
    ...record.stages.map((stage) => stage.src),
    ...(record.redBlue ? [record.redBlue] : []),
    ...(record.audio ? [record.audio] : []),
  ]);

  assert.equal(records.length, 58);
  assert.equal(paths.length, 385);
  assert.equal(new Set(paths).size, paths.length);
  for (const path of paths) await access(new URL(`../public${path}`, import.meta.url));

  const source = await readFile(new URL("../app/data/heritage-assets.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /auth_key|access_token|authorization|password|13928119432/i);
});
