import type { HeritageAsset } from "./heritage-assets.ts";
import type { LearningVisual } from "./illustrations.ts";
import type { MnemonicScene } from "./mnemonic-scenes.ts";

export type LessonCharacterMedia = {
  visual?: LearningVisual;
  heritage?: HeritageAsset;
  scene: MnemonicScene;
  transcript: string;
  practiceOptionVisuals: Record<string, LearningVisual>;
};
