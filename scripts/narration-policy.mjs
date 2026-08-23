import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const lockPath = resolve(import.meta.dirname, "../config/narration-toolchain.lock.json");
export const narrationToolchainLock = JSON.parse(await readFile(lockPath, "utf8"));

export const FORMAL_MODEL = narrationToolchainLock.models.tts.id;
export const FORMAL_MODEL_REVISION = narrationToolchainLock.models.tts.revision;
export const FORMAL_ASR_MODEL = narrationToolchainLock.models.asr.id;
export const FORMAL_ASR_MODEL_REVISION = narrationToolchainLock.models.asr.revision;
export const FORMAL_ALIGNER = narrationToolchainLock.models.aligner.id;
export const FORMAL_ALIGNER_REVISION = narrationToolchainLock.models.aligner.revision;
export const FORMAL_POLICY = narrationToolchainLock.formal.generationPolicy;
export const FORMAL_VOICE = narrationToolchainLock.formal.voice;
export const FORMAL_SEED = narrationToolchainLock.formal.seed;
export const FORMAL_SAMPLE_RATE = narrationToolchainLock.formal.sampleRate;
export const FORMAL_MINIMUM_ASR_SIMILARITY = narrationToolchainLock.formal.minimumAsrSimilarity;
export const FORMAL_PHONETIC_POLICY = narrationToolchainLock.formal.phoneticPolicy;
export const FORMAL_REFERENCE_ID = narrationToolchainLock.formal.reference.id;
export const FORMAL_REFERENCE_SHA256 = narrationToolchainLock.formal.reference.sha256;

export const formalNarrationBookPolicy = Object.freeze({
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
});
