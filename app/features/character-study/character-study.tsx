"use client";

import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  CheckCircle2,
  CircleStop,
  Map as MapIcon,
  Mic2,
  RotateCcw,
  Sparkles,
  Volume2,
} from "lucide-react";
import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CharacterItem } from "../../data/catalog-types";
import type { HeritageAsset, AudioMark } from "../../data/heritage-assets";
import type { LearningVisual } from "../../data/illustrations";
import type { MnemonicScene } from "../../data/mnemonic-scenes";
import {
  getMnemonicStageCopy,
  getMnemonicStagePartIndices,
  mnemonicStageLabels,
  type MnemonicStage,
} from "../../data/mnemonics";
import { getPartFocusRegions, mergeFocusRegions } from "../../lib/mnemonic-focus";
import {
  activeNarrationMarkIndices,
  activeNarrationPhraseIndex,
  buildNarrationTokens,
  narrationPhraseIndexByMark,
} from "../../lib/narration";
import type { StudyProfile } from "../../lib/profile-model";
import { getPracticeSteps } from "../../domain/practice";
import type { NarrationMedia } from "../../domain/narration-media";
import { speak } from "../../infrastructure/browser/speech";

export type CharacterStudyMedia = {
  visual?: LearningVisual;
  heritage?: HeritageAsset;
  scene: MnemonicScene;
  narration: NarrationMedia;
};

function InlineNarrationPlayer({
  active,
  character,
  narration,
  onActiveChange,
  onFinished,
  onReadAloud,
}: {
  active: boolean;
  character: CharacterItem;
  narration: NarrationMedia;
  onActiveChange: (active: boolean) => void;
  onFinished?: () => void;
  onReadAloud: () => void;
}) {
  const audioSource = narration.audio;
  const audioMarksSource = narration.marks;
  const releasedTranscript = narration.transcript;
  const audioRef = useRef<HTMLAudioElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const playerRef = useRef<HTMLElement>(null);
  const transcriptTriggerRef = useRef<HTMLButtonElement>(null);
  const transcriptSheetRef = useRef<HTMLElement>(null);
  const transcriptCloseRef = useRef<HTMLButtonElement>(null);
  const restoreLauncherFocusRef = useRef(false);
  const [marks, setMarks] = useState<AudioMark[]>([]);
  const [transcriptText, setTranscriptText] = useState(narration.transcript);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  useEffect(() => {
    if (!playing || !audioSource) return;
    let frame = 0;
    let lastSample = 0;
    const sampleAudioTime = (timestamp: number) => {
      const audio = audioRef.current;
      if (audio && !audio.paused && timestamp - lastSample >= 32) {
        setElapsed(audio.currentTime);
        lastSample = timestamp;
      }
      frame = window.requestAnimationFrame(sampleAudioTime);
    };
    frame = window.requestAnimationFrame(sampleAudioTime);
    return () => window.cancelAnimationFrame(frame);
  }, [audioSource, playing]);

  useEffect(() => {
    if (!audioMarksSource) return;
    const controller = new AbortController();
    const audio = audioRef.current;
    void fetch(audioMarksSource, { signal: controller.signal })
      .then((response) => response.ok
        ? response.json() as Promise<{ marks?: AudioMark[]; transcript?: string }>
        : Promise.reject(new Error("marks unavailable")))
      .then((payload: { marks?: AudioMark[]; transcript?: string }) => {
        setMarks((payload.marks || []).filter((mark) => Number.isFinite(mark.start) && Number.isFinite(mark.end)));
        setTranscriptText(payload.transcript || narration.transcript);
      })
      .catch(() => undefined);
    return () => {
      controller.abort();
      audio?.pause();
    };
  }, [audioMarksSource, narration.transcript]);

  useEffect(() => {
    if (!active) {
      if (!restoreLauncherFocusRef.current) return;
      restoreLauncherFocusRef.current = false;
      const focusFrame = window.requestAnimationFrame(() => launcherRef.current?.focus({ preventScroll: true }));
      return () => window.cancelAnimationFrame(focusFrame);
    }

    let revealFrame = 0;
    let resizeTimer = 0;
    const revealPlayer = (focus = false) => {
      window.cancelAnimationFrame(revealFrame);
      revealFrame = window.requestAnimationFrame(() => {
        const player = playerRef.current;
        if (!player) return;
        if (focus) player.focus({ preventScroll: true });
        if (!window.matchMedia("(max-width: 899px)").matches) return;

        const viewport = window.visualViewport;
        const viewportTop = viewport?.offsetTop || 0;
        const viewportBottom = viewportTop + (viewport?.height || window.innerHeight);
        const bounds = player.getBoundingClientRect();
        const fullyVisible = bounds.top >= viewportTop + 8 && bounds.bottom <= viewportBottom - 16;
        if (fullyVisible) return;

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        player.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "nearest",
          inline: "nearest",
        });
      });
    };
    const revealAfterResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => revealPlayer(), 140);
    };

    revealPlayer(true);
    window.addEventListener("resize", revealAfterResize);
    window.visualViewport?.addEventListener("resize", revealAfterResize);
    return () => {
      window.cancelAnimationFrame(revealFrame);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", revealAfterResize);
      window.visualViewport?.removeEventListener("resize", revealAfterResize);
    };
  }, [active]);

  useEffect(() => {
    if (!transcriptOpen) return;
    const returnFocusTo = transcriptTriggerRef.current;
    const focusFrame = window.requestAnimationFrame(() => transcriptCloseRef.current?.focus({ preventScroll: true }));
    const handleDialogKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setTranscriptOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const sheet = transcriptSheetRef.current;
      if (!sheet) return;
      const focusable = Array.from(
        sheet.querySelectorAll<HTMLElement>(
          'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ),
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (!sheet.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleDialogKeyboard);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleDialogKeyboard);
      window.requestAnimationFrame(() => {
        if (returnFocusTo?.isConnected) returnFocusTo.focus({ preventScroll: true });
      });
    };
  }, [transcriptOpen]);

  function toggleNarration() {
    const audio = audioRef.current;
    if (!audioSource || !audio) {
      setPlaying(true);
      speak(releasedTranscript, () => setPlaying(false));
      return;
    }
    if (audio.paused) {
      const audioDuration = Number.isFinite(audio.duration) ? audio.duration : duration;
      if (audio.ended || (audioDuration > 0 && audio.currentTime >= audioDuration - 0.08)) {
        audio.currentTime = 0;
        setElapsed(0);
      }
      void audio.play().then(() => setPlaying(true)).catch(() => {
        setPlaying(true);
        speak(releasedTranscript, () => setPlaying(false));
      });
    } else {
      audio.pause();
      setPlaying(false);
    }
  }

  const activeMarkIndices = useMemo(
    () => new Set(activeNarrationMarkIndices(marks, elapsed)),
    [marks, elapsed],
  );
  const transcript = useMemo(() => buildNarrationTokens(marks, transcriptText), [marks, transcriptText]);
  const phraseByMark = useMemo(() => narrationPhraseIndexByMark(transcript), [transcript]);
  const activePhraseIndex = useMemo(
    () => activeNarrationPhraseIndex(marks, elapsed, phraseByMark),
    [marks, elapsed, phraseByMark],
  );
  const timelineDuration = duration || marks.at(-1)?.end || 0;
  const completedCount = marks.reduce((count, mark) => count + (mark.end <= elapsed ? 1 : 0), 0);
  const finished = timelineDuration > 0 && elapsed >= timelineDuration - 0.08 && !playing;
  const progress = timelineDuration > 0 ? Math.min(100, (elapsed / timelineDuration) * 100) : 0;
  const narrationStatus = finished
    ? "讲解完成 · 点击可重听"
    : playing && marks.length
      ? `正在跟读 · ${completedCount} / ${marks.length} 字`
      : playing
        ? "正在讲解"
      : elapsed > 0 && marks.length
        ? `已读 ${completedCount} / ${marks.length} 字 · 点击继续`
        : marks.length
          ? "逐字跟读已就绪"
          : "标准普通话讲解";

  useEffect(() => {
    if (!active || !finished || !window.matchMedia("(max-width: 899px)").matches) return;
    const revealFrame = window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      playerRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "nearest",
        inline: "nearest",
      });
    });
    return () => window.cancelAnimationFrame(revealFrame);
  }, [active, finished]);

  const spokenSeconds = timelineDuration || 0;
  const currentPhraseText = useMemo(() => {
    if (activePhraseIndex < 0) return releasedTranscript;
    return transcript
      .filter((token) => phraseByMark[token.markIndex] === activePhraseIndex)
      .map((token) => token.text)
      .join("");
  }, [activePhraseIndex, phraseByMark, releasedTranscript, transcript]);

  function seekToPhraseStart(offset: number) {
    const audio = audioRef.current;
    if (!audio || !marks.length) return;
    const current = activePhraseIndex >= 0 ? activePhraseIndex : 0;
    const target = Math.max(0, current + offset);
    const markIndex = phraseByMark.findIndex((phrase) => phrase === target);
    audio.currentTime = markIndex >= 0 ? marks[markIndex]?.start ?? 0 : 0;
    setElapsed(audio.currentTime);
  }

  function startNarration() {
    onActiveChange(true);
    toggleNarration();
  }

  function collapseNarration() {
    audioRef.current?.pause();
    setPlaying(false);
    restoreLauncherFocusRef.current = true;
    onActiveChange(false);
    setTranscriptOpen(false);
  }

  return (
    <>
      {!active ? (
        <button className="study-listen-button" onClick={startNarration} ref={launcherRef}>
          <span className="study-equalizer" aria-hidden="true"><b /><b /><b /><b /><b /></span>
          <span>
            <strong>{elapsed > 0 && !finished ? "继续字义讲解" : "听字义讲解"}</strong>
            <small>{releasedTranscript.length} 字 · 留在画面边看边听</small>
          </span>
          <ArrowRight aria-hidden="true" size={20} />
        </button>
      ) : (
        <section
          className={`study-narration-player${playing ? " is-playing" : ""}${finished ? " is-finished" : ""}`}
          aria-label="字义讲解播放器"
          ref={playerRef}
          tabIndex={-1}
        >
          <div className="study-narration-head">
            <span>
              <strong>{character.hanzi} · {character.pinyin}</strong>
              <small>{narrationStatus}</small>
            </span>
            <button onClick={collapseNarration} aria-label="收起字义讲解">
              <ArrowLeft aria-hidden="true" size={18} style={{ transform: "rotate(-90deg)" }} />
            </button>
          </div>

          <p className="study-narration-phrase" aria-label="当前讲解内容">
            {currentPhraseText || releasedTranscript}
          </p>

          <div className="study-narration-progress" aria-hidden="true">
            <i style={{ width: `${progress}%` }} />
          </div>
          <div className="study-narration-time">
            <span>{formatClock(elapsed)}</span>
            <span>{formatClock(spokenSeconds)}</span>
          </div>

          <div className="study-narration-actions">
            <button onClick={() => seekToPhraseStart(-1)} disabled={!marks.length}>
              <RotateCcw aria-hidden="true" size={18} />
              <small>上一句</small>
            </button>
            <button className="is-primary" onClick={toggleNarration} aria-label={playing ? "暂停讲解" : finished ? "重新播放讲解" : "继续播放讲解"} aria-pressed={playing}>
              {playing ? <CircleStop aria-hidden="true" size={21} /> : <Volume2 aria-hidden="true" size={21} />}
              <small>{playing ? "暂停" : finished ? "重听" : "继续"}</small>
            </button>
            <button
              onClick={() => setTranscriptOpen(true)}
              aria-controls={`transcript-sheet-${character.id}`}
              aria-expanded={transcriptOpen}
              ref={transcriptTriggerRef}
            >
              <BookOpenText aria-hidden="true" size={18} />
              <small>逐字稿</small>
            </button>
            <button className="is-record" onClick={onReadAloud}>
              <Mic2 aria-hidden="true" size={18} />
              <small>我来读</small>
            </button>
          </div>

          {finished && onFinished && (
            <button className="study-narration-next" onClick={onFinished}>
              跟着画面找部件
              <ArrowRight aria-hidden="true" size={18} />
            </button>
          )}
        </section>
      )}

      {transcriptOpen && (
        <>
          <button
            className="study-transcript-backdrop"
            onClick={() => setTranscriptOpen(false)}
            aria-label="关闭逐字稿"
          />
          <section
            className="study-transcript-sheet"
            id={`transcript-sheet-${character.id}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`transcript-title-${character.id}`}
            ref={transcriptSheetRef}
          >
            <div className="study-transcript-head">
              <span>
                <small>可选辅助 · 不影响字画页</small>
                <strong id={`transcript-title-${character.id}`}>{character.hanzi}的逐字稿</strong>
              </span>
              <button onClick={() => setTranscriptOpen(false)} aria-label="收起逐字稿" ref={transcriptCloseRef}>
                <ArrowRight aria-hidden="true" size={20} style={{ transform: "rotate(90deg)" }} />
              </button>
            </div>

            <div className="study-transcript-text">
              {marks.length ? (
                <p aria-label={transcript.map((token) => token.text).join("")}>
                  {transcript.map((token, index) => {
                    if (token.kind === "punctuation") return null;
                    const completed = token.completionTime <= elapsed;
                    const currentPhrase = phraseByMark[token.markIndex] === activePhraseIndex;
                    const punctuation = transcript[index + 1]?.kind === "punctuation" ? transcript[index + 1] : null;
                    const className = `narration-token${activeMarkIndices.has(token.markIndex) ? " is-active" : completed ? " is-complete" : " is-upcoming"}`;
                    return (
                      <span
                        className={`narration-unit${currentPhrase ? " is-current-phrase" : ""}`}
                        key={`${token.kind}-${token.markIndex}-${index}`}
                        aria-hidden="true"
                      >
                        <span className={className}>{token.text}</span>
                        {punctuation && (
                          <span className={`narration-token is-punctuation${completed ? " is-complete" : ""}`}>
                            {punctuation.text}
                          </span>
                        )}
                      </span>
                    );
                  })}
                </p>
              ) : (
                <p>{releasedTranscript}</p>
              )}
            </div>

            <button className="study-transcript-close" onClick={() => setTranscriptOpen(false)}>
              回到字画
            </button>
          </section>
        </>
      )}

      {audioSource && (
        <audio
          ref={audioRef}
          preload="metadata"
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
          onTimeUpdate={(event) => setElapsed(event.currentTarget.currentTime)}
          onPlay={(event) => {
            setElapsed(event.currentTarget.currentTime);
            setPlaying(true);
          }}
          onPause={(event) => {
            setElapsed(event.currentTarget.currentTime);
            setPlaying(false);
          }}
          onEnded={(event) => {
            setPlaying(false);
            setElapsed(event.currentTarget.duration || marks.at(-1)?.end || 0);
          }}
        >
          <source src={audioSource} type='audio/webm; codecs="opus"' />
        </audio>
      )}
    </>
  );
}

function formatClock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

function MemoryStage({
  character,
  visual,
  scene,
  onClose,
  onComponent,
  onFinish,
}: {
  character: CharacterItem;
  visual: LearningVisual;
  scene: MnemonicScene;
  onClose: () => void;
  onComponent: (glyph: string) => void;
  onFinish: () => void;
}) {
  const [stage, setStage] = useState<MnemonicStage>(0);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const copy = getMnemonicStageCopy(character, scene, stage);
  const activePartIndices = getMnemonicStagePartIndices(character, stage);
  const parts = character.parts.length
    ? character.parts
    : [{ char: character.hanzi, radical: true }];
  const lastStage = (mnemonicStageLabels.length - 1) as MnemonicStage;

  const regions = useMemo(
    () => getPartFocusRegions(character.decomposition, parts.length),
    [character.decomposition, parts.length],
  );
  // Stage 0 shows the whole picture and stage 4 takes it away, so only the two
  // middle stages aim a spotlight.
  const focus = useMemo(
    () =>
      stage === 0 || stage === lastStage
        ? null
        : mergeFocusRegions(activePartIndices.map((index) => regions[index]).filter(Boolean)),
    [activePartIndices, lastStage, regions, stage],
  );

  const accent = stage === 1 ? "var(--radical)" : stage === 2 ? "var(--part)" : "var(--action)";
  const accentText = stage === 1
    ? "var(--radical-text)"
    : stage === 2 ? "var(--part-text)" : "var(--action-text)";

  function go(next: number) {
    setStage(Math.min(lastStage, Math.max(0, next)) as MnemonicStage);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    swipeStart.current = { x: event.clientX, y: event.clientY };
  }

  function onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const origin = swipeStart.current;
    swipeStart.current = null;
    if (!origin) return;
    const dx = event.clientX - origin.x;
    const dy = event.clientY - origin.y;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
    go(dx < 0 ? stage + 1 : stage - 1);
  }

  return (
    <div
      className="memory-stage"
      style={{ ["--stage-accent" as string]: accent, ["--stage-accent-text" as string]: accentText }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") go(stage - 1);
        if (event.key === "ArrowRight") go(stage + 1);
      }}
      tabIndex={0}
      role="group"
      aria-label={`物象四步，第 ${stage + 1} 步：${mnemonicStageLabels[stage]}`}
    >
      <div className="memory-stage-progress" aria-hidden="true">
        {mnemonicStageLabels.map((label, index) => (
          <i className={index < stage ? "is-past" : index === stage ? "is-current" : ""} key={label} />
        ))}
      </div>

      <div className="memory-stage-bar">
        <button onClick={() => (stage === 0 ? onClose() : go(stage - 1))} aria-label="上一步">
          <ArrowLeft aria-hidden="true" size={20} />
        </button>
        <span>物象四步 · {character.hanzi}</span>
        <button onClick={onClose} aria-label="退出演示">
          <ArrowRight aria-hidden="true" size={20} />
        </button>
      </div>

      {stage === lastStage ? (
        <>
          <div className="memory-stage-recall">
            {visual && <Image src={visual.src} alt="" aria-hidden="true" width={44} height={44} />}
            <span>
              <strong>图片先收起来了</strong>
              <small>能离开画面想起字形，才算记住</small>
            </span>
            <button onClick={() => go(0)}>再看图</button>
          </div>

          <div className="memory-stage-equation" aria-label={`${parts.map((part) => part.char).join("加")}等于${character.hanzi}`}>
            <div className={`memory-stage-parts${character.decomposition?.includes("左右") ? " is-beside" : ""}`}>
              {parts.map((part, index) => (
                <span className={part.radical ? "is-radical" : "is-component"} key={`${part.char}-${index}`}>
                  {part.char}
                </span>
              ))}
            </div>
            <ArrowRight aria-hidden="true" size={30} color="rgba(244,240,230,.5)" />
            <span className="memory-stage-result">{character.hanzi}</span>
          </div>

          <div className="memory-stage-legend" aria-hidden="true">
            <span><i style={{ background: "var(--radical)" }} />表意部首</span>
            <span><i style={{ background: "var(--part)" }} />形音部件</span>
            <span>{character.decomposition}</span>
          </div>

          <p className="memory-stage-copy" style={{ paddingTop: 26 }}>{copy.body}</p>
        </>
      ) : (
        <>
          <figure className="memory-stage-scene">
            <span className="memory-stage-art">
              {visual && (
                <Image
                  src={visual.src}
                  alt={`${visual.alt}。${scene.scene}`}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 520px"
                  style={{ objectFit: "contain", objectPosition: "center" }}
                />
              )}
              {focus && (
              <>
                <span
                  className="memory-stage-spot"
                  aria-hidden="true"
                  style={{
                    background: `radial-gradient(ellipse ${focus.w / 2}% ${focus.h / 2}% at ${focus.x}% ${focus.y}%, rgba(15,22,20,0) 0%, rgba(15,22,20,0) 62%, rgba(15,22,20,.66) 100%)`,
                  }}
                />
                <span
                  className="memory-stage-tint"
                  aria-hidden="true"
                  style={{
                    background: `radial-gradient(ellipse ${focus.w / 2}% ${focus.h / 2}% at ${focus.x}% ${focus.y}%, ${stage === 1 ? "rgba(217,84,47,.26)" : "rgba(46,108,138,.26)"} 0%, transparent 72%)`,
                  }}
                />
                <span
                  className="memory-stage-ring"
                  aria-hidden="true"
                  style={{
                    top: `${focus.y}%`,
                    left: `${focus.x}%`,
                    width: `${focus.w}%`,
                    height: `${focus.h}%`,
                  }}
                />
              </>
              )}
            </span>
          </figure>

          <div className="memory-stage-copy">
            <p className="memory-stage-eyebrow"><b>{stage + 1}</b>{copy.eyebrow}</p>
            <h2>{copy.title}</h2>
            <p>{copy.body}</p>
          </div>
        </>
      )}

      <div className="study-spacer" />

      <div className="memory-stage-foot">
        {stage !== lastStage && (
          <div className="memory-stage-chips">
            {parts.map((part, index) => {
              const isActive = activePartIndices.includes(index);
              return (
                <button
                  className={`${part.radical ? "is-radical" : "is-component"}${stage > 0 && isActive ? " is-active" : ""}`}
                  key={`${part.char}-${index}`}
                  onClick={() => onComponent(part.char)}
                >
                  <span>{part.char}</span>
                  <span>
                    <strong>{part.radical ? "表意部首" : "形音部件"}</strong>
                    <small>{stage > 0 && isActive ? "正在看" : scene.cues[index] ? "点开看来历" : "字形线索"}</small>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {stage === lastStage ? (
          <>
            <button className="memory-stage-next is-finish" onClick={onFinish}>
              记住线索，去练一练
              <ArrowRight aria-hidden="true" size={20} />
            </button>
            <button className="memory-stage-secondary" onClick={onClose}>回到这个字</button>
          </>
        ) : (
          <>
            <button className="memory-stage-next" onClick={() => go(stage + 1)}>
              看下一步
              <ArrowRight aria-hidden="true" size={19} />
            </button>
            <p className="memory-stage-hint">左右滑动也可以切换四步</p>
          </>
        )}
      </div>
    </div>
  );
}


export function CharacterStudy({
  character,
  media,
  profile,
  favorite,
  backLabel = "返回词语表",
  onBack,
  onFavorite,
  onStart,
  onComponent,
  onReadAloud,
}: {
  character: CharacterItem;
  media: CharacterStudyMedia;
  profile: StudyProfile;
  favorite: boolean;
  backLabel?: string;
  onBack: () => void;
  onFavorite: () => void;
  onStart: () => void;
  onComponent: (glyph: string) => void;
  onReadAloud: () => void;
}) {
  // One screen, one thing: the picture and a single primary action. Reference
  // material — component origins, script history, the textbook sentence — lives
  // in a pull-up drawer instead of seven stacked cards.
  const [view, setView] = useState<"study" | "memory">("study");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [narrationActive, setNarrationActive] = useState(false);

  const exercises = getPracticeSteps(character, "words", "mastery").map(({ exercise }) => exercise);
  const completedQuestions = exercises.filter((question) => profile.answers[question.id]?.lastCorrect).length;
  const isComplete = profile.completed.words.includes(character.id);
  const heritage = media.heritage;
  const hasExercises = exercises.length > 0;
  const visual = media.visual;
  const scene = media.scene;
  const narrationHref = media.narration.audio;
  const parts = character.parts.length
    ? character.parts
    : [{ char: character.hanzi, radical: true }];
  const roleLabel = character.official === false
    ? "语境拓展"
    : character.polyphonic
      ? character.curriculumRole === "write" ? "会写 · 多音字" : "会认 · 多音字"
      : character.curriculumRole === "write"
        ? "课内会写"
        : "课内会认";

  if (view === "memory" && visual) {
    return (
      <MemoryStage
        character={character}
        visual={visual}
        scene={scene}
        key={character.id}
        onClose={() => setView("study")}
        onComponent={onComponent}
        onFinish={onStart}
      />
    );
  }

  return (
    <main className={`study-shell${narrationActive ? " is-listening" : ""}`}>
      {narrationHref && <link rel="prefetch" as="audio" href={narrationHref} />}

      <div className="study-topbar">
        <button onClick={onBack} aria-label={backLabel}>
          <ArrowLeft aria-hidden="true" size={22} />
        </button>
        <div className="study-breadcrumb">
          <span>{character.lessonTitle}</span>
          <i aria-hidden="true" />
          <span>{character.word}</span>
        </div>
        <button
          className={"favorite-star " + (favorite ? "is-active" : "")}
          onClick={onFavorite}
          aria-label={favorite ? "取消收藏" : "收藏这个字"}
        >
          {favorite ? "★" : "☆"}
        </button>
      </div>

      <div className="study-body">
        <figure className={visual ? "study-scene" : "study-scene is-glyph"}>
          {visual ? (
            <>
              <span className="study-scene-art">
                <Image
                  src={visual.src}
                  alt={`${visual.alt}${scene ? `。${scene.scene}` : ""}`}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 520px"
                  style={{ objectFit: "contain", objectPosition: "center" }}
                />
              </span>
              <figcaption className="study-scene-caption">
                <Sparkles aria-hidden="true" />
                画面本身就是字形
              </figcaption>
            </>
          ) : (
            <strong>{character.hanzi}</strong>
          )}
        </figure>

        <div>
          <div className="study-identity">
            <span className="study-glyph">{character.hanzi}</span>
            <div>
              <span className="study-reading">
                <b>{character.pinyin}</b>
                <button onClick={() => speak(character.hanzi)} aria-label={`朗读${character.hanzi}`}>
                  <Volume2 aria-hidden="true" size={14} />
                </button>
              </span>
              <span className="study-tags">
                <span className="is-role">{roleLabel}</span>
                <span>{character.charType}</span>
                <span>{character.decomposition}</span>
              </span>
            </div>
          </div>

          <p className="study-meaning">
            {character.official === false ? character.originalMeaning : `本课词语「${character.word}」：${character.originalMeaning}`}
          </p>

          <div className="study-spacer" />

          <div className="study-launch">
            <InlineNarrationPlayer
              active={narrationActive}
              character={character}
              narration={media.narration}
              key={character.id}
              onActiveChange={setNarrationActive}
              onFinished={visual ? () => {
                setNarrationActive(false);
                setView("memory");
              } : undefined}
              onReadAloud={onReadAloud}
            />

            {visual && (
              <button className="study-next-steps" onClick={() => {
                setNarrationActive(false);
                setView("memory");
              }}>
                <small>接着是</small>
                <div>
                  {mnemonicStageLabels.map((label, index) => (
                    <span
                      className={index === 1 ? "is-radical" : index === 2 ? "is-part" : ""}
                      key={label}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </button>
            )}

            <div className="study-actions">
              <button className="study-action is-primary" onClick={onStart} disabled={!hasExercises}>
                <MapIcon aria-hidden="true" size={20} />
                <span>
                  <strong>{hasExercises ? (isComplete ? "再练一轮" : "单字过关") : "练习暂未开放"}</strong>
                  <small>{hasExercises ? `${completedQuestions} / ${exercises.length} 题` : "拓展字稍后开放"}</small>
                </span>
              </button>
              <button className="study-action" onClick={onReadAloud}>
                <Mic2 aria-hidden="true" size={20} />
                <span>
                  <strong>朗读录音</strong>
                  <small>读一遍本课词语</small>
                </span>
              </button>
            </div>

            <button className="study-drawer-handle" onClick={() => setDrawerOpen(true)}>
              <ArrowLeft aria-hidden="true" size={18} style={{ transform: "rotate(90deg)" }} />
              部件来历、字形演变与语境
            </button>
          </div>
        </div>
      </div>

      {drawerOpen && (
        <button
          className="study-drawer-backdrop"
          onClick={() => setDrawerOpen(false)}
          aria-label="收起更多内容"
        />
      )}

      <section
        className={drawerOpen ? "study-drawer is-open" : "study-drawer"}
        aria-label="更多助记内容"
        aria-hidden={drawerOpen ? undefined : true}
        inert={drawerOpen ? undefined : true}
      >
          <span className="study-drawer-grip" aria-hidden="true" />

          <h2>部件来历</h2>
          <div className="study-part-list">
            {parts.map((part, index) => {
              const composition = character.compositions.find((item) => item.char === part.char);
              return (
                <button
                  className={part.radical ? "is-radical" : "is-component"}
                  key={`${part.char}-${index}`}
                  onClick={() => onComponent(part.char)}
                >
                  <span className="study-part-glyph">{part.char}</span>
                  <span className="study-part-copy">
                    <strong>{part.char} · {part.radical ? "表意部首" : "形音部件"}</strong>
                    <small>{composition?.description || scene.cues[index] || "顺着画面里的物体轮廓找到这个部件。"}</small>
                  </span>
                  <ArrowRight aria-hidden="true" size={18} />
                </button>
              );
            })}
          </div>

          <h2>字形演变</h2>
          {heritage?.stages.length ? (
            <div className="study-script-line" aria-label="真实字形演变资料">
              {heritage.stages.map((stage) => (
                <div key={stage.src}>
                  <span className="study-script-image">
                    <Image
                      src={stage.src}
                      alt={`${character.hanzi}的${stage.label}字形`}
                      fill
                      sizes="78px"
                      style={{ objectFit: "contain", objectPosition: "center" }}
                    />
                  </span>
                  <small>{stage.label}</small>
                </div>
              ))}
            </div>
          ) : (
            <div className="study-note">
              <CheckCircle2 aria-hidden="true" size={19} />
              <div>
                <strong>本字暂无可靠的古文字图版</strong>
                <small>保留现代楷书，不虚构演变形态。</small>
              </div>
            </div>
          )}

          <h2>本课主题语境</h2>
          <div className="study-quote">
            <p>{character.originalText}</p>
            <small>原创学习摘要 · 本课词语「{character.word}」</small>
          </div>

        </section>
    </main>
  );
}
