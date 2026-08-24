import { learningSounds, type LearningSoundId } from "../../data/learning-sounds";

const players = new Map<LearningSoundId, HTMLAudioElement>();

export function playLearningSound(id: LearningSoundId) {
  if (typeof window === "undefined") return;

  const player = players.get(id) ?? new Audio(learningSounds[id]);
  player.preload = "auto";
  player.volume = 0.78;
  players.set(id, player);
  player.currentTime = 0;
  void player.play().catch(() => {
    // Browsers may reject sound until the first user gesture. The learning
    // action remains fully usable when that happens.
  });
}
