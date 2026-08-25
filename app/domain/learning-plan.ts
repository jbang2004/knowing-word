import { homeCandidates, type HomeCandidate } from "../data/home-index.generated.ts";
import type { StudyProfile, TrackId } from "../lib/profile-model.ts";

export type LearningRecommendation = {
  track: TrackId;
  candidate: HomeCandidate;
} | {
  track: null;
  candidate: null;
};

function candidatesForLesson(track: TrackId, lessonId?: string) {
  return lessonId
    ? homeCandidates[track].filter((candidate) => candidate.lessonId === lessonId)
    : homeCandidates[track];
}

export function isLessonLearningComplete(profile: StudyProfile, lessonId: string) {
  const wordIds = candidatesForLesson("words", lessonId).map((candidate) => candidate.id);
  return wordIds.length > 0 && wordIds.every((id) => profile.completed.words.includes(id));
}

function lessonIsComplete(profile: StudyProfile, lessonId: string) {
  return isLessonLearningComplete(profile, lessonId) && profile.readLessons.includes(lessonId);
}

export function recommendedLessonId(profile: StudyProfile) {
  const lastLessonId = profile.last.words?.lessonId;
  if (lastLessonId && !lessonIsComplete(profile, lastLessonId)) return lastLessonId;

  const nextWord = homeCandidates.words.find(
    (candidate) => !profile.completed.words.includes(candidate.id),
  );
  return nextWord?.lessonId ?? lastLessonId ?? homeCandidates.words[0]?.lessonId;
}

export function learnedTrackCandidates(
  profile: StudyProfile,
  track: Exclude<TrackId, "words">,
  lessonId?: string,
) {
  const learned = new Set(profile.completed.words);
  return candidatesForLesson(track, lessonId).filter((candidate) => learned.has(candidate.id));
}

export function learningTrackProgress(
  profile: StudyProfile,
  track: TrackId,
  lessonId?: string,
) {
  const candidates = track === "words"
    ? candidatesForLesson(track, lessonId)
    : learnedTrackCandidates(profile, track, lessonId);
  const completed = new Set(profile.completed[track]);
  return {
    completed: candidates.filter((candidate) => completed.has(candidate.id)).length,
    total: candidates.length,
  };
}

export function nextLearnedPracticeCandidate(
  profile: StudyProfile,
  track: Exclude<TrackId, "words">,
  lessonId?: string,
) {
  const candidates = learnedTrackCandidates(profile, track, lessonId);
  const preferred = profile.last[track];
  return candidates.find(
    (candidate) =>
      candidate.id === preferred?.characterId &&
      (!lessonId || preferred.lessonId === lessonId) &&
      !profile.completed[track].includes(candidate.id),
  ) ?? candidates.find((candidate) => !profile.completed[track].includes(candidate.id));
}

export function nextLessonActivity(
  profile: StudyProfile,
  lessonId: string,
): LearningRecommendation {
  const wordCandidates = candidatesForLesson("words", lessonId);
  const preferredWordId = profile.last.words?.lessonId === lessonId
    ? profile.last.words.characterId
    : undefined;
  const nextWord = wordCandidates.find(
    (candidate) => candidate.id === preferredWordId && !profile.completed.words.includes(candidate.id),
  ) ?? wordCandidates.find((candidate) => !profile.completed.words.includes(candidate.id));
  if (nextWord) return { track: "words", candidate: nextWord };

  return { track: null, candidate: null };
}
