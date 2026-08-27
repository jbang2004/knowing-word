import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { narrationAssets } from "../app/data/narration-assets.ts";

const run = promisify(execFile);
const projectRoot = resolve(import.meta.dirname, "..");
const sourceRoot = resolve(projectRoot, "release/miniprogram-narration-aac32");
const wranglerConfig = resolve(process.env.WRANGLER_CONFIG || join(projectRoot, "dist/server/wrangler.json"));
const wrangler = join(projectRoot, "node_modules/.bin/wrangler");
const config = JSON.parse(await readFile(wranglerConfig, "utf8"));
const mediaBinding = config.r2_buckets?.find((binding) => binding.binding === "MEDIA");
const bucketName = process.env.R2_BUCKET || mediaBinding?.bucket_name;
if (!bucketName) throw new Error("The MEDIA R2 bucket is missing from the production Wrangler config.");
if (bucketName === "site-creator-r2" && !process.env.R2_BUCKET) {
  throw new Error("The Sites R2 binding is managed by the platform. Set R2_BUCKET only when publishing to a directly accessible bucket.");
}

const relativePaths = [...new Set(
  Object.values(narrationAssets).map((asset) => asset.audio
    .replace(/^\/narration\//, "")
    .replace(/audio\.webm$/u, "audio.m4a")),
)];
const queue = [...relativePaths];
const failures = [];
let completed = 0;

async function upload(relative) {
  await run(wrangler, [
    "r2", "object", "put",
    `${bucketName}/built-in/narration/v5/${relative}`,
    "--file", join(sourceRoot, relative),
    "--content-type", "audio/mp4",
    "--cache-control", "public, max-age=31536000, immutable",
    "--remote", "--force", "--config", wranglerConfig,
  ], { cwd: projectRoot, maxBuffer: 2 * 1024 * 1024 });
}

async function uploadWorker() {
  while (queue.length) {
    const relative = queue.shift();
    if (!relative) return;
    try {
      await upload(relative);
      completed += 1;
      if (completed % 50 === 0 || completed === relativePaths.length) {
        process.stdout.write(`Uploaded ${completed}/${relativePaths.length} mini-program narration files.\n`);
      }
    } catch (error) {
      failures.push(`${relative}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

await Promise.all(Array.from({ length: 4 }, () => uploadWorker()));
if (failures.length) throw new Error(`Failed to upload ${failures.length} files:\n${failures.slice(0, 20).join("\n")}`);
process.stdout.write(`Mini-program narration published directly to R2: ${completed} objects.\n`);
