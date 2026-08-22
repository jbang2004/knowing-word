export type TimedCharacter = {
  char: string;
  start: number;
  end: number;
  alignment_group?: string | number;
  alignment_group_text?: string;
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

function hasAlignmentGroup(mark: TimedCharacter): mark is TimedCharacter & {
  alignment_group: string | number;
} {
  return mark.alignment_group !== undefined && mark.alignment_group !== null && mark.alignment_group !== "";
}

export function activeNarrationMarkIndices(marks: TimedCharacter[], elapsed: number): number[] {
  if (!Number.isFinite(elapsed)) return [];

  const directlyActive = marks.reduce<number[]>((indices, mark, index) => {
    if (elapsed >= mark.start && elapsed < mark.end) indices.push(index);
    return indices;
  }, []);
  const directlyActiveSet = new Set(directlyActive);
  const activeGroups = new Set(
    directlyActive
      .map((index) => marks[index])
      .filter(hasAlignmentGroup)
      .map((mark) => mark.alignment_group),
  );

  if (activeGroups.size === 0) return directlyActive;
  return marks.reduce<number[]>((indices, mark, index) => {
    if (directlyActiveSet.has(index) || (hasAlignmentGroup(mark) && activeGroups.has(mark.alignment_group))) {
      indices.push(index);
    }
    return indices;
  }, []);
}

function punctuationByMark(marks: TimedCharacter[], transcript: string) {
  const source = Array.from(transcript);
  const byMark = new Map<number, string>();
  let cursor = 0;
  let leading = "";

  while (cursor < source.length && !spokenCharacterPattern.test(source[cursor])) {
    if (!/\s/u.test(source[cursor])) leading += source[cursor];
    cursor += 1;
  }

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
  return { byMark, leading };
}

export function buildNarrationTokens(marks: TimedCharacter[], transcript?: string): NarrationToken[] {
  const authoredPunctuation = transcript ? punctuationByMark(marks, transcript) : null;
  return marks.flatMap((mark, markIndex) => {
    const character: NarrationToken = {
      kind: "character",
      text: markIndex === 0 ? `${authoredPunctuation?.leading || ""}${mark.char}` : mark.char,
      markIndex,
      completionTime: mark.end,
    };
    const punctuation = authoredPunctuation
      ? authoredPunctuation.byMark.get(markIndex) || null
      : punctuationAfter(mark, marks[markIndex + 1]);
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

const phraseEndingPattern = /[，。！？；：]/u;

/**
 * Maps every immutable ForcedAligner mark to a visual reading phrase. The
 * phrase layer changes only presentation rhythm; it never rewrites audio
 * boundaries or the audit-grade character timeline.
 */
export function narrationPhraseIndexByMark(tokens: NarrationToken[]): number[] {
  const phraseByMark: number[] = [];
  let phraseIndex = 0;
  for (const token of tokens) {
    if (token.kind === "character") {
      phraseByMark[token.markIndex] = phraseIndex;
    } else if (phraseEndingPattern.test(token.text)) {
      phraseIndex += 1;
    }
  }
  return phraseByMark;
}

export function activeNarrationPhraseIndex(
  marks: TimedCharacter[],
  elapsed: number,
  phraseByMark: number[],
): number {
  if (!marks.length || !Number.isFinite(elapsed)) return -1;
  const active = activeNarrationMarkIndices(marks, elapsed)[0];
  if (active !== undefined) return phraseByMark[active] ?? -1;
  const upcoming = marks.findIndex((mark) => mark.start > elapsed);
  if (upcoming >= 0) return phraseByMark[upcoming] ?? -1;
  return phraseByMark.at(-1) ?? -1;
}
