import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

import {
  FORMAL_ALIGNER,
  FORMAL_ALIGNER_REVISION,
  FORMAL_ASR_MODEL,
  FORMAL_ASR_MODEL_REVISION,
  FORMAL_MODEL,
  FORMAL_MODEL_REVISION,
  FORMAL_POLICY,
  FORMAL_REFERENCE_ID,
  FORMAL_REFERENCE_SHA256,
  FORMAL_VOICE,
  prepareHumanListening,
  qwenContentHash,
  validateListeningInputs,
} from "../scripts/prepare-qwen3-human-listening.mjs";

const LEGACY_BF16_MODEL = "mlx-community/Qwen3-TTS-12Hz-1.7B-Base-bf16";

function fixture(count) {
  const records = Array.from({ length: count }, (_, index) => ({
    recordId: `record-${index + 1}`,
    glyph: index === 0 ? "封" : "水",
    word: index === 0 ? "封锁" : `词${index + 1}`,
    lessonId: `lesson-${index + 1}`,
    lessonTitle: `第${index + 1}课`,
    script: `这是第${index + 1}条展示讲稿。`,
    ttsText: `这是第${index + 1}条实际口播。`,
    status: "approved",
    reviewer: "root",
  }));
  const manifestRecords = Object.fromEntries(records.map(record => {
    const contentHash = qwenContentHash(record.ttsText, FORMAL_REFERENCE_SHA256);
    return [record.recordId, {
      glyph: record.glyph,
      word: record.word,
      requiresPronunciationReview: record.recordId === "record-1",
      contentHash,
      audio: `by-content/${contentHash}/audio.webm`,
      audioMarks: `by-content/${contentHash}/audio-marks.json`,
    }];
  }));
  return {
    book: {
      version: "narration-v3-book",
      modelPolicy: {
        voice: FORMAL_VOICE,
        formalCloneModel: FORMAL_MODEL,
        formalModelRevision: FORMAL_MODEL_REVISION,
        formalAsrModel: FORMAL_ASR_MODEL,
        formalAsrModelRevision: FORMAL_ASR_MODEL_REVISION,
        formalAlignmentModel: FORMAL_ALIGNER,
        formalAlignmentModelRevision: FORMAL_ALIGNER_REVISION,
        formalGenerationPolicy: FORMAL_POLICY,
        formalReferenceId: FORMAL_REFERENCE_ID,
        formalReferenceSha256: FORMAL_REFERENCE_SHA256,
      },
      records,
    },
    manifest: {
      version: "narration-v3-qwen3",
      model: FORMAL_MODEL,
      modelRevision: FORMAL_MODEL_REVISION,
      generationPolicy: FORMAL_POLICY,
      voice: FORMAL_VOICE,
      reference: { id: FORMAL_REFERENCE_ID, sha256: FORMAL_REFERENCE_SHA256 },
      records: manifestRecords,
    },
  };
}

test("prepares a pending, non-auto-approved listening bundle with a static review UI", async () => {
  const directory = await mkdtemp(join(tmpdir(), "qwen3-human-listening-"));
  try {
    const { book, manifest } = fixture(2);
    const bookPath = join(directory, "book.json");
    const manifestPath = join(directory, "audio", "manifest.json");
    const outputDirectory = join(directory, "audio", "review");
    await mkdir(join(directory, "audio"), { recursive: true });
    await writeFile(bookPath, JSON.stringify(book), "utf8");
    await writeFile(manifestPath, JSON.stringify(manifest), "utf8");
    for (const record of Object.values(manifest.records)) {
      const audioPath = join(directory, "audio", record.audio);
      await mkdir(join(audioPath, ".."), { recursive: true });
      await writeFile(audioPath, "test-audio", "utf8");
    }

    const result = await prepareHumanListening({
      bookPath,
      manifestPath,
      outputDirectory,
      expectedRecordCount: 2,
      generatedAt: "2026-08-22T00:00:00.000Z",
    });
    assert.equal(result.recordCount, 2);
    assert.equal(result.carriedRecordCount, 0);
    assert.equal(result.pendingRecordCount, 2);
    const payload = JSON.parse(await readFile(result.jsonPath, "utf8"));
    assert.equal(payload.status, "pending");
    assert.equal(payload.version, "qwen3-human-listening-v4");
    assert.equal(payload.reviewer, "");
    assert.equal(payload.records[0].mnemonicMatchPass, null);
    assert.equal(payload.records[0].heritageBoundaryPass, null);
    assert.equal(payload.records[0].pronunciationPass, null);
    assert.equal(payload.records[0].listenCompleted, false);
    assert.equal(payload.records[0].prosodyPass, null);
    assert.equal(payload.records[0].verdict, "pending");
    assert.match(payload.records[0].reviewEvidenceHash, /^[a-f0-9]{64}$/u);
    assert.equal(payload.records[0].reviewReuse, null);
    assert.equal(
      payload.records[0].audioSha256,
      createHash("sha256").update("test-audio").digest("hex"),
    );
    assert.equal(payload.source.modelRevision, FORMAL_MODEL_REVISION);
    assert.equal(payload.source.referenceId, FORMAL_REFERENCE_ID);
    assert.match(payload.records[0].audio, /^\.\.\/by-content\//);
    assert.match(payload.records[0].mnemonicVisual.src, /public\/illustrations\/mnemonics\//);
    assert.equal(payload.records[0].characterType, "未标注");

    const html = await readFile(result.htmlPath, "utf8");
    assert.match(html, /Qwen3 正式讲解完整听审与看审/);
    assert.match(html, /构形助记画（帮助记忆，不等同字源）/);
    assert.match(html, /真实字形演变资料/);
    assert.match(html, /本字暂无可靠的古文字图版，保留现代楷书，不虚构演变形态/);
    assert.match(html, /课文语境/);
    assert.match(html, /画文一致/);
    assert.match(html, /字源边界/);
    assert.match(html, /发音/);
    assert.match(html, /自然度/);
    assert.match(html, /导出 JSON/);
    assert.match(html, /模板不会自动判定通过/);
    assert.match(html, /请完整听到结束/);
    assert.match(html, /本条需要完整听审和看审的内容/);
    assert.match(html, /listenCompleted/);
    const inlineScripts = [...html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)];
    assert.ok(inlineScripts.length >= 2);
    assert.doesNotThrow(() => new Function(inlineScripts.at(-1)[1]));

    await assert.rejects(
      prepareHumanListening({ bookPath, manifestPath, outputDirectory, expectedRecordCount: 2 }),
      /拒绝覆盖人工进度/,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("carries only unchanged per-record listening evidence into a new bundle", async () => {
  const directory = await mkdtemp(join(tmpdir(), "qwen3-human-listening-carry-"));
  try {
    const { book, manifest } = fixture(2);
    const bookPath = join(directory, "book.json");
    const manifestPath = join(directory, "audio", "manifest.json");
    await mkdir(join(directory, "audio"), { recursive: true });
    await writeFile(bookPath, JSON.stringify(book), "utf8");
    await writeFile(manifestPath, JSON.stringify(manifest), "utf8");
    for (const record of Object.values(manifest.records)) {
      const audioPath = join(directory, "audio", record.audio);
      await mkdir(join(audioPath, ".."), { recursive: true });
      await writeFile(audioPath, `audio-${record.glyph}`, "utf8");
    }

    const first = await prepareHumanListening({
      bookPath,
      manifestPath,
      outputDirectory: join(directory, "review-1"),
      expectedRecordCount: 2,
      generatedAt: "2026-08-22T00:00:00.000Z",
    });
    const previous = JSON.parse(await readFile(first.jsonPath, "utf8"));
    previous.status = "complete";
    previous.reviewer = "human-reviewer";
    previous.updatedAt = "2026-08-22T01:00:00.000Z";
    previous.records = previous.records.map(record => ({
      ...record,
      listenCompleted: true,
      mnemonicMatchPass: true,
      heritageBoundaryPass: true,
      pronunciationPass: true,
      prosodyPass: true,
      verdict: "pass",
    }));
    await writeFile(first.jsonPath, `${JSON.stringify(previous, null, 2)}\n`, "utf8");

    const carried = await prepareHumanListening({
      bookPath,
      manifestPath,
      outputDirectory: join(directory, "review-2"),
      expectedRecordCount: 2,
      previousListeningPath: first.jsonPath,
    });
    assert.equal(carried.carriedRecordCount, 2);
    assert.equal(carried.pendingRecordCount, 0);
    const carriedPayload = JSON.parse(await readFile(carried.jsonPath, "utf8"));
    assert.equal(carriedPayload.records[0].verdict, "pass");
    assert.equal(carriedPayload.records[0].reviewReuse.carried, true);
    assert.equal(carriedPayload.records[0].reviewReuse.reviewer, "human-reviewer");
    assert.equal(carriedPayload.status, "complete");
    assert.equal(carriedPayload.reviewer, "human-reviewer");

    const legacy = {
      ...previous,
      version: "qwen3-human-listening-v3",
      records: previous.records.map(record => {
        const legacyRecord = { ...record };
        delete legacyRecord.reviewEvidenceHash;
        return legacyRecord;
      }),
    };
    const legacyPath = join(directory, "legacy-human-listening.json");
    await writeFile(legacyPath, `${JSON.stringify(legacy, null, 2)}\n`, "utf8");
    const legacyRejected = await prepareHumanListening({
      bookPath,
      manifestPath,
      outputDirectory: join(directory, "review-legacy-rejected"),
      expectedRecordCount: 2,
      previousListeningPath: legacyPath,
    });
    assert.equal(legacyRejected.carriedRecordCount, 0);
    const legacyRebound = await prepareHumanListening({
      bookPath,
      manifestPath,
      outputDirectory: join(directory, "review-legacy-rebound"),
      expectedRecordCount: 2,
      previousListeningPath: legacyPath,
      confirmLegacyVisualsUnchanged: true,
    });
    assert.equal(legacyRebound.carriedRecordCount, 2);
    assert.equal(legacyRebound.pendingRecordCount, 0);
    const reboundPayload = JSON.parse(await readFile(legacyRebound.jsonPath, "utf8"));
    assert.equal(reboundPayload.version, "qwen3-human-listening-v4");
    assert.equal(reboundPayload.status, "complete");
    assert.equal(reboundPayload.records[0].reviewReuse.legacyEvidenceRebound, true);

    const changedMedia = manifest.records["record-2"];
    await writeFile(join(directory, "audio", changedMedia.audio), "changed-audio", "utf8");
    const partial = await prepareHumanListening({
      bookPath,
      manifestPath,
      outputDirectory: join(directory, "review-3"),
      expectedRecordCount: 2,
      previousListeningPath: first.jsonPath,
    });
    assert.equal(partial.carriedRecordCount, 1);
    assert.equal(partial.pendingRecordCount, 1);
    const partialPayload = JSON.parse(await readFile(partial.jsonPath, "utf8"));
    assert.equal(partialPayload.records[0].verdict, "pass");
    assert.equal(partialPayload.records[1].verdict, "pending");
    assert.equal(partialPayload.records[1].reviewReuse, null);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("rejects a manifest whose content hash is not bound to the approved ttsText", async () => {
  const directory = await mkdtemp(join(tmpdir(), "qwen3-human-listening-stale-"));
  try {
    const { book, manifest } = fixture(1);
    manifest.records["record-1"].contentHash = "stale-audio";
    const bookPath = join(directory, "book.json");
    const manifestPath = join(directory, "manifest.json");
    await writeFile(bookPath, JSON.stringify(book), "utf8");
    await writeFile(manifestPath, JSON.stringify(manifest), "utf8");
    await assert.rejects(
      prepareHumanListening({
        bookPath,
        manifestPath,
        outputDirectory: join(directory, "review"),
        expectedRecordCount: 1,
        verifyAudio: false,
      }),
      /音频内容摘要与当前批准口播不一致/,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("rejects a legacy bf16 manifest before formal 4bit listening review", async () => {
  const directory = await mkdtemp(join(tmpdir(), "qwen3-human-listening-bf16-"));
  try {
    const { book, manifest } = fixture(1);
    manifest.model = LEGACY_BF16_MODEL;
    const bookPath = join(directory, "book.json");
    const manifestPath = join(directory, "manifest.json");
    await writeFile(bookPath, JSON.stringify(book), "utf8");
    await writeFile(manifestPath, JSON.stringify(manifest), "utf8");
    await assert.rejects(
      prepareHumanListening({
        bookPath,
        manifestPath,
        outputDirectory: join(directory, "review"),
        expectedRecordCount: 1,
        verifyAudio: false,
      }),
      /音频清单不是正式 Qwen3-TTS 1\.7B Base 4bit 模型/,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("formal listening policy locks the 4bit model revision into content hashes", () => {
  assert.equal(FORMAL_MODEL, "mlx-community/Qwen3-TTS-12Hz-1.7B-Base-4bit");
  assert.equal(FORMAL_MODEL_REVISION, "37e955a1deb861c088ae5f3a67043185f3d1a60c");
  assert.notEqual(
    qwenContentHash("同一口播。", FORMAL_REFERENCE_SHA256),
    qwenContentHash("同一口播。", FORMAL_REFERENCE_SHA256, FORMAL_MODEL, "legacy-revision"),
  );
});

test("rejects a manifest from a different 4bit model revision", async () => {
  const { book, manifest } = fixture(1);
  manifest.modelRevision = "legacy-revision";
  assert.throws(
    () => validateListeningInputs(book, manifest, 1),
    /音频清单模型 revision 不一致/u,
  );
});
