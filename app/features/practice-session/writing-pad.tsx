"use client";

import { useEffect, useRef, useState } from "react";
import type HanziWriter from "hanzi-writer";
import type { CharacterJson, StrokeData } from "hanzi-writer";
import {
  emptyHandwritingAttempt,
  hanziWriterDataPath,
  type HandwritingAttempt,
} from "../../domain/handwriting";

const characterDataCache = new Map<string, Promise<CharacterJson>>();

function loadCharacterData(character: string) {
  const cached = characterDataCache.get(character);
  if (cached) return cached;
  const request = fetch(hanziWriterDataPath(character), {
    cache: "force-cache",
    headers: { accept: "application/json" },
  }).then(async (response) => {
    if (!response.ok) throw new Error(`笔画数据加载失败（${response.status}）`);
    const data = await response.json() as CharacterJson;
    if (!data.strokes?.length || data.strokes.length !== data.medians?.length) {
      throw new Error("笔画数据不完整");
    }
    return data;
  }).catch((error) => {
    characterDataCache.delete(character);
    throw error;
  });
  characterDataCache.set(character, request);
  return request;
}

function expectedStrokeCount(data: StrokeData, fallback: number) {
  return fallback || data.strokeNum + data.strokesRemaining + 1;
}

export function WritingPad({
  character,
  guided,
  retrying,
  canvasLabel,
  onProgress,
  onComplete,
  onClear,
}: {
  character: string;
  guided: boolean;
  retrying: boolean;
  canvasLabel: string;
  onProgress: (attempt: HandwritingAttempt) => void;
  onComplete: (attempt: HandwritingAttempt) => void;
  onClear: () => void;
}) {
  const targetRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  const expectedRef = useRef(0);
  const backwardsRef = useRef(0);
  const callbacksRef = useRef({ onProgress, onComplete });
  const [attempt, setAttempt] = useState<HandwritingAttempt>(emptyHandwritingAttempt);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [lastMistakeBackwards, setLastMistakeBackwards] = useState(false);
  const [setupRevision, setSetupRevision] = useState(0);

  useEffect(() => {
    callbacksRef.current = { onProgress, onComplete };
  }, [onComplete, onProgress]);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;
    let disposed = false;
    let starting = false;
    let writer: HanziWriter | null = null;

    expectedRef.current = 0;
    backwardsRef.current = 0;
    setAttempt(emptyHandwritingAttempt);
    setLoadState("loading");
    setLastMistakeBackwards(false);
    target.replaceChildren();

    function publish(next: HandwritingAttempt, completed = false) {
      if (disposed) return;
      setAttempt(next);
      callbacksRef.current.onProgress(next);
      if (completed) callbacksRef.current.onComplete(next);
    }

    async function ensureWriter(width: number, height: number) {
      if (writer || starting || width < 80 || height < 80) return;
      starting = true;
      try {
        const { default: HanziWriterClass } = await import("hanzi-writer");
        if (disposed) return;
        writer = HanziWriterClass.create(target!, character, {
          width,
          height,
          padding: Math.max(10, Math.round(Math.min(width, height) * 0.045)),
          renderer: "svg",
          showCharacter: false,
          showOutline: guided || retrying,
          outlineColor: "#b9c8db",
          strokeColor: "#263b64",
          drawingColor: "#263b64",
          highlightColor: "#ef8f43",
          drawingWidth: 7,
          strokeWidth: 3,
          outlineWidth: 2,
          charDataLoader: (requestedCharacter) => loadCharacterData(requestedCharacter),
          onLoadCharDataSuccess: (data) => {
            expectedRef.current = data.strokes.length;
            setLoadState("ready");
            publish({
              ...emptyHandwritingAttempt,
              expectedStrokes: data.strokes.length,
            });
          },
          onLoadCharDataError: () => setLoadState("error"),
        });
        writerRef.current = writer;
        await writer.quiz({
          leniency: 1.25,
          averageDistanceThreshold: 350,
          showHintAfterMisses: 2,
          highlightOnComplete: false,
          acceptBackwardsStrokes: false,
          markStrokeCorrectAfterMisses: false,
          onMistake: (data) => {
            const expected = expectedStrokeCount(data, expectedRef.current);
            if (data.isBackwards) backwardsRef.current += 1;
            setLastMistakeBackwards(data.isBackwards);
            publish({
              acceptedStrokes: expected - data.strokesRemaining,
              expectedStrokes: expected,
              mistakes: data.totalMistakes,
              backwardsMistakes: backwardsRef.current,
              complete: false,
            });
          },
          onCorrectStroke: (data) => {
            const expected = expectedStrokeCount(data, expectedRef.current);
            setLastMistakeBackwards(false);
            publish({
              acceptedStrokes: expected - data.strokesRemaining,
              expectedStrokes: expected,
              mistakes: data.totalMistakes,
              backwardsMistakes: backwardsRef.current,
              complete: data.strokesRemaining === 0,
            });
          },
          onComplete: (summary) => {
            const expected = expectedRef.current;
            publish({
              acceptedStrokes: expected,
              expectedStrokes: expected,
              mistakes: summary.totalMistakes,
              backwardsMistakes: backwardsRef.current,
              complete: true,
            }, true);
          },
        });
      } catch {
        if (!disposed) setLoadState("error");
      } finally {
        starting = false;
      }
    }

    const observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);
      if (writer) {
        writer.updateDimensions({
          width,
          height,
          padding: Math.max(10, Math.round(Math.min(width, height) * 0.045)),
        });
      } else {
        void ensureWriter(width, height);
      }
    });
    observer.observe(target);
    const rect = target.getBoundingClientRect();
    void ensureWriter(Math.round(rect.width), Math.round(rect.height));

    return () => {
      disposed = true;
      observer.disconnect();
      writer?.cancelQuiz();
      if (writerRef.current === writer) writerRef.current = null;
      target.replaceChildren();
    };
  }, [character, guided, retrying, setupRevision]);

  function clear() {
    writerRef.current?.cancelQuiz();
    expectedRef.current = 0;
    backwardsRef.current = 0;
    setAttempt(emptyHandwritingAttempt);
    setLastMistakeBackwards(false);
    onClear();
    setSetupRevision((value) => value + 1);
  }

  const attemptedStrokes = attempt.acceptedStrokes + attempt.mistakes;
  const status = loadState === "loading"
    ? "正在准备规范笔画…"
    : loadState === "error"
      ? "规范笔画加载失败，请重新加载"
      : attempt.complete
        ? `已完成 ${attempt.expectedStrokes} 笔，正在判定`
        : attempt.mistakes > 0
          ? lastMistakeBackwards
            ? `第 ${attempt.acceptedStrokes + 1} 笔方向反了，请按正确方向重写`
            : `第 ${attempt.acceptedStrokes + 1} 笔的位置、形状或笔顺不对，请重写这一笔`
          : attempt.acceptedStrokes > 0
            ? `已正确完成 ${attempt.acceptedStrokes} / ${attempt.expectedStrokes} 笔`
            : retrying
              ? "按系统提示重新写，规范笔画会逐笔检查"
              : guided
                ? "沿规范轮廓按笔顺书写，系统会逐笔检查"
                : "空白书写：系统会逐笔检查笔顺、方向和位置";

  return (
    <div className={`writing-board${guided ? "" : " is-unguided"}${retrying ? " is-retrying" : ""}`}>
      <div
        ref={targetRef}
        className="hanzi-writer-surface"
        role="application"
        aria-label={canvasLabel}
        aria-busy={loadState === "loading"}
      />
      <div className="writing-footer">
        <span
          className={attemptedStrokes ? "writing-status has-ink" : "writing-status"}
          role="status"
          aria-live="polite"
        >
          {status}
        </span>
        <button onClick={clear}>{loadState === "error" ? "重新加载" : "重新写"}</button>
      </div>
    </div>
  );
}
