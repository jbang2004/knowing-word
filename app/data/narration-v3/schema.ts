/**
 * Narration v3 is authored content. Generators may assemble indexes and media
 * manifests, but they must never synthesize or rewrite the prose in this model.
 */

export type NarrationReviewStatus = "draft" | "reviewed" | "approved";
export type EvidenceGrade = "A" | "B" | "C" | "D";
export type EtymologyReview = "mnemonic-only" | "needs-review" | "verified";

export type NarrationClaim = {
  text: string;
  kind: "curriculum" | "meaning" | "structure" | "etymology" | "mnemonic";
  evidenceGrade: EvidenceGrade;
  source?: string;
};

/** One reusable, context-independent fact card per glyph (423 in this book). */
export type GlyphFactCard = {
  glyph: string;
  meaningForChildren: string;
  structure: string;
  components: readonly string[];
  spokenComponents: readonly string[];
  etymologyReview: EtymologyReview;
  claims: readonly NarrationClaim[];
  risks: readonly string[];
  status: NarrationReviewStatus;
};

/** One lesson-aware script per catalog record (430 in this book). */
export type ContextualNarration = {
  recordId: string;
  glyph: string;
  lessonId: string;
  lessonTitle: string;
  word: string;
  pinyin: string;
  script: string;
  /** Optional TTS-safe wording when displayed pinyin or symbols are unstable. */
  ttsText?: string;
  courseConnection: string;
  shapeAnchors: readonly string[];
  claims: readonly NarrationClaim[];
  risks: readonly string[];
  charCount: number;
  status: NarrationReviewStatus;
  reviewer?: string;
};

export type NarrationV3Package = {
  version: "narration-v3";
  packageId: string;
  factCards: readonly GlyphFactCard[];
  records: readonly ContextualNarration[];
};
