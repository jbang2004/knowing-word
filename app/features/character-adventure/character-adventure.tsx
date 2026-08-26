"use client";
/* eslint-disable react-hooks/purity, react-hooks/set-state-in-effect -- event latency uses a real clock; stage transitions intentionally reset transient UI state. */

import Image from "next/image";
import {
  ArrowLeft, AudioLines, Brain, Check, Eye, EyeOff, FileCheck2, FolderArchive,
  Lightbulb, MessageCircle, PenTool, Puzzle, RotateCcw, Search, ShieldCheck, Volume2, VolumeX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect, useMemo, useRef, useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion, type PanInfo } from "motion/react";
import type { CharacterItem } from "../../data/catalog-types";
import {
  detectiveErrorTags, detectiveOptions, discriminationErrorTags, forgeErrorTags, forgeParts,
  historicalComponentNote, soundErrorTags, soundOptions, XIAN_ACQUISITION_CUE, xianObjectives, xianWritingQuestionId,
  type XianObjectiveId,
} from "../../domain/xian-adventure";
import type { ErrorTag, LearningAttempt } from "../../domain/learning-state";
import { playAdventureSound, pulseAdventureHaptic } from "../../infrastructure/browser/adventure-audio";
import { playLearningSound } from "../../infrastructure/browser/learning-audio";
import { queueLearningEvent } from "../../infrastructure/browser/learning-event-outbox";
import { getProfileActorId } from "../../infrastructure/browser/profile-actor";
import { applyLearningAttempt } from "../../lib/apply-learning-attempt";
import { learningDayKey } from "../../domain/learning-day";
import { useStudyProfile } from "../profile/use-study-profile";

type Act = "intro" | "detective" | "forge" | "mist" | "theater" | "boss" | "result";
type Feedback = { correct: boolean; title: string; detail: string; next: () => void } | null;
type ObjectiveResults = Partial<Record<XianObjectiveId, boolean>>;
type ForgeSlots = [string | null, string | null];
type BossIssue = "parts" | "position" | "strokes" | "unsure" | null;
type EvidenceFlight = {
  glyph: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
};

const ACTS = ["detective", "forge", "mist", "theater", "boss"] as const;
const ACT_LABELS: Record<(typeof ACTS)[number], string> = {
  detective: "找", forge: "合", mist: "记", theater: "用", boss: "写",
};
const OBJECTIVE_LABELS: Record<XianObjectiveId, string> = {
  recognition: "看得出", phonology: "读得准", semantics: "懂意思",
  generation: "搭得回", discrimination: "分得清", context: "用得对",
};
const detectiveDetails: Record<string, string> = {
  闲: "“闲”也读 xián，但里面是“木”，没有画面里的“兼”线索。",
  谦: "“谦”右边也像“兼”，左边却是言字旁，而且读 qiān。",
  歉: "“歉”含“兼”，右边还有“欠”，读 qiàn，声调也不同。",
};
const stageTransition = { duration: 0.38, ease: [0.2, 0.82, 0.24, 1] as const };

function speak(text: string, muted: boolean) {
  if (muted || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.78;
  window.speechSynthesis.speak(utterance);
}

function ProgressIcon({ act }: { act: Act }) {
  if (act === "detective") return <Search aria-hidden="true" />;
  if (act === "forge") return <Puzzle aria-hidden="true" />;
  if (act === "mist") return <Brain aria-hidden="true" />;
  if (act === "theater") return <MessageCircle aria-hidden="true" />;
  return <PenTool aria-hidden="true" />;
}

export default function CharacterAdventure({ character, visual, narrationAudio = "" }: {
  character: CharacterItem;
  visual: { src: string; alt: string; label: string };
  narrationAudio?: string;
}) {
  const router = useRouter();
  const { setProfile, hydrated } = useStudyProfile();
  const reduceMotion = useReducedMotion();
  const [actorId] = useState(getProfileActorId);
  const [act, setAct] = useState<Act>("intro");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [muted, setMuted] = useState(false);
  const [cueFloor, setCueFloor] = useState<0 | 1 | 2 | 3>(XIAN_ACQUISITION_CUE);
  const [results, setResults] = useState<ObjectiveResults>({});
  const [assisted, setAssisted] = useState<Partial<Record<XianObjectiveId, boolean>>>({});
  const [forgeSelection, setForgeSelection] = useState<ForgeSlots>([null, null]);
  const [forgeSolved, setForgeSolved] = useState(false);
  const [sceneEvidence, setSceneEvidence] = useState<string[]>([]);
  const [pendingEvidence, setPendingEvidence] = useState<string | null>(null);
  const [evidenceFlight, setEvidenceFlight] = useState<EvidenceFlight | null>(null);
  const [mistStep, setMistStep] = useState<"sound" | "meaning">("sound");
  const [mistPreview, setMistPreview] = useState(false);
  const [mistHinted, setMistHinted] = useState(false);
  const [theaterStep, setTheaterStep] = useState<"context" | "distinguish">("context");
  const [theaterChoice, setTheaterChoice] = useState<string | null>(null);
  const [inked, setInked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);
  const [bossIssue, setBossIssue] = useState<BossIssue>(null);
  const [archiving, setArchiving] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bossGridRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const feedbackButtonRef = useRef<HTMLButtonElement>(null);
  const evidenceBagRef = useRef<HTMLDivElement>(null);
  const forgeSlotRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const draggedPartRef = useRef<string | null>(null);
  const pronunciationRef = useRef<HTMLAudioElement>(null);
  const pronunciationStopRef = useRef<number | null>(null);
  const archiveTimerRef = useRef<number | null>(null);
  const lockedRef = useRef(false);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const strokeLengthRef = useRef(0);
  const stageStartedAt = useRef(Date.now());
  const [variant] = useState(() => Math.floor(Math.random() * 12));
  const actIndex = act === "intro" ? 0 : act === "result" ? 5 : ACTS.indexOf(act);
  const objectiveById = useMemo(() => Object.fromEntries(xianObjectives.map((item) => [item.id, item])), []);
  const selectedForgeParts = forgeSelection.filter((part): part is string => Boolean(part));

  function rotated<T>(items: readonly T[]) {
    const offset = variant % items.length;
    return [...items.slice(offset), ...items.slice(0, offset)];
  }

  useEffect(() => {
    stageStartedAt.current = Date.now();
    setCueFloor(XIAN_ACQUISITION_CUE);
    setFeedback(null);
    setTheaterChoice(null);
    window.scrollTo({ top: 0, behavior: "instant" });
    const frame = window.requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
    let previewTimer: number | undefined;
    if (act === "mist" && mistStep === "sound") {
      setMistPreview(true);
      setMistHinted(false);
      previewTimer = window.setTimeout(() => setMistPreview(false), reduceMotion ? 1100 : 850);
    }
    return () => {
      window.cancelAnimationFrame(frame);
      if (previewTimer) window.clearTimeout(previewTimer);
    };
  }, [act, mistStep, theaterStep, reduceMotion]);

  useEffect(() => {
    if (!feedback) return;
    const frame = window.requestAnimationFrame(() => feedbackButtonRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [feedback]);

  useEffect(() => () => {
    if (pronunciationStopRef.current) window.clearTimeout(pronunciationStopRef.current);
    if (archiveTimerRef.current) window.clearTimeout(archiveTimerRef.current);
    pronunciationRef.current?.pause();
    window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => {
    if (act !== "boss") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const setup = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const snapshot = document.createElement("canvas");
      snapshot.width = canvas.width;
      snapshot.height = canvas.height;
      snapshot.getContext("2d")?.drawImage(canvas, 0, 0);
      const ratio = Math.min(window.devicePixelRatio || 1, 2.5);
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      const context = canvas.getContext("2d");
      if (!context) return;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = "#17332d";
      context.shadowColor = "rgba(23, 51, 45, .18)";
      context.shadowBlur = 1.3;
      if (snapshot.width && snapshot.height) context.drawImage(snapshot, 0, 0, rect.width, rect.height);
    };
    setup();
    const observer = new ResizeObserver(setup);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [act]);

  function playPronunciation() {
    if (muted) return;
    const player = pronunciationRef.current;
    if (!player || !narrationAudio) {
      speak("嫌，嫌弃的嫌，读 xián", muted);
      return;
    }
    if (pronunciationStopRef.current) window.clearTimeout(pronunciationStopRef.current);
    player.pause();
    player.currentTime = 0;
    player.volume = 0.9;
    void player.play().then(() => {
      pronunciationStopRef.current = window.setTimeout(() => player.pause(), 3200);
    }).catch(() => speak("嫌，嫌弃的嫌，读 xián", muted));
  }

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
    if (correct) pulseAdventureHaptic("success");
    return true;
  }

  function showFeedback(correct: boolean, title: string, detail: string, next: () => void) {
    lockedRef.current = true;
    setFeedback({ correct, title, detail, next });
  }

  function retry() {
    setCueFloor(2);
    setFeedback(null);
    setTheaterChoice(null);
    stageStartedAt.current = Date.now();
    window.requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
  }

  function arriveEvidence(glyph: string) {
    setSceneEvidence((value) => [...new Set([...value, glyph])]);
    setEvidenceFlight(null);
    setPendingEvidence(null);
  }

  function collectEvidence(glyph: string, event: ReactMouseEvent<HTMLButtonElement>) {
    if (sceneEvidence.includes(glyph) || pendingEvidence) return;
    if (!muted) playAdventureSound("collect");
    pulseAdventureHaptic("light");
    const source = event.currentTarget.getBoundingClientRect();
    const target = evidenceBagRef.current?.getBoundingClientRect();
    setPendingEvidence(glyph);
    if (reduceMotion || !target) {
      arriveEvidence(glyph);
      return;
    }
    setEvidenceFlight({
      glyph,
      from: { x: source.left + source.width / 2 - 24, y: source.top + source.height / 2 - 24 },
      to: { x: target.left + target.width / 2 - 24, y: target.top + target.height / 2 - 24 },
    });
  }

  function chooseDetective(value: string) {
    const correct = value === "嫌";
    if (!recordObjective("recognition", correct, [value], correct ? [] : detectiveErrorTags(value))) return;
    showFeedback(correct, correct ? "第一条证据对上了" : "这条线索还对不上",
      correct ? "句子要表达“觉得长短不合适”，这个字正合适。" : detectiveDetails[value],
      correct ? () => { if (!muted) playAdventureSound("page"); setAct("forge"); } : retry);
  }

  function placeForgePart(part: string, requestedSlot?: number) {
    if (forgeSolved || selectedForgeParts.length >= 2) return;
    const slot = requestedSlot !== undefined && !forgeSelection[requestedSlot]
      ? requestedSlot
      : forgeSelection.findIndex((value) => !value);
    if (slot < 0) return;
    setForgeSelection((previous) => {
      const next: ForgeSlots = [...previous];
      next[slot] = part;
      return next;
    });
    if (!muted) playAdventureSound("snap");
    pulseAdventureHaptic("light");
  }

  function dropForgePart(part: string, info: PanInfo) {
    const requested = forgeSlotRefs.current.findIndex((slot) => {
      if (!slot) return false;
      const bounds = slot.getBoundingClientRect();
      return info.point.x >= bounds.left && info.point.x <= bounds.right
        && info.point.y >= bounds.top && info.point.y <= bounds.bottom;
    });
    placeForgePart(part, requested >= 0 ? requested : undefined);
  }

  function submitForge() {
    const correct = forgeSelection.map((part) => part ?? "").join("") === "女兼";
    if (correct) {
      setForgeSolved(true);
      if (!muted) playAdventureSound("combine");
    }
    if (!recordObjective("generation", correct, selectedForgeParts, correct ? [] : forgeErrorTags(selectedForgeParts))) return;
    showFeedback(correct, correct ? "两个部件合拢了" : "部件还没站对位置",
      correct ? `女在左边表义，兼在右边提示大致读音。${historicalComponentNote}` : "这是左右结构：先找左边的表义部件，再找右边的形音部件。",
      correct ? () => {
        if (!muted) { playLearningSound("streak"); playAdventureSound("mist"); }
        playPronunciation();
        setAct("mist");
      } : () => { setForgeSelection([null, null]); retry(); });
  }

  function chooseSound(value: string) {
    const correct = value === "xián";
    if (!recordObjective("phonology", correct, [value], correct ? [] : soundErrorTags(value))) return;
    showFeedback(correct, correct ? "声纹吻合" : "再听一听声调",
      correct ? "xián，第二声，和“闲”同音。" : "先找声母 x，再听由低向高扬起的第二声。",
      correct ? () => { if (!muted) playAdventureSound("page"); setMistStep("meaning"); } : retry);
  }

  function chooseMeaning(value: string) {
    const correct = value === "觉得不合适，或不愿接近、接纳";
    if (!recordObjective("semantics", correct, [value], correct ? [] : ["meaning-unknown"])) return;
    showFeedback(correct, correct ? "意思也找回来了" : "回到白鹭的长短想一想",
      correct ? "课文中的“嫌长、嫌短”，就是觉得不合适。" : "不是害怕，也不是羡慕；关键是“觉得不合适”。",
      correct ? () => { if (!muted) playAdventureSound("page"); setAct("theater"); } : retry);
  }

  function chooseContext(value: string) {
    setTheaterChoice(value);
    const correct = value === "这本旧书很有意思，我一点也不嫌它旧。";
    if (!recordObjective("context", correct, [value], correct ? [] : ["context-misuse"])) return;
    showFeedback(correct, correct ? "台词贴合画面" : "这句还没说出“不合适”",
      correct ? "这里的“嫌旧”是觉得旧而不喜欢；整句表达并不在意它旧。" : "先判断这个词是不是在表达“觉得不合适或不喜欢”。",
      correct ? () => { if (!muted) playAdventureSound("page"); setTheaterStep("distinguish"); } : retry);
  }

  function chooseDistinguish(value: string) {
    setTheaterChoice(value);
    const correct = value === "嫌弃";
    if (!recordObjective("discrimination", correct, [value], correct ? [] : discriminationErrorTags(value))) return;
    showFeedback(correct, correct ? "真假字已经分清" : "同音字走错房间了",
      correct ? "“嫌弃”与态度有关；“闲暇”与空闲时间有关。" : "听起来一样，还要看部件和词义。",
      correct ? () => { if (!muted) playAdventureSound("page"); setAct("boss"); } : retry);
  }

  function canvasPoint(event: PointerEvent | ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function beginDraw(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (revealed) return;
    const canvas = canvasRef.current;
    const point = canvasPoint(event);
    if (!canvas || !point) return;
    canvas.setPointerCapture(event.pointerId);
    const context = canvas.getContext("2d");
    if (!context) return;
    context.beginPath();
    context.moveTo(point.x, point.y);
    context.lineWidth = 5 + Math.max(0, event.pressure) * 4;
    drawingRef.current = true;
    lastPointRef.current = point;
    strokeLengthRef.current = 0;
    setDrawing(true);
    setInked(true);
    if (!muted) playAdventureSound("brush");
  }

  function draw(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    const samples = event.nativeEvent.getCoalescedEvents?.() ?? [event.nativeEvent];
    for (const sample of samples) {
      const point = canvasPoint(sample);
      if (!point) continue;
      const previous = lastPointRef.current;
      if (previous) strokeLengthRef.current += Math.hypot(point.x - previous.x, point.y - previous.y);
      context.lineWidth = 5 + (sample.pressure > 0 ? sample.pressure * 4 : 1.4);
      context.lineTo(point.x, point.y);
      context.stroke();
      lastPointRef.current = point;
      bossGridRef.current?.style.setProperty("--ink-x", `${point.x}px`);
      bossGridRef.current?.style.setProperty("--ink-y", `${point.y}px`);
    }
  }

  function finishDraw() {
    if (drawingRef.current && strokeLengthRef.current >= 6) setStrokeCount((count) => count + 1);
    drawingRef.current = false;
    lastPointRef.current = null;
    strokeLengthRef.current = 0;
    setDrawing(false);
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (canvas && context) {
      context.save();
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.restore();
    }
    drawingRef.current = false;
    setDrawing(false);
    setInked(false);
    setRevealed(false);
    setStrokeCount(0);
  }

  function completeWriting(kind: "match" | "parts" | "position" | "strokes" | "unsure") {
    if (!hydrated || lockedRef.current) return;
    lockedRef.current = true;
    setBossIssue(kind === "match" ? null : kind);
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
      showFeedback(false, "封印还差最后一步", detail, () => {
        clearCanvas(); setCueFloor(3); setFeedback(null); stageStartedAt.current = Date.now();
        window.requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
      });
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
    if (!muted) { playLearningSound("complete"); playAdventureSound("stamp"); }
    pulseAdventureHaptic("success");
    setAct("result");
  }

  function archiveResult() {
    if (archiving) return;
    setArchiving(true);
    if (!muted) { playAdventureSound("stamp"); playAdventureSound("page"); }
    pulseAdventureHaptic("success");
    archiveTimerRef.current = window.setTimeout(() => {
      router.push(`/lessons/${character.lessonId}/words/${character.id}`);
    }, reduceMotion ? 180 : 760);
  }

  function toggleMuted() {
    setMuted((value) => {
      if (!value) {
        window.speechSynthesis?.cancel();
        pronunciationRef.current?.pause();
      }
      return !value;
    });
  }

  function progressHeader() {
    return <header className="adventure-topbar">
      <button className="adventure-icon-button" onClick={() => router.back()} aria-label="退出汉字冒险"><ArrowLeft aria-hidden="true" /></button>
      <div className="adventure-progress" role="progressbar" aria-valuemin={0} aria-valuemax={5} aria-valuenow={actIndex} aria-label={`案件已完成 ${actIndex} 步，共 5 步`}>
        {ACTS.map((item, index) => <span className={`${index < actIndex ? "is-filled" : ""}${index === actIndex && act !== "result" ? " is-current" : ""}`} key={item}>
          <i><ProgressIcon act={item} /></i><b>{ACT_LABELS[item]}</b>
        </span>)}
      </div>
      <button className="adventure-icon-button" aria-pressed={muted} onClick={toggleMuted} aria-label={muted ? "打开声音" : "关闭声音"}>{muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}</button>
    </header>;
  }

  function feedbackSheet() {
    return <AnimatePresence>{feedback && <motion.aside
      className={`adventure-feedback ${feedback.correct ? "is-correct" : "is-retry"}`}
      role="status" aria-live="polite"
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 80 }}
      animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={stageTransition}
    >
      <motion.span className="adventure-feedback-icon" initial={{ scale: 0.78 }} animate={{ scale: 1 }}>
        {feedback.correct ? <Check aria-hidden="true" /> : <Lightbulb aria-hidden="true" />}
      </motion.span>
      <div><strong>{feedback.title}</strong><p>{feedback.detail}</p></div>
      <button ref={feedbackButtonRef} onClick={() => { lockedRef.current = false; feedback.next(); }}>{feedback.correct ? "继续" : "再查一次"}</button>
    </motion.aside>}</AnimatePresence>;
  }

  const stageKey = act === "mist" ? `${act}-${mistStep}` : act === "theater" ? `${act}-${theaterStep}` : act;

  if (act === "intro") return <MotionConfig reducedMotion="user" transition={stageTransition}>
    <main className="xian-adventure adventure-shell is-intro">
      {progressHeader()}
      <motion.section className="adventure-hero" aria-labelledby="adventure-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div className="adventure-art" initial={reduceMotion ? false : { opacity: 0, rotate: -3, scale: 0.97 }} animate={{ opacity: 1, rotate: -1.4, scale: 1 }}>
          <Image src={visual.src} alt="白鹭、水彩人物与竹篮组成的案件画面" fill priority sizes="(max-width: 760px) 100vw, 620px" />
          <span className="adventure-art-wash" aria-hidden="true" /><span className="adventure-case-tag">白鹭 · 第 01 案</span>
        </motion.div>
        <motion.div className="adventure-briefing" initial={reduceMotion ? false : { opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}>
          <p className="adventure-kicker"><AudioLines aria-hidden="true" /> 汉字侦探局</p>
          <h1 id="adventure-title">恰到好处的字<br />不见了</h1>
          <p className="adventure-lead">增之一分则 □ 长，减之一分则 □ 短。找到画面与读音线索，把这个字找回来。</p>
          <div className="adventure-brief-card"><span>案件目标</span><strong>找字 · 辨音 · 合部件 · 用语境 · 凭记忆写</strong><small>约 6–9 分钟，没有倒计时，也不会扣生命。</small></div>
          <motion.button className="adventure-start" type="button" disabled={!hydrated} whileTap={{ y: 5 }} onClick={() => { if (!muted) playLearningSound("start"); setAct("detective"); }}><span>{hydrated ? "开始侦查" : "正在恢复案卷…"}</span><small>五幕连续挑战</small></motion.button>
        </motion.div>
      </motion.section>
      {narrationAudio && <audio ref={pronunciationRef} src={narrationAudio} preload="metadata" />}
    </main>
  </MotionConfig>;

  return <MotionConfig reducedMotion="user" transition={stageTransition}>
    <main className={`xian-adventure adventure-shell is-stage act-${act}`}>
      {progressHeader()}
      <section className="adventure-stage" inert={feedback ? true : undefined}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={stageKey} className="adventure-stage-motion"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}>
            {act === "detective" && <div className="adventure-task adventure-task-split">
              <div className="adventure-scene-evidence">
                <Image src={visual.src} alt="白鹭、水彩人物与竹篮组成的线索画面" fill sizes="(max-width: 760px) 100vw, 540px" />
                <button className={`adventure-hotspot is-person ${sceneEvidence.includes("女") ? "is-found" : ""} ${pendingEvidence === "女" ? "is-pending" : ""}`} aria-label="查看人物字形线索" onClick={(event) => collectEvidence("女", event)}><span>{sceneEvidence.includes("女") ? <><Check aria-hidden="true" />人物</> : "人物"}</span></button>
                <button className={`adventure-hotspot is-basket ${sceneEvidence.includes("兼") ? "is-found" : ""} ${pendingEvidence === "兼" ? "is-pending" : ""}`} aria-label="查看竹篮字形线索" onClick={(event) => collectEvidence("兼", event)}><span>{sceneEvidence.includes("兼") ? <><Check aria-hidden="true" />竹篮</> : "竹篮"}</span></button>
              </div>
              <div className="adventure-question"><p className="adventure-step-label">第一幕 · 字影扫描</p><h1 ref={headingRef} tabIndex={-1}>把正确的字盖回课文</h1>
                <div className="adventure-quote">增之一分则 <b>□</b> 长，<br />减之一分则 <b>□</b> 短。</div>
                <div ref={evidenceBagRef} className={`adventure-evidence-bag ${sceneEvidence.length === 2 ? "is-complete" : ""}`}>
                  <span className="evidence-bag-title"><FileCheck2 aria-hidden="true" /><strong>证据袋 {sceneEvidence.length} / 2</strong></span>
                  <span className="evidence-slots" aria-label={`已找到 ${sceneEvidence.join("、") || "零"} 条部件证据`}>
                    {["女", "兼"].map((glyph) => <i className={sceneEvidence.includes(glyph) ? "is-found" : ""} key={glyph}>{sceneEvidence.includes(glyph) ? <motion.b initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>{glyph}</motion.b> : "?"}</i>)}
                  </span>
                  <small>{sceneEvidence.length < 2 ? "点画面里的两个呼吸线索，证据会自动归档。" : "证据齐了：用“女 + 兼”核对目标字。"}</small>
                </div>
                <AnimatePresence mode="wait">
                  {sceneEvidence.length === 2 && <motion.div className="adventure-choice-grid is-glyphs" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    {rotated(detectiveOptions).map((option) => <motion.button whileTap={{ scale: 0.98 }} onClick={() => chooseDetective(option)} key={option}><span>{option}</span></motion.button>)}
                  </motion.div>}
                </AnimatePresence>
                {cueFloor >= 2 && <div className="adventure-remedy"><span>闲 = 门 + 木</span><strong>目标字 = 女 + 兼</strong></div>}
                <button className="adventure-hint" onClick={() => { setCueFloor(1); if (!muted) playLearningSound("encourage"); }}><Lightbulb aria-hidden="true" />提示：这个字右边有“兼”的影子</button>
              </div>
            </div>}

            {act === "forge" && <div className="adventure-task adventure-forge">
              <p className="adventure-step-label">第二幕 · 部件锻造厂</p><h1 ref={headingRef} tabIndex={-1}>只凭线索，合成左右结构</h1><p className="adventure-subtitle">点击部件，或把它拖进左右槽位。</p>
              <div className={`forge-stage ${forgeSolved ? "is-solved" : ""}`}>
                <AnimatePresence mode="wait">
                  {forgeSolved ? <motion.div className="forge-reveal" role="status" key="reveal">
                    <motion.span className="forge-merge is-left" initial={{ x: -88, opacity: 1 }} animate={{ x: 18, opacity: 0 }} transition={{ duration: 0.52 }}>女</motion.span>
                    <motion.span className="forge-merge is-right" initial={{ x: 88, opacity: 1 }} animate={{ x: -18, opacity: 0 }} transition={{ duration: 0.52 }}>兼</motion.span>
                    <motion.strong initial={{ opacity: 0, scale: 0.78 }} animate={{ opacity: 1, scale: [0.78, 1.08, 1] }} transition={{ delay: 0.34, duration: 0.42 }}>{character.hanzi}</motion.strong>
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>{character.pinyin}</motion.span>
                  </motion.div> : <motion.div className="forge-workbench" aria-label="左右结构部件槽" key="bench">
                    {[0, 1].map((index) => <motion.button layout ref={(element) => { forgeSlotRefs.current[index] = element; }} key={index} onClick={() => setForgeSelection((previous) => { const next: ForgeSlots = [...previous]; next[index] = null; return next; })} className={`${forgeSelection[index] ? "is-filled " : ""}${index === 0 ? "is-radical" : "is-component"}`}>
                      {forgeSelection[index] ? <motion.span initial={{ y: 30, scale: 0.7, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }}>{forgeSelection[index]}</motion.span> : <span>{cueFloor >= 2 ? index === 0 ? "左 · 表义" : "右 · 形音" : index === 0 ? "左侧" : "右侧"}</span>}
                    </motion.button>)}
                    <i aria-hidden="true">+</i>
                  </motion.div>}
                </AnimatePresence>
              </div>
              <div className="forge-parts">{rotated(forgeParts).map((part) => <motion.button
                className={`${part === "女" ? "is-radical" : part === "兼" ? "is-component" : ""}${selectedForgeParts.includes(part) ? " is-used" : ""}`}
                key={part} disabled={selectedForgeParts.length >= 2 || forgeSolved || selectedForgeParts.includes(part)}
                drag={!forgeSolved && selectedForgeParts.length < 2} dragSnapToOrigin dragElastic={0.16}
                whileDrag={{ scale: 1.12, rotate: -3, zIndex: 8 }} whileTap={{ scale: 0.94 }}
                onDragStart={() => { draggedPartRef.current = part; }}
                onDragEnd={(_, info) => { dropForgePart(part, info); window.setTimeout(() => { if (draggedPartRef.current === part) draggedPartRef.current = null; }, 0); }}
                onClick={() => { if (draggedPartRef.current === part) { draggedPartRef.current = null; return; } placeForgePart(part); }}>{part}</motion.button>)}</div>
              <p className="adventure-history-note"><ShieldCheck aria-hidden="true" />“女”是历史字形中的表义部件，不表示女孩有某种负面性格。</p><button className="adventure-primary" disabled={selectedForgeParts.length !== 2 || forgeSolved} onClick={submitForge}>点火合字</button>
            </div>}

            {act === "mist" && <div className="adventure-task adventure-mist">
              <p className="adventure-step-label">第三幕 · 记忆迷雾</p>
              <div className={`mist-memory ${mistHinted ? "is-hinted" : ""} ${mistStep === "meaning" ? "is-settled" : ""}`} aria-hidden="true">
                <AnimatePresence>{mistPreview && <motion.strong initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.16, filter: "blur(9px)" }}>{character.hanzi}</motion.strong>}</AnimatePresence>
                <motion.div className="mist-cloud is-back" animate={reduceMotion ? undefined : { x: [-10, 12, -10] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}><Image src="/adventure/xian/memory-mist.webp" alt="" fill sizes="700px" /></motion.div>
                <motion.div className="mist-cloud is-front" animate={reduceMotion ? undefined : { x: [14, -16, 14] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}><Image src="/adventure/xian/memory-mist.webp" alt="" fill sizes="700px" /></motion.div>
                <span>{mistPreview ? "看清字形" : mistHinted ? "雾退开了一点" : "字已藏好"}</span>
              </div>
              {mistStep === "sound" ? <><h1 ref={headingRef} tabIndex={-1}>刚才的字已经藏进雾里</h1><p className="adventure-subtitle">词语：□弃。选择它的正确读音。</p><div className="adventure-choice-grid is-reading">{rotated(soundOptions).map((option) => <motion.button whileTap={{ scale: 0.98 }} key={option} onClick={() => chooseSound(option)}>{option}</motion.button>)}</div><button className="adventure-hint" disabled={muted} onClick={() => { setCueFloor(1); setMistHinted(true); playPronunciation(); }}><Volume2 aria-hidden="true" />{muted ? "声音已关闭" : "听一遍线索（会记录为使用提示）"}</button></>
                : <><h1 ref={headingRef} tabIndex={-1}>哪份证词解释了“□弃”？</h1><div className="adventure-choice-grid is-copy">{["觉得不合适，或不愿接近、接纳", "因为害怕，所以赶快逃开", "特别羡慕，想要变得一样", "暂时空闲，没有事情要做"].map((option) => <motion.button whileTap={{ scale: 0.985 }} key={option} onClick={() => chooseMeaning(option)}>{option}</motion.button>)}</div></>}
            </div>}

            {act === "theater" && <div className={`adventure-task adventure-theater is-${theaterStep}`}>
              <span className="theater-spotlight" aria-hidden="true" />
              <div className="theater-character"><motion.span className={`theater-portrait ${theaterStep === "distinguish" ? "is-heron" : ""}`} initial={{ opacity: 0, x: theaterStep === "context" ? -24 : 24 }} animate={{ opacity: 1, x: 0 }}><Image src={visual.src} alt={theaterStep === "context" ? "画中的证人" : "白鹭探长"} fill sizes="(max-width: 760px) 320px, 420px" /></motion.span><motion.small initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{theaterStep === "context" ? "画中证人" : "鹭探长"}</motion.small><div className="theater-cue">{theaterStep === "context" ? "把正确台词交给我。" : "把同音词送进正确卷宗。"}</div></div>
              <div className="adventure-question"><p className="adventure-step-label">第四幕 · 语境小剧场</p>{theaterStep === "context" ? <><h1 ref={headingRef} tabIndex={-1}>哪一句把刚找回的字用对了？</h1>
                <AnimatePresence>{theaterChoice && <motion.div className={`theater-script ${feedback?.correct ? "is-correct" : ""}`} initial={{ opacity: 0, y: 16, rotate: 1.5 }} animate={{ opacity: 1, y: 0, rotate: -0.5 }} exit={{ opacity: 0 }}>{theaterChoice}</motion.div>}</AnimatePresence>
                <div className="adventure-choice-grid is-copy">{["这本旧书很有意思，我一点也不嫌它旧。", "周末作业写完了，我终于嫌下来了。", "她很有本领，却一直很嫌虚。"].map((option) => <motion.button className={theaterChoice === option ? "is-selected" : ""} whileTap={{ scale: 0.985 }} key={option} onClick={() => chooseContext(option)}>{option}</motion.button>)}</div></>
                : <><h1 ref={headingRef} tabIndex={-1}>哪一个词能走进这句证词？</h1><div className="adventure-dialogue">修复师没有 <b>{theaterChoice || "□ □"}</b> 旧画框，而是把它认真修好了。</div><div className="adventure-choice-grid is-copy is-word-files">{["嫌弃", "闲暇", "谦虚", "道歉"].map((option) => <motion.button className={theaterChoice === option ? "is-selected" : ""} whileTap={{ scale: 0.96 }} key={option} onClick={() => chooseDistinguish(option)}><FolderArchive aria-hidden="true" />{option}</motion.button>)}</div></>}</div>
            </div>}

            {act === "boss" && <div className="adventure-task adventure-boss">
              <p className="adventure-step-label">第五幕 · 记忆封印</p><h1 ref={headingRef} tabIndex={-1}>{revealed ? "叠上范字，自主检查" : "不看答案，凭记忆写一遍"}</h1><p className="adventure-subtitle">读音 xián · 词语 □弃。前四幕证据都在场，先写，再揭晓。</p>
              <div className="boss-arena">
                <div className="boss-evidence-ring" aria-label="已收集的六类证据">{xianObjectives.map((objective, index) => {
                  const emphasized = bossIssue === "parts" && objective.id === "generation"
                    || bossIssue === "position" && objective.id === "recognition"
                    || bossIssue === "strokes" && objective.id === "generation";
                  return <motion.span className={`${results[objective.id] ? "is-ready" : ""}${emphasized ? " is-emphasis" : ""}${bossIssue && !emphasized ? " is-dimmed" : ""}`} style={{ "--seal-index": index } as CSSProperties} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: index * 0.055 }} key={objective.id}><Check aria-hidden="true" />{OBJECTIVE_LABELS[objective.id]}</motion.span>;
                })}</div>
                <div className="boss-writing"><div className="boss-model" aria-hidden={!revealed}>{revealed ? character.hanzi : <EyeOff />}</div><div ref={bossGridRef} className={`boss-grid ${drawing ? "is-drawing" : ""} ${revealed ? "is-revealed" : ""}`}><canvas ref={canvasRef} width={480} height={480} aria-label="田字格书写区" aria-describedby="boss-writing-status" aria-disabled={revealed} onPointerDown={beginDraw} onPointerMove={draw} onPointerUp={finishDraw} onPointerLeave={finishDraw} onPointerCancel={finishDraw} /><i /><i />{revealed && <motion.span className="boss-guide-character" initial={{ opacity: 0 }} animate={{ opacity: 0.17 }}>{character.hanzi}</motion.span>}</div></div>
              </div>
              <p id="boss-writing-status" className={`boss-writing-status ${inked ? "has-ink" : ""}`}>{revealed ? "淡色范字已叠在你的笔迹下方，请逐部件对照。" : strokeCount ? `已记录 ${strokeCount} 笔，继续把字写完整。` : "在田字格内书写；支持触控笔轻重变化。"}</p>
              {!revealed ? <div className="boss-actions"><button className="adventure-secondary" onClick={clearCanvas}><RotateCcw aria-hidden="true" />重写</button><button className="adventure-primary" onClick={() => { setRevealed(true); if (!muted) playAdventureSound("page"); }}><Eye aria-hidden="true" />{inked ? "叠上范字" : "我已在纸上写过，叠上范字"}</button></div>
                : <div className="boss-self-check"><p><ShieldCheck aria-hidden="true" />由你对照范字检查，不是机器识别。</p><button onClick={() => completeWriting("match")}>我认为一致</button><button onClick={() => completeWriting("parts")}>部件有误</button><button onClick={() => completeWriting("position")}>位置有误</button><button onClick={() => completeWriting("strokes")}>笔画有误</button><button onClick={() => completeWriting("unsure")}>我不能确认</button></div>}
            </div>}

            {act === "result" && <div className="adventure-task adventure-result">
              <div className="result-layout">
                <motion.div className="result-case-visual" animate={archiving ? (reduceMotion ? { opacity: 0 } : { y: -90, x: 120, rotate: 8, scale: 0.36, opacity: 0 }) : { opacity: 1 }} transition={{ duration: reduceMotion ? 0.15 : 0.72, ease: [0.2, 0.82, 0.24, 1] }}>
                  <Image src="/adventure/xian/case-folio.webp" alt="水彩汉字案件卷宗" fill priority sizes="(max-width: 760px) 260px, 390px" />
                  <span className="folio-label"><strong>{character.hanzi}</strong><small>{character.pinyin}</small></span>
                  <motion.span className="result-stamp" initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.5, rotate: -16 }} animate={{ opacity: 1, scale: [1.5, 0.92, 1], rotate: -8 }} transition={{ delay: 0.18, duration: 0.62 }}>案已破</motion.span>
                </motion.div>
                <div className="result-summary"><p className="adventure-step-label">白鹭 · 第 01 案</p><div className="result-glyph"><strong>{character.hanzi}</strong><span>{character.pinyin}</span></div><h1 ref={headingRef} tabIndex={-1}>恰到好处的字，找回来了</h1><p className="result-meaning">女 + 兼 → 嫌<br />“觉得不合适或不愿接近；在课文里是嫌长、嫌短。”</p></div>
              </div>
              <div className="result-seals">{xianObjectives.map((objective, index) => <motion.span initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.34 + index * 0.06 }} className={results[objective.id] ? assisted[objective.id] ? "is-assisted" : "is-found" : "is-practice"} key={objective.id}><Check aria-hidden="true" />{OBJECTIVE_LABELS[objective.id]}<small>{results[objective.id] ? assisted[objective.id] ? "补救后找回" : "本轮找回" : "需要再练"}</small></motion.span>)}</div>
              <div className="result-actions"><button className="adventure-primary" disabled={archiving} onClick={archiveResult}><FolderArchive aria-hidden="true" />{archiving ? "正在归档…" : "收藏进《白鹭》案卷"}</button><button className="adventure-secondary" disabled={archiving} onClick={() => window.location.reload()}><RotateCcw aria-hidden="true" />再挑战一次</button></div>
            </div>}
          </motion.div>
        </AnimatePresence>
      </section>
      <AnimatePresence>{evidenceFlight && <motion.span className="evidence-flight" key={evidenceFlight.glyph}
        initial={{ x: evidenceFlight.from.x, y: evidenceFlight.from.y, scale: 0.72, opacity: 0 }}
        animate={{ x: evidenceFlight.to.x, y: evidenceFlight.to.y, scale: [0.72, 1.08, 0.82], opacity: 1, rotate: [0, -8, 4] }}
        exit={{ opacity: 0 }} transition={{ duration: 0.58, ease: [0.2, 0.9, 0.25, 1] }}
        onAnimationComplete={() => arriveEvidence(evidenceFlight.glyph)}>{evidenceFlight.glyph}</motion.span>}</AnimatePresence>
      {feedbackSheet()}
      {narrationAudio && <audio ref={pronunciationRef} src={narrationAudio} preload="metadata" />}
    </main>
  </MotionConfig>;
}
