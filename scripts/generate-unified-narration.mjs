import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { promisify } from "node:util";
import { join, resolve } from "node:path";
import { homedir, tmpdir } from "node:os";
import { characters } from "../app/data/catalog.ts";
import { narrationScripts } from "../app/data/narration-scripts.ts";

const run = promisify(execFile);
const projectRoot = resolve(import.meta.dirname, "..");
const publicRoot = join(projectRoot, "public");
const outputRoot = join(publicRoot, "narration");
const modulePath = join(projectRoot, "app", "data", "narration-assets.ts");
const serviceUrl = process.env.VOXCPM_URL || "http://127.0.0.1:8766/tts";
const serviceOrigin = new URL(serviceUrl).origin;
const serviceControl = process.env.VOXCPM_CONTROL
  || join(homedir(), "Services", "voxcpm-mlx-service", "bin", "voxcpm-mlxctl");
const referenceCharacterId = "019f0554-ea22-762e-966c-32d678fd6bf6";
const referenceAudio = join(publicRoot, "heritage", referenceCharacterId, "audio.mp3");
const referenceWav = join(tmpdir(), "knowing-word-feng-reference.wav");
const referenceText = "封，封锁的封。会意字，左右结构，本义是地界，左边的圭。";
const narrationBitrate = process.env.NARRATION_BITRATE || "48k";
const diffusionSteps = Number(process.env.NARRATION_DDPM_STEPS || 3);
const legacyScriptVersion = "child-first-v1";
const officialScriptVersion = "child-first-v2";
const requestedGlyph = process.argv.find((arg) => arg.startsWith("--glyph="))?.slice(8);
const force = process.argv.includes("--force");

const spokenPattern = /[\p{L}\p{N}\p{Script=Han}]/u;

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

const delay = (milliseconds) => new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));

async function ensureService() {
  try {
    const health = await fetch(`${serviceOrigin}/health`);
    if (health.ok) {
      const payload = await health.json();
      if (payload.loaded) return;
    }
  } catch {}

  await run(serviceControl, ["start"]).catch(() => undefined);
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const health = await fetch(`${serviceOrigin}/health`);
      if (health.ok) break;
    } catch {}
    await delay(500);
  }
  const warmup = await fetch(`${serviceOrigin}/warmup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ generate: false }),
  });
  if (!warmup.ok) throw new Error(`VoxCPM warmup failed: ${warmup.status}`);
}

function createEstimatedMarks(text, duration) {
  const characters = Array.from(text);
  const spokenCount = characters.filter((char) => spokenPattern.test(char)).length;
  const leading = Math.min(0.28, duration * 0.02);
  const trailing = Math.min(0.2, duration * 0.015);
  const rawPauses = characters.reduce((total, char) => {
    if (/[。！？!?]/u.test(char)) return total + 0.34;
    if (/[，；：、,;:]/u.test(char)) return total + 0.18;
    if (/[…—]/u.test(char)) return total + 0.28;
    return total;
  }, 0);
  const pauseScale = rawPauses > duration * 0.28 ? (duration * 0.28) / rawPauses : 1;
  const spokenDuration = Math.max(0.1, duration - leading - trailing - rawPauses * pauseScale);
  const unit = spokenCount ? spokenDuration / spokenCount : spokenDuration;
  const marks = [];
  let cursor = leading;

  for (const char of characters) {
    if (spokenPattern.test(char)) {
      marks.push({
        index: marks.length,
        char,
        start: Number((cursor + unit * 0.06).toFixed(3)),
        end: Number((cursor + unit * 0.9).toFixed(3)),
      });
      cursor += unit;
    } else if (/[。！？!?]/u.test(char)) {
      cursor += 0.34 * pauseScale;
    } else if (/[，；：、,;:]/u.test(char)) {
      cursor += 0.18 * pauseScale;
    } else if (/[…—]/u.test(char)) {
      cursor += 0.28 * pauseScale;
    }
  }
  return marks;
}

async function durationOf(path) {
  const { stdout } = await run("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    path,
  ]);
  return Number(stdout.trim());
}

function spokenCountFor(text) {
  return Array.from(text).filter((char) => spokenPattern.test(char)).length;
}

function maximumNarrationDuration(text) {
  return Math.max(5, spokenCountFor(text) * 0.66 + 1.5);
}

function durationLooksNatural(text, duration) {
  const spokenCount = spokenCountFor(text);
  return Number.isFinite(duration)
    && duration >= Math.max(2, spokenCount * 0.11)
    && duration <= maximumNarrationDuration(text) + 0.15;
}

async function prepareReference() {
  if (!force && await exists(referenceWav)) return;
  await run("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", referenceAudio,
    "-t", "7.95",
    "-ar", "48000",
    "-ac", "1",
    referenceWav,
  ]);
}

function scriptVersionFor(records) {
  return records.some((record) => record.official !== false)
    ? officialScriptVersion
    : legacyScriptVersion;
}

async function outputMatchesScript(mp3Path, marksPath, text, scriptVersion) {
  if (!(await exists(mp3Path)) || !(await exists(marksPath))) return false;
  try {
    const payload = JSON.parse(await readFile(marksPath, "utf8"));
    return payload.transcript === text
      && payload.script_version === scriptVersion
      && payload.marks?.length === spokenCountFor(text)
      && durationLooksNatural(text, Number(payload.duration));
  } catch {
    return false;
  }
}

async function synthesize(text, wavPath, qualityAttempt = 1) {
  const baseMaxTokens = Math.min(1800, Math.max(360, Array.from(text).length * 6));
  const tokenScale = [1, 0.75, 0.6][qualityAttempt - 1] || 0.6;
  const maxTokens = Math.max(180, Math.round(baseMaxTokens * tokenScale));
  const body = JSON.stringify({
    text,
    lang_code: "chinese",
    max_tokens: maxTokens,
    temperature: 0.48,
    top_p: 0.86,
    top_k: 50,
    repetition_penalty: 1.16,
    ddpm_steps: diffusionSteps,
    speed: 1.08,
    ref_audio: referenceWav,
    ref_text: referenceText,
    save_path: wavPath,
  });

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await ensureService();
      const response = await fetch(serviceUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (!response.ok) throw new Error(`VoxCPM request failed: ${response.status} ${await response.text()}`);
      return response.json();
    } catch (error) {
      if (attempt === 3) throw error;
      process.stdout.write(`VoxCPM interrupted; restarting service (attempt ${attempt + 1}/3)\n`);
      await run(serviceControl, ["restart"]).catch(() => undefined);
      await delay(1200);
    }
  }
  throw new Error("VoxCPM generation failed");
}

async function encodeMp3(wavPath, mp3Path, maximumDuration) {
  await run("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", wavPath,
    ...(maximumDuration ? ["-t", String(maximumDuration)] : []),
    "-af", "loudnorm=I=-18:LRA=7:TP=-1.5",
    "-ar", "44100",
    "-ac", "1",
    "-b:a", narrationBitrate,
    mp3Path,
  ]);
}

function serializeModule(records) {
  return `export type NarrationAsset = {\n  audio: string;\n  audioMarks: string;\n  voice: \"封\";\n};\n\nexport const narrationAssets: Record<string, NarrationAsset> = ${JSON.stringify(records, null, 2)};\n`;
}

await prepareReference();
await mkdir(outputRoot, { recursive: true });

const recordsByGlyph = new Map();
for (const character of characters) {
  const records = recordsByGlyph.get(character.hanzi) || [];
  records.push(character);
  recordsByGlyph.set(character.hanzi, records);
}

const generatedByGlyph = new Map();
const glyphEntries = [...recordsByGlyph.entries()].filter(([glyph]) => !requestedGlyph || glyph === requestedGlyph);

for (let offset = 0; offset < glyphEntries.length; offset += 1) {
  const [glyph, records] = glyphEntries[offset];
  const canonical = records.find((record) => record.primary && record.ready)
    || records.find((record) => record.primary)
    || records[0];
  const text = narrationScripts[glyph];
  const scriptVersion = scriptVersionFor(records);
  if (!text) throw new Error(`Missing child-first narration script for ${glyph}`);
  let outputRecord = canonical;
  if (!force) {
    for (const record of records) {
      const candidateFolder = join(outputRoot, record.id);
      if (await outputMatchesScript(join(candidateFolder, "audio.mp3"), join(candidateFolder, "audio-marks.json"), text, scriptVersion)) {
        outputRecord = record;
        break;
      }
    }
  }
  const folder = join(outputRoot, outputRecord.id);
  const mp3Path = join(folder, "audio.mp3");
  const marksPath = join(folder, "audio-marks.json");
  const wavPath = join(tmpdir(), `knowing-word-${outputRecord.id}.wav`);
  await mkdir(folder, { recursive: true });
  const matchesScript = !force && await outputMatchesScript(mp3Path, marksPath, text, scriptVersion);

  if (!matchesScript) {
    process.stdout.write(`[${offset + 1}/${glyphEntries.length}] ${glyph} · generating ${Array.from(text).length} chars\n`);
    let duration = 0;
    let meta;
    for (let qualityAttempt = 1; qualityAttempt <= 3; qualityAttempt += 1) {
      meta = await synthesize(text, wavPath, qualityAttempt);
      await encodeMp3(
        wavPath,
        mp3Path,
        qualityAttempt === 3 ? maximumNarrationDuration(text) : undefined,
      );
      duration = await durationOf(mp3Path);
      if (durationLooksNatural(text, duration)) break;
      if (qualityAttempt < 3) {
        process.stdout.write(`[${offset + 1}/${glyphEntries.length}] ${glyph} · unnatural ${duration.toFixed(2)}s take; retrying\n`);
      }
    }
    if (!durationLooksNatural(text, duration)) {
      throw new Error(`Narration duration failed quality gate for ${glyph}: ${duration.toFixed(2)}s`);
    }
    const marks = createEstimatedMarks(text, duration);
    await writeFile(marksPath, JSON.stringify({
      marks,
      transcript: text,
      voice_reference: "封",
      timing_source: "punctuation-weighted-estimate",
      script_version: scriptVersion,
      duration,
    }, null, 2) + "\n");
    process.stdout.write(`[${offset + 1}/${glyphEntries.length}] ${glyph} · ${duration.toFixed(2)}s audio · ${marks.length} marks · ${meta.inferSec}s infer\n`);
  } else {
    process.stdout.write(`[${offset + 1}/${glyphEntries.length}] ${glyph} · existing output reused\n`);
  }

  generatedByGlyph.set(glyph, {
    audio: `/${mp3Path.slice(publicRoot.length + 1)}`,
    audioMarks: `/${marksPath.slice(publicRoot.length + 1)}`,
    voice: "封",
  });
}

const assetRecords = {};
for (const character of characters) {
  const asset = generatedByGlyph.get(character.hanzi);
  if (asset) assetRecords[character.id] = asset;
}

if (!requestedGlyph || glyphEntries.length === recordsByGlyph.size) {
  await writeFile(modulePath, serializeModule(assetRecords));
  process.stdout.write(`Wrote ${Object.keys(assetRecords).length} narration mappings.\n`);
} else {
  process.stdout.write(`Smoke generation complete for ${requestedGlyph}; module not rewritten.\n`);
}
