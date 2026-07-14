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

test("server-renders the Knowing Word learning experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Knowing Word/i);
  assert.match(html, /看见每一个字的故事/);
  assert.match(html, /KNOWING/);
  assert.match(html, /汉字故事实验室/);
});

test("the public learning catalog has no account data or signed media URLs", async () => {
  const catalog = await readFile(
    new URL("../app/data/catalog.ts", import.meta.url),
    "utf8",
  );

  assert.match(catalog, /"characters": \[/);
  assert.match(catalog, /"components": \[/);
  assert.doesNotMatch(catalog, /auth_key|course-assets|access_token/i);
  assert.doesNotMatch(catalog, /13928119432|yulin\.happy/i);
});
