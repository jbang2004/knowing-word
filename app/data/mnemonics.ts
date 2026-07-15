import type { CharacterItem } from "./catalog";

export type MnemonicStage = 0 | 1 | 2 | 3;

export type MnemonicAnchor = {
  x: number;
  y: number;
  scale: number;
  rotate: number;
};

type AnchorOverride = [number, number, number?, number?][];

/*
 * These anchors place the source-course characters near the visual subject in
 * their new illustrations. Characters without an authored anchor still get a
 * deterministic layout that follows their written structure.
 */
const authoredAnchors: Record<string, AnchorOverride> = {
  桂: [[52, 59, 1.08, -3], [43, 78, 0.92, 2]],
  花: [[51, 31, 1.08, -2], [51, 62, 0.94, 2]],
  故: [[36, 57, 0.96, -3], [68, 56, 0.9, 4]],
  乡: [[50, 56, 1.04, -2]],
  欣: [[34, 58, 0.92, -4], [68, 54, 0.94, 3]],
  兰: [[51, 58, 1.08, -2]],
  木: [[51, 57, 1.1, -2]],
  风: [[39, 51, 1.02, -4], [66, 58, 0.88, 5]],
  台: [[50, 61, 1.06, -2]],
  老: [[47, 44, 0.92, -3], [55, 67, 0.82, 3]],
  婆: [[49, 36, 0.94, -2], [50, 64, 0.92, 2]],
  饼: [[34, 60, 0.92, -3], [66, 59, 0.94, 3]],
  糕: [[34, 60, 0.92, -3], [66, 58, 0.94, 3]],
  其: [[50, 59, 1.08, -2]],
  尤: [[50, 54, 1.06, -2]],
  劲: [[37, 55, 0.9, -4], [66, 55, 0.96, 4]],
  使: [[33, 54, 0.88, -4], [67, 53, 0.94, 3]],
  茶: [[50, 30, 1.05, -2], [50, 64, 0.94, 2]],
  叶: [[35, 55, 0.88, -4], [67, 54, 0.94, 3]],
  浇: [[33, 54, 0.9, -4], [68, 55, 0.94, 3]],
  水: [[50, 58, 1.1, -2]],
  品: [[50, 32, 0.82, -2], [35, 63, 0.82, -3], [66, 63, 0.82, 3]],
  食: [[50, 34, 0.92, -2], [50, 64, 0.94, 2]],
  吩: [[34, 53, 0.88, -4], [67, 54, 0.94, 4]],
  咐: [[34, 54, 0.88, -4], [67, 55, 0.94, 4]],
  茅: [[50, 31, 1.05, -2], [50, 64, 0.94, 2]],
  亭: [[50, 35, 0.92, -2], [50, 66, 0.9, 2]],
  贵: [[50, 35, 0.92, -2], [50, 65, 0.92, 2]],
  可: [[42, 50, 1.03, -4], [59, 58, 0.82, 3]],
  绿: [[34, 54, 0.88, -4], [67, 54, 0.94, 4]],
  嫩: [[33, 55, 0.88, -4], [68, 54, 0.94, 4]],
  面: [[50, 54, 1.08, -2]],
  体: [[34, 54, 0.88, -4], [67, 55, 0.94, 4]],
  平: [[50, 55, 1.06, -2]],
  阔: [[40, 51, 1.08, -3], [58, 56, 0.84, 3]],
  距: [[34, 55, 0.9, -4], [68, 54, 0.94, 4]],
};

function tupleToAnchor(tuple: AnchorOverride[number]): MnemonicAnchor {
  return {
    x: tuple[0],
    y: tuple[1],
    scale: tuple[2] ?? 1,
    rotate: tuple[3] ?? 0,
  };
}

function structuralAnchors(character: CharacterItem): MnemonicAnchor[] {
  const count = Math.max(character.parts.length, 1);
  const decomposition = character.decomposition;
  if (count === 1) return [{ x: 50, y: 55, scale: 1.08, rotate: -2 }];

  if (decomposition.includes("左中右")) {
    return Array.from({ length: count }, (_, index) => ({
      x: 22 + (56 * index) / Math.max(1, count - 1),
      y: 55,
      scale: 0.86,
      rotate: index % 2 ? 2 : -2,
    }));
  }

  if (decomposition.includes("左右")) {
    return [
      { x: 34, y: 55, scale: 0.94, rotate: -3 },
      { x: 67, y: 55, scale: 0.94, rotate: 3 },
    ];
  }

  if (decomposition.includes("上中下")) {
    return Array.from({ length: count }, (_, index) => ({
      x: 50,
      y: 25 + (56 * index) / Math.max(1, count - 1),
      scale: 0.84,
      rotate: index % 2 ? 2 : -2,
    }));
  }

  if (decomposition.includes("上下")) {
    return [
      { x: 50, y: 34, scale: 0.94, rotate: -2 },
      { x: 50, y: 66, scale: 0.94, rotate: 2 },
    ];
  }

  if (decomposition.includes("包围")) {
    return [
      { x: 50, y: 54, scale: 1.12, rotate: -2 },
      { x: 52, y: 56, scale: 0.76, rotate: 2 },
    ];
  }

  return Array.from({ length: count }, (_, index) => ({
    x: 30 + (40 * index) / Math.max(1, count - 1),
    y: 55,
    scale: 0.92,
    rotate: index % 2 ? 3 : -3,
  }));
}

export function getMnemonicAnchors(character: CharacterItem): MnemonicAnchor[] {
  const authored = authoredAnchors[character.hanzi];
  if (authored?.length === Math.max(character.parts.length, 1)) {
    return authored.map(tupleToAnchor);
  }
  return structuralAnchors(character);
}

export function getMnemonicStageCopy(character: CharacterItem, stage: MnemonicStage) {
  const radical = character.parts.find((part) => part.radical) || character.parts[0];
  const phonetic = character.parts.find((part) => !part.radical);
  if (stage === 0) {
    return {
      eyebrow: "第一眼 · 只看场景",
      title: `先记住“${character.originalMeaning}”的画面`,
      body: "暂时不看答案，让图像先在脑海里留下一个位置。",
    };
  }
  if (stage === 1) {
    return {
      eyebrow: "红色 · 表意线索",
      title: radical ? `找到部首“${radical.char}”` : `找到“${character.hanzi}”的意义线索`,
      body: radical ? `红色部首通常提示这个字与什么事物有关。点一下“${radical.char}”，还能继续查看它的来历。` : "红色线索帮助我们把字义和场景连接起来。",
    };
  }
  if (stage === 2) {
    return {
      eyebrow: "蓝色 · 字形线索",
      title: phonetic ? `再找到部件“${phonetic.char}”` : `把场景换成“${character.hanzi}”的字形`,
      body: phonetic ? "蓝色部件补全结构，有些部件还会提示读音。" : "独体字没有可拆开的蓝色部件，直接记住它的整体轮廓。",
    };
  }
  return {
    eyebrow: "最后 · 场景合字",
    title: `${character.parts.map((part) => part.char).join(" + ") || character.hanzi} = ${character.hanzi}`,
    body: `把场景、颜色和结构合在一起：这就是“${character.hanzi}”。`,
  };
}

export const mnemonicStageLabels = ["看场景", "找部首", "找部件", "合成字"] as const;
