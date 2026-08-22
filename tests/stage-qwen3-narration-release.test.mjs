import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const stageScript = join(projectRoot, "scripts", "stage-qwen3-narration-release.mjs");
const MODEL = "mlx-community/Qwen3-TTS-12Hz-1.7B-Base-4bit";
const MODEL_REVISION = "37e955a1deb861c088ae5f3a67043185f3d1a60c";
const LEGACY_BF16_MODEL = "mlx-community/Qwen3-TTS-12Hz-1.7B-Base-bf16";
const ALIGNER = "mlx-community/Qwen3-ForcedAligner-0.6B-8bit";
const POLICY = "qwen3-clone-2026-08-22-v3";
const VOICE = "封";
const SEED = 20260822;
const REFERENCE_ID = "019f0554-ea22-762e-966c-32d678fd6bf6";
const REFERENCE_SHA256 = "eb07e06ee13a20ee4577b1b481df6d33d42127c1b3876bfa5d5e5362ae349f19";

function pythonFlatJson(object) {
  return `{${Object.entries(object)
    .sort(([left], [right]) => left.localeCompare(right, "en"))
    .map(([key, value]) => `${JSON.stringify(key)}: ${JSON.stringify(value)}`)
    .join(", ")}}`;
}

function contentHash(text, referenceHash) {
  return createHash("sha256").update(pythonFlatJson({
    text,
    reference: referenceHash,
    model: MODEL,
    modelRevision: MODEL_REVISION,
    voice: VOICE,
    policy: POLICY,
    seed: SEED,
  })).digest("hex").slice(0, 20);
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function spokenCharacters(text) {
  return Array.from(text).filter((char) => /[\p{L}\p{N}_]/u.test(char));
}

function alignedMarks(text) {
  return spokenCharacters(text).map((char, index) => ({
    index,
    char,
    start: Number((index * 0.1).toFixed(2)),
    end: Number((index * 0.1 + 0.08).toFixed(2)),
  }));
}

async function writeReleaseFixture(root, { listeningComplete }) {
  const outputRoot = join(root, "qwen-v3-4bit-master");
  const referenceHash = REFERENCE_SHA256;
  const records = Array.from({ length: 430 }, (_, index) => {
    const recordId = `record-${String(index).padStart(3, "0")}`;
    return {
      recordId,
      glyph: index < 2 ? "木" : `字${index}`,
      lessonId: `fixture-lesson-${String(index).padStart(3, "0")}`,
      word: index === 0 ? "木兰花" : index === 1 ? "木棒" : "相同教学词",
      ttsText: index === 0 ? "木兰花的木。" : index === 1 ? "木棒的木。" : "这是同一份内容寻址音频。",
      status: "approved",
    };
  });
  const manifestRecords = {};
  const checks = [];
  const listeningRecords = [];
  const contentObjects = new Map();

  for (const record of records) {
    const digest = contentHash(record.ttsText, referenceHash);
    const audioContent = Buffer.from(`fixture-audio-${digest}`);
    const audioHash = sha256(audioContent);
    contentObjects.set(digest, { text: record.ttsText, audioContent, audioHash });
    manifestRecords[record.recordId] = {
      glyph: record.glyph,
      word: record.word,
      contentHash: digest,
      audio: `by-content/${digest}/audio.webm`,
      audioMarks: `by-content/${digest}/audio-marks.json`,
    };
    checks.push({
      recordId: record.recordId,
      contentHash: digest,
      similarity: 1,
      asrPass: true,
      automatedPass: true,
      audioSha256: audioHash,
      alignmentWritten: true,
      alignmentGroupCount: 0,
    });
    listeningRecords.push({
      recordId: record.recordId,
      contentHash: digest,
      audioSha256: audioHash,
      listenCompleted: true,
      verdict: "pass",
      mnemonicMatchPass: true,
      heritageBoundaryPass: true,
      pronunciationPass: true,
      prosodyPass: true,
    });
  }

  for (const [digest, object] of contentObjects) {
    const objectRoot = join(outputRoot, "by-content", digest);
    await mkdir(objectRoot, { recursive: true });
    await Promise.all([
      writeFile(join(objectRoot, "audio.webm"), object.audioContent),
      writeFile(join(objectRoot, "audio-marks.json"), `${JSON.stringify({
        transcript: object.text,
      model: MODEL,
      model_revision: MODEL_REVISION,
      generation_policy: POLICY,
      voice_reference: VOICE,
      reference_id: REFERENCE_ID,
      reference_sha256: REFERENCE_SHA256,
        seed: SEED,
        content_hash: digest,
        timing_source: "qwen3-forced-aligner",
        alignment_model: ALIGNER,
        aligned_audio_sha256: object.audioHash,
        alignment_groups: [],
        marks: alignedMarks(object.text),
      }, null, 2)}\n`),
    ]);
  }

  const bookPath = join(root, "approved-book.json");
  const manifestPath = join(outputRoot, "manifest.json");
  await mkdir(dirname(manifestPath), { recursive: true });
  const bookRaw = `${JSON.stringify({
    version: "narration-v3-book",
    modelPolicy: {
      voice: VOICE,
      formalCloneModel: MODEL,
      formalModelRevision: MODEL_REVISION,
      formalGenerationPolicy: POLICY,
      formalReferenceId: REFERENCE_ID,
      formalReferenceSha256: REFERENCE_SHA256,
    },
    records,
  }, null, 2)}\n`;
  const manifestRaw = `${JSON.stringify({
    version: "narration-v3-qwen3",
    model: MODEL,
    modelRevision: MODEL_REVISION,
    generationPolicy: POLICY,
    voice: VOICE,
    reference: { id: REFERENCE_ID, sha256: referenceHash },
    records: manifestRecords,
  }, null, 2)}\n`;
  await Promise.all([
    writeFile(bookPath, bookRaw),
    writeFile(manifestPath, manifestRaw),
    writeFile(join(outputRoot, "asr-verification.json"), `${JSON.stringify({
      minimumSimilarity: 0.88,
      phoneticPolicy: "pinyin-pro-3.28.1-tone-number-v1",
      automatedPass: true,
      checks,
    }, null, 2)}\n`),
    writeFile(join(outputRoot, "human-listening.json"), `${JSON.stringify({
      version: "qwen3-human-listening-v3",
      reviewer: "fixture-reviewer",
      status: listeningComplete ? "complete" : "incomplete",
      source: {
        approvedBookSha256: sha256(bookRaw),
        qwenManifestSha256: sha256(manifestRaw),
        model: MODEL,
        modelRevision: MODEL_REVISION,
        generationPolicy: POLICY,
        voice: VOICE,
        referenceId: REFERENCE_ID,
        referenceSha256: REFERENCE_SHA256,
      },
      records: listeningRecords,
    }, null, 2)}\n`),
  ]);
  return { bookPath, manifestPath, records };
}

function runStage(bookPath, manifestPath, stagingPath) {
  return spawnSync(process.execPath, [stageScript, bookPath, manifestPath, stagingPath], {
    cwd: projectRoot,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
}

test("a missing formal release gate leaves no staging directory or temporary release", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "knowing-word-stage-gate-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const fixture = await writeReleaseFixture(root, { listeningComplete: false });
  const stagingPath = join(root, "blocked-stage");

  const result = runStage(fixture.bookPath, fixture.manifestPath, stagingPath);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /release gate 未通过/u);
  const rootEntries = await readdir(root);
  assert.equal(rootEntries.includes("blocked-stage"), false);
  assert.equal(rootEntries.some((entry) => entry.startsWith(".blocked-stage.tmp-")), false);
});

test("a legacy bf16 manifest cannot be staged as formal 4bit audio", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "knowing-word-stage-legacy-bf16-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const fixture = await writeReleaseFixture(root, { listeningComplete: true });
  const manifest = JSON.parse(await readFile(fixture.manifestPath, "utf8"));
  manifest.model = LEGACY_BF16_MODEL;
  await writeFile(fixture.manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  const stagingPath = join(root, "blocked-legacy-stage");

  const result = runStage(fixture.bookPath, fixture.manifestPath, stagingPath);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /音频模型不是正式 Qwen3-TTS 1\.7B Base 4bit/u);
  assert.equal((await readdir(root)).includes("blocked-legacy-stage"), false);
});

test("legacy bf16 marks cannot be relabeled through a formal 4bit manifest", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "knowing-word-stage-legacy-marks-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const fixture = await writeReleaseFixture(root, { listeningComplete: true });
  const firstRecord = fixture.records[0];
  const digest = contentHash(firstRecord.ttsText, REFERENCE_SHA256);
  const marksPath = join(root, "qwen-v3-4bit-master", "by-content", digest, "audio-marks.json");
  const marks = JSON.parse(await readFile(marksPath, "utf8"));
  marks.model = LEGACY_BF16_MODEL;
  await writeFile(marksPath, `${JSON.stringify(marks, null, 2)}\n`);
  const stagingPath = join(root, "blocked-legacy-marks-stage");

  const result = runStage(fixture.bookPath, fixture.manifestPath, stagingPath);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /marks模型不是正式1\.7B Base 4bit/u);
  assert.equal((await readdir(root)).includes("blocked-legacy-marks-stage"), false);
});

test("a different 4bit model revision cannot pass the release gate", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "knowing-word-stage-wrong-revision-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const fixture = await writeReleaseFixture(root, { listeningComplete: true });
  const manifest = JSON.parse(await readFile(fixture.manifestPath, "utf8"));
  manifest.modelRevision = "legacy-revision";
  await writeFile(fixture.manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  const stagingPath = join(root, "blocked-revision-stage");

  const result = runStage(fixture.bookPath, fixture.manifestPath, stagingPath);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /音频清单模型 revision 不一致/u);
  assert.equal((await readdir(root)).includes("blocked-revision-stage"), false);
});

test("human listening approval is bound to the exact audio bytes", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "knowing-word-stage-stale-listening-audio-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const fixture = await writeReleaseFixture(root, { listeningComplete: true });
  const listeningPath = join(dirname(fixture.manifestPath), "human-listening.json");
  const listening = JSON.parse(await readFile(listeningPath, "utf8"));
  listening.records[0].audioSha256 = "stale-reviewed-take";
  await writeFile(listeningPath, `${JSON.stringify(listening, null, 2)}\n`);
  const stagingPath = join(root, "blocked-listening-stage");

  const result = runStage(fixture.bookPath, fixture.manifestPath, stagingPath);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /人耳听审未通过/u);
  assert.equal((await readdir(root)).includes("blocked-listening-stage"), false);
});

test("a gated local stage covers 430 recordId paths and never deduplicates repeated glyph records", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "knowing-word-stage-success-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const fixture = await writeReleaseFixture(root, { listeningComplete: true });
  const stagingPath = join(root, "ready-stage");

  const result = runStage(fixture.bookPath, fixture.manifestPath, stagingPath);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /release gate passed for 430/u);
  assert.match(result.stdout, /No public files were changed and nothing was uploaded/u);

  const narrationRoot = join(stagingPath, "public", "narration");
  const recordDirectories = (await readdir(narrationRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  assert.equal(recordDirectories.length, 430);
  assert.deepEqual(new Set(recordDirectories), new Set(fixture.records.map((record) => record.recordId)));

  const assetsModule = await import(`${pathToFileURL(join(
    stagingPath,
    "app/data/narration-assets.ts",
  )).href}?fixture=${Date.now()}`);
  const transcriptsModule = await import(`${pathToFileURL(join(
    stagingPath,
    "app/data/released-narration-transcripts.generated.ts",
  )).href}?fixture=${Date.now()}`);
  assert.equal(Object.keys(assetsModule.narrationAssets).length, 430);
  assert.equal(Object.keys(transcriptsModule.releasedNarrationTranscripts).length, 430);
  assert.deepEqual(transcriptsModule.narrationDuplicateGlyphPolicy, {
    lookupKey: "recordId",
    destinationIsolation: "one-directory-per-recordId",
    sharedContentSourceAllowed: true,
    glyphDeduplicationAllowed: false,
  });

  const woodRecords = fixture.records.slice(0, 2);
  assert.equal(woodRecords[0].glyph, woodRecords[1].glyph);
  assert.notEqual(
    assetsModule.narrationAssets[woodRecords[0].recordId].audio,
    assetsModule.narrationAssets[woodRecords[1].recordId].audio,
  );
  assert.notEqual(
    transcriptsModule.releasedNarrationTranscripts[woodRecords[0].recordId].transcript,
    transcriptsModule.releasedNarrationTranscripts[woodRecords[1].recordId].transcript,
  );

  for (const record of fixture.records) {
    const recordRoot = join(narrationRoot, record.recordId);
    const marks = JSON.parse(await readFile(join(recordRoot, "audio-marks.json"), "utf8"));
    assert.equal(marks.transcript, record.ttsText);
    assert.ok((await readFile(join(recordRoot, "audio.webm"))).length > 0);
  }

  const stageManifest = JSON.parse(await readFile(join(stagingPath, "release-staging.json"), "utf8"));
  assert.equal(stageManifest.recordCount, 430);
  assert.equal(stageManifest.source.model, MODEL);
  assert.equal(stageManifest.source.modelRevision, MODEL_REVISION);
  assert.equal(stageManifest.source.generationPolicy, POLICY);
  assert.equal(stageManifest.source.referenceSha256, REFERENCE_SHA256);
  assert.deepEqual(stageManifest.duplicateGlyphs.木, woodRecords.map((record) => record.recordId));
  assert.equal(Object.keys(stageManifest.records).length, 430);
  assert.equal(stageManifest.records[woodRecords[0].recordId].audioSha256.length, 64);
});

test("the staging target is forbidden inside the repository public directory", async () => {
  const source = await readFile(stageScript, "utf8");
  assert.match(source, /isInside\(publicRoot, stagingPath\)/u);
  assert.match(source, /staging 目录不能位于 public 内/u);
});
