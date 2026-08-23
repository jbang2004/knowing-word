import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { characters } from "../app/data/catalog.ts";
import { narrationRecordDigest } from "../scripts/narration-review-digest.mjs";
import { containsLatinPinyin, ttsSafeNarration } from "../scripts/narration-tts-text.mjs";

const approvedCalibration = JSON.parse(await readFile(
  new URL("../app/data/narration-v3/approved/calibration.json", import.meta.url),
  "utf8",
));

test("narration v3 separates reusable glyph facts from lesson-aware records", () => {
  assert.equal(characters.length, 430);
  assert.equal(new Set(characters.map((record) => record.hanzi)).size, 423);
  assert.match(approvedCalibration.version, /narration-v3/);
  const stubborn = characters.find((record) => record.lessonId === "g5v1-l11" && record.hanzi === "拗");
  assert.equal(stubborn?.word, "拗不过");
  assert.equal(stubborn?.pinyin, "niù");
});

test("the calibration gold set passed root review and preserves repeated-glyph context", () => {
  assert.equal(approvedCalibration.records.length, 13);
  for (const record of approvedCalibration.records) {
    assert.equal(record.status, "approved");
    assert.equal(record.reviewer, "root");
    assert.ok(record.reviewScore >= 90);
    assert.ok(Array.from(record.script).length >= 85 && Array.from(record.script).length <= 150);
    assert.ok((record.script.match(/[。！？]/gu) || []).length >= 4);
  }
  const wood = approvedCalibration.records.filter((record) => record.glyph === "木");
  assert.equal(wood.length, 2);
  assert.notEqual(wood[0].script, wood[1].script);
  assert.deepEqual(new Set(wood.map((record) => record.word)), new Set(["木兰花", "木棒"]));
});

test("Qwen3 narration generation uses the full 1.7B clone model and content-addressed assets", async () => {
  const source = await readFile(new URL("../scripts/generate-qwen3-narration.py", import.meta.url), "utf8");
  const verifier = await readFile(new URL("../scripts/verify-qwen3-narration.py", import.meta.url), "utf8");
  const toolchain = JSON.parse(await readFile(
    new URL("../config/narration-toolchain.lock.json", import.meta.url),
    "utf8",
  ));
  assert.equal(toolchain.models.tts.id, "mlx-community/Qwen3-TTS-12Hz-1.7B-Base-4bit");
  assert.equal(toolchain.models.tts.revision, "37e955a1deb861c088ae5f3a67043185f3d1a60c");
  assert.equal(toolchain.models.asr.revision, "624c19c9af5603fa73b83bce14d4aeea96156d18");
  assert.equal(toolchain.models.aligner.revision, "0e1a68e91d815300c7c9754b2a7639378b23db15");
  assert.equal(toolchain.formal.generationPolicy, "qwen3-clone-2026-08-22-v3");
  assert.equal(toolchain.formal.reference.sha256, "eb07e06ee13a20ee4577b1b481df6d33d42127c1b3876bfa5d5e5362ae349f19");
  assert.match(source, /load_toolchain_lock\(PROJECT_ROOT\)/);
  assert.doesNotMatch(source, /37e955a1deb861c088ae5f3a67043185f3d1a60c/);
  assert.match(source, /qwen-v3-4bit-master/);
  assert.match(source, /load_model\(args\.model, revision=MODEL_REVISION\)/);
  assert.match(source, /"-map_metadata"/);
  assert.match(source, /"\+bitexact"/);
  assert.match(source, /same-language ICL voice cloning/);
  assert.match(source, /Formal narration is locked/);
  assert.match(source, /by-content/);
  assert.match(source, /content_hash/);
  assert.match(source, /GENERATION_POLICY/);
  assert.match(source, /"generation_policy": GENERATION_POLICY/);
  assert.match(source, /"model_revision": MODEL_REVISION/);
  assert.match(source, /"modelRevision": MODEL_REVISION/);
  assert.match(source, /"reference_sha256": REFERENCE_SHA256/);
  assert.match(source, /Rebuild it from the/);
  assert.doesNotMatch(source, /if args\.force or not reference_wav\.exists/);
  assert.match(source, /"seed": SEED/);
  assert.match(source, /int\(digest\[:8\], 16\)/);
  assert.match(source, /\{"拗", "识", "哼", "贾"\}/);
  assert.match(source, /requiresPronunciationReview/);
  assert.match(verifier, /default=MINIMUM_SIMILARITY/);
  assert.match(verifier, /humanListening/);
  assert.match(verifier, /load_toolchain_lock\(PROJECT_ROOT\)/);
  assert.doesNotMatch(verifier, /624c19c9af5603fa73b83bce14d4aeea96156d18/);
  assert.doesNotMatch(verifier, /0e1a68e91d815300c7c9754b2a7639378b23db15/);
  assert.match(verifier, /load_model\(args\.model, revision=MODEL_REVISION\)/);
  assert.match(verifier, /load_stt_model\(args\.aligner_model, revision=ALIGNER_REVISION\)/);
  assert.match(verifier, /alignment_model_revision/);
  assert.match(verifier, /qwen3-forced-aligner/);
  assert.match(verifier, /aligned_audio_sha256/);
  assert.match(verifier, /shared-right-model-interval/);
  assert.match(verifier, /shared-left-model-interval/);
  assert.match(verifier, /refusing to invent an internal boundary/);
  assert.match(verifier, /alignmentGroupCount/);
  assert.equal(toolchain.formal.phoneticPolicy, "pinyin-pro-3.28.1-tone-number-v1");
  assert.match(verifier, /phoneticSimilarity/);
  assert.match(verifier, /zero-anchor-right-envelope/);
  assert.match(verifier, /zero-anchor-left-envelope/);
  assert.match(verifier, /similarity >= args\.minimum_similarity/);
  assert.match(verifier, /previous_check\.get\("contentHash"\) == record\["contentHash"\]/);
  assert.match(verifier, /previous_check\.get\("audioSha256"\) == audio_hash/);
  assert.match(verifier, /previous_check\.get\("asrTranscriptSha256"\) == sha256_text\(cached_transcript\)/);
  assert.match(verifier, /"asrTranscriptSha256": sha256_text\(transcript\)/);
});

test("the full-book compiler refuses to bypass root review", async () => {
  const source = await readFile(new URL("../scripts/compile-approved-narration-v3.mjs", import.meta.url), "utf8");
  const rootReview = await readFile(new URL("../scripts/prepare-narration-root-review.mjs", import.meta.url), "utf8");
  assert.match(source, /root-review\.json/);
  assert.match(source, /reviewScore < 90/);
  assert.match(source, /尚未通过 root 主审/);
  assert.match(source, /expectedRecordCount = characters\.length/);
  assert.match(source, /expectedGlyphCount = new Set\(characters\.map/);
  assert.match(source, /assertUnique\(narrations, "recordId", expectedRecordCount/);
  assert.match(source, /assertUnique\(factCards, "glyph", expectedGlyphCount/);
  assert.match(source, /formalNarrationBookPolicy/);
  assert.match(source, /在主审签署后发生变化/);
  assert.match(rootReview, /作者与复核者分离/);
  assert.match(rootReview, /仍有.*未过交叉复核/);
  assert.match(rootReview, /未绑定当前稿件/);
});

test("independent review is cryptographically bound to the exact editorial content", () => {
  const source = approvedCalibration.records[0];
  assert.equal(narrationRecordDigest(source), narrationRecordDigest({ ...source }));
  assert.notEqual(
    narrationRecordDigest(source),
    narrationRecordDigest({ ...source, script: `${source.script}。` }),
  );
});

test("formal audio release requires full ASR, forced alignment, and human listening", async () => {
  const source = await readFile(new URL("../scripts/validate-qwen3-narration-release.mjs", import.meta.url), "utf8");
  assert.match(source, /EXPECTED_RECORD_COUNT = characters\.length/);
  assert.match(source, /records\?\.length !== EXPECTED_RECORD_COUNT/);
  assert.match(source, /from "\.\/narration-policy\.mjs"/);
  assert.match(source, /aligned_audio_sha256/);
  assert.match(source, /marks\.model !== MODEL/);
  assert.match(source, /marks\.generation_policy !== POLICY/);
  assert.match(source, /marks\.model_revision !== MODEL_REVISION/);
  assert.match(source, /verification\.modelRevision !== ASR_MODEL_REVISION/);
  assert.match(source, /marks\.alignment_model_revision !== ALIGNER_REVISION/);
  assert.match(source, /marks\.seed !== SEED/);
  assert.match(source, /human\.audioSha256 !== actualAudioHash/);
  assert.match(source, /human\.listenCompleted !== true/);
  assert.match(source, /human\.mnemonicMatchPass !== true/);
  assert.match(source, /human\.heritageBoundaryPass !== true/);
  assert.match(source, /未忠实保留模型原始边界/);
  assert.match(source, /shared-right-model-interval/);
  assert.match(source, /shared-left-model-interval/);
  assert.match(source, /zero-anchor-right-envelope/);
  assert.match(source, /zero-anchor-left-envelope/);
  assert.match(source, /phoneticSimilarity/);
  assert.match(source, /human-listening\.json/);
  assert.match(source, /pronunciationPass/);
  assert.match(source, /prosodyPass/);
  assert.match(source, /listening\.version !== "qwen3-human-listening-v4"/);
  assert.match(source, /reviewEvidenceHash !== expectedReviewEvidenceById/);
});

test("legacy human listening migration is explicit and preserves its source review", async () => {
  const source = await readFile(
    new URL("../scripts/migrate-qwen3-human-listening-v4.mjs", import.meta.url),
    "utf8",
  );
  assert.match(source, /--confirm-legacy-visuals-unchanged/);
  assert.match(source, /qwen3-human-listening-v3/);
  assert.match(source, /human-listening\.v3\.backup\.json/);
  assert.match(source, /pendingRecordCount !== 0/);
});

test("corpus audit detects repeated sentence templates after variable words are removed", async () => {
  const source = await readFile(new URL("../scripts/audit-narration-v3-corpus.mjs", import.meta.url), "utf8");
  assert.match(source, /shared-sentence-skeleton/);
  assert.match(source, /functionalPronunciationOpening/);
});

test("display pinyin is converted to stable Chinese tone labels before TTS", () => {
  const spoken = ttsSafeNarration("传记的传读zhuàn，不读传递的chuán。嫌读xián。");
  assert.equal(spoken, "传记的传读第四声，不读传递的第二声。嫌读第二声。");
  assert.equal(containsLatinPinyin(spoken), false);
  assert.throws(() => ttsSafeNarration("这里读hng。"), /人工提供 ttsText/);
});
