import type { CharacterItem, Exercise } from "../data/catalog-types";
import {
  skillDimensions,
  type AnswerMode,
  type ErrorTag,
  type SkillDimension,
} from "./learning-state.ts";
import type { TrackId } from "../lib/profile-model";
import { diagnoseErrors, type RemediationActivity } from "./error-diagnosis.ts";
import { learningTrackIds } from "./tracks.ts";

export type PracticeMode = "track" | "mastery";

export type PracticeStep = {
  exercise: Exercise;
  track: TrackId;
};

export type RemediationStep = {
  step: PracticeStep;
  targetDimension: SkillDimension;
  activity: RemediationActivity;
};

export const writingSelfAssessments = [
  "correct",
  "component-error",
  "position-error",
  "stroke-error",
] as const;

export type WritingSelfAssessment = typeof writingSelfAssessments[number];
export type WritingPhase = "draft" | "review" | "rewrite";

const exerciseOrigin: Record<TrackId, string> = {
  words: "识字小测",
  split: "拆一拆",
  honglan: "红蓝字",
  structure: "空间结构",
};

export function getTrackExercises(character: CharacterItem, track: TrackId) {
  return character.exercises.filter((exercise) => {
    const belongsToTrack = exercise.origin === exerciseOrigin[track] ||
      (track === "words" && exercise.origin === "科学复习") ||
      (track === "split" &&
        exercise.origin === "科学复习" &&
        exercise.dimension === "generation");
    if (!belongsToTrack) return false;
    // The words stage carries recognition/phonology/semantics/context plus one
    // visible-model writing pass for curriculum writing targets. Specialist
    // structure and component questions stay in their own tracks; the split
    // track later supplies the concealed, independent writing direction.
    return track !== "words" || exercise.kind === "single" || exercise.kind === "write";
  });
}

// The card's "learned it" action is one continuous mastery check. It reuses
// the canonical questions from each specialist track instead of restoring the
// older duplicate structure, component and writing items under 识字小测.
export function getPracticeSteps(
  character: CharacterItem,
  track: TrackId,
  mode: PracticeMode = "track",
): PracticeStep[] {
  const candidates = getPracticeCandidates(character, track, mode);
  if (mode !== "mastery") return candidates;

  // One strongest check per dimension keeps the first mastery round compact.
  // Writing targets receive one additional visible-model motor pass before
  // the concealed generation check selected below.
  const dimensionSteps = selectDueReviewSteps(candidates, skillDimensions);
  const guidedWriting = candidates.find(({ exercise, track: stepTrack }) =>
    stepTrack === "words" &&
    exercise.kind === "write" &&
    exercise.concealTarget !== true &&
    (exercise.cueLevel ?? 0) > 0
  );
  const concealedWriting = candidates.find(({ exercise }) =>
    exercise.kind === "write" &&
    exercise.concealTarget === true &&
    (exercise.cueLevel ?? 0) === 0
  );
  const selectedIds = new Set(dimensionSteps.map(({ exercise }) => exercise.id));
  const guidedExtra = guidedWriting && !selectedIds.has(guidedWriting.exercise.id)
    ? guidedWriting
    : null;
  const concealedExtra = concealedWriting && !selectedIds.has(concealedWriting.exercise.id)
    ? concealedWriting
    : null;
  if (!guidedExtra && !concealedExtra) {
    return dimensionSteps;
  }
  const generationIndex = dimensionSteps.findIndex(({ exercise, track: stepTrack }) =>
    practiceDimension(exercise, stepTrack) === "generation"
  );
  const insertionIndex = generationIndex < 0 ? dimensionSteps.length : generationIndex;
  return [
    ...dimensionSteps.slice(0, insertionIndex),
    ...(guidedExtra ? [guidedExtra] : []),
    ...dimensionSteps.slice(insertionIndex, insertionIndex + 1),
    ...(concealedExtra ? [concealedExtra] : []),
    ...dimensionSteps.slice(insertionIndex + 1),
  ];
}

/** All canonical activities available to a session before compact selection. */
export function getPracticeCandidates(
  character: CharacterItem,
  track: TrackId,
  mode: PracticeMode = "track",
): PracticeStep[] {
  const tracks = mode === "mastery" ? learningTrackIds : [track];
  return tracks.flatMap((stepTrack) =>
    getTrackExercises(character, stepTrack).map((exercise) => ({
      exercise,
      track: stepTrack,
    })),
  );
}

function retrievalFitness(step: PracticeStep) {
  const exercise = step.exercise;
  const cueLevel = exercise.cueLevel ?? 0;
  const answerMode = practiceAnswerMode(exercise);
  const answerModeScore: Record<AnswerMode, number> = {
    speech: 30,
    choice: 20,
    handwriting: 10,
    "self-check": 0,
  };
  const dimension = practiceDimension(exercise, step.track);
  const objectiveGeneration = dimension === "generation" &&
    exercise.kind !== "write" &&
    answerMode === "choice";

  // A cue-free item is the only one that can become independent evidence.
  // Keep a lower-cue fallback so older profiles never get trapped when a
  // legacy character has no cue-free item for a dimension yet.
  return (3 - cueLevel) * 100 +
    Number(objectiveGeneration) * 250 +
    answerModeScore[answerMode] +
    Number(exercise.concealTarget === true) * 10;
}

/**
 * Builds one compact due-review round from the character's canonical items.
 *
 * `dueDimensions` is already urgency ordered by the scheduler. The returned
 * steps preserve that order, exclude every non-due dimension, and keep only
 * the strongest retrieval item for each dimension. This deliberately knows
 * nothing about generated lesson modules, so the review engine stays usable
 * with hand-authored or future content sources.
 */
export function selectDueReviewSteps(
  steps: readonly PracticeStep[],
  dueDimensions: readonly SkillDimension[],
) {
  const due = new Set(dueDimensions);
  const bestByDimension = new Map<SkillDimension, {
    step: PracticeStep;
    score: number;
  }>();

  for (const step of steps) {
    const dimension = practiceDimension(step.exercise, step.track);
    if (!due.has(dimension)) continue;
    const score = retrievalFitness(step);
    const previous = bestByDimension.get(dimension);
    if (!previous || score > previous.score) {
      bestByDimension.set(dimension, { step, score });
    }
  }

  const emitted = new Set<SkillDimension>();
  return dueDimensions.flatMap((dimension) => {
    if (emitted.has(dimension)) return [];
    emitted.add(dimension);
    const selected = bestByDimension.get(dimension);
    return selected ? [selected.step] : [];
  });
}

/**
 * Select the strongest available activity for the first diagnosed target.
 * Prefer a different question so correction is followed by a genuine change
 * of representation instead of an immediate replay of the failed item.
 */
export function selectRemediationStep(
  steps: readonly PracticeStep[],
  errorTags: readonly ErrorTag[],
  currentExerciseId?: string,
): RemediationStep | null {
  for (const diagnosis of diagnoseErrors(errorTags)) {
    const matching = steps.filter((step) =>
      practiceDimension(step.exercise, step.track) === diagnosis.targetDimension
    );
    const alternatives = matching.filter(({ exercise }) => exercise.id !== currentExerciseId);
    const [step] = selectDueReviewSteps(
      alternatives.length > 0 ? alternatives : matching,
      [diagnosis.targetDimension],
    );
    if (step) {
      return {
        step,
        targetDimension: diagnosis.targetDimension,
        activity: diagnosis.activity,
      };
    }
  }
  return null;
}

export function stableOptionOrder(options: Exercise["options"], seed: string) {
  let state = [...seed].reduce(
    (value, character) => Math.imul(value ^ character.charCodeAt(0), 16777619) >>> 0,
    2166136261,
  );
  const random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  const ordered = [...options];
  for (let index = ordered.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [ordered[index], ordered[swapIndex]] = [ordered[swapIndex], ordered[index]];
  }
  return ordered;
}

export function concealTargetText(text: string, target: string, replacement = "□") {
  return target ? text.split(target).join(replacement) : text;
}

export function writingRetrievalText(
  question: Exercise,
  character: CharacterItem,
  revealed: boolean,
) {
  return {
    prompt: revealed
      ? question.prompt
      : concealTargetText(question.prompt, character.hanzi),
    wordCue: concealTargetText(character.word, character.hanzi),
    progressTarget: revealed ? character.hanzi : "独立书写",
    canvasLabel: revealed
      ? `对照范字“${character.hanzi}”检查刚才的书写`
      : "在方格中独立书写目标字",
  };
}

export function writingAssessmentErrorTags(
  assessment: WritingSelfAssessment,
): ErrorTag[] {
  if (assessment === "component-error") return ["component-missing", "component-extra"];
  if (assessment === "position-error") return ["component-position"];
  if (assessment === "stroke-error") return ["stroke-missing", "stroke-extra"];
  return [];
}

export function practiceDimension(
  question: Exercise,
  track: TrackId,
): SkillDimension {
  if (question.dimension) return question.dimension;
  if (question.kind === "write") return "generation";
  if (question.kind === "structure") return "discrimination";
  if (track === "honglan") return "semantics";
  if (track === "split" || question.kind === "components") return "generation";
  if (question.questionType === "image_single_select") return "semantics";
  return "recognition";
}

export function practiceAnswerMode(question: Exercise): AnswerMode {
  if (question.answerMode) return question.answerMode;
  return question.kind === "write" ? "self-check" : "choice";
}

export function practiceCueLevel(
  question: Exercise,
  answerPreviouslyRevealed = false,
): 0 | 1 | 2 | 3 {
  return Math.max(question.cueLevel ?? 0, answerPreviouslyRevealed ? 2 : 0) as 0 | 1 | 2 | 3;
}

export function practiceErrorTags(
  question: Exercise,
  track: TrackId,
  selected: string[],
): ErrorTag[] {
  const tagged = selected.flatMap((id) => question.optionErrorTags?.[id] ?? []);
  if (tagged.length) return [...new Set(tagged)];
  if (question.kind === "structure") return ["component-position"];
  if (track === "honglan") return ["semantic-component"];
  if (track === "split" || question.kind === "components") {
    return ["component-missing", "component-extra"];
  }
  if (practiceDimension(question, track) === "phonology") return ["pronunciation-tone"];
  if (practiceDimension(question, track) === "semantics") return ["meaning-unknown"];
  if (practiceDimension(question, track) === "context") return ["context-misuse"];
  return ["lookalike-confusion"];
}

export function expectedAnswerIds(
  question: Exercise,
  character: CharacterItem,
  track: TrackId,
) {
  if (track === "split" && question.kind === "components") {
    const inOrder = character.parts
      .map((part) => question.options.find(
        (option) => option.correct && option.text === part.char,
      )?.id)
      .filter((id): id is string => Boolean(id));
    if (inOrder.length) return inOrder;
  }
  return question.options.filter((option) => option.correct).map((option) => option.id);
}

export function isPracticeAnswerCorrect(
  question: Exercise,
  character: CharacterItem,
  track: TrackId,
  selected: string[],
  wrote: boolean,
  writingAssessment?: WritingSelfAssessment,
) {
  // Ink only proves that the learner attempted the prompt. Handwriting is
  // graded after the model character is revealed and the learner explicitly
  // compares components, placement and strokes.
  if (question.kind === "write") return wrote && writingAssessment === "correct";
  const expected = expectedAnswerIds(question, character, track);
  if (track === "split" && question.kind === "components") {
    return expected.length === selected.length && expected.every((id, index) => selected[index] === id);
  }
  const current = [...selected].sort();
  const target = [...expected].sort();
  return current.length === target.length && current.every((id, index) => id === target[index]);
}

export function questionTypeLabel(question: Exercise, track: TrackId) {
  if (question.kind === "write") return "独立书写";
  if (track === "honglan") return "红蓝字";
  if (track === "split" || question.kind === "components") return "组字 · 选字";
  if (question.kind === "structure") return "结构选择";
  if (question.questionType === "image_single_select") return "看图选择";
  return "选择题";
}
