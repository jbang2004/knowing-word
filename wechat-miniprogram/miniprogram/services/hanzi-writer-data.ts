import { publicRequest } from "./api";

export type HanziWriterCharacterData = {
  strokes: string[];
  medians: number[][][];
  radStrokes?: number[];
};

const characterDataCache = new Map<string, Promise<HanziWriterCharacterData>>();

export function hanziWriterDataPath(character: string) {
  const codePoints = Array.from(
    character,
    (value) => value.codePointAt(0)!.toString(16),
  );
  return `/hanzi-data/u${codePoints.join("-")}.json`;
}

export function loadHanziWriterData(character: string) {
  const cached = characterDataCache.get(character);
  if (cached) return cached;
  const request = publicRequest<HanziWriterCharacterData>(
    hanziWriterDataPath(character),
  ).then((data) => {
    if (!data.strokes?.length || data.strokes.length !== data.medians?.length) {
      throw new Error("规范笔画数据不完整");
    }
    return data;
  }).catch((error) => {
    characterDataCache.delete(character);
    throw error;
  });
  characterDataCache.set(character, request);
  return request;
}
