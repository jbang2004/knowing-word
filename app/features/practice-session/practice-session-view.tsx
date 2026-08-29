"use client";

import Image from "next/image";
import { ArrowLeft, CheckCircle2, Flame, RotateCcw } from "lucide-react";
import type { CharacterItem, Exercise } from "../../data/catalog-types";
import type { LearningVisual } from "../../data/illustrations";
import { remediationGuidanceFor } from "../../domain/error-diagnosis";
import {
  expectedAnswerIds as getExpectedIds,
  questionTypeLabel,
  stableOptionOrder,
  writingRetrievalText,
  type WritingPhase,
} from "../../domain/practice";
import type { HandwritingAttempt } from "../../domain/handwriting";
import { trackMeta } from "../../domain/tracks";
import type { StudyProfile, TrackId } from "../../lib/profile-model";
import { MnemonicSceneFocus } from "../character-study/mnemonic-scene-focus";
import { WritingPad } from "./writing-pad";

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
  sessionLabel,
  onReplay,
  onNextCharacter,
  onFinish,
  nextLabel,
  finishLabel,
}: {
  track: TrackId;
  character: CharacterItem;
  results: boolean[];
  total: number;
  sessionLabel?: string;
  onReplay: () => void;
  onNextCharacter: () => void;
  onFinish: () => void;
  nextLabel: string;
  finishLabel: string;
}) {
  // Reaching this overlay means every question ended up correct; results holds
  // one entry per ATTEMPT, so extra tries are the mistakes.
  const attempts = results.length;
  const firstTryRate = Math.min(100, Math.round((total * 100) / Math.max(attempts, total)));
  // The screen with the most attention gets to teach one more time: how this
  // character is actually built.
  const parts = character.parts.length ? character.parts : [{ char: character.hanzi, radical: true }];
  const radical = parts.find((part) => part.radical);
  const shapePart = parts.find((part) => !part.radical);
  const hasPhoneticRole = character.charType.includes("形声");
  return (
    <div className="celebration-overlay" role="dialog" aria-modal="true" aria-label="完整通关">
      <div className={"celebration-card track-" + trackMeta[track].tone}>
        <div
          className={"celebration-assembly" + (parts.length > 1 ? " is-assembling" : "")}
          aria-hidden="true"
        >
          {parts.length > 1 && parts.slice(0, 2).map((part, index) => (
            <span
              className={"celebration-fly "
                + (part.radical ? "is-radical" : "is-part")
                + (index === 0 ? " from-left" : " from-right")}
              key={`${part.char}-${index}`}
            >
              {part.char}
            </span>
          ))}
          <span className="celebration-ring" />
          <span className="celebration-glyph">{character.hanzi}</span>
        </div>
        <h2>完整通关</h2>
        <p className="celebration-kicker">{sessionLabel ?? trackMeta[track].menu} · {character.lessonTitle}</p>

        {parts.length > 1 && (
          <div className="celebration-lesson">
            <small>这一关记住了</small>
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

        <dl className="celebration-stats">
          <div><dt>题目</dt><dd>{total}</dd></div>
          <div><dt>尝试</dt><dd>{attempts}</dd></div>
          <div><dt>首次答对</dt><dd>{firstTryRate}%</dd></div>
        </dl>

        <div className="celebration-actions">
          <button className="game-button primary" onClick={onNextCharacter}>{nextLabel}</button>
          <button className="game-button ghost" onClick={onReplay}><RotateCcw aria-hidden="true" /> 再练一轮</button>
          <button className="text-button" onClick={onFinish}>{finishLabel}</button>
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
  streak,
  selected,
  wrote,
  result,
  writingPhase,
  writingRevision,
  profile,
  orderedOptions,
  onBack,
  onChoose,
  onRemove,
  onWritingProgress,
  onWritingComplete,
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
  streak: number;
  selected: string[];
  wrote: boolean;
  result: boolean | null;
  writingPhase: WritingPhase;
  writingRevision: number;
  profile: StudyProfile;
  orderedOptions: Exercise["options"];
  onBack: () => void;
  onChoose: (id: string) => void;
  onRemove: (id: string, index: number) => void;
  onWritingProgress: (attempt: HandwritingAttempt) => void;
  onWritingComplete: (attempt: HandwritingAttempt) => void;
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
  const answerLabel = question.kind === "write"
    ? "在方格里写完整的「" + character.hanzi + "」"
    : answerText || "仔细看字形。";
  const record = profile.answers[question.id];
  const remediation = remediationGuidanceFor(record?.lastErrorTags ?? []);
  const independentWriting = question.kind === "write" && question.concealTarget === true;
  const concealWritingTarget = independentWriting && result === null;
  const writingText = writingRetrievalText(question, character, !concealWritingTarget);

  return (
    <main className={"challenge-page challenge-centered track-" + meta.tone}>
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
          aria-label={`${meta.menu} · ${writingText.progressTarget}`}
        >
          <i
            className={streak >= 3 ? "is-hot" : undefined}
            style={{ width: ((result === null ? questionIndex : questionIndex + 1) / total) * 100 + "%" }}
          />
        </div>
        <span className="challenge-count">{questionIndex + 1}/{total}</span>
      </header>

      {streak >= 2 && (
        <div className="challenge-streak-row" role="status">
          {/* Keyed on the count so each new correct answer replays the pop. */}
          <span className="challenge-streak" key={streak}>
            <Flame aria-hidden="true" size={14} strokeWidth={2.4} />
            连对 {streak}
          </span>
        </div>
      )}

      <section className="challenge-board">
        <div className="challenge-question">
          <span className="question-tag">{questionTypeLabel(question, track)}</span>
          <h1>{writingText.prompt}</h1>
          {concealWritingTarget && (
            <p className="multi-hint">
              读音：<b>{character.pinyin}</b> · 词语线索：<b>{writingText.wordCue}</b>
            </p>
          )}
          {needsMultiple && (
            <p className="multi-hint">
              这题需要选择多个部件 · 已选 <b>{selected.length}</b> / 需要 <b>{expected.length}</b> 个
            </p>
          )}
        </div>

        {question.kind === "write" ? (
          <WritingPad
            key={`${question.id}:${writingRevision}`}
            character={character.hanzi}
            guided={!independentWriting}
            retrying={writingPhase === "rewrite"}
            canvasLabel={writingText.canvasLabel}
            onProgress={onWritingProgress}
            onComplete={onWritingComplete}
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

        {question.kind === "write" && writingPhase === "rewrite" && remediation && (
          <div className="targeted-remediation" role="status">
            <strong>{remediation.title}</strong>
            <p>{remediation.instruction}</p>
          </div>
        )}

      </section>

      {result === null ? (
        <div className="challenge-actions">
          <button className="game-button primary" disabled={!ready} onClick={onCheck}>
            {question.kind === "write" ? "写完了，检查" : "核对答案"}
          </button>
          <div className="challenge-actions-row">
            <button
              className="text-button"
              disabled={questionIndex === 0 || writingPhase === "rewrite"}
              onClick={onPrevious}
            >
              ← 上一题
            </button>
            <span className="key-hint">
              {writingPhase === "rewrite"
                ? "先完成这次纠错重写"
                : question.kind === "write"
                ? <>系统会逐笔检查 · 写完后按 <kbd>Enter</kbd> 确认</>
                : <>按 <kbd>A</kbd>–<kbd>D</kbd> 选择 · <kbd>Enter</kbd> 确认</>}
            </span>
            <button className="text-button" disabled={writingPhase === "rewrite"} onClick={onSkip}>
              跳过这一题 →
            </button>
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
              {question.kind === "write" && result
                ? "系统判定正确"
                : result
                ? "答对了"
                : remediation?.cue ?? "再看一眼"}
            </strong>
            {record && <small>已尝试 {record.attempts} 次</small>}
          </div>
          <p>
            {question.kind === "write" && result
              ? "笔顺、方向和位置均已通过逐笔检测，这次书写会记入掌握度。"
              : result
              ? question.explanation || (finalStep ? "这一关完成了，回到地图看看下一站。" : "记住这个线索，再去下一题。")
              : <>正确答案是：<b
                  className={"answer-sheet-answer" + ([...answerLabel].length <= 6 ? " is-glyph" : "")}
                >{answerLabel}</b></>}
          </p>
          {result === false && remediation && (
            <small className="answer-sheet-note">{remediation.instruction}</small>
          )}
          <button className="game-button primary" onClick={onNext}>
            {result ? (finalStep ? "查看成绩" : "继续") : "知道了"}
          </button>
        </div>
      )}
    </main>
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
  // When every option is a single character the shapes ARE the question:
  // 鹭 / 露 / 路 / 陆 cannot be told apart at body-copy size, so they get a
  // grid of glyphs rather than a list of labels.
  const glyphOnly = !visual
    && question.kind !== "structure"
    && displayedOptions.every((option) => [...optionText(option, character)].length === 1);
  const revealParts = character.parts.length > 1;
  const keyLabels = "ABCDEFGH";
  return (
    <div className={"choice-grid "
      + (visual ? "is-visual " : "")
      + (glyphOnly ? "is-glyph " : "")
      + (question.kind === "structure" ? "is-structure " : "")
      + (visual && !showVisualCaption ? "no-visual-captions" : "")}>
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
            aria-label={`选项 ${keyLabels[index] || index + 1}：${visual ? illustration!.alt : optionText(option, character)}`}
            aria-pressed={isSelected}
          >
            <span className="choice-key" aria-hidden="true">{keyLabels[index] || index + 1}</span>
            {visual ? (
              <span className="meaning-illustration">
                <Image
                  src={illustration!.src}
                  alt=""
                  aria-hidden="true"
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
            {/* Once the question is graded the right answer shows its own
                build, so the reason is on the card the learner is looking at
                rather than only in the sheet below. */}
            {glyphOnly && revealParts && result !== null && option.correct
              && optionText(option, character) === character.hanzi && (
              <span className="choice-parts" aria-hidden="true">
                {character.parts.map((part, index) => (
                  <i
                    className={part.radical ? "is-radical" : "is-part"}
                    key={`${part.char}-${index}`}
                  >
                    {part.char}
                  </i>
                ))}
              </span>
            )}
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
  onRemove: (id: string, index: number) => void;
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
                onClick={() => option && onRemove(option.id, index)}
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
