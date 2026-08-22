import { createHash } from "node:crypto";
import { access, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { characters } from "../app/data/catalog.ts";
import { heritageAssets } from "../app/data/heritage-assets.ts";
import { characterVisuals } from "../app/data/illustrations.ts";

export const FORMAL_MODEL = "mlx-community/Qwen3-TTS-12Hz-1.7B-Base-4bit";
export const FORMAL_MODEL_REVISION = "37e955a1deb861c088ae5f3a67043185f3d1a60c";
export const FORMAL_POLICY = "qwen3-clone-2026-08-22-v3";
export const FORMAL_VOICE = "封";
export const FORMAL_SEED = 20260822;
export const FORMAL_REFERENCE_ID = "019f0554-ea22-762e-966c-32d678fd6bf6";
export const FORMAL_REFERENCE_SHA256 = "eb07e06ee13a20ee4577b1b481df6d33d42127c1b3876bfa5d5e5362ae349f19";

const MODULE_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(MODULE_DIRECTORY, "..");
const PUBLIC_ROOT = resolve(PROJECT_ROOT, "public");
const characterById = new Map(characters.map(character => [character.id, character]));
const characterByGlyph = new Map(characters.map(character => [character.hanzi, character]));

function pythonFlatJson(object) {
  return `{${Object.entries(object)
    .sort(([left], [right]) => left.localeCompare(right, "en"))
    .map(([key, value]) => `${JSON.stringify(key)}: ${JSON.stringify(value)}`)
    .join(", ")}}`;
}

export function qwenContentHash(
  text,
  referenceHash,
  model = FORMAL_MODEL,
  modelRevision = FORMAL_MODEL_REVISION,
) {
  return createHash("sha256")
    .update(pythonFlatJson({
      text,
      reference: referenceHash,
      model,
      modelRevision,
      voice: FORMAL_VOICE,
      policy: FORMAL_POLICY,
      seed: FORMAL_SEED,
    }))
    .digest("hex")
    .slice(0, 20);
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

function assertUnique(values, label, expectedCount) {
  if (values.length !== expectedCount) {
    throw new Error(`${label}应为${expectedCount}条，实际${values.length}条`);
  }
  const unique = new Set(values);
  if (unique.size !== values.length) throw new Error(`${label}含重复项`);
}

function isInside(parent, child) {
  const path = relative(parent, child);
  return path === "" || (!path.startsWith(`..${sep}`) && path !== ".." && !isAbsolute(path));
}

function browserPath(fromDirectory, targetPath) {
  const path = relative(fromDirectory, targetPath).split(sep).join("/");
  return path || ".";
}

function publicAssetForReview(outputDirectory, source) {
  if (typeof source !== "string" || !source.startsWith("/")) return null;
  const absolute = resolve(PUBLIC_ROOT, source.slice(1));
  if (!isInside(PUBLIC_ROOT, absolute)) throw new Error(`静态资源路径越出 public 目录：${source}`);
  return {
    source,
    absolute,
    browser: browserPath(outputDirectory, absolute),
  };
}

function safeJsonForScript(value) {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function assertPublicAsset(recordId, label, source) {
  const asset = publicAssetForReview(PUBLIC_ROOT, source);
  if (!asset) throw new Error(`${recordId}: 缺少${label}资源路径`);
  let info;
  try {
    info = await stat(asset.absolute);
  } catch {
    throw new Error(`${recordId}: 找不到${label}资源 ${asset.absolute}`);
  }
  if (!info.isFile()) throw new Error(`${recordId}: ${label}资源不是文件`);
}

export function validateListeningInputs(book, manifest, expectedRecordCount = 430) {
  if (book?.version !== "narration-v3-book") {
    throw new Error("输入不是批准版 narration-v3-book");
  }
  if (!Array.isArray(book.records)) throw new Error("批准书缺少 records 数组");
  if (book.modelPolicy?.formalCloneModel !== FORMAL_MODEL) {
    throw new Error("批准书正式克隆模型与当前4bit政策不一致");
  }
  if (book.modelPolicy?.formalModelRevision !== FORMAL_MODEL_REVISION) {
    throw new Error("批准书正式模型 revision 与当前政策不一致");
  }
  if (book.modelPolicy?.formalGenerationPolicy !== FORMAL_POLICY) {
    throw new Error("批准书正式音频生成策略与当前政策不一致");
  }
  if (book.modelPolicy?.voice !== FORMAL_VOICE) throw new Error("批准书正式音色标杆不是封");
  if (book.modelPolicy?.formalReferenceId !== FORMAL_REFERENCE_ID) {
    throw new Error("批准书正式参考音记录与当前政策不一致");
  }
  if (book.modelPolicy?.formalReferenceSha256 !== FORMAL_REFERENCE_SHA256) {
    throw new Error("批准书正式参考音摘要与当前政策不一致");
  }
  assertUnique(book.records.map((row) => row.recordId), "批准讲稿", expectedRecordCount);
  for (const record of book.records) {
    if (record.status !== "approved" || record.reviewer !== "root") {
      throw new Error(`${record.recordId}: 讲稿尚未由root批准`);
    }
    for (const field of ["glyph", "word", "lessonId", "script", "ttsText"]) {
      if (typeof record[field] !== "string" || !record[field].trim()) {
        throw new Error(`${record.recordId}: 缺少${field}`);
      }
    }
  }

  if (manifest?.version !== "narration-v3-qwen3") throw new Error("输入不是 Qwen3 narration manifest");
  if (manifest.model !== FORMAL_MODEL) throw new Error("音频清单不是正式 Qwen3-TTS 1.7B Base 4bit 模型");
  if (manifest.modelRevision !== FORMAL_MODEL_REVISION) throw new Error("音频清单模型 revision 不一致");
  if (manifest.generationPolicy !== FORMAL_POLICY) throw new Error("音频生成策略版本不一致");
  if (manifest.voice !== FORMAL_VOICE) throw new Error("音色标杆不是封");
  if (manifest.reference?.id !== FORMAL_REFERENCE_ID) throw new Error("音频清单参考音记录不一致");
  if (manifest.reference?.sha256 !== FORMAL_REFERENCE_SHA256) throw new Error("音频清单参考音摘要不一致");
  if (!manifest.records || Array.isArray(manifest.records) || typeof manifest.records !== "object") {
    throw new Error("音频清单缺少 records 映射");
  }
  assertUnique(Object.keys(manifest.records), "音频清单", expectedRecordCount);

  const approvedIds = new Set(book.records.map((row) => row.recordId));
  for (const id of Object.keys(manifest.records)) {
    if (!approvedIds.has(id)) throw new Error(`${id}: 音频清单含未批准记录`);
  }
  for (const record of book.records) {
    const audio = manifest.records[record.recordId];
    if (!audio) throw new Error(`${record.recordId}: 音频清单缺少记录`);
    if (audio.glyph !== record.glyph || audio.word !== record.word) {
      throw new Error(`${record.recordId}: 音频清单的字或教学词与批准书不一致`);
    }
    if (typeof audio.audio !== "string" || !audio.audio || isAbsolute(audio.audio)) {
      throw new Error(`${record.recordId}: audio必须是清单目录内的相对路径`);
    }
    const expectedHash = qwenContentHash(
      record.ttsText,
      manifest.reference.sha256,
      manifest.model,
      manifest.modelRevision,
    );
    if (audio.contentHash !== expectedHash) {
      throw new Error(`${record.recordId}: 音频内容摘要与当前批准口播不一致`);
    }
  }
}

export function buildListeningPayload({
  book,
  manifest,
  bookPath,
  manifestPath,
  bookSha256,
  manifestSha256,
  audioSha256ById,
  outputDirectory,
  generatedAt = new Date().toISOString(),
}) {
  const manifestDirectory = dirname(manifestPath);
  return {
    version: "qwen3-human-listening-v3",
    status: "pending",
    reviewer: "",
    generatedAt,
    updatedAt: null,
    source: {
      approvedBook: bookPath,
      approvedBookSha256: bookSha256,
      qwenManifest: manifestPath,
      qwenManifestSha256: manifestSha256,
      model: manifest.model,
      modelRevision: manifest.modelRevision,
      generationPolicy: manifest.generationPolicy,
      voice: manifest.voice,
      referenceId: manifest.reference.id,
      referenceSha256: manifest.reference.sha256,
    },
    records: book.records.map((record, index) => {
      const audio = manifest.records[record.recordId];
      const absoluteAudio = resolve(manifestDirectory, audio.audio);
      const catalogCharacter = characterById.get(record.recordId) || characterByGlyph.get(record.glyph);
      const visual = characterVisuals[record.glyph];
      const visualAsset = publicAssetForReview(outputDirectory, visual?.src);
      const heritage = heritageAssets[record.recordId];
      const heritageStages = (heritage?.stages || []).map(stage => {
        const asset = publicAssetForReview(outputDirectory, stage.src);
        return {
          label: stage.label,
          src: asset?.browser || "",
          source: stage.src,
        };
      });
      const redBlueAsset = publicAssetForReview(outputDirectory, heritage?.redBlue);
      return {
        order: index + 1,
        recordId: record.recordId,
        glyph: record.glyph,
        word: record.word,
        lessonId: record.lessonId,
        lessonTitle: record.lessonTitle || "",
        script: record.script,
        ttsText: record.ttsText,
        pinyin: catalogCharacter?.pinyin || "",
        characterType: catalogCharacter?.charType || "未标注",
        decomposition: catalogCharacter?.decomposition || "",
        components: (catalogCharacter?.parts || []).map(part => ({
          glyph: part.char,
          semantic: part.radical === true,
        })),
        lessonContext: catalogCharacter?.originalText || "",
        mnemonicVisual: visualAsset ? {
          src: visualAsset.browser,
          source: visualAsset.source,
          label: visual.label,
          alt: visual.alt,
        } : null,
        heritageStages,
        redBlueVisual: redBlueAsset ? {
          src: redBlueAsset.browser,
          source: redBlueAsset.source,
        } : null,
        contentHash: audio.contentHash,
        audioSha256: audioSha256ById[record.recordId],
        audio: browserPath(outputDirectory, absoluteAudio),
        requiresPronunciationReview: audio.requiresPronunciationReview === true,
        listenCompleted: false,
        mnemonicMatchPass: null,
        heritageBoundaryPass: null,
        pronunciationPass: null,
        prosodyPass: null,
        verdict: "pending",
        note: "",
      };
    }),
  };
}

export function renderListeningHtml(payload) {
  const seed = safeJsonForScript(payload);
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Qwen3 正式讲解完整听审与看审</title>
  <style>
    :root { color-scheme: light; --ink:#172033; --muted:#667085; --line:#d8dee9; --paper:#f6f7fb; --card:#fff; --brand:#3157d5; --warn:#b54708; --bad:#b42318; --good:#067647; }
    * { box-sizing: border-box; }
    body { margin:0; font:15px/1.6 -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif; color:var(--ink); background:var(--paper); }
    button, input, select, textarea { font:inherit; }
    .top { position:sticky; top:0; z-index:10; padding:14px 18px; background:rgba(255,255,255,.96); border-bottom:1px solid var(--line); box-shadow:0 3px 14px rgba(16,24,40,.06); }
    .top h1 { margin:0 0 8px; font-size:20px; }
    .toolbar { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
    .toolbar input, .toolbar select, .toolbar button { min-height:38px; border:1px solid var(--line); border-radius:8px; background:white; padding:7px 10px; }
    .toolbar input[type="search"] { min-width:230px; }
    .toolbar button { cursor:pointer; }
    .toolbar .primary { color:white; background:var(--brand); border-color:var(--brand); }
    .stats { margin-top:8px; color:var(--muted); font-size:13px; }
    main { max-width:1080px; margin:18px auto 60px; padding:0 14px; }
    .notice { margin-bottom:14px; padding:11px 13px; background:#fff7ed; border:1px solid #fed7aa; border-radius:10px; color:#9a3412; }
    .card { margin:0 0 14px; padding:16px; background:var(--card); border:1px solid var(--line); border-radius:12px; box-shadow:0 2px 8px rgba(16,24,40,.04); }
    .card.pending { border-left:4px solid #98a2b3; }
    .card.pass { border-left:4px solid var(--good); }
    .card.revise { border-left:4px solid var(--bad); }
    .head { display:flex; gap:12px; justify-content:space-between; align-items:flex-start; }
    .identity { display:flex; gap:12px; align-items:center; }
    .glyph { font:700 36px/1.1 "Songti SC",serif; min-width:46px; text-align:center; }
    .word { font-size:18px; font-weight:700; }
    .meta { color:var(--muted); font-size:12px; }
    .badge { display:inline-block; margin-left:6px; padding:1px 7px; border-radius:999px; color:var(--warn); background:#fffaeb; border:1px solid #fedf89; font-size:12px; }
    .visual-panel { margin:14px 0 12px; padding:14px; border:1px solid #c7d7fe; border-radius:12px; background:#f8faff; }
    .visual-layout { display:grid; grid-template-columns:minmax(300px,1.35fr) minmax(280px,1fr); gap:14px; }
    .visual-card { overflow:hidden; min-width:0; border:1px solid var(--line); border-radius:10px; background:white; }
    .visual-card h3 { margin:0; padding:9px 12px; border-bottom:1px solid var(--line); color:#344054; background:#f8fafc; font-size:13px; }
    .mnemonic-image { display:block; width:100%; height:360px; object-fit:contain; background:#f2f4f7; }
    .visual-caption { padding:10px 12px; }
    .visual-caption strong { display:block; font-size:16px; }
    .visual-caption p { margin:4px 0 0; color:var(--muted); font-size:12px; }
    .glyph-facts { display:flex; flex-wrap:wrap; gap:6px; margin:0 0 10px; }
    .fact-pill { padding:3px 9px; border:1px solid #b2ccff; border-radius:999px; color:#1849a9; background:#eff4ff; font-size:12px; }
    .modern-glyph { display:flex; min-height:150px; align-items:center; justify-content:center; font:700 106px/1 "Songti SC",serif; color:#101828; }
    .heritage-strip { display:grid; grid-template-columns:repeat(auto-fit,minmax(86px,1fr)); gap:8px; padding:12px; }
    .heritage-stage { min-width:0; text-align:center; }
    .heritage-stage img { display:block; width:100%; height:112px; object-fit:contain; border:1px solid #eaecf0; border-radius:8px; background:#fff; }
    .heritage-stage small { display:block; margin-top:4px; color:#475467; }
    .red-blue-block { display:grid; grid-template-columns:110px 1fr; gap:10px; align-items:center; margin:0 12px 12px; padding:9px; border:1px dashed #b2ccff; border-radius:8px; }
    .red-blue-block img { width:110px; height:92px; object-fit:contain; }
    .red-blue-block p, .no-heritage { margin:0; color:var(--muted); font-size:12px; }
    .no-heritage { padding:0 14px 14px; text-align:center; }
    .context-line { margin:12px 0 0; padding:9px 11px; border-left:3px solid #84adff; color:#344054; background:white; font-size:13px; }
    .audio-panel { margin:14px 0 12px; padding:14px; border:1px solid #b2ccff; border-radius:10px; background:#f5f8ff; }
    .step-title { display:block; margin-bottom:8px; color:#1849a9; font-size:14px; }
    audio { display:block; width:100%; margin:0; }
    .listen-state { display:inline-block; margin-top:7px; color:var(--bad); font-size:12px; font-weight:700; }
    .listen-state.done { color:var(--good); }
    .copy { margin:10px 0; padding:11px 13px; border-radius:9px; background:#f8fafc; }
    .copy strong { display:block; margin-bottom:4px; color:#344054; font-size:12px; }
    .tts { background:#eef4ff; }
    .focus { margin:12px 0; padding:13px 15px; border:1px solid #fedf89; border-radius:10px; background:#fffaeb; }
    .focus strong { color:#93370d; }
    .focus ol { margin:7px 0 0; padding-left:22px; }
    .focus li + li { margin-top:4px; }
    .review-title { margin:16px 0 7px; color:#344054; font-size:14px; }
    .review { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:10px; margin-top:12px; }
    .review label { display:flex; flex-direction:column; gap:4px; color:#344054; font-size:13px; }
    .review select, .review textarea { width:100%; border:1px solid var(--line); border-radius:8px; background:white; padding:7px 9px; }
    .review textarea { grid-column:1/-1; min-height:72px; resize:vertical; }
    .row-warning { min-height:22px; color:var(--bad); font-size:12px; margin-top:5px; }
    .empty { padding:50px 10px; text-align:center; color:var(--muted); }
    @media (max-width:720px) { .head { display:block; } .visual-layout { grid-template-columns:1fr; } .mnemonic-image { height:auto; max-height:420px; } .review { grid-template-columns:1fr; } .review textarea { grid-column:auto; } audio { width:100%; } }
  </style>
</head>
<body>
  <header class="top">
    <h1>Qwen3 正式讲解完整听审与看审</h1>
    <div class="toolbar">
      <input id="reviewer" placeholder="听审人姓名（必填后才能完成）" autocomplete="name">
      <select id="batch-status" aria-label="整批状态">
        <option value="pending">整批待审</option>
        <option value="complete">明确标记整批完成</option>
      </select>
      <input id="search" type="search" placeholder="搜索字、词、课次或 recordId">
      <select id="filter" aria-label="筛选">
        <option value="all">全部</option>
        <option value="incomplete">未完成</option>
        <option value="pass">已通过</option>
        <option value="revise">需返修</option>
        <option value="pronunciation">重点读音</option>
        <option value="unheard">尚未完整播放</option>
      </select>
      <select id="view-mode" aria-label="查看方式">
        <option value="focus">逐条专注听审</option>
        <option value="list">列表浏览</option>
      </select>
      <button id="previous">上一条</button>
      <button id="next">下一条未完成</button>
      <button id="export" class="primary">导出 JSON</button>
    </div>
    <div class="stats" id="stats"></div>
  </header>
  <main>
    <div class="notice">每条都要同时看画、看字、看课文语境，并完整播放音频。助记画只负责帮助记忆，不等同于真实字源；只有有可靠资料的条目才展示古文字图版。模板不会自动判定通过，四项标准和单条结论都要由听审人明确选择。</div>
    <div id="records"></div>
  </main>
  <script id="seed" type="application/json">${seed}</script>
  <script>
    (() => {
      const seed = JSON.parse(document.getElementById("seed").textContent);
      const storageKey = "qwen3-human-listening:" + seed.source.qwenManifestSha256;
      const clone = value => JSON.parse(JSON.stringify(value));
      let state = clone(seed);
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.source?.qwenManifestSha256 === seed.source.qwenManifestSha256) {
            const savedById = new Map((parsed.records || []).map(record => [record.recordId, record]));
            state.reviewer = parsed.reviewer || "";
            state.status = parsed.status || "pending";
            state.updatedAt = parsed.updatedAt || null;
            state.records = seed.records.map(record => {
              const previous = savedById.get(record.recordId) || {};
              return {
                ...record,
                listenCompleted: previous.listenCompleted === true,
                mnemonicMatchPass: previous.mnemonicMatchPass ?? null,
                heritageBoundaryPass: previous.heritageBoundaryPass ?? null,
                pronunciationPass: previous.pronunciationPass ?? null,
                prosodyPass: previous.prosodyPass ?? null,
                verdict: previous.verdict || "pending",
                note: previous.note || "",
              };
            });
          }
        }
      } catch { /* file:// storage may be unavailable */ }

      state.records = state.records.map(record => ({
        ...record,
        listenCompleted: record.listenCompleted === true,
        mnemonicMatchPass: record.mnemonicMatchPass ?? null,
        heritageBoundaryPass: record.heritageBoundaryPass ?? null,
      }));
      const byId = new Map(state.records.map(record => [record.recordId, record]));
      const recordsNode = document.getElementById("records");
      const reviewerNode = document.getElementById("reviewer");
      const batchStatusNode = document.getElementById("batch-status");
      const searchNode = document.getElementById("search");
      const filterNode = document.getElementById("filter");
      const viewModeNode = document.getElementById("view-mode");
      const statsNode = document.getElementById("stats");
      reviewerNode.value = state.reviewer || "";
      batchStatusNode.value = state.status || "pending";
      let currentAudio = null;
      let focusedRecordId = state.records.find(record => !record.listenCompleted)?.recordId
        || state.records[0]?.recordId
        || null;

      const criterionValue = value => value === true ? "true" : value === false ? "false" : "";
      const parseCriterion = value => value === "true" ? true : value === "false" ? false : null;
      const isComplete = record => record.listenCompleted === true
        && record.mnemonicMatchPass !== null
        && record.heritageBoundaryPass !== null
        && record.pronunciationPass !== null
        && record.prosodyPass !== null
        && record.verdict !== "pending";

      function save() {
        state.reviewer = reviewerNode.value.trim();
        state.status = batchStatusNode.value;
        state.updatedAt = new Date().toISOString();
        try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* optional convenience only */ }
      }

      function option(value, label) {
        const node = document.createElement("option");
        node.value = value;
        node.textContent = label;
        return node;
      }

      function criterionSelect(record, field, label) {
        const wrapper = document.createElement("label");
        wrapper.textContent = label;
        const select = document.createElement("select");
        select.append(option("", "未审"), option("true", "通过"), option("false", "不通过"));
        select.value = criterionValue(record[field]);
        select.addEventListener("change", () => {
          record[field] = parseCriterion(select.value);
          save();
          updateCard(wrapper.closest(".card"), record);
          updateStats();
        });
        wrapper.append(select);
        return wrapper;
      }

      function verdictSelect(record) {
        const wrapper = document.createElement("label");
        wrapper.textContent = "单条结论";
        const select = document.createElement("select");
        select.append(option("pending", "待审"), option("pass", "通过"), option("revise", "退回返修"));
        select.value = record.verdict;
        select.addEventListener("change", () => {
          record.verdict = select.value;
          save();
          updateCard(wrapper.closest(".card"), record);
          updateStats();
        });
        wrapper.append(select);
        return wrapper;
      }

      function updateCard(card, record) {
        if (!card) return;
        card.classList.remove("pending", "pass", "revise");
        card.classList.add(record.verdict);
        const warning = card.querySelector(".row-warning");
        warning.textContent = record.verdict === "pass" && (record.mnemonicMatchPass !== true || record.heritageBoundaryPass !== true || record.pronunciationPass !== true || record.prosodyPass !== true)
          ? "单条选了通过，但画文一致、字源边界、发音和自然度尚未全部通过。"
          : "";
        const listenState = card.querySelector(".listen-state");
        listenState.textContent = record.listenCompleted ? "✓ 已完整播放" : "尚未完整播放";
        listenState.classList.toggle("done", record.listenCompleted);
      }

      function makeCard(record) {
        const card = document.createElement("section");
        card.className = "card " + record.verdict;
        card.dataset.recordId = record.recordId;

        const head = document.createElement("div");
        head.className = "head";
        const identity = document.createElement("div");
        identity.className = "identity";
        const glyph = document.createElement("div");
        glyph.className = "glyph";
        glyph.textContent = record.glyph;
        const names = document.createElement("div");
        const word = document.createElement("div");
        word.className = "word";
        word.textContent = record.word;
        if (record.requiresPronunciationReview) {
          const badge = document.createElement("span");
          badge.className = "badge";
          badge.textContent = "重点读音";
          word.append(badge);
        }
        const meta = document.createElement("div");
        meta.className = "meta";
        meta.textContent = record.order + "/" + state.records.length + " · " + record.lessonId + (record.lessonTitle ? " · " + record.lessonTitle : "") + " · " + record.recordId;
        names.append(word, meta);
        identity.append(glyph, names);
        head.append(identity);
        card.append(head);

        const visualPanel = document.createElement("div");
        visualPanel.className = "visual-panel";
        const visualTitle = document.createElement("strong");
        visualTitle.className = "step-title";
        visualTitle.textContent = "① 看画、看字形、看课文语境";
        visualPanel.append(visualTitle);
        const visualLayout = document.createElement("div");
        visualLayout.className = "visual-layout";

        const mnemonicCard = document.createElement("section");
        mnemonicCard.className = "visual-card";
        const mnemonicTitle = document.createElement("h3");
        mnemonicTitle.textContent = "构形助记画（帮助记忆，不等同字源）";
        mnemonicCard.append(mnemonicTitle);
        if (record.mnemonicVisual) {
          const mnemonicImage = document.createElement("img");
          mnemonicImage.className = "mnemonic-image";
          mnemonicImage.src = record.mnemonicVisual.src;
          mnemonicImage.alt = record.mnemonicVisual.alt || (record.glyph + "的构形助记画");
          const mnemonicCaption = document.createElement("div");
          mnemonicCaption.className = "visual-caption";
          const mnemonicLabel = document.createElement("strong");
          mnemonicLabel.textContent = record.mnemonicVisual.label;
          const mnemonicNote = document.createElement("p");
          mnemonicNote.textContent = "请核对讲解提到的物象、部件与位置，是否真的能从画面中看出来。";
          mnemonicCaption.append(mnemonicLabel, mnemonicNote);
          mnemonicCard.append(mnemonicImage, mnemonicCaption);
        } else {
          const missingVisual = document.createElement("p");
          missingVisual.className = "no-heritage";
          missingVisual.textContent = "缺少构形助记画，不能通过本条看审。";
          mnemonicCard.append(missingVisual);
        }

        const glyphCard = document.createElement("section");
        glyphCard.className = "visual-card";
        const glyphTitle = document.createElement("h3");
        glyphTitle.textContent = record.heritageStages.length ? "真实字形演变资料" : "现代字形与构字信息";
        glyphCard.append(glyphTitle);
        const glyphFacts = document.createElement("div");
        glyphFacts.className = "glyph-facts visual-caption";
        const facts = [record.pinyin, record.characterType, record.decomposition].filter(Boolean);
        if (record.components.length) facts.push("部件：" + record.components.map(part => part.glyph).join(" + "));
        for (const fact of facts) {
          const pill = document.createElement("span");
          pill.className = "fact-pill";
          pill.textContent = fact;
          glyphFacts.append(pill);
        }
        glyphCard.append(glyphFacts);
        if (record.heritageStages.length) {
          const heritageStrip = document.createElement("div");
          heritageStrip.className = "heritage-strip";
          for (const stage of record.heritageStages) {
            const stageNode = document.createElement("div");
            stageNode.className = "heritage-stage";
            const stageImage = document.createElement("img");
            stageImage.src = stage.src;
            stageImage.alt = record.glyph + "的" + stage.label + "字形";
            const stageLabel = document.createElement("small");
            stageLabel.textContent = stage.label;
            stageNode.append(stageImage, stageLabel);
            heritageStrip.append(stageNode);
          }
          glyphCard.append(heritageStrip);
        } else {
          const modernGlyph = document.createElement("div");
          modernGlyph.className = "modern-glyph";
          modernGlyph.textContent = record.glyph;
          const noHeritage = document.createElement("p");
          noHeritage.className = "no-heritage";
          noHeritage.textContent = "本字暂无可靠的古文字图版，保留现代楷书，不虚构演变形态。";
          glyphCard.append(modernGlyph, noHeritage);
        }
        if (record.redBlueVisual) {
          const redBlueBlock = document.createElement("div");
          redBlueBlock.className = "red-blue-block";
          const redBlueImage = document.createElement("img");
          redBlueImage.src = record.redBlueVisual.src;
          redBlueImage.alt = record.glyph + "字中部首与其他部件的红蓝标记";
          const redBlueCopy = document.createElement("p");
          redBlueCopy.textContent = "红蓝合字用于核对表意部首和其他部件的对应关系；它也是教学标记，不是古文字证据。";
          redBlueBlock.append(redBlueImage, redBlueCopy);
          glyphCard.append(redBlueBlock);
        }
        visualLayout.append(mnemonicCard, glyphCard);
        visualPanel.append(visualLayout);
        if (record.lessonContext) {
          const context = document.createElement("blockquote");
          context.className = "context-line";
          context.textContent = "课文语境：" + record.lessonContext;
          visualPanel.append(context);
        }
        card.append(visualPanel);

        const audioPanel = document.createElement("div");
        audioPanel.className = "audio-panel";
        const audioTitle = document.createElement("strong");
        audioTitle.className = "step-title";
        audioTitle.textContent = "② 播放本条音频（请完整听到结束）";
        const audio = document.createElement("audio");
        audio.controls = true;
        audio.preload = "metadata";
        audio.src = record.audio;
        audio.addEventListener("play", () => {
          if (currentAudio && currentAudio !== audio) currentAudio.pause();
          currentAudio = audio;
        });
        const listenState = document.createElement("span");
        listenState.className = "listen-state";
        audio.addEventListener("ended", () => {
          record.listenCompleted = true;
          save();
          updateCard(card, record);
          updateStats();
        });
        audioPanel.append(audioTitle, audio, listenState);
        card.append(audioPanel);

        const script = document.createElement("div");
        script.className = "copy";
        const scriptLabel = document.createElement("strong");
        scriptLabel.textContent = "③ 对应展示文案（学生看到的文字）";
        const scriptText = document.createElement("div");
        scriptText.textContent = record.script;
        script.append(scriptLabel, scriptText);
        card.append(script);

        const tts = document.createElement("div");
        tts.className = "copy tts";
        const ttsLabel = document.createElement("strong");
        ttsLabel.textContent = record.ttsText === record.script
          ? "实际合成文本（与展示文案一致，音频应逐字读出）"
          : "实际合成文本（音频应逐字读出）";
        const ttsText = document.createElement("div");
        ttsText.textContent = record.ttsText;
        tts.append(ttsLabel, ttsText);
        card.append(tts);

        const focus = document.createElement("div");
        focus.className = "focus";
        const focusTitle = document.createElement("strong");
        focusTitle.textContent = "④ 本条需要完整听审和看审的内容";
        const focusList = document.createElement("ol");
        const focusItems = [
          "画文一致：讲解提到的物象、部件和位置，是否与助记画清楚对应。",
          "字源边界：助记画和红蓝标记不得冒充字源；古文字图版及标签要有据、无图时不虚构。",
          "课文关联：解释是否回到本课词语和课文语境，学生能否看懂、记住并用得上。",
          "逐字对照实际合成文本：确认没有漏读、多读、错读或句尾截断。",
          "重点核对“" + record.word + "”中“" + record.glyph + "”的发音和声调" + (record.requiresPronunciationReview ? "（重点读音项）" : "") + "。",
          "检查停顿、语速和重音是否自然，句子是否有机械拼接感。",
          "检查音色、音量是否稳定清楚，是否存在杂音、爆音或突然变声。",
        ];
        for (const item of focusItems) {
          const li = document.createElement("li");
          li.textContent = item;
          focusList.append(li);
        }
        focus.append(focusTitle, focusList);
        card.append(focus);

        const reviewTitle = document.createElement("h3");
        reviewTitle.className = "review-title";
        reviewTitle.textContent = "⑤ 给出本条听审与看审结论";
        card.append(reviewTitle);
        const review = document.createElement("div");
        review.className = "review";
        review.append(
          criterionSelect(record, "mnemonicMatchPass", "画文一致"),
          criterionSelect(record, "heritageBoundaryPass", "字源边界"),
          criterionSelect(record, "pronunciationPass", "发音"),
          criterionSelect(record, "prosodyPass", "自然度"),
          verdictSelect(record),
        );
        const note = document.createElement("textarea");
        note.placeholder = "备注：画文不符、字源边界、课文关联、错音、停顿、重音、机械感或需要重生成的位置";
        note.value = record.note || "";
        note.addEventListener("input", () => { record.note = note.value; save(); });
        review.append(note);
        card.append(review);
        const warning = document.createElement("div");
        warning.className = "row-warning";
        card.append(warning);
        updateCard(card, record);
        return card;
      }

      function matches(record) {
        const query = searchNode.value.trim().toLowerCase();
        if (query && ![record.glyph, record.word, record.lessonId, record.lessonTitle, record.recordId]
          .join(" ").toLowerCase().includes(query)) return false;
        const filter = filterNode.value;
        if (filter === "incomplete") return !isComplete(record);
        if (filter === "pass") return record.verdict === "pass";
        if (filter === "revise") return record.verdict === "revise";
        if (filter === "pronunciation") return record.requiresPronunciationReview;
        if (filter === "unheard") return !record.listenCompleted;
        return true;
      }

      function render() {
        recordsNode.replaceChildren();
        const matched = state.records.filter(matches);
        if (!matched.some(record => record.recordId === focusedRecordId)) {
          focusedRecordId = matched[0]?.recordId || null;
        }
        const visible = viewModeNode.value === "focus"
          ? matched.filter(record => record.recordId === focusedRecordId)
          : matched;
        if (!visible.length) {
          const empty = document.createElement("div");
          empty.className = "empty";
          empty.textContent = "没有符合当前筛选条件的条目。";
          recordsNode.append(empty);
        } else {
          const fragment = document.createDocumentFragment();
          for (const record of visible) fragment.append(makeCard(record));
          recordsNode.append(fragment);
        }
        updateStats();
      }

      function updateStats() {
        const pass = state.records.filter(record => record.verdict === "pass" && record.mnemonicMatchPass === true && record.heritageBoundaryPass === true && record.pronunciationPass === true && record.prosodyPass === true).length;
        const revise = state.records.filter(record => record.verdict === "revise").length;
        const incomplete = state.records.filter(record => !isComplete(record)).length;
        const listened = state.records.filter(record => record.listenCompleted).length;
        const heritage = state.records.filter(record => record.heritageStages.length > 0).length;
        const focused = byId.get(focusedRecordId);
        statsNode.textContent = "共 " + state.records.length + " 条助记画 · " + heritage + " 条有真实字形图版 · 已完整播放 " + listened + " · 完整通过 " + pass + " · 需返修 " + revise + " · 未完成 " + incomplete + (focused ? " · 当前 " + focused.order + "/" + state.records.length : "") + " · 当前批次状态 " + (state.status === "complete" ? "已手动标记完成" : "待审");
      }

      function validateBeforeExport() {
        if (state.status !== "complete") return true;
        if (!state.reviewer.trim()) {
          alert("整批完成前必须填写听审人姓名。");
          return false;
        }
        const invalid = state.records.filter(record => !record.listenCompleted || record.verdict !== "pass" || record.mnemonicMatchPass !== true || record.heritageBoundaryPass !== true || record.pronunciationPass !== true || record.prosodyPass !== true);
        if (invalid.length) {
          alert("还有 " + invalid.length + " 条没有明确通过画文一致、字源边界、发音、自然度和单条结论，不能导出 complete 状态。");
          return false;
        }
        return true;
      }

      reviewerNode.addEventListener("input", () => { save(); updateStats(); });
      batchStatusNode.addEventListener("change", () => { save(); updateStats(); });
      searchNode.addEventListener("input", render);
      filterNode.addEventListener("change", render);
      viewModeNode.addEventListener("change", render);
      function showRecord(record) {
        if (!record) return;
        focusedRecordId = record.recordId;
        searchNode.value = "";
        filterNode.value = "all";
        viewModeNode.value = "focus";
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      document.getElementById("previous").addEventListener("click", () => {
        const index = state.records.findIndex(record => record.recordId === focusedRecordId);
        showRecord(state.records[Math.max(0, index - 1)]);
      });
      document.getElementById("next").addEventListener("click", () => {
        const currentIndex = state.records.findIndex(record => record.recordId === focusedRecordId);
        const ordered = [...state.records.slice(currentIndex + 1), ...state.records.slice(0, currentIndex + 1)];
        const next = ordered.find(record => !isComplete(record));
        if (!next) return alert("全部条目都已有明确选择。");
        showRecord(next);
      });
      document.getElementById("export").addEventListener("click", () => {
        save();
        if (!validateBeforeExport()) return;
        const output = clone(state);
        const blob = new Blob([JSON.stringify(output, null, 2) + "\\n"], { type:"application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "human-listening.json";
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      });

      render();
    })();
  </script>
</body>
</html>
`;
}

export async function prepareHumanListening({
  bookPath,
  manifestPath,
  outputDirectory,
  force = false,
  expectedRecordCount = 430,
  verifyAudio = true,
  generatedAt,
}) {
  const approvedPath = resolve(bookPath);
  const qwenManifestPath = resolve(manifestPath);
  const outputPath = resolve(outputDirectory);
  const [bookRaw, manifestRaw] = await Promise.all([
    readFile(approvedPath, "utf8"),
    readFile(qwenManifestPath, "utf8"),
  ]);
  const book = JSON.parse(bookRaw);
  const manifest = JSON.parse(manifestRaw);
  validateListeningInputs(book, manifest, expectedRecordCount);

  const manifestDirectory = dirname(qwenManifestPath);
  const audioSha256ById = {};
  for (const record of book.records) {
    const relativeAudio = manifest.records[record.recordId].audio;
    const absoluteAudio = resolve(manifestDirectory, relativeAudio);
    if (!isInside(manifestDirectory, absoluteAudio)) {
      throw new Error(`${record.recordId}: audio路径越出清单目录`);
    }
    if (verifyAudio) {
      let info;
      try {
        info = await stat(absoluteAudio);
      } catch {
        throw new Error(`${record.recordId}: 找不到音频 ${absoluteAudio}`);
      }
      if (!info.isFile()) throw new Error(`${record.recordId}: audio不是文件`);
    }
    try {
      audioSha256ById[record.recordId] = sha256(await readFile(absoluteAudio));
    } catch (error) {
      if (error?.code === "ENOENT") throw new Error(`${record.recordId}: 找不到音频 ${absoluteAudio}`);
      throw error;
    }
  }

  const jsonPath = resolve(outputPath, "human-listening.json");
  const htmlPath = resolve(outputPath, "index.html");
  if (!force && (await fileExists(jsonPath) || await fileExists(htmlPath))) {
    throw new Error(`输出目录已有听审文件，拒绝覆盖人工进度；确认后使用 --force：${outputPath}`);
  }

  const payload = buildListeningPayload({
    book,
    manifest,
    bookPath: approvedPath,
    manifestPath: qwenManifestPath,
    bookSha256: sha256(bookRaw),
    manifestSha256: sha256(manifestRaw),
    audioSha256ById,
    outputDirectory: outputPath,
    generatedAt,
  });
  for (const record of payload.records) {
    if (!record.mnemonicVisual) throw new Error(`${record.recordId}: 缺少构形助记画，不能生成完整看审页`);
    await assertPublicAsset(record.recordId, "构形助记画", record.mnemonicVisual.source);
    for (const stage of record.heritageStages) {
      await assertPublicAsset(record.recordId, `${stage.label}字形图版`, stage.source);
    }
    if (record.redBlueVisual) {
      await assertPublicAsset(record.recordId, "红蓝合字", record.redBlueVisual.source);
    }
  }
  const html = renderListeningHtml(payload);
  await mkdir(outputPath, { recursive: true });
  await Promise.all([
    writeFile(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8"),
    writeFile(htmlPath, html, "utf8"),
  ]);
  return { jsonPath, htmlPath, recordCount: payload.records.length };
}

function usage() {
  return "Usage: node scripts/prepare-qwen3-human-listening.mjs <approved-book.json> <qwen-manifest.json> <output-directory> [--force]";
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    process.stdout.write(`${usage()}\n`);
    return;
  }
  const unknownFlags = args.filter(arg => arg.startsWith("-") && arg !== "--force");
  if (unknownFlags.length) throw new Error(`未知参数：${unknownFlags.join(", ")}\n${usage()}`);
  const positional = args.filter(arg => !arg.startsWith("-"));
  if (positional.length !== 3) throw new Error(usage());
  const [bookPath, manifestPath, outputDirectory] = positional;
  const result = await prepareHumanListening({
    bookPath,
    manifestPath,
    outputDirectory,
    force: args.includes("--force"),
  });
  process.stdout.write(`Prepared ${result.recordCount} pending listening records.\n`);
  process.stdout.write(`Template: ${result.jsonPath}\n`);
  process.stdout.write(`Open: ${result.htmlPath}\n`);
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === currentFile) {
  main().catch(error => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
