"use client";
/* eslint-disable react-hooks/purity, react-hooks/set-state-in-effect -- event latency uses a real clock; stage transitions reset transient UI state. */

import Image from "next/image";
import { ArrowLeft, AudioLines, Check, Eye, EyeOff, Lightbulb, RotateCcw, ShieldCheck, Volume2, VolumeX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { CharacterItem } from "../../data/catalog-types";
import {
  detectiveErrorTags, detectiveOptions, discriminationErrorTags, forgeErrorTags, forgeParts,
  historicalComponentNote, soundErrorTags, soundOptions, XIAN_ACQUISITION_CUE, xianObjectives, xianWritingQuestionId,
  type XianObjectiveId,
} from "../../domain/xian-adventure";
import type { ErrorTag, LearningAttempt } from "../../domain/learning-state";
import { playLearningSound } from "../../infrastructure/browser/learning-audio";
import { queueLearningEvent } from "../../infrastructure/browser/learning-event-outbox";
import { getProfileActorId } from "../../infrastructure/browser/profile-actor";
import { applyLearningAttempt } from "../../lib/apply-learning-attempt";
import { learningDayKey } from "../../domain/learning-day";
import { useStudyProfile } from "../profile/use-study-profile";

type Act = "intro" | "detective" | "forge" | "mist" | "theater" | "boss" | "result";
type Feedback = { correct: boolean; title: string; detail: string; next: () => void } | null;
type ObjectiveResults = Partial<Record<XianObjectiveId, boolean>>;
const ACTS: Act[] = ["detective", "forge", "mist", "theater", "boss"];
const detectiveDetails: Record<string, string> = {
  闲: "“闲”也读 xián，但里面是“木”，没有画面里的“兼”线索。",
  谦: "“谦”右边也像“兼”，左边却是言字旁，而且读 qiān。",
  歉: "“歉”含“兼”，右边还有“欠”，读 qiàn，声调也不同。",
};

function speak(text: string, muted: boolean) {
  if (muted || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.78;
  window.speechSynthesis.speak(utterance);
}

export default function CharacterAdventure({ character, visual }: {
  character: CharacterItem;
  visual: { src: string; alt: string; label: string };
}) {
  const router = useRouter();
  const { setProfile, hydrated } = useStudyProfile();
  const [actorId] = useState(getProfileActorId);
  const [act, setAct] = useState<Act>("intro");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [muted, setMuted] = useState(false);
  // First play is acquisition: prior stages deliberately teach the answer, so
  // this round must never masquerade as cue-free independent review evidence.
  const [cueFloor, setCueFloor] = useState<0 | 1 | 2 | 3>(XIAN_ACQUISITION_CUE);
  const [results, setResults] = useState<ObjectiveResults>({});
  const [assisted, setAssisted] = useState<Partial<Record<XianObjectiveId, boolean>>>({});
  const [forgeSelection, setForgeSelection] = useState<string[]>([]);
  const [forgeSolved, setForgeSolved] = useState(false);
  const [sceneEvidence, setSceneEvidence] = useState<string[]>([]);
  const [mistStep, setMistStep] = useState<"sound" | "meaning">("sound");
  const [theaterStep, setTheaterStep] = useState<"context" | "distinguish">("context");
  const [inked, setInked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lockedRef = useRef(false);
  const stageStartedAt = useRef(Date.now());
  const [variant] = useState(() => Math.floor(Math.random() * 12));
  const actIndex = act === "intro" ? 0 : act === "result" ? 5 : ACTS.indexOf(act);
  const objectiveById = useMemo(() => Object.fromEntries(xianObjectives.map((item) => [item.id, item])), []);

  function rotated<T>(items: readonly T[]) {
    const offset = variant % items.length;
    return [...items.slice(offset), ...items.slice(0, offset)];
  }

  useEffect(() => {
    stageStartedAt.current = Date.now();
    setCueFloor(XIAN_ACQUISITION_CUE);
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [act, mistStep, theaterStep]);

  function recordObjective(id: XianObjectiveId, correct: boolean, selected: string[], errorTags: ErrorTag[] = []) {
    if (!hydrated || lockedRef.current) return false;
    lockedRef.current = true;
    const objective = objectiveById[id];
    const attempt: LearningAttempt = {
      characterId: character.id, questionId: objective.questionId, dimension: objective.dimension,
      cueLevel: cueFloor, answerMode: "choice", correct,
      latencyMs: Math.max(0, Date.now() - stageStartedAt.current), errorTags, occurredAt: new Date().toISOString(),
    };
    setResults((previous) => ({ ...previous, [id]: correct }));
    if (!correct) setAssisted((previous) => ({ ...previous, [id]: true }));
    setProfile((previous) => applyLearningAttempt(previous, actorId, attempt));
    queueLearningEvent({
      action: "answer", track: "words", lessonId: character.lessonId, characterId: character.id,
      questionId: objective.questionId, correct, selected, dimension: objective.dimension,
      cueLevel: attempt.cueLevel, answerMode: attempt.answerMode, latencyMs: attempt.latencyMs, errorTags,
    });
    if (!muted) playLearningSound(correct ? "correct" : "retry");
    return true;
  }

  function showFeedback(correct: boolean, title: string, detail: string, next: () => void) {
    lockedRef.current = true;
    setFeedback({ correct, title, detail, next });
  }

  function retry() {
    setCueFloor(2);
    setFeedback(null);
    stageStartedAt.current = Date.now();
  }

  function chooseDetective(value: string) {
    const correct = value === "嫌";
    if (!recordObjective("recognition", correct, [value], correct ? [] : detectiveErrorTags(value))) return;
    showFeedback(correct, correct ? "第一条证据对上了" : "这条线索还对不上",
      correct ? "句子要表达“觉得长短不合适”，这个字正合适。" : detectiveDetails[value],
      correct ? () => setAct("forge") : retry);
  }

  function submitForge() {
    const correct = forgeSelection.join("") === "女兼";
    if (correct) setForgeSolved(true);
    if (!recordObjective("generation", correct, forgeSelection, correct ? [] : forgeErrorTags(forgeSelection))) return;
    showFeedback(correct, correct ? "两个部件合拢了" : "部件还没站对位置",
      correct ? `女在左边表义，兼在右边提示大致读音。${historicalComponentNote}` : "这是左右结构：先找左边的表义部件，再找右边的形音部件。",
      correct ? () => { if (!muted) playLearningSound("streak"); speak("嫌，嫌弃的嫌，读 xián", muted); setAct("mist"); }
        : () => { setForgeSelection([]); retry(); });
  }

  function chooseSound(value: string) {
    const correct = value === "xián";
    if (!recordObjective("phonology", correct, [value], correct ? [] : soundErrorTags(value))) return;
    showFeedback(correct, correct ? "声纹吻合" : "再听一听声调",
      correct ? "xián，第二声，和“闲”同音。" : "先找声母 x，再听由低向高扬起的第二声。",
      correct ? () => setMistStep("meaning") : retry);
  }

  function chooseMeaning(value: string) {
    const correct = value === "觉得不合适，或不愿接近、接纳";
    if (!recordObjective("semantics", correct, [value], correct ? [] : ["meaning-unknown"])) return;
    showFeedback(correct, correct ? "意思也找回来了" : "回到白鹭的长短想一想",
      correct ? "课文中的“嫌长、嫌短”，就是觉得不合适。" : "不是害怕，也不是羡慕；关键是“觉得不合适”。",
      correct ? () => setAct("theater") : retry);
  }

  function chooseContext(value: string) {
    const correct = value === "这本旧书很有意思，我一点也不嫌它旧。";
    if (!recordObjective("context", correct, [value], correct ? [] : ["context-misuse"])) return;
    showFeedback(correct, correct ? "台词贴合画面" : "这句还没说出“不合适”",
      correct ? "这里的“嫌旧”是觉得旧而不喜欢；整句表达并不在意它旧。" : "先判断这个词是不是在表达“觉得不合适或不喜欢”。",
      correct ? () => setTheaterStep("distinguish") : retry);
  }

  function chooseDistinguish(value: string) {
    const correct = value === "嫌弃";
    if (!recordObjective("discrimination", correct, [value], correct ? [] : discriminationErrorTags(value))) return;
    showFeedback(correct, correct ? "真假字已经分清" : "同音字走错房间了",
      correct ? "“嫌弃”与态度有关；“闲暇”与空闲时间有关。" : "听起来一样，还要看部件和词义。",
      correct ? () => setAct("boss") : retry);
  }

  function canvasPoint(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * (canvas.width / rect.width), y: (event.clientY - rect.top) * (canvas.height / rect.height) };
  }

  function beginDraw(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const point = canvasPoint(event);
    if (!canvas || !point) return;
    canvas.setPointerCapture(event.pointerId);
    const context = canvas.getContext("2d");
    if (!context) return;
    context.beginPath(); context.moveTo(point.x, point.y); context.lineWidth = 10;
    context.lineCap = "round"; context.lineJoin = "round"; context.strokeStyle = "#17332d";
    setDrawing(true); setInked(true);
  }

  function draw(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawing) return;
    const point = canvasPoint(event);
    const context = canvasRef.current?.getContext("2d");
    if (!point || !context) return;
    context.lineTo(point.x, point.y); context.stroke();
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    canvas?.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setInked(false); setRevealed(false);
  }

  function completeWriting(kind: "match" | "parts" | "position" | "strokes" | "unsure") {
    if (!hydrated || lockedRef.current) return;
    lockedRef.current = true;
    const errorTags: ErrorTag[] = kind === "parts" ? ["component-missing"] : kind === "position" ? ["component-position"]
      : kind === "strokes" ? ["stroke-missing"] : kind === "unsure" ? ["writing-unverified"] : [];
    const correct = kind === "match" || kind === "unsure" ? null : false;
    const attempt: LearningAttempt = {
      characterId: character.id, questionId: xianWritingQuestionId, dimension: "generation", cueLevel: 3,
      answerMode: "self-check", correct, latencyMs: Math.max(0, Date.now() - stageStartedAt.current),
      errorTags, occurredAt: new Date().toISOString(),
    };
    if (correct === false || errorTags.length) setProfile((previous) => applyLearningAttempt(previous, actorId, attempt));
    queueLearningEvent({
      action: "answer", track: "words", lessonId: character.lessonId, characterId: character.id,
      questionId: xianWritingQuestionId, correct, selected: [kind], dimension: "generation", cueLevel: 3,
      answerMode: "self-check", latencyMs: attempt.latencyMs, errorTags,
    });
    if (kind !== "match") {
      const detail = kind === "unsure" ? "先看清范字的两个部件，再遮住范字重写一次。"
        : kind === "parts" ? "回到“女 + 兼”检查有没有漏掉或换错部件。"
          : kind === "position" ? "记住女在左、兼在右，再写一次。" : "放慢一点，对照交叉和横画再写一次。";
      showFeedback(false, "封印还差最后一步", detail, () => { clearCanvas(); setCueFloor(3); setFeedback(null); stageStartedAt.current = Date.now(); });
      return;
    }
    setProfile((previous) => {
      if (previous.completed.words.includes(character.id)) return previous;
      const date = learningDayKey();
      return {
        ...previous,
        completed: { ...previous.completed, words: [...previous.completed.words, character.id] },
        introducedByDay: {
          ...previous.introducedByDay,
          [date]: [...new Set([...(previous.introducedByDay[date] ?? []), character.id])],
        },
      };
    });
    if (!muted) playLearningSound("complete");
    setAct("result");
  }

  function progressHeader() {
    return <header className="adventure-topbar">
      <button className="adventure-icon-button" onClick={() => router.back()} aria-label="退出汉字冒险"><ArrowLeft aria-hidden="true" /></button>
      <div className="adventure-progress" role="progressbar" aria-valuemin={0} aria-valuemax={5} aria-valuenow={actIndex} aria-label={`案件已完成 ${actIndex} 步，共 5 步`}>
        {ACTS.map((item, index) => <i className={index < actIndex ? "is-filled" : ""} key={item} />)}
      </div>
      <button className="adventure-icon-button" aria-pressed={muted} onClick={() => setMuted((value) => { if (!value && typeof window !== "undefined") window.speechSynthesis?.cancel(); return !value; })} aria-label={muted ? "打开声音" : "关闭声音"}>{muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}</button>
    </header>;
  }

  function feedbackSheet() {
    if (!feedback) return null;
    return <aside className={`adventure-feedback ${feedback.correct ? "is-correct" : "is-retry"}`} role="status">
      <span className="adventure-feedback-icon">{feedback.correct ? <Check aria-hidden="true" /> : <Lightbulb aria-hidden="true" />}</span>
      <div><strong>{feedback.title}</strong><p>{feedback.detail}</p></div>
      <button onClick={() => { lockedRef.current = false; feedback.next(); }}>{feedback.correct ? "继续" : "再查一次"}</button>
    </aside>;
  }

  if (act === "intro") return <main className="xian-adventure adventure-shell is-intro">
    {progressHeader()}
    <section className="adventure-hero" aria-labelledby="adventure-title">
      <div className="adventure-art">
        <Image src={visual.src} alt="白鹭、水彩人物与竹篮组成的案件画面" fill priority sizes="(max-width: 760px) 100vw, 620px" />
        <span className="adventure-art-wash" aria-hidden="true" /><span className="adventure-case-tag">白鹭 · 第 01 案</span>
      </div>
      <div className="adventure-briefing">
        <p className="adventure-kicker"><AudioLines aria-hidden="true" /> 汉字侦探局</p>
        <h1 id="adventure-title">恰到好处的字<br />不见了</h1>
        <p className="adventure-lead">增之一分则 □ 长，减之一分则 □ 短。找到画面与读音线索，把这个字找回来。</p>
        <div className="adventure-brief-card"><span>案件目标</span><strong>找字 · 辨音 · 合部件 · 用语境 · 凭记忆写</strong><small>约 6–9 分钟，没有倒计时，也不会扣生命。</small></div>
        <button className="adventure-start" type="button" disabled={!hydrated} onClick={() => { if (!muted) playLearningSound("start"); setAct("detective"); }}><span>{hydrated ? "开始侦查" : "正在恢复案卷…"}</span><small>五幕连续挑战</small></button>
      </div>
    </section>
  </main>;

  return <main className={`xian-adventure adventure-shell is-stage act-${act}`}>
    {progressHeader()}
    <section className="adventure-stage" inert={feedback ? true : undefined}>
      {act === "detective" && <div className="adventure-task adventure-task-split">
        <div className="adventure-scene-evidence"><Image src={visual.src} alt="白鹭、水彩人物与竹篮组成的线索画面" fill sizes="(max-width: 760px) 100vw, 540px" /><button className={`adventure-hotspot is-person ${sceneEvidence.includes("女") ? "is-found" : ""}`} aria-label="查看人物字形线索" onClick={() => { setSceneEvidence((value) => [...new Set([...value, "女"])]); if (!muted) playLearningSound("correct"); }}><span>{sceneEvidence.includes("女") ? "女" : "人物线索"}</span></button><button className={`adventure-hotspot is-basket ${sceneEvidence.includes("兼") ? "is-found" : ""}`} aria-label="查看竹篮字形线索" onClick={() => { setSceneEvidence((value) => [...new Set([...value, "兼"])]); if (!muted) playLearningSound("correct"); }}><span>{sceneEvidence.includes("兼") ? "兼" : "竹篮线索"}</span></button></div>
        <div className="adventure-question"><p className="adventure-step-label">第一幕 · 字影扫描</p><h1>把正确的字盖回课文</h1>
          <div className="adventure-quote">增之一分则 <b>□</b> 长，<br />减之一分则 <b>□</b> 短。</div>
          {sceneEvidence.length < 2 ? <div className="adventure-evidence-bag"><strong>证据袋 {sceneEvidence.length} / 2</strong><span>先点画面里的两个呼吸线索。</span></div> : <div className="adventure-choice-grid is-glyphs">{rotated(detectiveOptions).map((option) => <button onClick={() => chooseDetective(option)} key={option}><span>{option}</span></button>)}</div>}
          {cueFloor >= 2 && <div className="adventure-remedy"><span>闲 = 门 + 木</span><strong>目标字 = 女 + 兼</strong></div>}
          <button className="adventure-hint" onClick={() => { setCueFloor(1); if (!muted) playLearningSound("encourage"); }}><Lightbulb aria-hidden="true" />提示：这个字右边有“兼”的影子</button>
        </div>
      </div>}

      {act === "forge" && <div className="adventure-task adventure-forge">
        <p className="adventure-step-label">第二幕 · 部件锻造厂</p><h1>只凭线索，合成左右结构</h1><p className="adventure-subtitle">依次点击左边、右边的部件，也可以用键盘选择。</p>
        {forgeSolved ? <div className="forge-reveal" role="status"><strong>{character.hanzi}</strong><span>{character.pinyin}</span></div> : <div className="forge-workbench" aria-label="左右结构部件槽"><button onClick={() => setForgeSelection((value) => value.slice(1))} className={forgeSelection[0] ? "is-filled is-radical" : ""}>{forgeSelection[0] || (cueFloor >= 2 ? "左 · 表义" : "左侧")}</button><i aria-hidden="true">+</i><button onClick={() => setForgeSelection((value) => value.slice(0, 1))} className={forgeSelection[1] ? "is-filled is-component" : ""}>{forgeSelection[1] || (cueFloor >= 2 ? "右 · 形音" : "右侧")}</button></div>}
        <div className="forge-parts">{rotated(forgeParts).map((part) => <button key={part} disabled={forgeSelection.length >= 2 || forgeSolved} onClick={() => setForgeSelection((value) => [...value, part])}>{part}</button>)}</div>
        <p className="adventure-history-note"><ShieldCheck aria-hidden="true" />“女”是历史字形中的表义部件，不表示女孩有某种负面性格。</p><button className="adventure-primary" disabled={forgeSelection.length !== 2 || forgeSolved} onClick={submitForge}>点火合字</button>
      </div>}

      {act === "mist" && <div className="adventure-task adventure-mist">
        <p className="adventure-step-label">第三幕 · 记忆迷雾</p><div className="mist-emblem" aria-hidden="true"><EyeOff /></div>
        {mistStep === "sound" ? <><h1>刚才的字已经藏进雾里</h1><p className="adventure-subtitle">词语：□弃。选择它的正确读音。</p><div className="adventure-choice-grid is-reading">{rotated(soundOptions).map((option) => <button key={option} onClick={() => chooseSound(option)}>{option}</button>)}</div><button className="adventure-hint" disabled={muted} onClick={() => { setCueFloor(1); speak(character.hanzi, muted); }}><Volume2 aria-hidden="true" />{muted ? "声音已关闭" : "听一遍线索（会记录为使用提示）"}</button></>
          : <><h1>哪份证词解释了“□弃”？</h1><div className="adventure-choice-grid is-copy">{["觉得不合适，或不愿接近、接纳", "因为害怕，所以赶快逃开", "特别羡慕，想要变得一样", "暂时空闲，没有事情要做"].map((option) => <button key={option} onClick={() => chooseMeaning(option)}>{option}</button>)}</div></>}
      </div>}

      {act === "theater" && <div className="adventure-task adventure-theater">
        <div className="theater-character"><span className={`theater-portrait ${theaterStep === "distinguish" ? "is-heron" : ""}`}><Image src={visual.src} alt={theaterStep === "context" ? "画中的证人" : "白鹭探长"} fill sizes="160px" /></span><small>{theaterStep === "context" ? "画中证人" : "鹭探长"}</small></div>
        <div className="adventure-question"><p className="adventure-step-label">第四幕 · 语境小剧场</p>{theaterStep === "context" ? <><h1>哪一句把刚找回的字用对了？</h1><div className="adventure-choice-grid is-copy">{["这本旧书很有意思，我一点也不嫌它旧。", "周末作业写完了，我终于嫌下来了。", "她很有本领，却一直很嫌虚。"].map((option) => <button key={option} onClick={() => chooseContext(option)}>{option}</button>)}</div></>
          : <><h1>哪一个词能走进这句证词？</h1><div className="adventure-dialogue">修复师没有 <b>□ □</b> 旧画框，而是把它认真修好了。</div><div className="adventure-choice-grid is-copy">{["嫌弃", "闲暇", "谦虚", "道歉"].map((option) => <button key={option} onClick={() => chooseDistinguish(option)}>{option}</button>)}</div></>}</div>
      </div>}

      {act === "boss" && <div className="adventure-task adventure-boss">
        <p className="adventure-step-label">第五幕 · 记忆封印</p><h1>{revealed ? "对照范字，自主检查" : "不看答案，凭记忆写一遍"}</h1><p className="adventure-subtitle">读音 xián · 词语 □弃。先写，再揭晓。</p>
        <div className="boss-writing"><div className="boss-model" aria-hidden={!revealed}>{revealed ? character.hanzi : <EyeOff />}</div><div className="boss-grid"><canvas ref={canvasRef} width={480} height={480} aria-label="田字格书写区" onPointerDown={beginDraw} onPointerMove={draw} onPointerUp={() => setDrawing(false)} onPointerCancel={() => setDrawing(false)} /><i /><i /></div></div>
        {!revealed ? <div className="boss-actions"><button className="adventure-secondary" onClick={clearCanvas}><RotateCcw aria-hidden="true" />重写</button><button className="adventure-primary" onClick={() => setRevealed(true)}><Eye aria-hidden="true" />{inked ? "揭晓范字" : "我已在纸上写过，揭晓"}</button></div>
          : <div className="boss-self-check"><p><ShieldCheck aria-hidden="true" />由你对照范字检查，不是机器识别。</p><button onClick={() => completeWriting("match")}>我认为一致</button><button onClick={() => completeWriting("parts")}>部件有误</button><button onClick={() => completeWriting("position")}>位置有误</button><button onClick={() => completeWriting("strokes")}>笔画有误</button><button onClick={() => completeWriting("unsure")}>我不能确认</button></div>}
      </div>}

      {act === "result" && <div className="adventure-task adventure-result">
        <span className="result-stamp">案已破</span><p className="adventure-step-label">白鹭 · 第 01 案</p><div className="result-glyph"><strong>{character.hanzi}</strong><span>{character.pinyin}</span></div><h1>恰到好处的字，找回来了</h1><p className="result-meaning">女 + 兼 → 嫌<br />“觉得不合适或不愿接近；在课文里是嫌长、嫌短。”</p>
        <div className="result-seals">{xianObjectives.map((objective) => <span className={results[objective.id] ? assisted[objective.id] ? "is-assisted" : "is-found" : "is-practice"} key={objective.id}><Check aria-hidden="true" />{{ recognition: "看得出", phonology: "读得准", semantics: "懂意思", generation: "搭得回", discrimination: "分得清", context: "用得对" }[objective.id]}<small>{results[objective.id] ? assisted[objective.id] ? "补救后找回" : "本轮找回" : "需要再练"}</small></span>)}</div>
        <div className="result-actions"><button className="adventure-primary" onClick={() => router.push(`/lessons/${character.lessonId}/words/${character.id}`)}>收藏进《白鹭》案卷</button><button className="adventure-secondary" onClick={() => window.location.reload()}><RotateCcw aria-hidden="true" />再挑战一次</button></div>
      </div>}
    </section>
    {feedbackSheet()}
  </main>;
}
