import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  copyFile,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { characters } from "../app/data/catalog.ts";

const EXPECTED_RECORD_COUNT = characters.length;
const projectRoot = resolve(import.meta.dirname, "..");
const publicRoot = join(projectRoot, "public");
const releaseValidatorPath = join(import.meta.dirname, "validate-qwen3-narration-release.mjs");
const RELEASE_SOURCE_KEYS = ["approvedBook", "qwenManifest", "asrVerification", "humanListening"];

const [bookArg, manifestArg, stagingArg] = process.argv.slice(2);

function usageError() {
  return new Error(
    "Usage: node scripts/stage-qwen3-narration-release.mjs "
      + "<approved-book.json> <qwen-manifest.json> <new-staging-directory>",
  );
}

function isInside(parent, candidate) {
  const pathFromParent = relative(parent, candidate);
  return pathFromParent === "" || (!pathFromParent.startsWith("..") && !isAbsolute(pathFromParent));
}

async function exists(path) {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function assertSafeNewStagingTarget(stagingPath) {
  if (stagingPath === projectRoot) throw new Error("staging 目录不能是项目根目录");
  if (isInside(publicRoot, stagingPath)) throw new Error("staging 目录不能位于 public 内");
  if (await exists(stagingPath)) throw new Error("staging 目录必须是全新路径，不能覆盖已有文件或目录");

  let existingAncestor = dirname(stagingPath);
  while (!await exists(existingAncestor)) {
    const parent = dirname(existingAncestor);
    if (parent === existingAncestor) break;
    existingAncestor = parent;
  }
  const [canonicalAncestor, canonicalPublic] = await Promise.all([
    realpath(existingAncestor),
    realpath(publicRoot),
  ]);
  const canonicalTarget = resolve(canonicalAncestor, relative(existingAncestor, stagingPath));
  if (isInside(canonicalPublic, canonicalTarget)) {
    throw new Error("staging 目录不能经由符号链接指向 public");
  }
}

async function runFormalReleaseGate(bookPath, manifestPath) {
  const result = await new Promise((resolveResult, reject) => {
    const child = spawn(process.execPath, [releaseValidatorPath, bookPath, manifestPath], {
      cwd: projectRoot,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.once("error", reject);
    child.once("close", (code, signal) => resolveResult({ code, signal, stdout, stderr }));
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.code !== 0) {
    const suffix = result.signal ? `，signal=${result.signal}` : "";
    throw new Error(`Qwen3 正式 release gate 未通过，拒绝写入 staging${suffix}`);
  }
}

function assertSafeRecordId(recordId) {
  if (typeof recordId !== "string" || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/u.test(recordId)) {
    throw new Error(`不安全的 recordId 路径片段: ${String(recordId)}`);
  }
}

function expectedContentPath(contentHash, fileName) {
  return `by-content/${contentHash}/${fileName}`;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function sha256File(path) {
  return sha256(await readFile(path));
}

async function captureReleaseSources(bookPath, manifestPath) {
  const manifestRoot = dirname(manifestPath);
  const paths = {
    approvedBook: bookPath,
    qwenManifest: manifestPath,
    asrVerification: join(manifestRoot, "asr-verification.json"),
    humanListening: join(manifestRoot, "human-listening.json"),
  };
  const entries = await Promise.all(Object.entries(paths).map(async ([key, path]) => {
    const raw = await readFile(path, "utf8");
    return [key, { path, raw, sha256: sha256(raw), parsed: JSON.parse(raw) }];
  }));
  const snapshot = Object.fromEntries(entries);
  const digestCache = new Map();
  const cachedDigest = (path) => {
    if (!digestCache.has(path)) digestCache.set(path, sha256File(path));
    return digestCache.get(path);
  };
  snapshot.assetHashes = {};
  for (const [recordId, record] of Object.entries(snapshot.qwenManifest.parsed.records || {})) {
    const audioPath = join(manifestRoot, record.audio);
    const marksPath = join(manifestRoot, record.audioMarks);
    snapshot.assetHashes[recordId] = {
      audioPath,
      marksPath,
      audioSha256: await cachedDigest(audioPath),
      marksSha256: await cachedDigest(marksPath),
    };
  }
  return snapshot;
}

async function assertReleaseSourcesUnchanged(snapshot) {
  for (const key of RELEASE_SOURCE_KEYS) {
    const source = snapshot[key];
    if (await sha256File(source.path) !== source.sha256) {
      throw new Error(`${key} 在正式门禁后发生变化，拒绝提交 staging`);
    }
  }
  const digestCache = new Map();
  const cachedDigest = (path) => {
    if (!digestCache.has(path)) digestCache.set(path, sha256File(path));
    return digestCache.get(path);
  };
  for (const [recordId, asset] of Object.entries(snapshot.assetHashes)) {
    const [audioSha256, marksSha256] = await Promise.all([
      cachedDigest(asset.audioPath),
      cachedDigest(asset.marksPath),
    ]);
    if (audioSha256 !== asset.audioSha256 || marksSha256 !== asset.marksSha256) {
      throw new Error(`${recordId}: source audio/marks 在正式门禁后发生变化，拒绝提交 staging`);
    }
  }
}

function narrationAssetsSource(assets) {
  return `export type NarrationAsset = {\n`
    + `  audio: string;\n`
    + `  audioMarks: string;\n`
    + `  voice: "封";\n`
    + `};\n\n`
    + `export const narrationAssets: Record<string, NarrationAsset> = ${JSON.stringify(assets, null, 2)};\n`;
}

function releasedTranscriptsSource(records) {
  return `export type ReleasedNarrationTranscript = {\n`
    + `  recordId: string;\n`
    + `  glyph: string;\n`
    + `  lessonId: string;\n`
    + `  word: string;\n`
    + `  transcript: string;\n`
    + `  contentHash: string;\n`
    + `  audioSha256: string;\n`
    + `};\n\n`
    + `// Repeated glyphs remain separate lesson records. Runtime lookup and asset paths use recordId.\n`
    + `export const narrationDuplicateGlyphPolicy = {\n`
    + `  lookupKey: "recordId",\n`
    + `  destinationIsolation: "one-directory-per-recordId",\n`
    + `  sharedContentSourceAllowed: true,\n`
    + `  glyphDeduplicationAllowed: false,\n`
    + `} as const;\n\n`
    + `export const releasedNarrationTranscripts: Record<string, ReleasedNarrationTranscript> = ${JSON.stringify(records, null, 2)};\n`;
}

function duplicateGlyphGroups(records) {
  const byGlyph = new Map();
  for (const record of records) {
    const ids = byGlyph.get(record.glyph) || [];
    ids.push(record.recordId);
    byGlyph.set(record.glyph, ids);
  }
  return Object.fromEntries([...byGlyph].filter(([, ids]) => ids.length > 1));
}

async function buildStagingDirectory(tempRoot, sourceSnapshot) {
  const book = sourceSnapshot.approvedBook.parsed;
  const manifest = sourceSnapshot.qwenManifest.parsed;
  const verification = sourceSnapshot.asrVerification.parsed;
  const listening = sourceSnapshot.humanListening.parsed;
  const records = book.records || [];
  const recordIds = records.map((record) => record.recordId);
  if (records.length !== EXPECTED_RECORD_COUNT || new Set(recordIds).size !== EXPECTED_RECORD_COUNT) {
    throw new Error(`staging 必须精确包含 ${EXPECTED_RECORD_COUNT} 个唯一 recordId`);
  }

  const manifestRoot = dirname(sourceSnapshot.qwenManifest.path);
  const stagedPublicRoot = join(tempRoot, "public", "narration");
  const stagedDataRoot = join(tempRoot, "app", "data");
  await Promise.all([
    mkdir(stagedPublicRoot, { recursive: true }),
    mkdir(stagedDataRoot, { recursive: true }),
  ]);

  const assets = {};
  const transcripts = {};
  const stagedRecords = {};
  const asrById = new Map((verification.checks || []).map((row) => [row.recordId, row]));
  const listeningById = new Map((listening.records || []).map((row) => [row.recordId, row]));
  for (const record of records) {
    assertSafeRecordId(record.recordId);
    const source = manifest.records?.[record.recordId];
    if (!source) throw new Error(`${record.recordId}: release manifest 缺少记录`);
    if (source.audio !== expectedContentPath(source.contentHash, "audio.webm")) {
      throw new Error(`${record.recordId}: 音频不是标准内容寻址路径`);
    }
    if (source.audioMarks !== expectedContentPath(source.contentHash, "audio-marks.json")) {
      throw new Error(`${record.recordId}: marks 不是标准内容寻址路径`);
    }

    const recordRoot = join(stagedPublicRoot, record.recordId);
    const stagedAudio = join(recordRoot, "audio.webm");
    const stagedMarks = join(recordRoot, "audio-marks.json");
    await mkdir(recordRoot);
    await Promise.all([
      copyFile(join(manifestRoot, source.audio), stagedAudio),
      copyFile(join(manifestRoot, source.audioMarks), stagedMarks),
    ]);
    const [audioSha256, marksRaw] = await Promise.all([
      sha256File(stagedAudio),
      readFile(stagedMarks, "utf8"),
    ]);
    const marks = JSON.parse(marksRaw);
    const sourceHashes = sourceSnapshot.assetHashes[record.recordId];
    if (audioSha256 !== sourceHashes.audioSha256 || sha256(marksRaw) !== sourceHashes.marksSha256) {
      throw new Error(`${record.recordId}: 暂存副本与正式门禁前的 source audio/marks 不一致`);
    }
    if (marks.aligned_audio_sha256 !== audioSha256) {
      throw new Error(`${record.recordId}: 暂存音频与强制对齐摘要不一致`);
    }
    if (marks.content_hash !== source.contentHash) throw new Error(`${record.recordId}: 暂存 marks 内容摘要不一致`);
    if (marks.model !== manifest.model || marks.model_revision !== manifest.modelRevision) {
      throw new Error(`${record.recordId}: 暂存 marks 模型来源不一致`);
    }
    if (
      marks.alignment_model !== verification.alignmentModel
      || marks.alignment_model_revision !== verification.alignmentModelRevision
    ) {
      throw new Error(`${record.recordId}: 暂存 marks 对齐模型来源不一致`);
    }
    if (marks.generation_policy !== manifest.generationPolicy) {
      throw new Error(`${record.recordId}: 暂存 marks 生成策略不一致`);
    }
    if (
      marks.voice_reference !== manifest.voice
      || marks.reference_id !== manifest.reference.id
      || marks.reference_sha256 !== manifest.reference.sha256
    ) {
      throw new Error(`${record.recordId}: 暂存 marks 参考音来源不一致`);
    }
    if (asrById.get(record.recordId)?.audioSha256 !== audioSha256) {
      throw new Error(`${record.recordId}: 暂存音频与ASR验收摘要不一致`);
    }
    if (listeningById.get(record.recordId)?.audioSha256 !== audioSha256) {
      throw new Error(`${record.recordId}: 暂存音频与人耳听审摘要不一致`);
    }

    assets[record.recordId] = {
      audio: `/narration/${record.recordId}/audio.webm`,
      audioMarks: `/narration/${record.recordId}/audio-marks.json`,
      voice: "封",
    };
    transcripts[record.recordId] = {
      recordId: record.recordId,
      glyph: record.glyph,
      lessonId: record.lessonId,
      word: record.word,
      transcript: record.ttsText,
      contentHash: source.contentHash,
      audioSha256,
    };
    stagedRecords[record.recordId] = {
      glyph: record.glyph,
      contentHash: source.contentHash,
      audioSha256,
      audioMarksSha256: sourceHashes.marksSha256,
      audio: `public/narration/${record.recordId}/audio.webm`,
      audioMarks: `public/narration/${record.recordId}/audio-marks.json`,
    };
  }

  await Promise.all([
    writeFile(join(stagedDataRoot, "narration-assets.ts"), narrationAssetsSource(assets), "utf8"),
    writeFile(
      join(stagedDataRoot, "released-narration-transcripts.generated.ts"),
      releasedTranscriptsSource(transcripts),
      "utf8",
    ),
    writeFile(join(tempRoot, "release-staging.json"), `${JSON.stringify({
      version: "narration-v3-qwen3-local-staging",
      recordCount: records.length,
      source: {
        approvedBookSha256: sourceSnapshot.approvedBook.sha256,
        qwenManifestSha256: sourceSnapshot.qwenManifest.sha256,
        asrVerificationSha256: sourceSnapshot.asrVerification.sha256,
        humanListeningSha256: sourceSnapshot.humanListening.sha256,
        model: manifest.model,
        modelRevision: manifest.modelRevision,
        asrModel: verification.model,
        asrModelRevision: verification.modelRevision,
        alignmentModel: verification.alignmentModel,
        alignmentModelRevision: verification.alignmentModelRevision,
        generationPolicy: manifest.generationPolicy,
        voice: manifest.voice,
        referenceId: manifest.reference.id,
        referenceSha256: manifest.reference.sha256,
      },
      duplicateGlyphPolicy: {
        lookupKey: "recordId",
        destinationIsolation: "one-directory-per-recordId",
        sharedContentSourceAllowed: true,
        glyphDeduplicationAllowed: false,
      },
      duplicateGlyphs: duplicateGlyphGroups(records),
      generatedFiles: [
        "app/data/narration-assets.ts",
        "app/data/released-narration-transcripts.generated.ts",
      ],
      records: stagedRecords,
    }, null, 2)}\n`, "utf8"),
  ]);
}

async function main() {
  if (!bookArg || !manifestArg || !stagingArg || process.argv.slice(2).length !== 3) throw usageError();
  const bookPath = resolve(bookArg);
  const manifestPath = resolve(manifestArg);
  const stagingPath = resolve(stagingArg);
  await assertSafeNewStagingTarget(stagingPath);
  const sourceSnapshot = await captureReleaseSources(bookPath, manifestPath);

  // No directory creation or file write is allowed before this exact production gate succeeds.
  await runFormalReleaseGate(bookPath, manifestPath);
  await assertReleaseSourcesUnchanged(sourceSnapshot);

  // Recheck after the asynchronous gate so a newly created target is never overwritten.
  await assertSafeNewStagingTarget(stagingPath);
  const stagingParent = dirname(stagingPath);
  await mkdir(stagingParent, { recursive: true });
  const tempRoot = await mkdtemp(join(stagingParent, `.${basename(stagingPath)}.tmp-`));
  try {
    await buildStagingDirectory(tempRoot, sourceSnapshot);
    await assertReleaseSourcesUnchanged(sourceSnapshot);
    if (await exists(stagingPath)) throw new Error("staging 目标在构建期间出现，拒绝覆盖");
    await rename(tempRoot, stagingPath);
  } catch (error) {
    await rm(tempRoot, { recursive: true, force: true });
    throw error;
  }

  process.stdout.write(`Staged ${EXPECTED_RECORD_COUNT} Qwen3 narration records at ${stagingPath}. No public files were changed and nothing was uploaded.\n`);
}

main().catch((error) => {
  process.stderr.write(`ERROR ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
