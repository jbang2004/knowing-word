import type { ErrorTag } from "./learning-state.ts";

export type HandwritingAttempt = {
  acceptedStrokes: number;
  expectedStrokes: number;
  mistakes: number;
  backwardsMistakes: number;
  complete: boolean;
};

export const emptyHandwritingAttempt: HandwritingAttempt = {
  acceptedStrokes: 0,
  expectedStrokes: 0,
  mistakes: 0,
  backwardsMistakes: 0,
  complete: false,
};

export function hanziWriterDataPath(character: string) {
  const codePoints = Array.from(
    character,
    (value) => value.codePointAt(0)!.toString(16),
  );
  return `/hanzi-data/u${codePoints.join("-")}.json`;
}

export function isHandwritingComplete(attempt: HandwritingAttempt) {
  return attempt.complete &&
    attempt.expectedStrokes > 0 &&
    attempt.acceptedStrokes === attempt.expectedStrokes;
}

export function isHandwritingCorrect(attempt: HandwritingAttempt) {
  return isHandwritingComplete(attempt);
}

export function handwritingErrorTags(attempt: HandwritingAttempt): ErrorTag[] {
  // Hanzi Writer only advances after the current stroke is accepted. Once all
  // strokes are complete, earlier rejected traces are retry history rather
  // than missing or extra strokes in the finished character.
  if (isHandwritingComplete(attempt)) return [];
  const tags: ErrorTag[] = [];
  if (!attempt.complete || attempt.acceptedStrokes < attempt.expectedStrokes) {
    tags.push("stroke-missing");
  }
  if (attempt.mistakes > 0 || attempt.backwardsMistakes > 0) {
    tags.push("stroke-extra");
  }
  return tags;
}
