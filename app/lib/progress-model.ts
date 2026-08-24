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

// A resume point may sit after another unfinished item (for example after a
// direct lesson visit). Resolve the preferred item once, rather than deciding
// independently inside the render loop, so a path can never expose two
// "current" nodes.
export function candidatePathStates(
  candidateIds: string[],
  completedIds: string[],
  preferredCandidateId?: string,
): Record<string, CandidatePathState> {
  const completed = new Set(completedIds);
  const preferredIndex = preferredCandidateId
    ? candidateIds.findIndex((id) => id === preferredCandidateId && !completed.has(id))
    : -1;
  const currentIndex = preferredIndex >= 0
    ? preferredIndex
    : candidateIds.findIndex((id) => !completed.has(id));

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
  return completedIds.filter((id) => id !== candidateId);
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

export function firstIncompleteQuestionIndex(
  questionIds: string[],
  answers: Record<string, { lastCorrect?: boolean } | undefined>,
) {
  const index = questionIds.findIndex((id) => !answers[id]?.lastCorrect);
  // A completed set starts from the beginning when the learner chooses to
  // practise again; it must not reopen on the final question forever.
  return index >= 0 ? index : 0;
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
