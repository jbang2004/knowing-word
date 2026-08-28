"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { CharacterItem } from "../../data/catalog-types";
import {
  getPracticeCandidates,
  getPracticeSteps,
  getTrackExercises,
  isPracticeAnswerCorrect,
  practiceAnswerMode,
  practiceCueLevel,
  practiceDimension,
  practiceErrorTags,
  selectDueReviewSteps,
  selectRemediationStep,
  stableOptionOrder,
  updatePracticeSelection,
  writingAssessmentErrorTags,
  type PracticeMode,
  type PracticeStep,
  type WritingPhase,
  type WritingSelfAssessment,
} from "../../domain/practice";
import { buildDailyLearningPlan } from "../../domain/daily-plan";
import { learningDayKey } from "../../domain/learning-day";
import type { ErrorTag, LearningAttempt } from "../../domain/learning-state";
import { nextDueDimensions, scheduleReviewEvidence } from "../../domain/review-scheduler";
import { routeForTrack } from "../../lib/app-route";
import { withReturnTo } from "../../lib/navigation";
import {
  advanceResumeIndex,
  firstUnpassedQuestionIndex,
  nextCandidateId,
  nextResumeIndex,
  updatePassedQuestionIds,
  updateCompletion,
} from "../../lib/progress-model";
import {
  characterMemoryFromProfile,
  recordAnswerAttempt,
  type StudyProfile,
  type TrackId,
} from "../../lib/profile-model";
import { pulseHaptic } from "../../infrastructure/browser/haptics";
import { playLearningSound } from "../../infrastructure/browser/learning-audio";
import { queueLearningEvent } from "../../infrastructure/browser/learning-event-outbox";
import { getProfileActorId } from "../../infrastructure/browser/profile-actor";
import { useStudyProfile } from "../profile/use-study-profile";
import { CelebrationOverlay, ChallengeRoom, type PracticeMedia } from "./practice-session-view";

export type PracticeReviewMode = "due";

function dueReviewRoute(lessonId: string, characterId: string) {
  return `${routeForTrack("words", lessonId, characterId)}?review=due`;
}

export default function PracticeSessionRoute({
  character,
  track,
  candidateIds,
  media,
  initialQuestionIndex,
  mode = "track",
  review,
  returnTo,
}: {
  character: CharacterItem;
  track: TrackId;
  candidateIds: string[];
  media: PracticeMedia;
  initialQuestionIndex?: number;
  mode?: PracticeMode;
  review?: PracticeReviewMode;
  returnTo?: string;
}) {
  const { profile, setProfile, hydrated } = useStudyProfile();
  if (!hydrated) {
    return <main className="challenge-page challenge-centered" aria-busy="true"><section className="challenge-board"><h1>正在恢复学习进度…</h1></section></main>;
  }
  if (track !== "words" && !profile.completed.words.includes(character.id)) {
    return (
      <main className="challenge-page challenge-centered">
        <section className="challenge-board challenge-locked">
          <span aria-hidden="true">字</span>
          <h1>先认识“{character.hanzi}”</h1>
          <p>完成这个字的单字过关后，结构、拆字和红蓝专项才会开放。</p>
          <Link
            className="game-button primary"
            href={withReturnTo(
              `/lessons/${character.lessonId}/words/${character.id}`,
              returnTo ?? routeForTrack(track, character.lessonId),
            )}
          >
            打开字卡
          </Link>
        </section>
      </main>
    );
  }
  return (
    <HydratedPracticeSession
      key={`${mode}:${track}:${review ?? "regular"}:${character.id}:${initialQuestionIndex ?? "start"}`}
      character={character}
      track={track}
      mode={mode}
      review={review}
      candidateIds={track === "words"
        ? candidateIds
        : candidateIds.filter((id) => profile.completed.words.includes(id))}
      media={media}
      initialQuestionIndex={initialQuestionIndex}
      profile={profile}
      setProfile={setProfile}
      returnTo={returnTo}
    />
  );
}

function HydratedPracticeSession({
  character,
  track,
  candidateIds,
  media,
  initialQuestionIndex,
  mode,
  review,
  profile,
  setProfile,
  returnTo,
}: {
  character: CharacterItem;
  track: TrackId;
  candidateIds: string[];
  media: PracticeMedia;
  initialQuestionIndex?: number;
  mode: PracticeMode;
  review?: PracticeReviewMode;
  profile: StudyProfile;
  setProfile: Dispatch<SetStateAction<StudyProfile>>;
  returnTo?: string;
}) {
  const router = useRouter();
  const [actorId] = useState(getProfileActorId);
  const [initiallyCompleted] = useState(() => profile.completed.words.includes(character.id));
  // Freeze the dimensions that were due when this round opened. Correct
  // answers reschedule memory immediately; recomputing against the live
  // profile would otherwise remove the current step halfway through a round.
  const [reviewDimensions] = useState(() => review === "due"
    ? nextDueDimensions(characterMemoryFromProfile(profile, character.id), new Date())
    : []);
  const steps = useMemo(() => {
    const available = getPracticeSteps(character, track, mode);
    return review === "due"
      ? selectDueReviewSteps(available, reviewDimensions)
      : available;
  }, [character, mode, review, reviewDimensions, track]);
  const remediationCandidates = useMemo(
    () => getPracticeCandidates(character, track, mode),
    [character, mode, track],
  );
  const questionIds = useMemo(() => steps.map(({ exercise }) => exercise.id), [steps]);
  const resumedIndex = initialQuestionIndex ?? (
    mode === "mastery" || review === "due"
      ? 0
      : profile.last[track]?.characterId === character.id
      ? profile.last[track]?.questionIndex ?? 0
      : 0
  );
  const [questionIndex, setQuestionIndex] = useState(() =>
    Math.min(Math.max(resumedIndex, 0), Math.max(0, steps.length - 1)),
  );
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [wrote, setWrote] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);
  const [writingPhase, setWritingPhase] = useState<WritingPhase>("draft");
  const [writingRevision, setWritingRevision] = useState(0);
  const [writingRevealCount, setWritingRevealCount] = useState(0);
  const [cueFloor, setCueFloor] = useState<0 | 1 | 2 | 3>(0);
  const [sessionSalt, setSessionSalt] = useState(() =>
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
  );
  const attemptStartedAt = useRef(Date.now());
  const initialPassedQuestionIds = mode === "mastery" || review === "due"
    ? []
    : steps
        .slice(0, questionIndex)
        .map(({ exercise }) => exercise.id)
        .filter((id) => profile.answers[id]?.lastCorrect);
  const [passedQuestionIds, setPassedQuestionIds] = useState<string[]>(initialPassedQuestionIds);
  const [sessionResults, setSessionResults] = useState<boolean[]>(() =>
    Array(initialPassedQuestionIds.length).fill(true),
  );
  // A run of correct answers inside this sitting. Seeded at zero rather than
  // from resumed results, so reopening a half-done round never opens on a
  // streak the learner did not just earn.
  const [streak, setStreak] = useState(0);
  const [celebration, setCelebration] = useState(false);
  const [reviewFinished, setReviewFinished] = useState(false);
  const [activeRemediation, setActiveRemediation] = useState<PracticeStep | null>(null);
  const [queuedRemediation, setQueuedRemediation] = useState<PracticeStep | null>(null);
  const currentStep = activeRemediation ?? steps[questionIndex];
  const currentQuestion = currentStep?.exercise;
  const currentTrack = currentStep?.track ?? track;
  const orderedOptions = useMemo(
    () => currentQuestion && currentQuestion.kind !== "write"
      ? stableOptionOrder(currentQuestion.options, `${currentQuestion.id}:${sessionSalt}`)
      : [],
    [currentQuestion, sessionSalt],
  );

  function setStep(index: number) {
    setActiveRemediation(null);
    setQueuedRemediation(null);
    setQuestionIndex(Math.min(Math.max(index, 0), steps.length - 1));
    setSelectedOptions([]);
    setWrote(false);
    setResult(null);
    setWritingPhase("draft");
    setWritingRevealCount(0);
    setCueFloor(0);
    setWritingRevision((previous) => previous + 1);
    attemptStartedAt.current = Date.now();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function chooseOption(optionId: string) {
    if (!currentQuestion || result !== null) return;
    setSelectedOptions((previous) => updatePracticeSelection(
      currentQuestion,
      character,
      currentTrack,
      previous,
      optionId,
    ));
  }

  function nextStep() {
    if (!currentQuestion) return;
    if (result === false) {
      if (queuedRemediation && queuedRemediation.exercise.id !== currentQuestion.id) {
        setActiveRemediation(queuedRemediation);
        setQueuedRemediation(null);
        setSelectedOptions([]);
        setWrote(false);
        setResult(null);
        setWritingPhase("draft");
        setWritingRevealCount(0);
        setCueFloor(0);
        setWritingRevision((previous) => previous + 1);
        attemptStartedAt.current = Date.now();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setSelectedOptions([]);
      setWrote(false);
      setResult(null);
      setCueFloor(2);
      attemptStartedAt.current = Date.now();
    } else if (activeRemediation) {
      // The targeted activity repairs the diagnosed dimension; now return to
      // the failed retrieval item for a prompted confirmation.
      setActiveRemediation(null);
      setQueuedRemediation(null);
      setSelectedOptions([]);
      setWrote(false);
      setResult(null);
      setWritingPhase("draft");
      setWritingRevealCount(0);
      setCueFloor(2);
      setWritingRevision((previous) => previous + 1);
      attemptStartedAt.current = Date.now();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (questionIndex < steps.length - 1) {
      setStep(questionIndex + 1);
    } else {
      const passedAfterCurrent = updatePassedQuestionIds(
        passedQuestionIds,
        currentQuestion.id,
        result === true,
      );
      const pendingIndex = firstUnpassedQuestionIndex(questionIds, passedAfterCurrent);
      if (pendingIndex >= 0) setStep(pendingIndex);
      else {
        playLearningSound("complete");
        setCelebration(true);
      }
    }
  }

  useEffect(() => {
    if (celebration || !currentQuestion) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === "Enter") {
        event.preventDefault();
        if (result === null) {
          const ready = currentQuestion.kind === "write"
            ? wrote && writingPhase !== "review"
            : selectedOptions.length > 0;
          if (ready) checkAnswer();
        } else {
          nextStep();
        }
        return;
      }
      if (result !== null) return;
      const letterIndex = "abcdefgh".indexOf(event.key.toLowerCase());
      const numberIndex = "12345678".indexOf(event.key);
      const index = letterIndex >= 0 ? letterIndex : numberIndex;
      if (index >= 0 && index < orderedOptions.length) chooseOption(orderedOptions[index].id);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function recordAnswer({
    correct,
    errorTags,
    cueLevel,
    answerMode,
    recordedSelection,
    showResult = true,
  }: {
    correct: boolean;
    errorTags: ErrorTag[];
    cueLevel: 0 | 1 | 2 | 3;
    answerMode?: LearningAttempt["answerMode"];
    recordedSelection?: string[];
    showResult?: boolean;
  }) {
    if (!currentQuestion) return;
    const resolvedAnswerMode = answerMode ?? practiceAnswerMode(currentQuestion);
    const nextStreak = correct ? streak + 1 : 0;
    setStreak(nextStreak);
    // `>= 3` rather than the old `=== 2`, which fired the streak sound on the
    // third correct answer and then never again for the rest of the run.
    playLearningSound(correct
      ? nextStreak >= 3 ? "streak" : "correct"
      : "retry");
    pulseHaptic(correct ? "success" : "retry");
    const now = new Date().toISOString();
    const attempt: LearningAttempt = {
      characterId: character.id,
      questionId: currentQuestion.id,
      dimension: practiceDimension(currentQuestion, currentTrack),
      cueLevel,
      answerMode: resolvedAnswerMode,
      correct,
      latencyMs: Math.max(0, Date.now() - attemptStartedAt.current),
      errorTags,
      occurredAt: now,
    };
    const passedAfterAnswer = activeRemediation
      ? passedQuestionIds
      : updatePassedQuestionIds(
          passedQuestionIds,
          currentQuestion.id,
          correct,
        );
    const remediation = correct
      ? null
      : selectRemediationStep(
          remediationCandidates,
          errorTags,
          currentQuestion.id,
        );
    setQueuedRemediation(remediation?.step ?? null);
    if (showResult) setResult(correct);
    setPassedQuestionIds(passedAfterAnswer);
    setSessionResults((previous) => [...previous, correct]);
    queueLearningEvent({
      action: "answer",
      track: currentTrack,
      lessonId: character.lessonId,
      characterId: character.id,
      questionId: currentQuestion.id,
      correct,
      selected: recordedSelection ?? (
        currentQuestion.kind === "write" ? ["written"] : selectedOptions
      ),
      dimension: attempt.dimension,
      cueLevel: attempt.cueLevel,
      answerMode: attempt.answerMode,
      latencyMs: attempt.latencyMs,
      errorTags: attempt.errorTags,
    });

    setProfile((previous) => {
      const prior = previous.answers[currentQuestion.id];
      const priorMemory = characterMemoryFromProfile(previous, character.id);
      const storedMemory = previous.memory[character.id] ?? {};
      const errorCounts = { ...previous.errorCounts };
      for (const tag of errorTags) errorCounts[tag] = (errorCounts[tag] ?? 0) + 1;
      const answers = {
        ...previous.answers,
        [currentQuestion.id]: recordAnswerAttempt(prior, actorId, {
          lastCorrect: correct,
          lastAt: now,
          lastLatencyMs: attempt.latencyMs,
          lastCueLevel: cueLevel,
          lastErrorTags: errorTags,
          correctAnswer: correct,
        }),
      };
      const completed = { ...previous.completed };
      const completionTrack = mode === "mastery" ? "words" : track;
      const wasCompleted = previous.completed[completionTrack].includes(character.id);
      const completionQuestionIds = mode === "mastery"
        ? questionIds
        : getTrackExercises(character, completionTrack).map((exercise) => exercise.id);
      const roundCompleted = completionQuestionIds.length > 0 &&
        completionQuestionIds.every((id) => passedAfterAnswer.includes(id));
      if (roundCompleted) {
        completed[completionTrack] = updateCompletion(
          completed[completionTrack],
          character.id,
          true,
        );
      }
      const date = learningDayKey();
      const day = previous.daily[date] ?? { attempts: 0, correct: 0, skips: 0, readSessions: 0 };
      return {
        ...previous,
        answers,
        completed,
        memory: {
          ...previous.memory,
          [character.id]: {
            ...storedMemory,
            ...scheduleReviewEvidence(priorMemory, attempt),
          },
        },
        errorCounts,
        introducedByDay: completionTrack === "words" &&
          !wasCompleted &&
          completed.words.includes(character.id)
          ? {
              ...previous.introducedByDay,
              [date]: [...new Set([
                ...(previous.introducedByDay[date] ?? []),
                character.id,
              ])],
            }
          : previous.introducedByDay,
        reviewedByDay: review === "due" && roundCompleted
          ? {
              ...previous.reviewedByDay,
              [date]: [...new Set([
                ...(previous.reviewedByDay[date] ?? []),
                character.id,
              ])],
            }
          : previous.reviewedByDay,
        daily: {
          ...previous.daily,
          [date]: {
            ...day,
            attempts: day.attempts + 1,
            correct: day.correct + Number(correct),
          },
        },
        last: updateResumePoints(previous.last, correct),
      };
    });
  }

  function checkAnswer() {
    if (!currentQuestion || result !== null) return;
    if (currentQuestion.kind === "write") {
      if (!wrote || writingPhase === "review") return;
      setWritingPhase("review");
      setWritingRevealCount((previous) => previous + 1);
      return;
    }
    const correct = isPracticeAnswerCorrect(
      currentQuestion,
      character,
      currentTrack,
      selectedOptions,
      wrote,
    );
    recordAnswer({
      correct,
      errorTags: correct ? [] : practiceErrorTags(currentQuestion, currentTrack, selectedOptions),
      cueLevel: practiceCueLevel(currentQuestion, cueFloor >= 2),
    });
  }

  function assessWriting(assessment: WritingSelfAssessment) {
    if (!currentQuestion || currentQuestion.kind !== "write" || writingPhase !== "review") return;
    const correct = isPracticeAnswerCorrect(
      currentQuestion,
      character,
      currentTrack,
      selectedOptions,
      wrote,
      assessment,
    );
    const errorTags = writingAssessmentErrorTags(assessment);
    const cueLevel = practiceCueLevel(currentQuestion, writingRevealCount > 1);
    recordAnswer({
      correct,
      errorTags,
      cueLevel,
      answerMode: "self-check",
      recordedSelection: [assessment],
      showResult: correct,
    });
    if (correct) return;
    setWritingPhase("rewrite");
    setWrote(false);
    setWritingRevision((previous) => previous + 1);
    attemptStartedAt.current = Date.now();
  }

  function skipStep() {
    if (!currentQuestion) return;
    queueLearningEvent({
      action: "skip",
      track: currentTrack,
      lessonId: character.lessonId,
      characterId: character.id,
      questionId: currentQuestion.id,
    });
    setProfile((previous) => {
      const date = learningDayKey();
      const day = previous.daily[date] ?? { attempts: 0, correct: 0, skips: 0, readSessions: 0 };
      return {
        ...previous,
        daily: { ...previous.daily, [date]: { ...day, skips: day.skips + 1 } },
        last: updateResumePoints(previous.last),
      };
    });
    setStep(questionIndex < steps.length - 1 ? questionIndex + 1 : 0);
  }

  function updateResumePoints(
    previous: StudyProfile["last"],
    correct?: boolean,
  ): StudyProfile["last"] {
    const resumeIndex = (index: number, total: number) => correct === undefined
      ? advanceResumeIndex(index, total)
      : nextResumeIndex(index, total, correct);
    const next = {
      ...previous,
      [track]: {
        lessonId: character.lessonId,
        characterId: character.id,
        questionIndex: resumeIndex(questionIndex, steps.length),
      },
    };
    return next;
  }

  function finish() {
    router.push(review === "due" ? "/" : returnTo ?? (track === "words"
      ? `/lessons/${character.lessonId}?view=words`
      : "/practice"));
  }

  function nextCharacter() {
    const pendingIndex = firstUnpassedQuestionIndex(questionIds, passedQuestionIds);
    if (pendingIndex >= 0) {
      setCelebration(false);
      setStep(pendingIndex);
      return;
    }
    if (review === "due") {
      const nextReview = buildDailyLearningPlan(profile, new Date(), {
        reviewLimit: 10,
        newLimit: 0,
      }).reviews.find((item) => item.candidate.id !== character.id);
      if (nextReview) {
        playLearningSound("encourage");
        router.push(dueReviewRoute(
          nextReview.candidate.lessonId,
          nextReview.candidate.id,
        ));
      } else {
        setCelebration(false);
        setReviewFinished(true);
      }
      return;
    }
    if (track === "words" && mode === "mastery" && !initiallyCompleted) {
      const introducedToday = new Set(
        profile.introducedByDay[learningDayKey()] ?? [],
      );
      introducedToday.add(character.id);
      if (introducedToday.size >= 5) {
        finish();
        return;
      }
    }
    const completedAfterThisRound = profile.completed[track].includes(character.id)
      ? profile.completed[track]
      : [...profile.completed[track], character.id];
    if (!candidateIds.some((id) => !completedAfterThisRound.includes(id))) {
      finish();
      return;
    }
    const nextId = nextCandidateId(candidateIds, completedAfterThisRound, character.id);
    if (nextId && nextId !== character.id) {
      playLearningSound("encourage");
      const destination = routeForTrack(track, character.lessonId, nextId);
      router.push(returnTo ? withReturnTo(destination, returnTo) : destination);
    } else {
      finish();
    }
  }

  const nextDueReview = review === "due"
    ? buildDailyLearningPlan(profile, new Date(), {
        reviewLimit: 10,
        newLimit: 0,
      }).reviews.find((item) => item.candidate.id !== character.id)
    : undefined;

  if (reviewFinished) {
    return (
      <main className="challenge-page challenge-centered">
        <section className="challenge-board challenge-locked">
          <span aria-hidden="true">✓</span>
          <h1>今天的到期复习完成了</h1>
          <p>旧字已经按计划独立回想，可以安心开始今天的新字。</p>
          <Link className="game-button primary" href="/">返回学习首页</Link>
        </section>
      </main>
    );
  }

  if (!currentQuestion) {
    if (review === "due") {
      const unmatched = reviewDimensions.length > 0;
      return (
        <main className="challenge-page challenge-centered">
          <section className="challenge-board challenge-locked">
            <span aria-hidden="true">{nextDueReview ? "复" : "✓"}</span>
            <h1>{unmatched
              ? "这个字暂无可用的到期复习题"
              : "这个字今天不需要再复习"}</h1>
            <p>{nextDueReview
              ? "复习队列已经更新，继续下一个到期的旧字。"
              : unmatched
                ? "到期记录仍会保留，请先返回首页。"
                : "今天的到期任务已经全部完成。"}</p>
            {nextDueReview ? (
              <Link
                className="game-button primary"
                href={dueReviewRoute(
                  nextDueReview.candidate.lessonId,
                  nextDueReview.candidate.id,
                )}
              >
                继续下一个到期字
              </Link>
            ) : (
              <Link className="game-button primary" href="/">返回学习首页</Link>
            )}
          </section>
        </main>
      );
    }
    return (
      <main className="challenge-page challenge-centered">
        <section className="challenge-board"><h1>这个字暂时没有可用练习</h1></section>
      </main>
    );
  }

  const completedForNext = profile.completed[track].includes(character.id)
    ? profile.completed[track]
    : [...profile.completed[track], character.id];
  const hasNextCandidate = review === "due"
    ? Boolean(nextDueReview)
    : candidateIds.some((id) => !completedForNext.includes(id));
  const nextLabel = review === "due"
    ? hasNextCandidate ? "继续 · 下一个到期字" : "查看今日完成状态"
    : hasNextCandidate
      ? "继续 · 下一个字"
      : track === "words" ? "完成本课" : "完成本项复习";
  const finishLabel = review === "due"
    ? "返回学习首页"
    : returnTo
    ? "返回上一页"
    : track === "words" ? "返回本课生字表" : "返回练习";

  return (
    <>
      <ChallengeRoom
        track={currentTrack}
        character={character}
        media={media}
        question={currentQuestion}
        questionIndex={questionIndex}
        total={steps.length}
        streak={streak}
        selected={selectedOptions}
        wrote={wrote}
        result={result}
        writingPhase={writingPhase}
        writingRevision={writingRevision}
        profile={profile}
        orderedOptions={orderedOptions}
        onBack={() => router.push(
          review === "due"
            ? "/"
            : track === "words"
            ? withReturnTo(
                `/lessons/${character.lessonId}/words/${character.id}`,
                returnTo ?? `/lessons/${character.lessonId}?view=words`,
              )
            : returnTo ?? routeForTrack(track, character.lessonId),
        )}
        onChoose={chooseOption}
        onRemove={(_id, index) => result === null && setSelectedOptions((items) =>
          items.filter((_, itemIndex) => itemIndex !== index)
        )}
        onWrite={() => setWrote(true)}
        onClearWrite={() => setWrote(false)}
        onAssessWriting={assessWriting}
        onCheck={checkAnswer}
        onNext={nextStep}
        onPrevious={() => questionIndex > 0 && setStep(questionIndex - 1)}
        onSkip={skipStep}
      />
      {celebration && (
        <CelebrationOverlay
          track={track}
          character={character}
          results={sessionResults}
          total={steps.length}
          sessionLabel={review === "due"
            ? "到期复习"
            : mode === "mastery" ? "单字过关" : undefined}
          onReplay={() => {
            playLearningSound("start");
            setPassedQuestionIds([]);
            setSessionResults([]);
            setStreak(0);
            setSessionSalt(globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);
            setCelebration(false);
            setStep(0);
          }}
          onNextCharacter={nextCharacter}
          onFinish={finish}
          nextLabel={nextLabel}
          finishLabel={finishLabel}
        />
      )}
    </>
  );
}
