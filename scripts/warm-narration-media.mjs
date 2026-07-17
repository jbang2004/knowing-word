import { narrationAssets } from "../app/data/narration-assets.ts";

const siteUrl = (process.env.SITE_URL || process.argv[2] || "").replace(/\/+$/, "");
if (!/^https?:\/\//.test(siteUrl)) {
  throw new Error("Pass the deployed site URL through SITE_URL or as the first argument.");
}

const mediaPaths = [...new Set(
  Object.values(narrationAssets)
    .flatMap((asset) => [asset.audio, asset.audioMarks])
    .map((source) => source.replace(/^\/narration\//, "/media/narration/v2/")),
)];

let completed = 0;
let reused = 0;
const failures = [];
const queue = [...mediaPaths];

async function warm(path) {
  const url = `${siteUrl}${path}`;
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "accept-encoding": "identity",
      range: "bytes=0-0",
    },
  });
  if (response.status !== 206 || response.headers.get("x-knowing-word-media") !== "r2") {
    throw new Error(`${response.status} ${response.statusText}: media did not resolve from R2`);
  }
  if (Number(response.headers.get("content-length")) !== 1) {
    throw new Error("R2 byte-range verification returned an unexpected payload");
  }
  await response.arrayBuffer();
}

async function worker() {
  while (queue.length) {
    const path = queue.shift();
    if (!path) return;
    try {
      await warm(path);
      completed += 1;
      if (completed % 50 === 0 || completed === mediaPaths.length) {
        process.stdout.write(`Warmed ${completed}/${mediaPaths.length} narration objects.\n`);
      }
    } catch (error) {
      failures.push(`${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

await Promise.all(Array.from({ length: 8 }, () => worker()));

if (failures.length) {
  throw new Error(`Failed to warm ${failures.length} objects:\n${failures.slice(0, 20).join("\n")}`);
}

process.stdout.write(`Narration media ready: ${completed} checked, ${reused} already present.\n`);
