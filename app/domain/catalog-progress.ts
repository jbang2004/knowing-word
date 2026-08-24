import { homeCandidates, type HomeCandidate } from "../data/home-index.generated.ts";
import type { StudyProfile, TrackId } from "../lib/profile-model.ts";
import { nextCandidateId } from "../lib/progress-model.ts";

export function trackCandidates(track: TrackId, lessonId?: string) {
  const candidates = homeCandidates[track];
  return lessonId
    ? candidates.filter((candidate) => candidate.lessonId === lessonId)
    : candidates;
}

export function trackProgress(profile: StudyProfile, track: TrackId, lessonId?: string) {
  const candidates = trackCandidates(track, lessonId);
  const completed = new Set(profile.completed[track]);
  return {
    completed: candidates.filter((candidate) => completed.has(candidate.id)).length,
    total: candidates.length,
  };
}

export function nextTrackCandidate(track: TrackId, profile: StudyProfile): HomeCandidate | undefined {
  const candidates = homeCandidates[track];
  const id = nextCandidateId(
    candidates.map((candidate) => candidate.id),
    profile.completed[track],
    profile.last[track]?.characterId,
  );
  return candidates.find((candidate) => candidate.id === id);
}
