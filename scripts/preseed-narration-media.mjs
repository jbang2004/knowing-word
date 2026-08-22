import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { narrationAssets } from "../app/data/narration-assets.ts";

const projectRoot = resolve(import.meta.dirname, "..");
const narrationVersion = "v3";
const narrationSourceRoot = resolve(
  process.env.NARRATION_SOURCE_ROOT || join(projectRoot, "public/narration"),
);
const siteUrl = (process.env.SITE_URL || process.argv[2] || "").replace(/\/+$/, "");
if (!/^https?:\/\//.test(siteUrl)) {
  throw new Error("Pass the current deployed site URL through SITE_URL or as the first argument.");
}

const cookiePath = join(projectRoot, ".wrangler/narration-seed-cookie");
let cookie = process.env.SEED_COOKIE || "";
if (!cookie) {
  try {
    cookie = (await readFile(cookiePath, "utf8")).trim();
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

const relativePaths = [...new Set(
  Object.values(narrationAssets)
    .flatMap((asset) => [asset.audio, asset.audioMarks])
    .map((source) => source.replace(/^\/narration\//, "")),
)];

async function request(path, init) {
  const headers = new Headers(init?.headers);
  if (cookie) headers.set("cookie", cookie);
  const response = await fetch(`${siteUrl}${path}`, { ...init, headers });
  const setCookie = response.headers.get("set-cookie")?.split(";", 1)[0];
  if (setCookie && !cookie) {
    cookie = setCookie;
    await mkdir(dirname(cookiePath), { recursive: true });
    await writeFile(cookiePath, `${cookie}\n`, { mode: 0o600 });
  }
  return response;
}

function seedTag(relative) {
  return `builtin:narration:${narrationVersion}:${relative}`;
}

async function isSeeded(relative) {
  const response = await request(
    `/api/recordings?lessonId=${encodeURIComponent(seedTag(relative))}`,
    { cache: "no-store" },
  );
  if (!response.ok) throw new Error(`Seed lookup failed: ${response.status}`);
  const payload = await response.json();
  return Array.isArray(payload.recordings) && payload.recordings.length > 0;
}

async function upload(relative) {
  if (await isSeeded(relative)) return "reused";
  const bytes = await readFile(join(narrationSourceRoot, relative));
  const response = await request(
    `/api/recordings?lessonId=${encodeURIComponent(seedTag(relative))}`,
    {
      method: "POST",
      headers: { "content-type": "audio/webm" },
      body: bytes,
    },
  );
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Seed upload failed: ${response.status} ${detail.slice(0, 180)}`);
  }
  return "uploaded";
}

// Establish one isolated device identity before concurrent uploads begin.
if (!cookie) await isSeeded(relativePaths[0]);

const queue = [...relativePaths];
let completed = 0;
let reused = 0;
const failures = [];

async function worker() {
  while (queue.length) {
    const relative = queue.shift();
    if (!relative) return;
    try {
      if (await upload(relative) === "reused") reused += 1;
      completed += 1;
      if (completed % 50 === 0 || completed === relativePaths.length) {
        process.stdout.write(`Pre-seeded ${completed}/${relativePaths.length} narration objects.\n`);
      }
    } catch (error) {
      failures.push(`${relative}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

await Promise.all(Array.from({ length: 6 }, () => worker()));

if (failures.length) {
  throw new Error(`Failed to pre-seed ${failures.length} objects:\n${failures.slice(0, 20).join("\n")}`);
}
process.stdout.write(`R2 migration seed ready: ${completed} checked, ${reused} already present.\n`);
