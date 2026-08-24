import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { narrationAssets } from "../app/data/narration-assets.ts";

const run = promisify(execFile);
const projectRoot = resolve(import.meta.dirname, "..");
const narrationVersion = "v4";
const narrationSourceRoot = resolve(
  process.env.NARRATION_SOURCE_ROOT || join(projectRoot, "release/narration"),
);
const wranglerConfig = resolve(
  process.env.WRANGLER_CONFIG || join(projectRoot, "dist/server/wrangler.json"),
);
const wrangler = join(projectRoot, "node_modules/.bin/wrangler");
const config = JSON.parse(await readFile(wranglerConfig, "utf8"));
const mediaBinding = config.r2_buckets?.find((binding) => binding.binding === "MEDIA");
const bucketName = process.env.R2_BUCKET || mediaBinding?.bucket_name;
if (!bucketName) throw new Error("The MEDIA R2 bucket is missing from the production Wrangler config.");

const relativePaths = [...new Set(
  Object.values(narrationAssets)
    .flatMap((asset) => [asset.audio, asset.audioMarks])
    .map((source) => source.replace(/^\/narration\//, "")),
)];

function contentType(relative) {
  return relative.endsWith(".webm")
    ? "audio/webm; codecs=opus"
    : "application/json; charset=utf-8";
}

async function upload(relative) {
  const source = join(narrationSourceRoot, relative);
  const objectPath = `${bucketName}/built-in/narration/${narrationVersion}/${relative}`;
  await run(wrangler, [
    "r2",
    "object",
    "put",
    objectPath,
    "--file",
    source,
    "--content-type",
    contentType(relative),
    "--cache-control",
    "public, max-age=31536000, immutable",
    "--remote",
    "--force",
    "--config",
    wranglerConfig,
  ], { cwd: projectRoot, maxBuffer: 2 * 1024 * 1024 });
}

const queue = [...relativePaths];
const failures = [];
let completed = 0;

async function uploadWorker() {
  while (queue.length) {
    const relative = queue.shift();
    if (!relative) return;
    try {
      await upload(relative);
      completed += 1;
      if (completed % 50 === 0 || completed === relativePaths.length) {
        process.stdout.write(`Uploaded ${completed}/${relativePaths.length} narration objects.\n`);
      }
    } catch (error) {
      failures.push(`${relative}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

await Promise.all(Array.from({ length: 4 }, () => uploadWorker()));
if (failures.length) {
  throw new Error(`Failed to upload ${failures.length} objects:\n${failures.slice(0, 20).join("\n")}`);
}
process.stdout.write(`Narration media published directly to R2: ${completed} objects.\n`);
