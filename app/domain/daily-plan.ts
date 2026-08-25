import {
  homeCandidates,
  type HomeCandidate,
} from "../data/home-index.generated.ts";
import {
  characterMemoryFromProfile,
  type StudyProfile,
} from "../lib/profile-model.ts";
import {
  skillDimensions,
  type SkillDimension,
} from "./learning-state.ts";
import { learningDayKey } from "./learning-day.ts";

export type DailyPlanItem = {
  kind: "review" | "new";
  candidate: HomeCandidate;
  dueDimensions: SkillDimension[];
};

export type DailyLearningPlan = {
  reviews: DailyPlanItem[];
  newCharacters: DailyPlanItem[];
  total: number;
};

function dueTime(value: string) {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? Number.POSITIVE_INFINITY : timestamp;
}

export function dueDimensionsForCharacter(
  profile: StudyProfile,
  characterId: string,
  now: Date,
) {
  if (!profile.memory[characterId]) return [];
  const memory = characterMemoryFromProfile(profile, characterId);
  const timestamp = now.getTime();
  return skillDimensions.filter((dimension) => {
    const state = memory[dimension];
    return state.status !== "new" && dueTime(state.dueAt) <= timestamp;
  });
}

function rotateAfterLast(candidates: HomeCandidate[], lastId?: string) {
  const index = lastId ? candidates.findIndex((candidate) => candidate.id === lastId) : -1;
  return index < 0
    ? candidates
    : [...candidates.slice(index + 1), ...candidates.slice(0, index + 1)];
}

export function buildDailyLearningPlan(
  profile: StudyProfile,
  now: Date,
  options: { reviewLimit?: number; newLimit?: number } = {},
): DailyLearningPlan {
  const reviewLimit = Math.max(0, options.reviewLimit ?? 10);
  const newLimit = Math.max(0, options.newLimit ?? 5);
  const day = learningDayKey(now);
  const introducedToday = profile.introducedByDay[day] ?? [];
  const reviewedToday = new Set(profile.reviewedByDay[day] ?? []);
  const remainingNewSlots = Math.max(0, newLimit - introducedToday.length);
  const remainingReviewSlots = Math.max(0, reviewLimit - reviewedToday.size);
  const completed = new Set(profile.completed.words);
  const reviews = homeCandidates.words
    .filter((candidate) => completed.has(candidate.id))
    .filter((candidate) => !reviewedToday.has(candidate.id))
    .map((candidate) => ({
      kind: "review" as const,
      candidate,
      dueDimensions: dueDimensionsForCharacter(profile, candidate.id, now),
    }))
    .filter((item) => item.dueDimensions.length > 0)
    .sort((left, right) => {
      const leftMemory = characterMemoryFromProfile(profile, left.candidate.id);
      const rightMemory = characterMemoryFromProfile(profile, right.candidate.id);
      const leftDue = Math.min(...left.dueDimensions.map((dimension) => dueTime(leftMemory[dimension].dueAt)));
      const rightDue = Math.min(...right.dueDimensions.map((dimension) => dueTime(rightMemory[dimension].dueAt)));
      return leftDue - rightDue;
    })
    .slice(0, remainingReviewSlots);

  const newCharacters = rotateAfterLast(homeCandidates.words, profile.last.words?.characterId)
    .filter((candidate) => !completed.has(candidate.id))
    .slice(0, remainingNewSlots)
    .map((candidate) => ({
      kind: "new" as const,
      candidate,
      dueDimensions: [] as SkillDimension[],
    }));

  return {
    reviews,
    newCharacters,
    total: reviews.length + newCharacters.length,
  };
}
