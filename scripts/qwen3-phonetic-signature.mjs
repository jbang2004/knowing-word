import { clearCustomDict, customPinyin, pinyin } from "pinyin-pro";

import { characters } from "../app/data/catalog.ts";

let rawInput = "";
for await (const chunk of process.stdin) rawInput += chunk;
const input = JSON.parse(rawInput);
const character = characters.find((row) => row.id === input.recordId);

clearCustomDict("pinyin");
if (character?.pinyin && character.word) {
  const wordCharacters = Array.from(character.word);
  const wordPinyin = pinyin(character.word, {
    toneType: "symbol",
    type: "array",
    nonZh: "removed",
  });
  if (wordPinyin.length === wordCharacters.length) {
    for (let index = 0; index < wordCharacters.length; index += 1) {
      if (wordCharacters[index] === character.hanzi) wordPinyin[index] = character.pinyin;
    }
    customPinyin({ [character.word]: wordPinyin.join(" ") });
  }
}

function signature(text) {
  return pinyin(text, {
    toneType: "num",
    type: "array",
    nonZh: "removed",
  });
}

process.stdout.write(`${JSON.stringify({
  expected: signature(input.expected),
  actual: signature(input.actual),
})}\n`);
