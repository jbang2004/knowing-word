import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { characters } from "../app/data/catalog.ts";
import { containsLatinPinyin } from "./narration-tts-text.mjs";
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
} from "./narration-policy.mjs";

const args = process.argv.slice(2);
const fileArg = args.find((arg) => !arg.startsWith("--"));
if (!fileArg) throw new Error("Usage: node scripts/validate-narration-v3.mjs <file.json> [--corpus]");

const payload = JSON.parse(await readFile(resolve(fileArg), "utf8"));
const records = Array.isArray(payload) ? payload : payload.records;
const factCards = Array.isArray(payload?.factCards) ? payload.factCards : [];
const approvedMode = args.includes("--approved") || payload?.version === "narration-v3-book";
if (!Array.isArray(records) && !factCards.length) throw new Error("Expected records or factCards in the JSON input");

const catalogById = new Map(characters.map((record) => [record.id, record]));
const errors = [];
const warnings = [];
const seen = new Set();
const riskyClaimPattern = /(本义|造字|字源|象形|会意|形声|形旁|声旁|表意|表音)/u;
const mechanicalPattern = /(先看整体结构|再看关键部件|最后再读一遍|这个字适合顺着完整轮廓来记|从构字分工看)/u;

function countSentences(text) {
  return (text.match(/[。！？]/gu) || []).length;
}

for (const [index, record] of (records || []).entries()) {
  const label = record.recordId || `#${index + 1}`;
  const catalogRecord = catalogById.get(record.recordId);
  if (!catalogRecord) errors.push(`${label}: recordId 不在 catalog 中`);
  if (seen.has(record.recordId)) errors.push(`${label}: recordId 重复`);
  seen.add(record.recordId);
  for (const field of ["recordId", "glyph", "lessonId", "word", "script", "courseConnection"]) {
    if (typeof record[field] !== "string" || !record[field].trim()) errors.push(`${label}: 缺少 ${field}`);
  }
  if (catalogRecord && record.glyph !== catalogRecord.hanzi) errors.push(`${label}: glyph 与 catalog 不符`);
  if (catalogRecord && record.lessonId !== catalogRecord.lessonId) errors.push(`${label}: lessonId 与 catalog 不符`);
  if (catalogRecord && record.word !== catalogRecord.word) errors.push(`${label}: word 与 catalog 不符`);
  const length = Array.from(record.script || "").length;
  if (record.charCount !== undefined && record.charCount !== length) errors.push(`${label}: charCount 应为 ${length}`);
  if (length < 85 || length > 150) errors.push(`${label}: 讲稿长度 ${length}，要求 85–150`);
  const sentences = countSentences(record.script || "");
  if (sentences < 4 || sentences > 6) errors.push(`${label}: 句数 ${sentences}，要求 4–6`);
  if (!record.script?.includes(record.glyph)) errors.push(`${label}: 讲稿没有出现目标字`);
  if (!record.script?.includes(record.word)) warnings.push(`${label}: 讲稿没有完整出现本课词语“${record.word}”`);
  if (!Array.isArray(record.shapeAnchors) || !record.shapeAnchors.length) errors.push(`${label}: shapeAnchors 为空`);
  if (!Array.isArray(record.claims)) errors.push(`${label}: claims 必须是数组`);
  if (!Array.isArray(record.risks)) errors.push(`${label}: risks 必须是数组`);
  if (approvedMode) {
    if (record.status !== "approved" || record.reviewer !== "root") errors.push(`${label}: 批准稿必须由 root 标记 approved`);
    if (!Number.isFinite(record.reviewScore) || record.reviewScore < 90) errors.push(`${label}: 批准稿主审分数不足 90`);
    for (const claim of record.claims || []) {
      if (!claim || typeof claim !== "object" || !claim.text || !claim.kind || !claim.evidenceGrade) {
        errors.push(`${label}: 批准稿 claims 必须使用结构化证据对象`);
        break;
      }
    }
    if (typeof record.ttsText !== "string" || !record.ttsText.trim()) errors.push(`${label}: 批准稿缺少 TTS 安全文本`);
    if (containsLatinPinyin(record.ttsText || "")) errors.push(`${label}: TTS 安全文本仍含拉丁拼音`);
  }
  if (mechanicalPattern.test(record.script || "")) warnings.push(`${label}: 命中旧生成器机械句式`);
  if (riskyClaimPattern.test(record.script || "")) {
    const supported = record.claims?.some((claim) =>
      typeof claim === "object"
        ? claim.evidenceGrade && claim.evidenceGrade !== "D" && claim.source
        : false,
    );
    if (!supported) warnings.push(`${label}: 含字源/构字结论，但没有带来源的 A–C 级 claim`);
  }
}

const scripts = (records || []).map((record) => record.script || "");
for (let left = 0; left < scripts.length; left += 1) {
  for (let right = left + 1; right < scripts.length; right += 1) {
    if (scripts[left] === scripts[right]) {
      errors.push(`${records[left].recordId} / ${records[right].recordId}: 讲稿完全重复`);
      continue;
    }
    const chunks = new Set();
    const chars = Array.from(scripts[left]);
    for (let start = 0; start <= chars.length - 24; start += 1) chunks.add(chars.slice(start, start + 24).join(""));
    if (Array.from(scripts[right]).some((_, start, all) => chunks.has(all.slice(start, start + 24).join("")))) {
      warnings.push(`${records[left].recordId} / ${records[right].recordId}: 存在 24 字以上共用片段`);
    }
  }
}

if (args.includes("--corpus") && records) {
  const expected = new Set(characters.map((record) => record.id));
  for (const id of expected) if (!seen.has(id)) errors.push(`${id}: 全书模式缺稿`);
  for (const id of seen) if (!expected.has(id)) errors.push(`${id}: 全书模式出现未知记录`);
}

const seenGlyphs = new Set();
for (const card of factCards) {
  const label = card.glyph || "<missing glyph>";
  const catalogRecords = characters.filter((record) => record.hanzi === card.glyph);
  if (seenGlyphs.has(card.glyph)) errors.push(`${label}: fact card 重复`);
  seenGlyphs.add(card.glyph);
  for (const field of ["glyph", "meaningForChildren", "structure", "etymologyReview", "status"]) {
    if (typeof card[field] !== "string" || !card[field].trim()) errors.push(`${label}: fact card 缺少 ${field}`);
  }
  if (!Array.isArray(card.components) || !card.components.length) errors.push(`${label}: components 为空`);
  if (!Array.isArray(card.spokenComponents) || card.spokenComponents.length !== card.components?.length) {
    errors.push(`${label}: spokenComponents 必须逐一对应 components`);
  }
  if (!Array.isArray(card.claims) || !Array.isArray(card.risks)) errors.push(`${label}: claims/risks 必须是数组`);
  if (!catalogRecords.length) errors.push(`${label}: fact card 不在 catalog 中`);
  if (catalogRecords.length) {
    const expectedRecordIds = catalogRecords.map((record) => record.id).sort();
    const actualRecordIds = [...(card.recordIds || [])].sort();
    if (JSON.stringify(actualRecordIds) !== JSON.stringify(expectedRecordIds)) errors.push(`${label}: recordIds 与 catalog 不一致`);
    if (card.structure !== catalogRecords[0].decomposition) errors.push(`${label}: structure 与 catalog 不一致`);
    const expectedComponents = catalogRecords[0].parts.map((part) => part.char);
    if (JSON.stringify(card.components) !== JSON.stringify(expectedComponents)) errors.push(`${label}: components 与 catalog 不一致`);
  }
  for (const [index, spoken] of (card.spokenComponents || []).entries()) {
    if (typeof spoken !== "string" || !spoken.trim()) errors.push(`${label}: 第 ${index + 1} 个课堂部件名为空`);
    const component = card.components?.[index] || "";
    if (spoken === component && (/^[\u2e80-\u2fff]$/u.test(component) || Array.from(component).some((char) => char.codePointAt(0) > 0xffff))) {
      errors.push(`${label}: 生僻部件 ${component} 不能直接口播`);
    }
  }
  for (const claim of card.claims || []) {
    if (!claim || typeof claim !== "object" || !claim.text || !claim.kind || !claim.evidenceGrade) {
      errors.push(`${label}: fact card claims 必须使用结构化证据对象`);
      break;
    }
  }
  if (card.status === "approved" && card.etymologyReview === "needs-review") {
    errors.push(`${label}: 未完成字源复核的 fact card 不能批准`);
  }
  if (approvedMode && card.status !== "approved") errors.push(`${label}: 批准库中的 fact card 必须为 approved`);
}

if (approvedMode) {
  const expectedGlyphCount = new Set(characters.map((record) => record.hanzi)).size;
  if ((records || []).length !== characters.length) {
    errors.push(`批准库讲稿应为 ${characters.length} 条，实际 ${(records || []).length}`);
  }
  if (factCards.length !== expectedGlyphCount) {
    errors.push(`批准库事实卡应为 ${expectedGlyphCount} 张，实际 ${factCards.length}`);
  }
  if (payload?.modelPolicy?.formalCloneModel !== FORMAL_MODEL) {
    errors.push("批准库正式克隆模型必须是 Qwen3-TTS 1.7B Base 4bit");
  }
  if (payload?.modelPolicy?.formalModelRevision !== FORMAL_MODEL_REVISION) {
    errors.push("批准库正式克隆模型 revision 不一致");
  }
  if (payload?.modelPolicy?.voice !== FORMAL_VOICE) {
    errors.push("批准库正式音色标杆不一致");
  }
  if (payload?.modelPolicy?.formalAsrModel !== FORMAL_ASR_MODEL) {
    errors.push("批准库正式ASR模型不一致");
  }
  if (payload?.modelPolicy?.formalAsrModelRevision !== FORMAL_ASR_MODEL_REVISION) {
    errors.push("批准库正式ASR模型 revision 不一致");
  }
  if (payload?.modelPolicy?.formalAlignmentModel !== FORMAL_ALIGNER) {
    errors.push("批准库正式对齐模型不一致");
  }
  if (payload?.modelPolicy?.formalAlignmentModelRevision !== FORMAL_ALIGNER_REVISION) {
    errors.push("批准库正式对齐模型 revision 不一致");
  }
  if (payload?.modelPolicy?.formalGenerationPolicy !== FORMAL_POLICY) {
    errors.push("批准库正式音频生成策略版本不一致");
  }
  if (payload?.modelPolicy?.formalReferenceId !== FORMAL_REFERENCE_ID) {
    errors.push("批准库正式参考音记录不一致");
  }
  if (payload?.modelPolicy?.formalReferenceSha256 !== FORMAL_REFERENCE_SHA256) {
    errors.push("批准库正式参考音摘要不一致");
  }
}

for (const warning of [...new Set(warnings)]) process.stderr.write(`WARN ${warning}\n`);
if (errors.length) {
  for (const error of [...new Set(errors)]) process.stderr.write(`ERROR ${error}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Validated ${(records || []).length} narration records and ${factCards.length} fact cards with ${new Set(warnings).size} warning(s).\n`);
}
