export type NarrationMark = {
  char: string;
  start: number;
  end: number;
  alignment_group?: string | number | null;
};

export type NarrationTokenView = {
  key: string;
  text: string;
  punctuation: string;
  state: "is-active" | "is-complete" | "is-upcoming";
  phraseClass: "is-current-phrase" | "";
  punctuationState: "is-complete" | "";
  phraseIndex: number;
  markIndex: number;
};

const spokenCharacterPattern = /[\p{L}\p{N}\p{Script=Han}]/u;
const phraseEndingPattern = /[，。！？；：]/u;

function punctuationByMark(marks: NarrationMark[], transcript: string) {
  const source = Array.from(transcript);
  const byMark = new Map<number, string>();
  let cursor = 0;
  let leading = "";
  while (cursor < source.length && !spokenCharacterPattern.test(source[cursor])) {
    if (!/\s/u.test(source[cursor])) leading += source[cursor];
    cursor += 1;
  }
  for (let markIndex = 0; markIndex < marks.length; markIndex += 1) {
    let matchIndex = source.indexOf(marks[markIndex].char, cursor);
    if (matchIndex < 0) matchIndex = source.findIndex((char, index) => index >= cursor && spokenCharacterPattern.test(char));
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

function activeMarkIndices(marks: NarrationMark[], elapsed: number) {
  const direct = marks.reduce<number[]>((indices, mark, index) => {
    if (elapsed >= mark.start && elapsed < mark.end) indices.push(index);
    return indices;
  }, []);
  const groups = new Set(direct
    .map((index) => marks[index].alignment_group)
    .filter((group): group is string | number => group !== undefined && group !== null && group !== ""));
  if (!groups.size) return direct;
  return marks.reduce<number[]>((indices, mark, index) => {
    const group = mark.alignment_group;
    if (direct.includes(index) || (group !== undefined && group !== null && group !== "" && groups.has(group))) indices.push(index);
    return indices;
  }, []);
}

function authoredTokens(marks: NarrationMark[], transcript: string) {
  const authored = punctuationByMark(marks, transcript);
  let phraseIndex = 0;
  return marks.map((mark, markIndex) => {
    const punctuation = authored.byMark.get(markIndex) ?? "";
    const item = {
      key: `${markIndex}-${mark.char}`,
      text: markIndex === 0 ? `${authored.leading}${mark.char}` : mark.char,
      punctuation,
      phraseIndex,
      markIndex,
    };
    if (phraseEndingPattern.test(punctuation)) phraseIndex += 1;
    return item;
  });
}

export function narrationView(marks: NarrationMark[], transcript: string, elapsed: number) {
  if (!marks.length) return { tokens: [] as NarrationTokenView[], phrase: transcript, completed: 0, activePhrase: -1 };
  const tokens = authoredTokens(marks, transcript);
  const active = new Set(activeMarkIndices(marks, elapsed));
  const activeMark = active.values().next().value as number | undefined;
  const upcoming = marks.findIndex((mark) => mark.start > elapsed);
  const anchor = activeMark ?? (upcoming >= 0 ? upcoming : marks.length - 1);
  const activePhrase = tokens[anchor]?.phraseIndex ?? -1;
  const viewTokens = tokens.map((token): NarrationTokenView => {
    const complete = marks[token.markIndex].end <= elapsed;
    return {
      ...token,
      state: active.has(token.markIndex) ? "is-active" : complete ? "is-complete" : "is-upcoming",
      phraseClass: token.phraseIndex === activePhrase ? "is-current-phrase" : "",
      punctuationState: complete ? "is-complete" : "",
    };
  });
  return {
    tokens: viewTokens,
    phrase: viewTokens.filter((token) => token.phraseIndex === activePhrase).map((token) => `${token.text}${token.punctuation}`).join("") || transcript,
    completed: marks.filter((mark) => mark.end <= elapsed).length,
    activePhrase,
  };
}

export function previousPhraseStart(marks: NarrationMark[], transcript: string, elapsed: number) {
  if (!marks.length) return 0;
  const current = narrationView(marks, transcript, elapsed).activePhrase;
  const target = Math.max(0, current - 1);
  const tokens = authoredTokens(marks, transcript);
  const token = tokens.find((item) => item.phraseIndex === target);
  return token ? marks[token.markIndex].start : 0;
}
