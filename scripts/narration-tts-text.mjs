const toneMarks = new Map([
  ...Array.from("āēīōūǖ").map((char) => [char, 1]),
  ...Array.from("áéíóúǘḿń").map((char) => [char, 2]),
  ...Array.from("ǎěǐǒǔǚň").map((char) => [char, 3]),
  ...Array.from("àèìòùǜǹ").map((char) => [char, 4]),
]);
const toneNames = new Map([[1, "第一声"], [2, "第二声"], [3, "第三声"], [4, "第四声"]]);
const pinyinToken = /(?<![A-Za-z])[a-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜêḿńňǹ]+(?![A-Za-z])/giu;

export function ttsSafeNarration(script) {
  return script.replace(pinyinToken, (token) => {
    const tone = Array.from(token.toLowerCase()).map((char) => toneMarks.get(char)).find(Boolean);
    if (!tone) throw new Error(`无法自动口播无声调拼音“${token}”，请人工提供 ttsText`);
    return toneNames.get(tone);
  });
}

export function containsLatinPinyin(text) {
  return /[A-Za-züāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜêḿńňǹ]/u.test(text);
}
