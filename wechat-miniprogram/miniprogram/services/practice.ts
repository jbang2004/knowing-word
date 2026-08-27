import type { CatalogCharacter, Exercise } from "../types/models";

const masteryDimensions = ["recognition", "phonology", "semantics", "generation", "discrimination", "context"];

export function masteryQuestionsFor(character: CatalogCharacter) {
  const best = new Map<string, { exercise: Exercise; score: number }>();
  for (const exercise of character.exercises ?? []) {
    const dimension = exercise.dimension ?? "recognition";
    if (!masteryDimensions.includes(dimension)) continue;
    const cueLevel = exercise.cueLevel ?? 0;
    const answerMode = exercise.answerMode ?? (exercise.kind === "write" ? "self-check" : "choice");
    const answerModeScore = answerMode === "speech" ? 30 : answerMode === "choice" ? 20 : answerMode === "handwriting" ? 10 : 0;
    const objectiveGeneration = dimension === "generation" && exercise.kind !== "write" && answerMode === "choice";
    const score = (3 - cueLevel) * 100 + Number(objectiveGeneration) * 250 + answerModeScore + Number(exercise.concealTarget === true) * 10;
    const previous = best.get(dimension);
    if (!previous || score > previous.score) best.set(dimension, { exercise, score });
  }
  return masteryDimensions.flatMap((dimension) => best.get(dimension)?.exercise ?? []);
}
