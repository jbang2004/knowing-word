import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { characters } from "../app/data/catalog.ts";
import {
  buildListeningPayload,
  reviewEvidenceHash,
} from "./prepare-qwen3-human-listening.mjs";
import {
  FORMAL_ALIGNER as ALIGNER,
  FORMAL_ALIGNER_REVISION as ALIGNER_REVISION,
  FORMAL_ASR_MODEL as ASR_MODEL,
  FORMAL_ASR_MODEL_REVISION as ASR_MODEL_REVISION,
  FORMAL_MINIMUM_ASR_SIMILARITY as MINIMUM_ASR_SIMILARITY,
  FORMAL_MODEL as MODEL,
  FORMAL_MODEL_REVISION as MODEL_REVISION,
  FORMAL_PHONETIC_POLICY as PHONETIC_POLICY,
  FORMAL_POLICY as POLICY,
  FORMAL_REFERENCE_ID as REFERENCE_ID,
  FORMAL_REFERENCE_SHA256 as REFERENCE_SHA256,
  FORMAL_SEED as SEED,
  FORMAL_VOICE as VOICE,
} from "./narration-policy.mjs";

const [bookArg, manifestArg] = process.argv.slice(2);
if (!bookArg || !manifestArg) {
  throw new Error("Usage: node scripts/validate-qwen3-narration-release.mjs <approved-book.json> <qwen-manifest.json>");
}

const EXPECTED_RECORD_COUNT = characters.length;

const bookPath = resolve(bookArg);
const manifestPath = resolve(manifestArg);
const audioRoot = resolve(manifestPath, "..");
const [bookRaw, manifestRaw] = await Promise.all([
  readFile(bookPath, "utf8"),
  readFile(manifestPath, "utf8"),
]);
const book = JSON.parse(bookRaw);
const manifest = JSON.parse(manifestRaw);
const verification = JSON.parse(await readFile(join(audioRoot, "asr-verification.json"), "utf8"));
const listening = JSON.parse(await readFile(join(audioRoot, "human-listening.json"), "utf8"));
const errors = [];

function pythonFlatJson(object) {
  return `{${Object.entries(object)
    .sort(([left], [right]) => left.localeCompare(right, "en"))
    .map(([key, value]) => `${JSON.stringify(key)}: ${JSON.stringify(value)}`)
    .join(", ")}}`;
}

function contentHash(text, referenceHash) {
  const encoded = pythonFlatJson({
    text,
    reference: referenceHash,
    model: MODEL,
    modelRevision: MODEL_REVISION,
    voice: VOICE,
    policy: POLICY,
    seed: SEED,
  });
  return createHash("sha256").update(encoded).digest("hex").slice(0, 20);
}

async function sha256File(path) {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function spokenCharacters(text) {
  return Array.from(text).filter((char) => /[\p{L}\p{N}_]/u.test(char));
}

if (book.version !== "narration-v3-book") errors.push("输入不是批准版 narration-v3-book");
if (book.records?.length !== EXPECTED_RECORD_COUNT) {
  errors.push(`批准讲稿应为${EXPECTED_RECORD_COUNT}条，实际${book.records?.length ?? 0}`);
}
if (book.modelPolicy?.formalCloneModel !== MODEL) errors.push("批准书正式克隆模型与发布门不一致");
if (book.modelPolicy?.formalModelRevision !== MODEL_REVISION) errors.push("批准书正式模型 revision 与发布门不一致");
if (book.modelPolicy?.formalAsrModel !== ASR_MODEL) errors.push("批准书正式ASR模型与发布门不一致");
if (book.modelPolicy?.formalAsrModelRevision !== ASR_MODEL_REVISION) errors.push("批准书正式ASR模型 revision 与发布门不一致");
if (book.modelPolicy?.formalAlignmentModel !== ALIGNER) errors.push("批准书正式对齐模型与发布门不一致");
if (book.modelPolicy?.formalAlignmentModelRevision !== ALIGNER_REVISION) errors.push("批准书正式对齐模型 revision 与发布门不一致");
if (book.modelPolicy?.formalGenerationPolicy !== POLICY) errors.push("批准书正式音频生成策略与发布门不一致");
if (book.modelPolicy?.voice !== VOICE) errors.push("批准书正式音色标杆与发布门不一致");
if (book.modelPolicy?.formalReferenceId !== REFERENCE_ID) errors.push("批准书正式参考音记录与发布门不一致");
if (book.modelPolicy?.formalReferenceSha256 !== REFERENCE_SHA256) errors.push("批准书正式参考音摘要与发布门不一致");
if (manifest.model !== MODEL) errors.push("音频模型不是正式 Qwen3-TTS 1.7B Base 4bit");
if (manifest.modelRevision !== MODEL_REVISION) errors.push("音频清单模型 revision 不一致");
if (manifest.generationPolicy !== POLICY) errors.push("音频生成策略版本不一致");
if (manifest.voice !== VOICE) errors.push("音色标杆不是封");
if (manifest.reference?.id !== REFERENCE_ID) errors.push("音频清单参考音记录不是正式封字标杆");
if (manifest.reference?.sha256 !== REFERENCE_SHA256) errors.push("音频清单参考音摘要不一致");
if (
  verification.model !== ASR_MODEL
  || verification.modelRevision !== ASR_MODEL_REVISION
  || verification.alignmentModel !== ALIGNER
  || verification.alignmentModelRevision !== ALIGNER_REVISION
  || verification.minimumSimilarity !== MINIMUM_ASR_SIMILARITY
  || verification.phoneticPolicy !== PHONETIC_POLICY
  || verification.automatedPass !== true
) {
  errors.push("ASR回读尚未以0.88阈值全量通过");
}
if (!listening.reviewer || listening.status !== "complete") errors.push("缺少已完成的人耳听审签名");
if (listening.version !== "qwen3-human-listening-v4") {
  errors.push("正式发布只接受绑定完整视觉证据的 qwen3-human-listening-v4");
}
if (listening.source?.approvedBookSha256 !== sha256(bookRaw)) errors.push("人耳听审未绑定当前批准书");
if (listening.source?.qwenManifestSha256 !== sha256(manifestRaw)) errors.push("人耳听审未绑定当前音频清单");
if (listening.source?.model !== manifest.model) errors.push("人耳听审模型与音频清单不一致");
if (listening.source?.modelRevision !== manifest.modelRevision) errors.push("人耳听审模型 revision 与音频清单不一致");
if (listening.source?.generationPolicy !== manifest.generationPolicy) errors.push("人耳听审生成策略与音频清单不一致");
if (listening.source?.voice !== manifest.voice) errors.push("人耳听审音色与音频清单不一致");
if (listening.source?.referenceId !== manifest.reference?.id) errors.push("人耳听审参考音记录与音频清单不一致");
if (listening.source?.referenceSha256 !== manifest.reference?.sha256) errors.push("人耳听审参考音与音频清单不一致");

const verificationById = new Map((verification.checks || []).map((row) => [row.recordId, row]));
const listeningById = new Map((listening.records || []).map((row) => [row.recordId, row]));
const approvedIds = new Set((book.records || []).map((row) => row.recordId));
if (Object.keys(manifest.records || {}).length !== approvedIds.size) errors.push("音频清单未精确覆盖批准讲稿");
if (verificationById.size !== approvedIds.size) errors.push("ASR回读未精确覆盖批准讲稿");
if (listeningById.size !== approvedIds.size) errors.push("人耳听审未精确覆盖批准讲稿");

const actualAudioHashes = Object.fromEntries(await Promise.all((book.records || []).map(async (record) => {
  const audio = manifest.records?.[record.recordId];
  return [record.recordId, audio ? await sha256File(join(audioRoot, audio.audio)) : null];
})));
const expectedReviewEvidenceById = new Map();
const expectedReview = buildListeningPayload({
  book,
  manifest,
  bookPath,
  manifestPath,
  bookSha256: sha256(bookRaw),
  manifestSha256: sha256(manifestRaw),
  audioSha256ById: actualAudioHashes,
  outputDirectory: audioRoot,
  generatedAt: listening.generatedAt,
});
for (const reviewRecord of expectedReview.records) {
  expectedReviewEvidenceById.set(
    reviewRecord.recordId,
    await reviewEvidenceHash(reviewRecord),
  );
}

for (const record of book.records || []) {
  const audio = manifest.records?.[record.recordId];
  if (!audio) {
    errors.push(`${record.recordId}: 缺少音频`);
    continue;
  }
  const expectedHash = contentHash(record.ttsText, manifest.reference.sha256);
  if (audio.contentHash !== expectedHash) errors.push(`${record.recordId}: 音频不是由当前批准文本生成`);
  const marksPath = join(audioRoot, audio.audioMarks);
  const actualAudioHash = actualAudioHashes[record.recordId];
  const marks = JSON.parse(await readFile(marksPath, "utf8"));
  if (marks.model !== MODEL) errors.push(`${record.recordId}: marks模型不是正式1.7B Base 4bit`);
  if (marks.model_revision !== MODEL_REVISION) errors.push(`${record.recordId}: marks模型 revision 不一致`);
  if (marks.generation_policy !== POLICY) errors.push(`${record.recordId}: marks生成策略版本不一致`);
  if (marks.voice_reference !== VOICE) errors.push(`${record.recordId}: marks音色标杆不是封`);
  if (marks.reference_id !== REFERENCE_ID) errors.push(`${record.recordId}: marks参考音记录不一致`);
  if (marks.reference_sha256 !== REFERENCE_SHA256) errors.push(`${record.recordId}: marks参考音摘要不一致`);
  if (marks.seed !== SEED) errors.push(`${record.recordId}: marks随机种子不一致`);
  if (marks.transcript !== record.ttsText) errors.push(`${record.recordId}: marks文稿与批准口播不一致`);
  if (marks.content_hash !== expectedHash) errors.push(`${record.recordId}: marks内容摘要不一致`);
  if (marks.timing_source !== "qwen3-forced-aligner" || marks.alignment_model !== ALIGNER) {
    errors.push(`${record.recordId}: 尚未完成正式强制对齐`);
  }
  if (marks.alignment_model_revision !== ALIGNER_REVISION) {
    errors.push(`${record.recordId}: 强制对齐模型 revision 不一致`);
  }
  if (!Array.isArray(marks.alignment_groups)) errors.push(`${record.recordId}: 缺少强制对齐共同高亮组审计记录`);
  if (marks.aligned_audio_sha256 !== actualAudioHash) errors.push(`${record.recordId}: 对齐后音频发生变化`);
  const expectedChars = spokenCharacters(record.ttsText);
  const timedChars = (marks.marks || []).map((item) => item.char);
  if (timedChars.join("") !== expectedChars.join("")) errors.push(`${record.recordId}: 逐字时间未完整覆盖口播`);
  const groupedMarks = new Map();
  for (const mark of marks.marks || []) {
    if (!mark.alignment_group) continue;
    const members = groupedMarks.get(mark.alignment_group) || [];
    members.push(mark);
    groupedMarks.set(mark.alignment_group, members);
  }
  const groupAudits = new Map((marks.alignment_groups || []).map((group) => [group.id, group]));
  if (groupAudits.size !== groupedMarks.size) errors.push(`${record.recordId}: 共同高亮组与审计记录数量不一致`);
  for (const [groupId, members] of groupedMarks) {
    const audit = groupAudits.get(groupId);
    const indices = members.map((mark) => mark.index);
    const text = members.map((mark) => mark.char).join("");
    const sameSpan = members.length >= 2 && members.every(
      (mark) => mark.start === members[0].start && mark.end === members[0].end,
    );
    const raw = audit?.rawIntervals;
    const validRight = audit?.method === "shared-right-model-interval"
      && Array.isArray(raw)
      && raw.length === members.length
      && raw.slice(0, -1).every((item) => item.start === item.end && item.start === raw.at(-1).start)
      && raw.at(-1).end > raw.at(-1).start
      && members[0].start === raw.at(-1).start
      && members[0].end === raw.at(-1).end;
    const validLeft = audit?.method === "shared-left-model-interval"
      && Array.isArray(raw)
      && raw.length === members.length
      && raw[0].end > raw[0].start
      && raw.slice(1).every((item) => item.start === item.end && item.start === raw[0].end)
      && members[0].start === raw[0].start
      && members[0].end === raw[0].end;
    const validRightEnvelope = audit?.method === "zero-anchor-right-envelope"
      && Array.isArray(raw)
      && raw.length === members.length
      && raw.slice(0, -1).every((item) => item.start === item.end && item.start === raw[0].start)
      && raw.at(-1).start > raw[0].start
      && raw.at(-1).end > raw.at(-1).start
      && members[0].start === raw[0].start
      && members[0].end === raw.at(-1).end;
    const validLeftEnvelope = audit?.method === "zero-anchor-left-envelope"
      && Array.isArray(raw)
      && raw.length === members.length
      && raw[0].end > raw[0].start
      && raw.slice(1).every((item) => item.start === item.end && item.start === raw.at(-1).start)
      && raw.at(-1).start > raw[0].end
      && members[0].start === raw[0].start
      && members[0].end === raw.at(-1).end;
    if (
      !audit
      || !sameSpan
      || audit.text !== text
      || JSON.stringify(audit.indices) !== JSON.stringify(indices)
      || (!validRight && !validLeft && !validRightEnvelope && !validLeftEnvelope)
    ) {
      errors.push(`${record.recordId}: 共同高亮组 ${groupId} 未忠实保留模型原始边界`);
    }
  }
  let previousEnd = -1;
  let previousStart = -1;
  let previousGroup = null;
  for (const mark of marks.marks || []) {
    const sameGroupOverlap = Boolean(
      mark.alignment_group
      && mark.alignment_group === previousGroup
      && mark.start === previousStart
      && mark.end === previousEnd
    );
    if (!(mark.start >= 0 && mark.end > mark.start && (mark.start >= previousEnd || sameGroupOverlap))) {
      errors.push(`${record.recordId}: 含零时长、重叠或乱序时间标记`);
      break;
    }
    previousStart = mark.start;
    previousEnd = Math.max(previousEnd, mark.end);
    previousGroup = mark.alignment_group || null;
  }
  const asr = verificationById.get(record.recordId);
  const textAsrPass = asr?.similarity >= MINIMUM_ASR_SIMILARITY;
  const phoneticAsrPass = asr?.phoneticPolicy === PHONETIC_POLICY
    && asr?.phoneticSimilarity >= MINIMUM_ASR_SIMILARITY;
  if (
    !asr
    || asr.contentHash !== expectedHash
    || asr.automatedPass !== true
    || (!textAsrPass && !phoneticAsrPass)
    || asr.asrPass !== true
    || asr.alignmentWritten !== true
    || asr.alignmentGroupCount !== (marks.alignment_groups?.length ?? -1)
  ) {
    errors.push(`${record.recordId}: ASR回读未通过`);
  }
  if (asr?.audioSha256 !== actualAudioHash) errors.push(`${record.recordId}: ASR后音频发生变化`);
  const human = listeningById.get(record.recordId);
  if (human?.reviewEvidenceHash !== expectedReviewEvidenceById.get(record.recordId)) {
    errors.push(`${record.recordId}: 人耳听审证据与当前文案、音频或看审资源不一致`);
  }
  if (
    !human
    || human.contentHash !== expectedHash
    || human.audioSha256 !== actualAudioHash
    || human.listenCompleted !== true
    || human.verdict !== "pass"
    || human.mnemonicMatchPass !== true
    || human.heritageBoundaryPass !== true
    || human.pronunciationPass !== true
    || human.prosodyPass !== true
  ) {
    errors.push(`${record.recordId}: 人耳听审未通过`);
  }
}

for (const id of Object.keys(manifest.records || {})) if (!approvedIds.has(id)) errors.push(`${id}: 音频清单含未批准记录`);

if (errors.length) {
  for (const error of errors) process.stderr.write(`ERROR ${error}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Qwen3 narration release gate passed for ${EXPECTED_RECORD_COUNT} approved records.\n`);
}
