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

export type CandidatePathState = "done" | "current" | "locked";

export function candidatePathStates(
  candidateIds: string[],
  completedIds: string[],
): Record<string, CandidatePathState> {
  const completed = new Set(completedIds);
  // The path is an authored sequence, not recent-history navigation. Always
  // unlock the first gap; question-level resume state is handled inside that
  // character's practice route.
  const currentIndex = candidateIds.findIndex((id) => !completed.has(id));

  return Object.fromEntries(candidateIds.map((id, index) => [
    id,
    completed.has(id) ? "done" : index === currentIndex ? "current" : "locked",
  ]));
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
  return completedIds;
}

export function nextResumeIndex(currentIndex: number, total: number, correct: boolean) {
  if (!correct) return currentIndex;
  return Math.min(currentIndex + 1, Math.max(0, total - 1));
}

// Advancing past a question without grading it (skip) still moves the resume
// point forward; keep the single source of this rule next to nextResumeIndex.
export function advanceResumeIndex(currentIndex: number, total: number) {
  return Math.min(currentIndex + 1, Math.max(0, total - 1));
}

export function firstUnpassedQuestionIndex(
  questionIds: string[],
  passedQuestionIds: string[],
) {
  const passed = new Set(passedQuestionIds);
  return questionIds.findIndex((id) => !passed.has(id));
}

export function updatePassedQuestionIds(
  passedQuestionIds: string[],
  questionId: string,
  correct: boolean,
) {
  if (correct) {
    return passedQuestionIds.includes(questionId)
      ? passedQuestionIds
      : [...passedQuestionIds, questionId];
  }
  return passedQuestionIds.filter((id) => id !== questionId);
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
