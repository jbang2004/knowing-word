import { learningTrackIds, skillDimensions, trackOrigins } from "../data/runtime-contract";
import { createPracticeSelectors } from "./practice-selection";
export type { PracticeStep } from "./practice-selection";

export const { masteryStepsFor, trackStepsFor } = createPracticeSelectors({
  learningTrackIds,
  skillDimensions,
  trackOrigins,
});
