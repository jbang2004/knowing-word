import type { CatalogCharacter, Exercise, TrackId } from "../types/models";

export type PracticeStep = { exercise: Exercise; track: TrackId };

type PracticeContract = {
  skillDimensions: readonly string[];
  learningTrackIds: readonly TrackId[];
  trackOrigins: Readonly<Record<TrackId, string>>;
};

/** Pure practice selection; kept free of wx and generated-module imports for contract testing. */
export function createPracticeSelectors(contract: PracticeContract) {
  function answerMode(exercise: Exercise) {
    return exercise.answerMode ?? (exercise.kind === "write" ? "handwriting" : "choice");
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

  function fitness(step: PracticeStep) {
    const { exercise, track } = step;
    const cueLevel = exercise.cueLevel ?? 0;
    const mode = answerMode(exercise);
    const answerModeScore = mode === "speech" ? 30 : mode === "choice" ? 20 : mode === "handwriting" ? 10 : 0;
    const objectiveGeneration = dimension(exercise, track) === "generation"
      && exercise.kind !== "write"
      && mode === "choice";
    return (3 - cueLevel) * 100
      + Number(objectiveGeneration) * 250
      + answerModeScore
      + Number(exercise.concealTarget === true) * 10;
  }

  function trackStepsFor(character: CatalogCharacter, track: TrackId): PracticeStep[] {
    return (character.exercises ?? []).filter((exercise) => {
      const belongs = exercise.origin === contract.trackOrigins[track]
        || (track === "words" && exercise.origin === "科学复习")
        || (track === "split" && exercise.origin === "科学复习" && exercise.dimension === "generation");
      return belongs && (track !== "words" || exercise.kind === "single" || exercise.kind === "write");
    }).map((exercise) => ({ exercise, track }));
  }

  function masteryStepsFor(character: CatalogCharacter): PracticeStep[] {
    const candidates = contract.learningTrackIds.flatMap((track) => trackStepsFor(character, track));
    const strongest = contract.skillDimensions.flatMap((target) => {
      const candidatesForDimension = candidates.filter((step) => dimension(step.exercise, step.track) === target);
      return candidatesForDimension.reduce<PracticeStep | null>((best, step) =>
        !best || fitness(step) > fitness(best) ? step : best, null) ?? [];
    });
    const guidedWriting = candidates.find(({ exercise, track }) =>
      track === "words"
      && exercise.kind === "write"
      && exercise.concealTarget !== true
      && (exercise.cueLevel ?? 0) > 0);
    const concealedWriting = candidates.find(({ exercise }) =>
      exercise.kind === "write"
      && exercise.concealTarget === true
      && (exercise.cueLevel ?? 0) === 0);
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

  return { masteryStepsFor, trackStepsFor };
}
