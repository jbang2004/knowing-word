import type { CharacterItem } from "../../data/catalog-types";
import { getMnemonicLayout } from "../../data/mnemonic-scenes";
import type { MnemonicStage } from "../../data/mnemonics";

export function MnemonicSceneFocus({
  character,
  stage,
  compact = false,
}: {
  character: CharacterItem;
  stage: MnemonicStage;
  compact?: boolean;
}) {
  const layout = getMnemonicLayout(character);
  return (
    <div
      className={`mnemonic-scene-focus layout-${layout} focus-${stage}${compact ? " is-compact" : ""}`}
      aria-hidden="true"
    >
      {!compact && stage > 0 && stage < 3 && <span className="mnemonic-focus-wash" />}
      {!compact && stage === 0 && <span className="scene-hunt-badge">先找物体轮廓</span>}
      {!compact && stage === 3 && <span className="scene-resolved-badge">物象已经合拢</span>}
      {compact && <span className="meaning-match-badge">图形即字形 <b>✓</b></span>}
    </div>
  );
}
