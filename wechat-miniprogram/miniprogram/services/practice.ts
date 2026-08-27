import type { CatalogCharacter, Exercise, TrackId } from "../types/models";

const masteryDimensions = ["recognition", "phonology", "semantics", "generation", "discrimination", "context"];

export type PracticeStep = { exercise: Exercise; track: TrackId };

const exerciseOrigin: Record<TrackId, string> = {
  words: "识字小测",
  split: "拆一拆",
  honglan: "红蓝字",
  structure: "空间结构",
};

function answerMode(exercise: Exercise) {
  return exercise.answerMode ?? (exercise.kind === "write" ? "self-check" : "choice");
}

function dimension(exercise: Exercise, track: TrackId) {
  if (exercise.dimension) return exercise.dimension;
  if (exercise.kind === "write") return "generation";
  if (exercise.kind === "structure") return "discrimination";
  if (track === "honglan") return "semantics";
  if (track === "split" || exercise.kind === "components") return "generation";
  if (exercise.questionType === "image_single_select") return "semantics";
  return "recognition";
}

function fitness(exercise: Exercise) {
  const cueLevel = exercise.cueLevel ?? 0;
  const mode = answerMode(exercise);
  const answerModeScore = mode === "speech" ? 30 : mode === "choice" ? 20 : mode === "handwriting" ? 10 : 0;
  const objectiveGeneration = exercise.dimension === "generation" && exercise.kind !== "write" && mode === "choice";
  return (3 - cueLevel) * 100 + Number(objectiveGeneration) * 250 + answerModeScore + Number(exercise.concealTarget === true) * 10;
}

function trackSteps(character: CatalogCharacter, track: TrackId): PracticeStep[] {
  return (character.exercises ?? []).filter((exercise) => {
    const belongs = exercise.origin === exerciseOrigin[track]
      || (track === "words" && exercise.origin === "科学复习")
      || (track === "split" && exercise.origin === "科学复习" && exercise.dimension === "generation");
    return belongs && (track !== "words" || exercise.kind === "single" || exercise.kind === "write");
  }).map((exercise) => ({ exercise, track }));
}

export function masteryStepsFor(character: CatalogCharacter): PracticeStep[] {
  const candidates = (["words", "split", "honglan", "structure"] as TrackId[]).flatMap((track) => trackSteps(character, track));
  const strongest = masteryDimensions.flatMap((target) => {
    const candidatesForDimension = candidates.filter((step) => dimension(step.exercise, step.track) === target);
    return candidatesForDimension.reduce<PracticeStep | null>((best, step) =>
      !best || fitness(step.exercise) > fitness(best.exercise) ? step : best, null) ?? [];
  });
  const guidedWriting = candidates.find(({ exercise, track }) =>
    track === "words" && exercise.kind === "write" && exercise.concealTarget !== true && (exercise.cueLevel ?? 0) > 0);
  const concealedWriting = candidates.find(({ exercise }) =>
    exercise.kind === "write" && exercise.concealTarget === true && (exercise.cueLevel ?? 0) === 0);
  const selectedIds = new Set(strongest.map(({ exercise }) => exercise.id));
  const generationIndex = strongest.findIndex((step) => dimension(step.exercise, step.track) === "generation");
  const insertionIndex = generationIndex < 0 ? strongest.length : generationIndex;
  return [
    ...strongest.slice(0, insertionIndex),
    ...(guidedWriting && !selectedIds.has(guidedWriting.exercise.id) ? [guidedWriting] : []),
    ...strongest.slice(insertionIndex, insertionIndex + 1),
    ...(concealedWriting && !selectedIds.has(concealedWriting.exercise.id) ? [concealedWriting] : []),
    ...strongest.slice(insertionIndex + 1),
  ];
}

export function masteryQuestionsFor(character: CatalogCharacter) {
  return masteryStepsFor(character).map((step) => step.exercise);
}
