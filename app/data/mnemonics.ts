import type { CharacterItem } from "./catalog";
import { getMnemonicScene } from "./mnemonic-scenes.ts";

export type MnemonicStage = 0 | 1 | 2 | 3;

export function getMnemonicStagePartIndices(
  character: CharacterItem,
  stage: MnemonicStage,
) {
  const parts = character.parts.length
    ? character.parts
    : [{ char: character.hanzi, radical: true }];
  if (stage === 0) return [];
  if (stage === 3) return parts.map((_, index) => index);

  const matching = parts
    .map((part, index) => ({ part, index }))
    .filter(({ part }) => (stage === 1 ? part.radical : !part.radical))
    .map(({ index }) => index);

  // 独体字没有蓝色部件，第二步继续追踪完整物象的轮廓。
  return matching.length ? matching : parts.map((_, index) => index);
}

export function getMnemonicStageCopy(
  character: CharacterItem,
  stage: MnemonicStage,
) {
  const scene = getMnemonicScene(character);
  const parts = character.parts.length
    ? character.parts
    : [{ char: character.hanzi, radical: true }];
  const indices = getMnemonicStagePartIndices(character, stage);
  const activeParts = indices.map((index) => parts[index]);
  const activeCues = indices.map((index) => scene.cues[index]).filter(Boolean);

  if (stage === 0) {
    return {
      eyebrow: "第一眼 · 只看物象",
      title: "先找出画面里不寻常的轮廓",
      body: scene.scene,
    };
  }

  if (stage === 1) {
    return {
      eyebrow: "暖红聚焦 · 表意部首",
      title: activeParts.length
        ? `看见“${activeParts.map((part) => part.char).join("、")}”怎样长进图里`
        : `找到“${character.hanzi}”的意义线索`,
      body: activeCues.join(" ") || scene.scene,
    };
  }

  if (stage === 2) {
    const hasIndependentComponent = parts.some((part) => !part.radical);
    return {
      eyebrow: "靛蓝聚焦 · 补全字形",
      title: hasIndependentComponent
        ? `再找“${activeParts.map((part) => part.char).join("、")}”的形与音`
        : `顺着物体轮廓描一遍“${character.hanzi}”`,
      body: activeCues.join(" ") || scene.scene,
    };
  }

  return {
    eyebrow: "最后 · 物象合字",
    title: `${parts.map((part) => part.char).join(" + ") || character.hanzi} = ${character.hanzi}`,
    body: `现在不要再把它看成几件分散的物体：${scene.scene}`,
  };
}

export const mnemonicStageLabels = ["看意象", "找部首", "找部件", "合成字"] as const;
