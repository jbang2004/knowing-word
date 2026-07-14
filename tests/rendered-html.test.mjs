import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", String(Date.now()));
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
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
  assert.doesNotMatch(catalog, /REDACTED_ACCOUNT|REDACTED_PASSWORD/i);

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
