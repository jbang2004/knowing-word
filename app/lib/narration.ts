export type TimedCharacter = {
  char: string;
  start: number;
  end: number;
};

export type NarrationToken =
  | {
      kind: "character";
      text: string;
      markIndex: number;
      completionTime: number;
    }
  | {
      kind: "punctuation";
      text: "，" | "。";
      markIndex: number;
      completionTime: number;
    };

const CLAUSE_PAUSE_SECONDS = 0.42;
const SENTENCE_PAUSE_SECONDS = 0.78;

function punctuationAfter(mark: TimedCharacter, next?: TimedCharacter): "，" | "。" | null {
  if (!next) return "。";
  const pause = Math.max(0, next.start - mark.end);
  if (pause >= SENTENCE_PAUSE_SECONDS) return "。";
  if (pause >= CLAUSE_PAUSE_SECONDS) return "，";
  return null;
}

export function buildNarrationTokens(marks: TimedCharacter[]): NarrationToken[] {
  return marks.flatMap((mark, markIndex) => {
    const character: NarrationToken = {
      kind: "character",
      text: mark.char,
      markIndex,
      completionTime: mark.end,
    };
    const punctuation = punctuationAfter(mark, marks[markIndex + 1]);
    return punctuation
      ? [
          character,
          {
            kind: "punctuation" as const,
            text: punctuation,
            markIndex,
            completionTime: mark.end,
          },
        ]
      : [character];
  });
}
