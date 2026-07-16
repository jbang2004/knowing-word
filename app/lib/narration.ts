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
      text: string;
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

const spokenCharacterPattern = /[\p{L}\p{N}\p{Script=Han}]/u;

function punctuationByMark(marks: TimedCharacter[], transcript: string) {
  const source = Array.from(transcript);
  const byMark = new Map<number, string>();
  let cursor = 0;

  for (let markIndex = 0; markIndex < marks.length; markIndex += 1) {
    const mark = marks[markIndex];
    let matchIndex = source.indexOf(mark.char, cursor);
    if (matchIndex < 0) {
      matchIndex = source.findIndex((char, index) => index >= cursor && spokenCharacterPattern.test(char));
    }
    if (matchIndex < 0) break;
    cursor = matchIndex + 1;
    let punctuation = "";
    while (cursor < source.length && !spokenCharacterPattern.test(source[cursor])) {
      if (!/\s/u.test(source[cursor])) punctuation += source[cursor];
      cursor += 1;
    }
    if (punctuation) byMark.set(markIndex, punctuation);
  }
  return byMark;
}

export function buildNarrationTokens(marks: TimedCharacter[], transcript?: string): NarrationToken[] {
  const authoredPunctuation = transcript ? punctuationByMark(marks, transcript) : null;
  return marks.flatMap((mark, markIndex) => {
    const character: NarrationToken = {
      kind: "character",
      text: mark.char,
      markIndex,
      completionTime: mark.end,
    };
    const punctuation = authoredPunctuation?.get(markIndex) || punctuationAfter(mark, marks[markIndex + 1]);
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
