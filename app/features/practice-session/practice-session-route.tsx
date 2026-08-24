"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import type { CharacterItem } from "../../data/catalog-types";
import {
  expectedAnswerIds,
  getPracticeSteps,
  getTrackExercises,
  isPracticeAnswerCorrect,
  stableOptionOrder,
  type PracticeMode,
} from "../../domain/practice";
import { learningDayKey } from "../../domain/learning-day";
import { learningTrackIds } from "../../domain/tracks";
import { routeForTrack } from "../../lib/app-route";
import {
  advanceResumeIndex,
  firstUnpassedQuestionIndex,
  isQuestionSetComplete,
  nextCandidateId,
  nextResumeIndex,
  updatePassedQuestionIds,
  updateCompletion,
} from "../../lib/progress-model";
import type { StudyProfile, TrackId } from "../../lib/profile-model";
import { queueLearningEvent } from "../../infrastructure/browser/learning-event-outbox";
import { useStudyProfile } from "../profile/use-study-profile";
import { CelebrationOverlay, ChallengeRoom, type PracticeMedia } from "./practice-session-view";

export default function PracticeSessionRoute({
  character,
  track,
  candidateIds,
  media,
  initialQuestionIndex,
  mode = "track",
}: {
  character: CharacterItem;
  track: TrackId;
  candidateIds: string[];
  media: PracticeMedia;
  initialQuestionIndex?: number;
  mode?: PracticeMode;
}) {
  const { profile, setProfile, hydrated } = useStudyProfile();
  if (!hydrated) {
    return <main className="challenge-page challenge-centered" aria-busy="true"><section className="challenge-board"><h2>正在恢复学习进度…</h2></section></main>;
  }
  if (track !== "words" && !profile.completed.words.includes(character.id)) {
    return (
      <main className="challenge-page challenge-centered">
        <section className="challenge-board challenge-locked">
          <span aria-hidden="true">字</span>
          <h2>先认识“{character.hanzi}”</h2>
          <p>完成这个字的单字过关后，结构、拆字和红蓝专项才会开放。</p>
          <Link className="game-button primary" href={`/lessons/${character.lessonId}/words/${character.id}`}>
            打开字卡
          </Link>
        </section>
      </main>
    );
  }
  return (
    <HydratedPracticeSession
      key={`${mode}:${track}:${character.id}:${initialQuestionIndex ?? "start"}`}
      character={character}
      track={track}
      mode={mode}
      candidateIds={track === "words"
        ? candidateIds
        : candidateIds.filter((id) => profile.completed.words.includes(id))}
      media={media}
      initialQuestionIndex={initialQuestionIndex}
      profile={profile}
      setProfile={setProfile}
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
  profile,
  setProfile,
}: {
  character: CharacterItem;
  track: TrackId;
  candidateIds: string[];
  media: PracticeMedia;
  initialQuestionIndex?: number;
  mode: PracticeMode;
  profile: StudyProfile;
  setProfile: Dispatch<SetStateAction<StudyProfile>>;
}) {
  const router = useRouter();
  const steps = useMemo(() => getPracticeSteps(character, track, mode), [character, mode, track]);
  const questionIds = useMemo(() => steps.map(({ exercise }) => exercise.id), [steps]);
  const resumedIndex = initialQuestionIndex ?? (
    mode === "mastery"
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
  const initialPassedQuestionIds = mode === "mastery"
    ? []
    : steps
        .slice(0, questionIndex)
        .map(({ exercise }) => exercise.id)
        .filter((id) => profile.answers[id]?.lastCorrect);
  const [passedQuestionIds, setPassedQuestionIds] = useState<string[]>(initialPassedQuestionIds);
  const [sessionResults, setSessionResults] = useState<boolean[]>(() =>
    Array(initialPassedQuestionIds.length).fill(true),
  );
  const [celebration, setCelebration] = useState(false);
  const currentStep = steps[questionIndex];
  const currentQuestion = currentStep?.exercise;
  const currentTrack = currentStep?.track ?? track;
  const orderedOptions = useMemo(
    () => currentQuestion && currentQuestion.kind !== "write"
      ? stableOptionOrder(currentQuestion.options, currentQuestion.id)
      : [],
    [currentQuestion],
  );

  function setStep(index: number) {
    setQuestionIndex(Math.min(Math.max(index, 0), steps.length - 1));
    setSelectedOptions([]);
    setWrote(false);
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function chooseOption(optionId: string) {
    if (!currentQuestion || result !== null) return;
    const multiple = expectedAnswerIds(currentQuestion, character, currentTrack).length > 1;
    if (!multiple) {
      setSelectedOptions([optionId]);
      return;
    }
    setSelectedOptions((previous) => previous.includes(optionId)
      ? previous.filter((id) => id !== optionId)
      : [...previous, optionId]);
  }

  function nextStep() {
    if (!currentQuestion) return;
    if (result === false) {
      setSelectedOptions([]);
      setWrote(false);
      setResult(null);
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
      else setCelebration(true);
    }
  }

  useEffect(() => {
    if (celebration || !currentQuestion) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === "Enter") {
        event.preventDefault();
        if (result === null) {
          const ready = currentQuestion.kind === "write" ? wrote : selectedOptions.length > 0;
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

  function checkAnswer() {
    if (!currentQuestion || result !== null) return;
    const correct = isPracticeAnswerCorrect(
      currentQuestion,
      character,
      currentTrack,
      selectedOptions,
      wrote,
    );
    const now = new Date().toISOString();
    const passedAfterAnswer = updatePassedQuestionIds(
      passedQuestionIds,
      currentQuestion.id,
      correct,
    );
    setResult(correct);
    setPassedQuestionIds(passedAfterAnswer);
    setSessionResults((previous) => [...previous, correct]);
    queueLearningEvent({
      action: "answer",
      track: currentTrack,
      lessonId: character.lessonId,
      characterId: character.id,
      questionId: currentQuestion.id,
      correct,
      selected: currentQuestion.kind === "write" ? ["written"] : selectedOptions,
    });

    setProfile((previous) => {
      const prior = previous.answers[currentQuestion.id];
      const answers = {
        ...previous.answers,
        [currentQuestion.id]: {
          attempts: (prior?.attempts ?? 0) + 1,
          correct: (prior?.correct ?? 0) + Number(correct),
          lastCorrect: correct,
          lastAt: now,
        },
      };
      const completed = { ...previous.completed };
      const completionTracks = mode === "mastery" ? learningTrackIds : [track];
      for (const completionTrack of completionTracks) {
        const completionQuestionIds = mode === "mastery" && completionTrack === "words"
          ? questionIds
          : getTrackExercises(character, completionTrack).map((exercise) => exercise.id);
        if (mode === "mastery") {
          if (completionQuestionIds.every((id) => passedAfterAnswer.includes(id))) {
            completed[completionTrack] = updateCompletion(
              completed[completionTrack],
              character.id,
              true,
            );
          }
        } else {
          completed[completionTrack] = updateCompletion(
            completed[completionTrack],
            character.id,
            isQuestionSetComplete(completionQuestionIds, currentQuestion.id, correct, answers),
          );
        }
      }
      const date = learningDayKey();
      const day = previous.daily[date] ?? { attempts: 0, correct: 0, skips: 0, readSessions: 0 };
      return {
        ...previous,
        answers,
        completed,
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
    if (questionIndex < steps.length - 1) setStep(questionIndex + 1);
    else finish();
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
    if (mode === "mastery" && currentTrack !== track) {
      const trackExercises = getTrackExercises(character, currentTrack);
      const trackQuestionIndex = Math.max(
        0,
        trackExercises.findIndex((exercise) => exercise.id === currentQuestion?.id),
      );
      next[currentTrack] = {
        lessonId: character.lessonId,
        characterId: character.id,
        questionIndex: resumeIndex(trackQuestionIndex, trackExercises.length),
      };
    }
    return next;
  }

  function finish() {
    router.push(track === "words"
      ? `/lessons/${character.lessonId}?view=words`
      : "/practice");
  }

  function nextCharacter() {
    const pendingIndex = firstUnpassedQuestionIndex(questionIds, passedQuestionIds);
    if (pendingIndex >= 0) {
      setCelebration(false);
      setStep(pendingIndex);
      return;
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
      router.push(routeForTrack(track, character.lessonId, nextId));
    } else {
      finish();
    }
  }

  if (!currentQuestion) {
    return (
      <main className="challenge-page challenge-centered">
        <section className="challenge-board"><h2>这个字暂时没有可用练习</h2></section>
      </main>
    );
  }

  return (
    <>
      <ChallengeRoom
        track={currentTrack}
        character={character}
        media={media}
        question={currentQuestion}
        questionIndex={questionIndex}
        total={steps.length}
        selected={selectedOptions}
        wrote={wrote}
        result={result}
        profile={profile}
        orderedOptions={orderedOptions}
        onBack={() => router.push(
          track === "words"
            ? `/lessons/${character.lessonId}/words/${character.id}`
            : routeForTrack(track, character.lessonId),
        )}
        onChoose={chooseOption}
        onRemove={(id) => result === null && setSelectedOptions((items) => items.filter((item) => item !== id))}
        onWrite={() => setWrote(true)}
        onClearWrite={() => setWrote(false)}
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
          sessionLabel={mode === "mastery" ? "单字过关" : undefined}
          onReplay={() => {
            setPassedQuestionIds([]);
            setSessionResults([]);
            setCelebration(false);
            setStep(0);
          }}
          onNextCharacter={nextCharacter}
          onFinish={finish}
        />
      )}
    </>
  );
}
