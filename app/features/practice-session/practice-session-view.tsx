"use client";

import Image from "next/image";
import { ArrowLeft, CheckCircle2, RotateCcw } from "lucide-react";
import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import type { CharacterItem, Exercise } from "../../data/catalog-types";
import type { LearningVisual } from "../../data/illustrations";
import {
  expectedAnswerIds as getExpectedIds,
  questionTypeLabel,
  stableOptionOrder,
} from "../../domain/practice";
import { trackMeta } from "../../domain/tracks";
import type { StudyProfile, TrackId } from "../../lib/profile-model";
import { MnemonicSceneFocus } from "../character-study/mnemonic-scene-focus";

export type PracticeMedia = {
  answerLabel?: string;
  optionVisuals: Readonly<Record<string, LearningVisual>>;
  redBlueAsset?: string;
};

function optionText(option: Exercise["options"][number], character: CharacterItem) {
  if (option.text) return option.text;
  return option.correct ? character.originalMeaning || "与字义相关的图意" : "另一种图意";
}

export function CelebrationOverlay({
  track,
  character,
  results,
  total,
  onReplay,
  onNextCharacter,
  onFinish,
}: {
  track: TrackId;
  character: CharacterItem;
  results: boolean[];
  total: number;
  onReplay: () => void;
  onNextCharacter: () => void;
  onFinish: () => void;
}) {
  // Reaching this overlay means every question ended up correct; results holds
  // one entry per ATTEMPT, so extra tries are the mistakes.
  const attempts = results.length;
  const mistakes = Math.max(0, attempts - total);
  const firstTryRate = Math.min(100, Math.round((total * 100) / Math.max(attempts, total)));
  // The screen with the most attention gets to teach one more time: how this
  // character is actually built.
  const parts = character.parts.length ? character.parts : [{ char: character.hanzi, radical: true }];
  const radical = parts.find((part) => part.radical);
  const shapePart = parts.find((part) => !part.radical);
  const hasPhoneticRole = character.charType.includes("形声");
  return (
    <div className="celebration-overlay" role="dialog" aria-modal="true" aria-label="本关完成">
      <div className={"celebration-card track-" + trackMeta[track].tone}>
        <div className="celebration-glyph" aria-hidden="true">{character.hanzi}</div>
        <h2>{mistakes === 0 ? "完美通关" : "本关完成"}</h2>
        <p className="celebration-kicker">{trackMeta[track].menu} · {character.lessonTitle}</p>

        <dl className="celebration-stats">
          <div><dt>题目</dt><dd>{total}</dd></div>
          <div><dt>尝试</dt><dd>{attempts}</dd></div>
          <div><dt>首次答对</dt><dd>{firstTryRate}%</dd></div>
        </dl>

        {parts.length > 1 && (
          <div className="celebration-lesson">
            <small>这一关记住了</small>
            <div className="celebration-equation" aria-hidden="true">
              {parts.map((part, index) => (
                <span className={part.radical ? "is-radical" : "is-part"} key={`${part.char}-${index}`}>
                  {part.char}
                </span>
              ))}
              <i>=</i>
              <span className="is-result">{character.hanzi}</span>
            </div>
            <p>
              {radical && <><b className="is-radical">{radical.char}</b>是表意部首</>}
              {radical && shapePart && "；"}
              {shapePart && (
                <>
                  <b className="is-part">{shapePart.char}</b>
                  {hasPhoneticRole ? "提供读音线索" : "补充字形线索"}
                </>
              )}
              。{character.decomposition}
            </p>
          </div>
        )}

        <div className="celebration-actions">
          <button className="game-button primary" onClick={onNextCharacter}>继续 · 下一个字</button>
          <button className="game-button ghost" onClick={onReplay}><RotateCcw aria-hidden="true" /> 再练一轮</button>
          <button className="text-button" onClick={onFinish}>返回课文地图</button>
        </div>
      </div>
    </div>
  );
}

export function ChallengeRoom({
  track,
  character,
  media,
  question,
  questionIndex,
  total,
  selected,
  wrote,
  result,
  profile,
  orderedOptions,
  onBack,
  onChoose,
  onRemove,
  onWrite,
  onClearWrite,
  onCheck,
  onNext,
  onPrevious,
  onSkip,
}: {
  track: TrackId;
  character: CharacterItem;
  media: PracticeMedia;
  question: Exercise;
  questionIndex: number;
  total: number;
  selected: string[];
  wrote: boolean;
  result: boolean | null;
  profile: StudyProfile;
  orderedOptions: Exercise["options"];
  onBack: () => void;
  onChoose: (id: string) => void;
  onRemove: (id: string) => void;
  onWrite: () => void;
  onClearWrite: () => void;
  onCheck: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
}) {
  const meta = trackMeta[track];
  const expected = getExpectedIds(question, character, track);
  const needsMultiple = expected.length > 1;
  const ready = question.kind === "write" ? wrote : selected.length > 0;
  const answerText = question.questionType === "image_single_select"
    ? (media.answerLabel || character.originalMeaning)
    : expected
        .map((id) => question.options.find((option) => option.id === id))
        .filter(Boolean)
        .map((option) => optionText(option as Exercise["options"][number], character))
        .join("、");
  const finalStep = questionIndex === total - 1;
  const record = profile.answers[question.id];

  return (
    <div className={"challenge-page challenge-centered track-" + meta.tone}>
      <header className="challenge-bar">
        <button className="challenge-close" onClick={onBack} aria-label="退出练习">
          <ArrowLeft aria-hidden="true" size={21} />
        </button>
        <div
          className="challenge-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={questionIndex + (result === null ? 0 : 1)}
          aria-label={`${meta.menu} · ${character.hanzi}`}
        >
          <i style={{ width: ((result === null ? questionIndex : questionIndex + 1) / total) * 100 + "%" }} />
        </div>
        <span className="challenge-count">{questionIndex + 1}/{total}</span>
      </header>

      <section className="challenge-board">
        <div className="challenge-question">
          <span className="question-tag">{questionTypeLabel(question, track)}</span>
          <h2>{question.prompt}</h2>
          {needsMultiple && (
            <p className="multi-hint">
              这题需要选择多个部件 · 已选 <b>{selected.length}</b> / 需要 <b>{expected.length}</b> 个
            </p>
          )}
        </div>

        {question.kind === "write" ? (
          <WritingPad
            character={character.hanzi}
            guided
            revealAnswer={result !== null}
            onWrite={onWrite}
            onClear={onClearWrite}
          />
        ) : question.kind === "components" && track === "split" ? (
          <AssemblyExercise
            character={character}
            question={question}
            orderedOptions={orderedOptions}
            selected={selected}
            result={result}
            onChoose={onChoose}
            onRemove={onRemove}
          />
        ) : question.kind === "components" && track === "honglan" ? (
          <RedBlueExercise
            character={character}
            redBlueAsset={media.redBlueAsset}
            question={question}
            orderedOptions={orderedOptions}
            selected={selected}
            result={result}
            onChoose={onChoose}
          />
        ) : (
          <ChoiceExercise
            character={character}
            optionVisuals={media.optionVisuals}
            question={question}
            orderedOptions={orderedOptions}
            selected={selected}
            result={result}
            onChoose={onChoose}
          />
        )}

      </section>

      {result === null ? (
        <div className="challenge-actions">
          <button className="game-button primary" disabled={!ready} onClick={onCheck}>核对答案</button>
          <div className="challenge-actions-row">
            <button className="text-button" disabled={questionIndex === 0} onClick={onPrevious}>← 上一题</button>
            <span className="key-hint">按 <kbd>A</kbd>–<kbd>D</kbd> 选择 · <kbd>Enter</kbd> 确认</span>
            <button className="text-button" onClick={onSkip}>跳过这一题 →</button>
          </div>
        </div>
      ) : (
        <div className={"answer-sheet " + (result ? "is-correct" : "is-wrong")} role="status">
          <div className="answer-sheet-head">
            <span className="answer-sheet-mark" aria-hidden="true">
              {result
                ? <CheckCircle2 size={24} strokeWidth={2.6} />
                : <RotateCcw size={22} strokeWidth={2.6} />}
            </span>
            <strong>
              {result
                ? "答对了"
                : "再看一眼"}
            </strong>
            {record && <small>已尝试 {record.attempts} 次</small>}
          </div>
          <p>
            {result
              ? question.explanation || (finalStep ? "这一关完成了，回到地图看看下一站。" : "记住这个线索，再去下一题。")
              : "正确答案是：" + (question.kind === "write" ? "在方格里写完整的「" + character.hanzi + "」" : answerText || "仔细看字形。")}
          </p>
          <button className="game-button primary" onClick={onNext}>
            {result ? (finalStep ? "查看成绩" : "继续") : "知道了"}
          </button>
        </div>
      )}
    </div>
  );
}

function ChoiceExercise({
  character,
  optionVisuals,
  question,
  orderedOptions,
  selected,
  result,
  onChoose,
}: {
  character: CharacterItem;
  optionVisuals: PracticeMedia["optionVisuals"];
  question: Exercise;
  orderedOptions: Exercise["options"];
  selected: string[];
  result: boolean | null;
  onChoose: (id: string) => void;
}) {
  const visual = question.questionType === "image_single_select";
  // Captions on picture options can name the answer; reveal them only after
  // the question has been graded.
  const showVisualCaption = result !== null && question.options.some((item) => Boolean(item.text));
  const displayedOptions = orderedOptions.length ? orderedOptions : stableOptionOrder(question.options, question.id);
  const keyLabels = "ABCDEFGH";
  return (
    <div className={"choice-grid " + (visual ? "is-visual " : "") + (visual && !showVisualCaption ? "no-visual-captions" : "")}>
      {displayedOptions.map((option, index) => {
        const isSelected = selected.includes(option.id);
        const illustration = visual
          ? optionVisuals[`${question.id}:${option.id}`]
          : null;
        const state =
          result === null
            ? isSelected
              ? "is-selected"
              : ""
            : option.correct
              ? "is-correct"
              : isSelected
                ? "is-wrong"
                : "";
        return (
          <button
            className={"choice-card " + state}
            key={option.id}
            onClick={() => onChoose(option.id)}
            aria-pressed={isSelected}
          >
            <span className="choice-key" aria-hidden="true">{keyLabels[index] || index + 1}</span>
            {visual ? (
              <span className="meaning-illustration">
                <Image
                  src={illustration!.src}
                  alt={showVisualCaption ? illustration!.alt : "选项图片"}
                  fill
                  sizes="(max-width: 760px) 82vw, 220px"
                  style={{ objectFit: "contain", objectPosition: "center" }}
                />
                {option.correct && result !== null && (
                  <MnemonicSceneFocus character={character} stage={3} compact />
                )}
              </span>
            ) : question.kind === "structure" ? (
              <StructureShape code={option.idcCode} />
            ) : null}
            {visual ? (
              showVisualCaption && <strong>{illustration!.label}</strong>
            ) : (
              <strong>{optionText(option, character)}</strong>
            )}
            {question.kind === "structure" && <small aria-hidden="true">{option.idcCode}</small>}
          </button>
        );
      })}
    </div>
  );
}

function AssemblyExercise({
  character,
  question,
  orderedOptions,
  selected,
  result,
  onChoose,
  onRemove,
}: {
  character: CharacterItem;
  question: Exercise;
  orderedOptions: Exercise["options"];
  selected: string[];
  result: boolean | null;
  onChoose: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const expected = getExpectedIds(question, character, "split");
  const slots = Math.max(expected.length, character.parts.length, 1);
  const choices = orderedOptions.length ? orderedOptions : stableOptionOrder(question.options, question.id);
  return (
    <div className="assembly-exercise">
      <div className="assembly-target">
        <span>把「{character.hanzi}」搭出来</span>
        <div className="assembly-slots">
          {Array.from({ length: slots }).map((_, index) => {
            const option = question.options.find((item) => item.id === selected[index]);
            const state =
              result === null
                ? ""
                : option?.correct && expected[index] === option.id
                  ? "is-correct"
                  : option
                    ? "is-wrong"
                    : "";
            return (
              <button
                className={"assembly-slot " + state}
                key={index}
                disabled={!option || result !== null}
                onClick={() => option && onRemove(option.id)}
              >
                {option ? optionText(option, character) : "？"}
              </button>
            );
          })}
        </div>
        {result === null && <small className="assembly-hint">按顺序点选部件；点错了就点上面的格子撤销。</small>}
      </div>
      <div className="assembly-choices">
        {choices.map((option) => (
          <button
            className={selected.includes(option.id) ? "is-picked" : ""}
            disabled={result !== null}
            key={option.id}
            onClick={() => onChoose(option.id)}
          >
            {optionText(option, character)}
          </button>
        ))}
      </div>
    </div>
  );
}

function RedBlueExercise({
  character,
  redBlueAsset,
  question,
  orderedOptions,
  selected,
  result,
  onChoose,
}: {
  character: CharacterItem;
  redBlueAsset?: string;
  question: Exercise;
  orderedOptions: Exercise["options"];
  selected: string[];
  result: boolean | null;
  onChoose: (id: string) => void;
}) {
  const choices = orderedOptions.length ? orderedOptions : stableOptionOrder(question.options, question.id);
  return (
    <div className="redblue-exercise">
      {redBlueAsset ? (
        <div className="redblue-word is-composed" aria-label={"“" + character.hanzi + "”的红蓝合字"}>
          <Image
            src={redBlueAsset}
            alt={`${character.hanzi}字中部首与其他部件的红蓝标记`}
            fill
            sizes="190px"
            style={{ objectFit: "contain", objectPosition: "center" }}
          />
        </div>
      ) : (
        <div className="redblue-word" aria-label={"“" + character.hanzi + "”的红蓝字形"}>
          {(character.parts.length ? character.parts : [{ char: character.hanzi, radical: true }]).map((part, index) => (
            <span className={part.radical ? "is-red" : "is-blue"} key={part.char + index}>{part.char}</span>
          ))}
        </div>
      )}
      <p><i className="red-key" /> 表意部首　<i className="blue-key" /> 其他部件</p>
      <div className="redblue-options">
        {choices.map((option) => {
          const isSelected = selected.includes(option.id);
          // Chips stay color-neutral before grading; coloring radicals red up
          // front would give the answer away before checking.
          const revealColors = result !== null;
          const chipColor = revealColors ? (option.radical ? " is-red" : " is-blue") : "";
          const state =
            result === null
              ? isSelected
                ? "is-selected"
                : ""
              : option.correct
                ? "is-correct"
                : isSelected
                  ? "is-wrong"
                  : "";
          return (
            <button className={chipColor.trim() + " " + state} key={option.id} disabled={result !== null} onClick={() => onChoose(option.id)}>
              <span className={revealColors ? (option.radical ? "is-red" : "is-blue") : ""}>{optionText(option, character)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StructureShape({ code }: { code: string }) {
  const shape =
    code === "⿰" ? "side"
    : code === "⿲" ? "triside"
    : code === "⿱" ? "stack"
    : code === "⿳" ? "tristack"
    : code === "⿴" ? "enclose"
    : code === "⿵" ? "open-top"
    : code === "⿶" ? "open-bottom"
    : code === "⿷" ? "open-right"
    : code === "⿸" ? "corner-tl"
    : code === "⿹" ? "corner-tr"
    : code === "⿺" ? "corner-bl"
    : code === "⿻" ? "cross"
    : "single";
  return (
    <span className={"structure-shape ss-" + shape} aria-hidden="true">
      <i /><i /><i />
    </span>
  );
}

function WritingPad({
  character,
  guided,
  revealAnswer,
  onWrite,
  onClear,
}: {
  character: string;
  guided: boolean;
  revealAnswer: boolean;
  onWrite: () => void;
  onClear: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const strokeLengthRef = useRef(0);
  const totalLengthRef = useRef(0);
  const acceptedRef = useRef(false);
  const [strokeCount, setStrokeCount] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const setup = () => {
      const context = canvas.getContext("2d");
      if (!context) return;
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      context.scale(ratio, ratio);
      context.strokeStyle = "#263b64";
      context.lineWidth = 5;
      context.lineCap = "round";
      context.lineJoin = "round";
    };
    setup();
    const observer = new ResizeObserver(setup);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  function position(event: ReactPointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function start(event: ReactPointerEvent<HTMLCanvasElement>) {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    const point = position(event);
    drawingRef.current = true;
    lastPointRef.current = point;
    strokeLengthRef.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(point.x, point.y);
  }

  function draw(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    const point = position(event);
    const previous = lastPointRef.current;
    if (previous) {
      const distance = Math.hypot(point.x - previous.x, point.y - previous.y);
      strokeLengthRef.current += distance;
      totalLengthRef.current += distance;
      if (guided && !acceptedRef.current && totalLengthRef.current >= 34) {
        acceptedRef.current = true;
        onWrite();
      }
    }
    lastPointRef.current = point;
    context.lineTo(point.x, point.y);
    context.stroke();
  }

  function stop() {
    if (drawingRef.current && strokeLengthRef.current >= 7) {
      const nextStrokeCount = strokeCount + 1;
      setStrokeCount(nextStrokeCount);
      if (!guided && !acceptedRef.current && nextStrokeCount >= 2 && totalLengthRef.current >= 80) {
        acceptedRef.current = true;
        onWrite();
      }
    }
    drawingRef.current = false;
    lastPointRef.current = null;
    strokeLengthRef.current = 0;
  }

  function clear() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawingRef.current = false;
    lastPointRef.current = null;
    strokeLengthRef.current = 0;
    totalLengthRef.current = 0;
    acceptedRef.current = false;
    setStrokeCount(0);
    onClear();
  }

  return (
    <div className={`writing-board${guided ? "" : " is-unguided"}${revealAnswer ? " is-answer-revealed" : ""}`}>
      {(guided || revealAnswer) && <div className="writing-guide" aria-hidden="true">{character}</div>}
      <canvas
        ref={canvasRef}
        aria-label={"书写“" + character + "”"}
        onPointerDown={start}
        onPointerMove={draw}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
      />
      <div className="writing-footer">
        <span className={strokeCount ? "writing-status has-ink" : "writing-status"}>
          {revealAnswer
            ? "规范字已显示：请逐部件对照是否漏笔、错位"
            : strokeCount
              ? `已记录 ${strokeCount} 笔，继续把字写完整`
              : guided
                ? "沿着浅色字形认真描写，轻点一下不会算作完成"
                : "空白书写：至少完成两笔后才能核对答案"}
        </span>
        <button onClick={clear}>重新写</button>
      </div>
    </div>
  );
}
