import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { promisify } from "node:util";
import { join, resolve } from "node:path";
import { homedir, tmpdir } from "node:os";
import { characters } from "../app/data/catalog.ts";
import { heritageAssets } from "../app/data/heritage-assets.ts";
import { buildNarrationTokens } from "../app/lib/narration.ts";

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
const referenceMarks = join(publicRoot, "heritage", referenceCharacterId, "audio-marks.json");
const referenceWav = join(tmpdir(), "knowing-word-feng-reference.wav");
const referenceText = "封，封锁的封。会意字，左右结构，本义是地界，左边的圭。";
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

function punctuatedTextFromMarks(marks) {
  return buildNarrationTokens(marks).map((token) => token.text).join("");
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

function scaleMarks(marks, duration) {
  const finalEnd = marks.at(-1)?.end || duration;
  const scale = finalEnd > 0 ? Math.max(0.1, duration - 0.08) / finalEnd : 1;
  return marks.map((mark, index) => ({
    index,
    char: mark.char,
    start: Number((mark.start * scale).toFixed(3)),
    end: Number((mark.end * scale).toFixed(3)),
  }));
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

async function loadSourceForGlyph(glyph, records) {
  for (const record of records) {
    const marksPath = heritageAssets[record.id]?.audioMarks;
    if (!marksPath) continue;
    const payload = JSON.parse(await readFile(join(publicRoot, marksPath), "utf8"));
    if (Array.isArray(payload.marks) && payload.marks.length) {
      return {
        text: punctuatedTextFromMarks(payload.marks),
        sourceMarks: payload.marks,
      };
    }
  }
  const preferred = records.find((record) => record.primary && record.ready)
    || records.find((record) => record.primary)
    || records[0];
  return { text: preferred.description.trim(), sourceMarks: null };
}

async function synthesize(text, wavPath) {
  const maxTokens = Math.min(7000, Math.max(1200, Array.from(text).length * 12));
  const body = JSON.stringify({
    text,
    lang_code: "chinese",
    max_tokens: maxTokens,
    temperature: 0.65,
    top_p: 0.9,
    top_k: 50,
    repetition_penalty: 1.1,
    speed: 1,
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

async function encodeMp3(wavPath, mp3Path) {
  await run("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-i", wavPath,
    "-af", "loudnorm=I=-18:LRA=7:TP=-1.5",
    "-ar", "44100",
    "-ac", "1",
    "-b:a", "128k",
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
  const folder = join(outputRoot, canonical.id);
  const mp3Path = glyph === "封" ? referenceAudio : join(folder, "audio.mp3");
  const marksPath = join(folder, "audio-marks.json");
  const wavPath = join(tmpdir(), `knowing-word-${canonical.id}.wav`);
  await mkdir(folder, { recursive: true });
  const source = await loadSourceForGlyph(glyph, records);

  if (glyph !== "封" && (force || !(await exists(mp3Path)) || !(await exists(marksPath)))) {
    process.stdout.write(`[${offset + 1}/${glyphEntries.length}] ${glyph} · generating ${Array.from(source.text).length} chars\n`);
    const meta = await synthesize(source.text, wavPath);
    await encodeMp3(wavPath, mp3Path);
    const duration = await durationOf(mp3Path);
    const marks = source.sourceMarks
      ? scaleMarks(source.sourceMarks, duration)
      : createEstimatedMarks(source.text, duration);
    await writeFile(marksPath, JSON.stringify({
      marks,
      transcript: source.text,
      voice_reference: "封",
      timing_source: source.sourceMarks ? "scaled-source-marks" : "punctuation-weighted-estimate",
      duration,
    }, null, 2) + "\n");
    process.stdout.write(`[${offset + 1}/${glyphEntries.length}] ${glyph} · ${duration.toFixed(2)}s audio · ${marks.length} marks · ${meta.inferSec}s infer\n`);
  } else if (glyph === "封" && (force || !(await exists(marksPath)))) {
    const payload = JSON.parse(await readFile(referenceMarks, "utf8"));
    await writeFile(marksPath, JSON.stringify({
      ...payload,
      transcript: source.text,
      voice_reference: "封",
      timing_source: "original-source-marks",
    }, null, 2) + "\n");
    process.stdout.write(`[${offset + 1}/${glyphEntries.length}] 封 · preserved original reference audio\n`);
  } else {
    process.stdout.write(`[${offset + 1}/${glyphEntries.length}] ${glyph} · existing output reused\n`);
  }

  generatedByGlyph.set(glyph, {
    audio: glyph === "封"
      ? `/heritage/${referenceCharacterId}/audio.mp3`
      : `/${mp3Path.slice(publicRoot.length + 1)}`,
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
