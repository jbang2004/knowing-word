import type { CharacterItem, Exercise } from "../data/catalog-types";
import type { TrackId } from "../lib/profile-model";

const exerciseOrigin: Record<TrackId, string> = {
  words: "识字小测",
  split: "拆一拆",
  honglan: "红蓝字",
  structure: "空间结构",
};

export function getTrackExercises(character: CharacterItem, track: TrackId) {
  return character.exercises.filter((exercise) => exercise.origin === exerciseOrigin[track]);
}

export function stableOptionOrder(options: Exercise["options"], seed: string) {
  const hash = [...seed].reduce(
    (value, character) => ((value * 31) + character.charCodeAt(0)) >>> 0,
    2166136261,
  );
  return [...options]
    .map((option, index) => ({
      option,
      rank: (hash ^ ((index + 1) * 2654435761)) >>> 0,
    }))
    .sort((left, right) => left.rank - right.rank)
    .map(({ option }) => option);
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
) {
  if (question.kind === "write") return wrote;
  const expected = expectedAnswerIds(question, character, track);
  if (track === "split" && question.kind === "components") {
    return expected.length === selected.length && expected.every((id, index) => selected[index] === id);
  }
  const current = [...selected].sort();
  const target = [...expected].sort();
  return current.length === target.length && current.every((id, index) => id === target[index]);
}

export function questionTypeLabel(question: Exercise, track: TrackId) {
  if (question.kind === "write") return "写整字";
  if (track === "honglan") return "红蓝字";
  if (track === "split" || question.kind === "components") return "组字 · 选字";
  if (question.kind === "structure") return "结构选择";
  if (question.questionType === "image_single_select") return "看图选择";
  return "选择题";
}
