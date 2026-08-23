"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import type { CharacterItem } from "../../data/catalog-types";
import {
  expectedAnswerIds,
  getTrackExercises,
  isPracticeAnswerCorrect,
  stableOptionOrder,
} from "../../domain/practice";
import { routeForTrack } from "../../lib/app-route";
import {
  advanceResumeIndex,
  isQuestionSetComplete,
  nextCandidateId,
  nextResumeIndex,
  updateCompletion,
} from "../../lib/progress-model";
import { todayKey, type StudyProfile, type TrackId } from "../../lib/profile-model";
import { queueLearningEvent } from "../../infrastructure/browser/learning-event-outbox";
import { useStudyProfile } from "../profile/use-study-profile";
import { CelebrationOverlay, ChallengeRoom } from "./practice-session-view";

export default function PracticeSessionRoute({
  character,
  track,
  candidateIds,
  initialQuestionIndex,
}: {
  character: CharacterItem;
  track: TrackId;
  candidateIds: string[];
  initialQuestionIndex?: number;
}) {
  const { profile, setProfile, hydrated } = useStudyProfile();
  if (!hydrated) {
    return <main className="challenge-page challenge-centered" aria-busy="true"><section className="challenge-board"><h2>正在恢复学习进度…</h2></section></main>;
  }
  return (
    <HydratedPracticeSession
      character={character}
      track={track}
      candidateIds={candidateIds}
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
  initialQuestionIndex,
  profile,
  setProfile,
}: {
  character: CharacterItem;
  track: TrackId;
  candidateIds: string[];
  initialQuestionIndex?: number;
  profile: StudyProfile;
  setProfile: Dispatch<SetStateAction<StudyProfile>>;
}) {
  const router = useRouter();
  const exercises = useMemo(() => getTrackExercises(character, track), [character, track]);
  const resumedIndex = initialQuestionIndex ?? (
    profile.last[track]?.characterId === character.id
      ? profile.last[track]?.questionIndex ?? 0
      : 0
  );
  const [questionIndex, setQuestionIndex] = useState(() =>
    Math.min(Math.max(resumedIndex, 0), Math.max(0, exercises.length - 1)),
  );
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [wrote, setWrote] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);
  const [sessionResults, setSessionResults] = useState<boolean[]>([]);
  const [celebration, setCelebration] = useState(false);
  const currentQuestion = exercises[questionIndex];
  const orderedOptions = useMemo(
    () => currentQuestion && currentQuestion.kind !== "write"
      ? stableOptionOrder(currentQuestion.options, currentQuestion.id)
      : [],
    [currentQuestion],
  );

  function setStep(index: number) {
    setQuestionIndex(Math.min(Math.max(index, 0), exercises.length - 1));
    setSelectedOptions([]);
    setWrote(false);
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function chooseOption(optionId: string) {
    if (!currentQuestion || result !== null) return;
    const multiple = expectedAnswerIds(currentQuestion, character, track).length > 1;
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
    } else if (questionIndex < exercises.length - 1) {
      setStep(questionIndex + 1);
    } else {
      setCelebration(true);
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
      track,
      selectedOptions,
      wrote,
    );
    const now = new Date().toISOString();
    setResult(correct);
    setSessionResults((previous) => [...previous, correct]);
    queueLearningEvent({
      action: "answer",
      track,
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
      completed[track] = updateCompletion(
        completed[track],
        character.id,
        isQuestionSetComplete(exercises.map((exercise) => exercise.id), currentQuestion.id, correct, answers),
      );
      const date = todayKey();
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
        last: {
          ...previous.last,
          [track]: {
            lessonId: character.lessonId,
            characterId: character.id,
            questionIndex: nextResumeIndex(questionIndex, exercises.length, correct),
          },
        },
      };
    });
  }

  function skipStep() {
    if (!currentQuestion) return;
    queueLearningEvent({
      action: "skip",
      track,
      lessonId: character.lessonId,
      characterId: character.id,
      questionId: currentQuestion.id,
    });
    setProfile((previous) => {
      const date = todayKey();
      const day = previous.daily[date] ?? { attempts: 0, correct: 0, skips: 0, readSessions: 0 };
      return {
        ...previous,
        daily: { ...previous.daily, [date]: { ...day, skips: day.skips + 1 } },
        last: {
          ...previous.last,
          [track]: {
            lessonId: character.lessonId,
            characterId: character.id,
            questionIndex: advanceResumeIndex(questionIndex, exercises.length),
          },
        },
      };
    });
    if (questionIndex < exercises.length - 1) setStep(questionIndex + 1);
    else finish();
  }

  function finish() {
    router.push(routeForTrack(track, character.lessonId));
  }

  function nextCharacter() {
    const nextId = nextCandidateId(candidateIds, profile.completed[track], character.id);
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
        track={track}
        character={character}
        question={currentQuestion}
        questionIndex={questionIndex}
        total={exercises.length}
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
          total={exercises.length}
          onReplay={() => {
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
