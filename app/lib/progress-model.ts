export function nextCandidateId(
  candidateIds: string[],
  completedIds: string[],
  lastCandidateId?: string,
) {
  if (!candidateIds.length) return undefined;
  const lastIndex = lastCandidateId ? candidateIds.indexOf(lastCandidateId) : -1;
  if (lastIndex >= 0 && !completedIds.includes(candidateIds[lastIndex])) {
    return candidateIds[lastIndex];
  }
  const ordered = lastIndex >= 0
    ? [...candidateIds.slice(lastIndex + 1), ...candidateIds.slice(0, lastIndex + 1)]
    : candidateIds;
  return ordered.find((id) => !completedIds.includes(id)) || ordered[0];
}

export function updateCompletion(
  completedIds: string[],
  candidateId: string,
  allQuestionsCorrect: boolean,
) {
  if (allQuestionsCorrect) {
    return completedIds.includes(candidateId)
      ? completedIds
      : [...completedIds, candidateId];
  }
  return completedIds.filter((id) => id !== candidateId);
}

export function nextResumeIndex(currentIndex: number, total: number, correct: boolean) {
  if (!correct) return currentIndex;
  return Math.min(currentIndex + 1, Math.max(0, total - 1));
}

export function isQuestionSetComplete(
  questionIds: string[],
  currentQuestionId: string,
  currentCorrect: boolean,
  latestAnswers: Record<string, { lastCorrect?: boolean } | undefined>,
) {
  return questionIds.every((id) =>
    id === currentQuestionId ? currentCorrect : Boolean(latestAnswers[id]?.lastCorrect),
  );
}
