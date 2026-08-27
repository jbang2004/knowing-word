import { execFile } from "node:child_process";
import { mkdir, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { promisify } from "node:util";
import { narrationAssets } from "../app/data/narration-assets.ts";

const run = promisify(execFile);
const projectRoot = resolve(import.meta.dirname, "..");
const sourceRoot = resolve(projectRoot, "release/narration");
const outputRoot = resolve(projectRoot, ".cache/miniprogram-narration-aac32");
const ffmpeg = process.env.FFMPEG || "ffmpeg";
const relativeInputs = [...new Set(
  Object.values(narrationAssets).map((asset) => asset.audio.replace(/^\/narration\//, "")),
)];

async function needsTranscode(source, output) {
  try {
    const [sourceStat, outputStat] = await Promise.all([stat(source), stat(output)]);
    return outputStat.size === 0 || outputStat.mtimeMs < sourceStat.mtimeMs;
  } catch {
    return true;
  }
}

const queue = [...relativeInputs];
const failures = [];
let completed = 0;

async function worker() {
  while (queue.length) {
    const relative = queue.shift();
    if (!relative) return;
    const source = join(sourceRoot, relative);
    const output = join(outputRoot, relative.replace(/audio\.webm$/u, "audio.m4a"));
    try {
      await mkdir(dirname(output), { recursive: true });
      if (await needsTranscode(source, output)) {
        await run(ffmpeg, [
          "-hide_banner", "-loglevel", "error", "-y",
          "-i", source,
          "-vn", "-c:a", "aac", "-ac", "1", "-ar", "32000", "-b:a", "32k", "-movflags", "+faststart",
          output,
        ], { cwd: projectRoot, maxBuffer: 2 * 1024 * 1024 });
      }
      completed += 1;
      if (completed % 50 === 0 || completed === relativeInputs.length) {
        process.stdout.write(`Prepared ${completed}/${relativeInputs.length} mini-program narration files.\n`);
      }
    } catch (error) {
      failures.push(`${relative}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

await Promise.all(Array.from({ length: 4 }, () => worker()));
if (failures.length) throw new Error(`Failed to transcode ${failures.length} files:\n${failures.slice(0, 20).join("\n")}`);
process.stdout.write(`Mini-program narration prepared in ${outputRoot}.\n`);
