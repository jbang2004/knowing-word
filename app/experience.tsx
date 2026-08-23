"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  CircleStop,
  CheckCircle2,
  Home as HomeIcon,
  LayoutGrid,
  LogOut,
  Map as MapIcon,
  Mic2,
  MoonStar,
  RotateCcw,
  Sparkles,
  SunMedium,
  UserRound,
  Volume2,
} from "lucide-react";
import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  characters,
  components,
  course,
  lessons,
  type CharacterItem,
  type ComponentItem,
  type LessonItem,
} from "./data/catalog";
import { lessonVisuals } from "./data/illustrations";
import {
  LESSON_THREE_ID,
  getLessonThreeKnowledge,
  qianPhoneticFamily,
} from "./data/lesson3-literacy";
import {
  isQuestionSetComplete,
  nextCandidateId,
  nextResumeIndex,
  advanceResumeIndex,
  updateCompletion,
} from "./lib/progress-model";
import {
  primaryNavigation,
  withReturnTo,
  type PrimaryNavigationId,
} from "./lib/navigation";
import {
  resolveAppRoute,
  routeForTrack,
  type AppRoute,
  type PlaygroundKind,
  type Screen,
} from "./lib/app-route";
import {
  todayKey,
  trackIds,
  type AnswerStat,
  type StudyProfile,
  type TrackId,
} from "./lib/profile-model";
import {
  useStudyProfile,
  type AccountIdentity,
  type ProfileSyncState,
} from "./features/profile/use-study-profile";
import { queueLearningEvent } from "./infrastructure/browser/learning-event-outbox";
import { speak } from "./infrastructure/browser/speech";
import {
  expectedAnswerIds as getExpectedIds,
  getTrackExercises,
  isPracticeAnswerCorrect,
  questionTypeLabel,
  stableOptionOrder,
} from "./domain/practice";
import { trackMeta } from "./domain/tracks";
import {
  CelebrationOverlay,
  ChallengeRoom,
} from "./features/practice-session/practice-session-view";
import type { LearningEventInput } from "./domain/learning-event";

const CharacterStudy = lazy(() =>
  import("./features/character-study/character-study").then((module) => ({
    default: module.CharacterStudy,
  })),
);

const allCharacters = characters as unknown as CharacterItem[];
const allComponents = components as unknown as ComponentItem[];
const lessonList = lessons as unknown as LessonItem[];
const initialLesson = lessonList[0];
const initialCharacter =
  allCharacters.find((item) => item.lessonId === initialLesson.id && item.primary) ||
  allCharacters[0];
const practiceTrackIds: Exclude<TrackId, "words">[] = ["split", "honglan", "structure"];

const courseUnits = [
  { label: "第一单元", start: 1, end: 4 },
  { label: "第二单元", start: 5, end: 8 },
  { label: "第三单元", start: 9, end: 11 },
  { label: "第四单元", start: 12, end: 14 },
  { label: "第五单元", start: 15, end: 17 },
  { label: "第六单元", start: 18, end: 20 },
  { label: "第七单元", start: 21, end: 24 },
  { label: "第八单元", start: 25, end: 26 },
];

function getLessonCharacters(lessonId: string) {
  return allCharacters.filter((item) => item.lessonId === lessonId && item.primary);
}

function getOfficialLessonCharacters(lessonId: string) {
  return getLessonCharacters(lessonId).filter((item) => item.official !== false);
}

function getExtensionLessonCharacters(lessonId: string) {
  return getLessonCharacters(lessonId).filter((item) => item.official === false);
}

function getTrackCharacters(track: TrackId, lessonId?: string) {
  return allCharacters.filter(
    (item) =>
      item.primary &&
      item.official !== false &&
      (!lessonId || item.lessonId === lessonId) &&
      getTrackExercises(item, track).length > 0,
  );
}

function getWordGroups(lessonId: string, tier: "all" | "curriculum" | "extension" = "all") {
  const map = new Map<string, CharacterItem[]>();
  const source = tier === "curriculum"
    ? getOfficialLessonCharacters(lessonId)
    : tier === "extension"
      ? getExtensionLessonCharacters(lessonId)
      : getLessonCharacters(lessonId);
  for (const item of source) {
    const key = String(item.wordPosition) + "-" + item.word;
    const existing = map.get(key) || [];
    existing.push(item);
    map.set(key, existing);
  }
  return [...map.values()];
}

function getNextCharacter(
  track: TrackId,
  profile: StudyProfile,
  lessonId?: string,
) {
  const candidates = getTrackCharacters(track, lessonId);
  if (!candidates.length) return undefined;
  const last = profile.last[track];
  const nextId = nextCandidateId(
    candidates.map((item) => item.id),
    profile.completed[track],
    last?.characterId,
  );
  return candidates.find((item) => item.id === nextId);
}

function trackProgress(profile: StudyProfile, track: TrackId, lessonId?: string) {
  const targets = getTrackCharacters(track, lessonId);
  const completed = targets.filter((item) => profile.completed[track].includes(item.id)).length;
  return { completed, total: targets.length };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function Home({ initialPath = "/" }: { initialPath?: string }) {
  const initialRoute = useMemo(() => resolveAppRoute(initialPath), [initialPath]);
  const { profile, setProfile, identity, syncState, resetProfile: clearProfile } = useStudyProfile();
  const [screen, setScreen] = useState<Screen>(initialRoute.screen);
  const [selectedLessonId, setSelectedLessonId] = useState(initialRoute.lessonId || initialLesson.id);
  const [selectedCharacterId, setSelectedCharacterId] = useState(initialRoute.characterId || initialCharacter.id);
  const [selectedTrack, setSelectedTrack] = useState<TrackId>(initialRoute.track || "words");
  const [selectedComponentId, setSelectedComponentId] = useState(
    initialRoute.componentId || allComponents[0]?.id || "",
  );
  const [componentSearch, setComponentSearch] = useState("");
  const [recordTrack, setRecordTrack] = useState<TrackId>(initialRoute.track || "words");
  const [playgroundKind, setPlaygroundKind] = useState<PlaygroundKind>(initialRoute.playground || "kit");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [wrote, setWrote] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);
  const [sessionResults, setSessionResults] = useState<boolean[]>([]);
  const [celebration, setCelebration] = useState(false);
  const [secondaryReturnPath, setSecondaryReturnPath] = useState(initialRoute.returnTo);

  const applyRoute = useCallback((route: AppRoute) => {
    setScreen(route.screen);
    setSecondaryReturnPath(
      route.screen === "components" || route.screen === "read" ? route.returnTo : undefined,
    );
    if (route.lessonId) setSelectedLessonId(route.lessonId);
    if (route.characterId) setSelectedCharacterId(route.characterId);
    if (route.componentId) setSelectedComponentId(route.componentId);
    if (route.track) {
      setSelectedTrack(route.track);
      if (route.screen === "records" || route.screen === "recordDetail") setRecordTrack(route.track);
    }
    if (route.playground) setPlaygroundKind(route.playground);
    if (route.screen === "challenge") {
      setQuestionIndex(0);
      setSelectedOptions([]);
      setWrote(false);
      setResult(null);
      setSessionResults([]);
      setCelebration(false);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const onPopState = () => applyRoute(resolveAppRoute(`${window.location.pathname}${window.location.search}`));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [applyRoute]);

  const selectedLesson =
    lessonList.find((lesson) => lesson.id === selectedLessonId) || initialLesson;
  const selectedCharacter =
    allCharacters.find((item) => item.id === selectedCharacterId) || initialCharacter;
  const selectedComponent =
    allComponents.find((item) => item.id === selectedComponentId) || allComponents[0];
  const challengeExercises = getTrackExercises(selectedCharacter, selectedTrack);
  const currentQuestion = challengeExercises[questionIndex];
  const favoriteSet = useMemo(() => new Set(profile.favorites), [profile.favorites]);
  // One deterministic display order shared by the exercise renderer and the
  // keyboard shortcuts, so pressing a key always hits the option on screen.
  const orderedOptions = useMemo(
    () =>
      currentQuestion && currentQuestion.kind !== "write"
        ? stableOptionOrder(currentQuestion.options, currentQuestion.id)
        : [],
    [currentQuestion],
  );

  useEffect(() => {
    if (screen !== "challenge" || celebration || !currentQuestion) return;
    function onKeyboardEvent(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (event.key === "Enter") {
        event.preventDefault();
        if (result === null) {
          const ready = currentQuestion.kind === "write" ? wrote : orderedOptions.length > 0 && selectedOptions.length > 0;
          if (ready) checkAnswer();
        } else {
          nextChallengeStep();
        }
        return;
      }
      if (result !== null) return;
      const keys = "123456789abcdefghijklmnopqrstuvwxyz";
      const index = keys.indexOf(event.key.toLowerCase());
      if (index >= 0 && index < orderedOptions.length) chooseOption(orderedOptions[index].id);
    }
    window.addEventListener("keydown", onKeyboardEvent);
    return () => window.removeEventListener("keydown", onKeyboardEvent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, celebration, currentQuestion, result, selectedOptions, wrote, orderedOptions]);

  useEffect(() => {
    if (screen === "home") window.location.replace("/");
  }, [screen]);

  function navigatePath(path: string, replace = false) {
    const route = resolveAppRoute(path);
    if (route.screen === "home") {
      // The path home lives at "/" as its own server-rendered route; a
      // client-side push would leave the engine showing an empty shell.
      window.location[replace ? "replace" : "assign"]("/");
      return;
    }
    window.history[replace ? "replaceState" : "pushState"]({}, "", path);
    applyRoute(route);
  }

  function navigate(next: Screen) {
    const path =
      next === "home" ? "/" :
      next === "practice" ? "/practice" :
      next === "course" ? "/lessons" :
      next === "lesson" ? `/lessons/${selectedLessonId}` :
      next === "character" ? `/lessons/${selectedLessonId}/words/${selectedCharacterId}` :
      next === "trackMap" ? routeForTrack(selectedTrack === "words" ? "split" : selectedTrack) :
      next === "trackLesson" ? routeForTrack(selectedTrack, selectedLessonId) :
      next === "challenge" ? routeForTrack(selectedTrack, selectedLessonId, selectedCharacterId) :
      next === "components" ? "/bujian" :
      next === "records" ? "/records" :
      next === "recordDetail" ? `/records/${recordTrack}/${selectedCharacterId}` :
      next === "read" ? "/read-aloud" :
      next === "playground" ? `/playground/${playgroundKind}` :
      "/account";
    navigatePath(path);
  }

  function updateProfile(updater: (previous: StudyProfile) => StudyProfile) {
    setProfile((previous) => updater(previous));
  }

  function openLesson(lessonId: string) {
    navigatePath(`/lessons/${lessonId}`);
  }

  function openCharacter(character: CharacterItem) {
    navigatePath(`/lessons/${character.lessonId}/words/${character.id}`);
  }

  function openTrackMap(track: TrackId) {
    navigatePath(routeForTrack(track));
  }

  function openTrackLesson(track: TrackId, lessonId: string) {
    navigatePath(routeForTrack(track, lessonId));
  }

  function openRecordDetail(character: CharacterItem, track: TrackId) {
    navigatePath(`/records/${track}/${character.id}`);
  }

  function openChallenge(track: TrackId, character: CharacterItem, index = 0) {
    const questions = getTrackExercises(character, track);
    if (!questions.length) return;
    navigatePath(routeForTrack(track, character.lessonId, character.id));
    setQuestionIndex(Math.min(Math.max(index, 0), questions.length - 1));
  }

  function continueTrack(track: TrackId) {
    const next = getNextCharacter(track, profile);
    if (next) openChallenge(track, next, profile.last[track]?.characterId === next.id ? profile.last[track]?.questionIndex || 0 : 0);
  }

  function toggleFavorite(characterId: string) {
    updateProfile((previous) => ({
      ...previous,
      favorites: previous.favorites.includes(characterId)
        ? previous.favorites.filter((item) => item !== characterId)
        : [...previous.favorites, characterId],
    }));
  }

  function chooseOption(optionId: string) {
    if (!currentQuestion || result !== null) return;
    const expected = getExpectedIds(currentQuestion, selectedCharacter, selectedTrack);
    const multiple = expected.length > 1;

    if (!multiple) {
      setSelectedOptions([optionId]);
      return;
    }

    setSelectedOptions((previous) =>
      previous.includes(optionId)
        ? previous.filter((item) => item !== optionId)
        : [...previous, optionId],
    );
  }

  function removePlacedOption(optionId: string) {
    if (result !== null) return;
    setSelectedOptions((previous) => previous.filter((item) => item !== optionId));
  }

  function logLearningEvent(payload: LearningEventInput) {
    queueLearningEvent(payload);
  }

  function checkAnswer() {
    if (!currentQuestion || result !== null) return;
    const correct = isPracticeAnswerCorrect(
      currentQuestion,
      selectedCharacter,
      selectedTrack,
      selectedOptions,
      wrote,
    );
    const questionIds = challengeExercises.map((item) => item.id);
    const now = new Date().toISOString();
    setResult(correct);
    setSessionResults((previous) => [...previous, correct]);
    logLearningEvent({
      action: "answer",
      track: selectedTrack,
      lessonId: selectedCharacter.lessonId,
      characterId: selectedCharacter.id,
      questionId: currentQuestion.id,
      correct,
      selected: currentQuestion.kind === "write" ? ["written"] : selectedOptions,
    });

    updateProfile((previous) => {
      const prior = previous.answers[currentQuestion.id];
      const answers = {
        ...previous.answers,
        [currentQuestion.id]: {
          attempts: (prior?.attempts || 0) + 1,
          correct: (prior?.correct || 0) + (correct ? 1 : 0),
          lastCorrect: correct,
          lastAt: now,
        },
      };
      const allCorrect = isQuestionSetComplete(
        questionIds,
        currentQuestion.id,
        correct,
        answers,
      );
      const completed = { ...previous.completed };
      completed[selectedTrack] = updateCompletion(
        completed[selectedTrack],
        selectedCharacter.id,
        allCorrect,
      );
      const date = todayKey();
      const day = previous.daily[date] || { attempts: 0, correct: 0, skips: 0, readSessions: 0 };

      return {
        ...previous,
        answers,
        completed,
        daily: {
          ...previous.daily,
          [date]: {
            ...day,
            attempts: day.attempts + 1,
            correct: day.correct + (correct ? 1 : 0),
          },
        },
        last: {
          ...previous.last,
          [selectedTrack]: {
            lessonId: selectedCharacter.lessonId,
            characterId: selectedCharacter.id,
            questionIndex: nextResumeIndex(questionIndex, challengeExercises.length, correct),
          },
        },
      };
    });
  }

  function setChallengeStep(index: number) {
    setQuestionIndex(Math.min(Math.max(index, 0), challengeExercises.length - 1));
    setSelectedOptions([]);
    setWrote(false);
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function nextChallengeStep() {
    if (!currentQuestion) return;
    if (result === false) {
      setSelectedOptions([]);
      setWrote(false);
      setResult(null);
      return;
    }

    if (questionIndex < challengeExercises.length - 1) {
      setChallengeStep(questionIndex + 1);
      return;
    }

    // Finishing the last question lands on a celebration summary instead of an
    // abrupt jump back to the map.
    setCelebration(true);
  }

  function restartChallenge() {
    setQuestionIndex(0);
    setSelectedOptions([]);
    setWrote(false);
    setResult(null);
    setSessionResults([]);
    setCelebration(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function finishChallengeCelebration() {
    setCelebration(false);
    if (selectedTrack === "words") openLesson(selectedCharacter.lessonId);
    else openTrackLesson(selectedTrack, selectedCharacter.lessonId);
  }

  function nextCharacterFromCelebration() {
    setCelebration(false);
    const candidates = getTrackCharacters(selectedTrack, selectedCharacter.lessonId);
    const nextId = nextCandidateId(
      candidates.map((item) => item.id),
      profile.completed[selectedTrack],
      selectedCharacter.id,
    );
    const next = candidates.find((item) => item.id === nextId);
    if (next && next.id !== selectedCharacter.id) openChallenge(selectedTrack, next, 0);
    else finishChallengeCelebration();
  }

  function previousChallengeStep() {
    if (questionIndex > 0) setChallengeStep(questionIndex - 1);
  }

  function skipChallengeStep() {
    if (!currentQuestion) return;
    logLearningEvent({
      action: "skip",
      track: selectedTrack,
      lessonId: selectedCharacter.lessonId,
      characterId: selectedCharacter.id,
      questionId: currentQuestion.id,
    });
    updateProfile((previous) => {
      const date = todayKey();
      const day = previous.daily[date] || { attempts: 0, correct: 0, skips: 0, readSessions: 0 };
      return {
        ...previous,
        daily: { ...previous.daily, [date]: { ...day, skips: day.skips + 1 } },
        last: {
          ...previous.last,
          [selectedTrack]: {
            lessonId: selectedCharacter.lessonId,
            characterId: selectedCharacter.id,
            questionIndex: advanceResumeIndex(questionIndex, challengeExercises.length),
          },
        },
      };
    });
    if (questionIndex < challengeExercises.length - 1) {
      setChallengeStep(questionIndex + 1);
    } else if (selectedTrack === "words") {
      openLesson(selectedCharacter.lessonId);
    } else {
      openTrackLesson(selectedTrack, selectedCharacter.lessonId);
    }
  }

  function markComponentLearned(componentId: string) {
    updateProfile((previous) => ({
      ...previous,
      learnedComponents: previous.learnedComponents.includes(componentId)
        ? previous.learnedComponents
        : [...previous.learnedComponents, componentId],
      recentComponents: [componentId, ...previous.recentComponents.filter((id) => id !== componentId)].slice(0, 24),
    }));
  }

  function resetProfile() {
    if (!window.confirm("清除你的学习足迹吗？课程内容不会受影响。")) return;
    void clearProfile();
  }

  function completeReadSession() {
    logLearningEvent({ action: "read", lessonId: selectedLessonId });
    updateProfile((previous) => {
      const date = todayKey();
      const day = previous.daily[date] || { attempts: 0, correct: 0, skips: 0, readSessions: 0 };
      return {
        ...previous,
        readSessions: previous.readSessions + 1,
        daily: { ...previous.daily, [date]: { ...day, readSessions: day.readSessions + 1 } },
      };
    });
  }

  const immersive = screen === "character";

  return (
    <main className={immersive ? "game-shell is-immersive" : "game-shell"}>
      {!immersive && (
        <TopNavigation
          active={screen}
          name={profile.name}
          onNavigate={navigate}
          onProfile={() => navigate("profile")}
        />
      )}

      {screen === "practice" && (
        <PracticeHub
          profile={profile}
          onTrack={openTrackMap}
          onLesson={openTrackLesson}
        />
      )}

      {screen === "course" && (
        <CourseMap
          profile={profile}
          onLesson={openLesson}
        />
      )}

      {screen === "lesson" && (
        <LessonWordMap
          lesson={selectedLesson}
          profile={profile}
          onBack={() => navigate("course")}
          onCharacter={openCharacter}
          onTrackLesson={openTrackLesson}
        />
      )}

      {screen === "character" && (
        <Suspense fallback={<div className="study-shell" aria-busy="true" aria-label="正在准备汉字学习画面" />}>
          <CharacterStudy
            key={selectedCharacter.id}
            character={selectedCharacter}
            profile={profile}
            favorite={favoriteSet.has(selectedCharacter.id)}
            onBack={() => openLesson(selectedCharacter.lessonId)}
            onFavorite={() => toggleFavorite(selectedCharacter.id)}
            onStart={() => openChallenge("words", selectedCharacter)}
            onReadAloud={() => navigatePath(withReturnTo(
              "/read-aloud",
              `/lessons/${selectedCharacter.lessonId}/words/${selectedCharacter.id}`,
            ))}
            onComponent={(glyph) => {
              const component = allComponents.find((item) => item.glyph === glyph);
              if (component) {
                setSelectedComponentId(component.id);
                markComponentLearned(component.id);
                navigatePath(withReturnTo(
                  "/bujian",
                  `/lessons/${selectedCharacter.lessonId}/words/${selectedCharacter.id}`,
                ));
              }
            }}
          />
        </Suspense>
      )}

      {screen === "trackMap" && (
        <TrackMap
          track={selectedTrack}
          profile={profile}
          onBack={() => navigate("practice")}
          onContinue={() => continueTrack(selectedTrack)}
          onLesson={(lessonId) => openTrackLesson(selectedTrack, lessonId)}
        />
      )}

      {screen === "trackLesson" && (
        <TrackLessonMap
          track={selectedTrack}
          lesson={selectedLesson}
          profile={profile}
          onBack={() => openTrackMap(selectedTrack)}
          onCharacter={(character) => openChallenge(selectedTrack, character)}
        />
      )}

      {screen === "challenge" && currentQuestion && (
        <ChallengeRoom
          track={selectedTrack}
          character={selectedCharacter}
          question={currentQuestion}
          questionIndex={questionIndex}
          total={challengeExercises.length}
          selected={selectedOptions}
          wrote={wrote}
          result={result}
          profile={profile}
          orderedOptions={orderedOptions}
          onBack={() =>
            selectedTrack === "words"
              ? openCharacter(selectedCharacter)
              : openTrackLesson(selectedTrack, selectedCharacter.lessonId)
          }
          onChoose={chooseOption}
          onRemove={removePlacedOption}
          onWrite={() => setWrote(true)}
          onClearWrite={() => setWrote(false)}
          onCheck={checkAnswer}
          onNext={nextChallengeStep}
          onPrevious={previousChallengeStep}
          onSkip={skipChallengeStep}
        />
      )}

      {screen === "challenge" && celebration && (
        <CelebrationOverlay
          track={selectedTrack}
          character={selectedCharacter}
          results={sessionResults}
          total={challengeExercises.length}
          onReplay={restartChallenge}
          onNextCharacter={nextCharacterFromCelebration}
          onFinish={finishChallengeCelebration}
        />
      )}

      {screen === "components" && selectedComponent && (
        <ComponentStudio
          profile={profile}
          selected={selectedComponent}
          search={componentSearch}
          onBack={() => navigatePath(secondaryReturnPath || "/practice")}
          onSearch={setComponentSearch}
          onSelect={(component) => {
            setSelectedComponentId(component.id);
            markComponentLearned(component.id);
          }}
          onCharacter={openCharacter}
        />
      )}

      {screen === "records" && (
        <LearningRecords
          profile={profile}
          track={recordTrack}
          onBack={() => navigate("home")}
          onTrack={(track) => navigatePath(`/records/${track}`)}
          onDetail={(character) => openRecordDetail(character, recordTrack)}
        />
      )}

      {screen === "recordDetail" && (
        <RecordDetail
          character={selectedCharacter}
          profile={profile}
          track={recordTrack}
          onBack={() => navigatePath(`/records/${recordTrack}`)}
          onPractice={(index) => openChallenge(recordTrack, selectedCharacter, index)}
        />
      )}

      {screen === "read" && (
        <ReadAloud
          profile={profile}
          onBack={() => navigatePath(secondaryReturnPath || "/account")}
          onSession={completeReadSession}
        />
      )}

      {screen === "profile" && (
        <ProfilePanel
          profile={profile}
          identity={identity}
          syncState={syncState}
          onName={(name) => updateProfile((previous) => ({ ...previous, name }))}
          onGrade={(grade) => updateProfile((previous) => ({ ...previous, grade }))}
          onTheme={() =>
            updateProfile((previous) => ({
              ...previous,
              theme: previous.theme === "light" ? "night" : "light",
            }))
          }
          onReset={resetProfile}
        />
      )}

      {screen === "playground" && (
        <Playground
          kind={playgroundKind}
          onBack={() => navigate("home")}
          onKind={(kind) => navigatePath(`/playground/${kind}`)}
        />
      )}
    </main>
  );
}

function TopNavigation({
  active,
  name,
  onNavigate,
  onProfile,
}: {
  active: Screen;
  name: string;
  onNavigate: (screen: Screen) => void;
  onProfile: () => void;
}) {
  const activeScreens: Record<PrimaryNavigationId, Screen[]> = {
    home: ["home"],
    course: ["course", "lesson", "character"],
    practice: ["practice", "trackMap", "trackLesson", "challenge", "components"],
    profile: ["profile", "records", "recordDetail", "read"],
  };
  const icons: Record<PrimaryNavigationId, typeof HomeIcon> = {
    home: HomeIcon,
    course: BookOpenText,
    practice: LayoutGrid,
    profile: UserRound,
  };

  return (
    <header className={`top-navigation${active === "challenge" ? " is-focus" : ""}`}>
      <button className="wordmark" onClick={() => onNavigate("home")} aria-label="回到 Knowing Word 首页">
        <span className="brand-seal" aria-hidden="true">知</span>
        <span className="wordmark-copy">
          <strong>KNOWING WORD</strong>
          <span className="wordmark-flag">从一个字，看见一方世界</span>
        </span>
      </button>
      <nav aria-label="主菜单">
        {primaryNavigation.map((item) => {
          const Icon = icons[item.id];
          return (
            <button
              className={activeScreens[item.id].includes(active) ? "is-active" : ""}
              key={item.id}
              onClick={() => onNavigate(item.id)}
            >
              <Icon aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <button className="profile-pill" onClick={onProfile} aria-label={`打开${name || "我的"}学习空间`}>
        <span>{name ? name.slice(0, 1) : "学"}</span>
        <small>{name || "学习空间"}</small>
      </button>
    </header>
  );
}

function PracticeHub({
  profile,
  onTrack,
  onLesson,
}: {
  profile: StudyProfile;
  onTrack: (track: TrackId) => void;
  onLesson: (track: TrackId, lessonId: string) => void;
}) {
  const nextWord = getNextCharacter("words", profile);
  const currentLesson = lessonList.find((lesson) => lesson.id === nextWord?.lessonId) || initialLesson;
  const lessonWordProgress = trackProgress(profile, "words", currentLesson.id);

  return (
    <div className="page practice-hub-page">
      <PageHeading
        kicker="巩固练习"
        title="同一批字，换三种眼光再看一遍"
        copy="拆字看组成，红蓝看部件分工，结构看空间站位。三种方法服务于同一个目标：离开图片后，仍然能把字想起来。"
      />

      <section className="practice-context-band" aria-label="当前课程">
        <div>
          <span>当前建议</span>
          <h2>练习第 {currentLesson.position} 课《{currentLesson.title}》</h2>
          <p>本课识字已完成 {lessonWordProgress.completed}/{lessonWordProgress.total} 个，练习会围绕同一批字展开。</p>
        </div>
        <i>{nextWord?.hanzi || "字"}</i>
      </section>

      <section className="practice-route-grid" aria-label="三种巩固方式">
        {practiceTrackIds.map((track, index) => {
          const meta = trackMeta[track];
          const lessonProgress = trackProgress(profile, track, currentLesson.id);
          const totalProgress = trackProgress(profile, track);
          return (
            <article className={`practice-route-card ${meta.tone}`} key={track}>
              <div className="practice-route-top">
                <i>{meta.glyph}</i>
                <div>
                  <p>{meta.eyebrow}</p>
                  <h2>{meta.label}</h2>
                </div>
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="practice-route-progress">
                <span>本课 {lessonProgress.completed}/{lessonProgress.total}</span>
                <span>全册 {totalProgress.completed}/{totalProgress.total}</span>
              </div>
              <div className="practice-route-actions">
                <button className="game-button primary" onClick={() => onLesson(track, currentLesson.id)}>
                  练习本课 <ArrowRight aria-hidden="true" />
                </button>
                <button className="text-button" onClick={() => onTrack(track)}>全部课程</button>
              </div>
            </article>
          );
        })}
      </section>

      <section className="practice-sequence-note">
        <span><Sparkles aria-hidden="true" /></span>
        <div><p className="kicker">建议顺序</p><h2>先拆组成，再辨功能，最后看空间。</h2></div>
        <ol><li>拆一拆</li><li>涂红蓝</li><li>认结构</li></ol>
      </section>
    </div>
  );
}

function CourseMap({
  profile,
  onLesson,
}: {
  profile: StudyProfile;
  onLesson: (lessonId: string) => void;
}) {
  return (
    <div className="page course-page">
      <PageHeading
        kicker="课程地图"
        title={course.title}
        copy="新版五年级上册共 26 课：按官方会认、会写和多音字清单学习，再用专项关卡反复巩固。"
      />
      <div className="course-units">
        {courseUnits.map((unit) => {
          const unitLessons = lessonList.filter((lesson) => lesson.position >= unit.start && lesson.position <= unit.end);
          const unitProgress = unitLessons.reduce(
            (summary, lesson) => {
              const progress = trackProgress(profile, "words", lesson.id);
              return { completed: summary.completed + progress.completed, total: summary.total + progress.total };
            },
            { completed: 0, total: 0 },
          );
          return (
            <section className="course-unit" key={unit.label}>
              <header>
                <div><span>{unit.label}</span><h2>第 {unit.start}—{unit.end} 课</h2></div>
                <p>已认识 {unitProgress.completed}/{unitProgress.total} 个字</p>
              </header>
              <div className="lesson-route">
                {unitLessons.map((lesson) => {
                  const chars = getOfficialLessonCharacters(lesson.id);
                  const extensionCount = getExtensionLessonCharacters(lesson.id).length;
                  const progress = trackProgress(profile, "words", lesson.id);
                  const illustration = lessonVisuals[lesson.id];
                  return (
                    <button className={`lesson-route-card lesson-tone-${(lesson.position - 1) % 4}${lesson.skimming ? " is-skimming" : ""}`} key={lesson.id} onClick={() => onLesson(lesson.id)}>
                      <span className="route-index">第 {lesson.position} 课{lesson.skimming ? " · 略读" : ""}</span>
                      <div className="route-scene">
                        <Image src={illustration.src} alt={illustration.alt} fill sizes="180px" />
                        <div className="route-character-cloud" aria-hidden="true">
                          {chars.slice(0, 4).map((character) => <i key={character.id}>{character.hanzi}</i>)}
                        </div>
                      </div>
                      <div className="route-copy">
                        <h2>{lesson.title}</h2>
                        <p>{chars.length} 个课内字 · 已完成 {progress.completed} 个{extensionCount ? ` · ${extensionCount} 个拓展字` : ""}</p>
                      </div>
                      <span className="route-arrow">→</span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
      <section className="course-method-card">
        <span>26</span><p>精读课分会认、会写与多音字；略读课以会认和理解为主。教材正文不复制，所有讲解和练习都经过重新组织。</p>
      </section>
    </div>
  );
}

function lessonThreeReviewState(character: CharacterItem, profile: StudyProfile) {
  const records = getTrackExercises(character, "words")
    .map((exercise) => profile.answers[exercise.id])
    .filter((record): record is AnswerStat => Boolean(record));
  if (!records.length) return { label: "未开始", due: false, tone: "new" };
  if (records.some((record) => !record.lastCorrect)) return { label: "现在复习", due: true, tone: "due" };

  const latest = records.reduce((current, record) => record.lastAt > current.lastAt ? record : current);
  const intervalDays = records.every((record) => record.attempts >= 3) ? 7 : records.every((record) => record.attempts >= 2) ? 3 : 1;
  const dueAt = new Date(latest.lastAt).getTime() + intervalDays * 86_400_000;
  if (!Number.isFinite(dueAt) || dueAt <= Date.now()) return { label: "今天复习", due: true, tone: "due" };
  const remainingDays = Math.max(1, Math.ceil((dueAt - Date.now()) / 86_400_000));
  return { label: `${remainingDays} 天后`, due: false, tone: "later" };
}

function LessonThreeMethodOverview({
  characters,
  profile,
  onCharacter,
}: {
  characters: CharacterItem[];
  profile: StudyProfile;
  onCharacter: (character: CharacterItem) => void;
}) {
  const phonosemantic = characters.filter((character) => getLessonThreeKnowledge(character.hanzi)?.method === "phonosemantic");
  const structural = characters.filter((character) => getLessonThreeKnowledge(character.hanzi)?.method === "structure");
  const reviewStates = characters.map((character) => ({ character, ...lessonThreeReviewState(character, profile) }));
  const dueCount = reviewStates.filter((item) => item.due).length;
  const startedCount = reviewStates.filter((item) => item.tone !== "new").length;
  const visibleReviewStates = [...reviewStates]
    .sort((left, right) => Number(right.due) - Number(left.due))
    .slice(0, 6);

  return (
    <section className="pilot-method-overview" aria-labelledby="pilot-method-title">
      <div className="pilot-overview-heading">
        <div>
          <p className="kicker">第三课 · 识字方法试点</p>
          <h2 id="pilot-method-title">先分方法，再使用图片</h2>
          <p>本课 11 个课内字按构形关系分组：图片只在开始时搭桥，最后必须离图认读和回忆。</p>
        </div>
        <span className="pilot-source-badge">规范字形教学拆分<br /><small>不等同历史字源</small></span>
      </div>

      <div className="pilot-method-grid">
        <article className="pilot-method-lane is-phonetic">
          <div><span>01</span><p><strong>形旁 + 声旁</strong><small>{phonosemantic.length} 个字 · 用字族迁移</small></p></div>
          <div className="pilot-character-list">
            {phonosemantic.map((character) => {
              const knowledge = getLessonThreeKnowledge(character.hanzi)!;
              return <button key={character.id} onClick={() => onCharacter(character)}><strong>{character.hanzi}</strong><small>{knowledge.equation}</small></button>;
            })}
          </div>
        </article>
        <article className="pilot-method-lane is-structure">
          <div><span>02</span><p><strong>部件 + 位置</strong><small>{structural.length} 个字 · 不强编字源</small></p></div>
          <div className="pilot-character-list">
            {structural.map((character) => {
              const knowledge = getLessonThreeKnowledge(character.hanzi)!;
              return <button key={character.id} onClick={() => onCharacter(character)}><strong>{character.hanzi}</strong><small>{knowledge.equation}</small></button>;
            })}
          </div>
        </article>
      </div>

      <div className="pilot-overview-bottom">
        <article className="pilot-family-card">
          <div><span>声旁家族</span><strong>佥</strong><small>读音只提供线索，不保证完全相同</small></div>
          <div className="pilot-family-flow">
            {qianPhoneticFamily.map((member) => (
              <span className={member.active ? "is-active" : ""} key={member.hanzi}>
                <b>{member.semantic}</b><i>+</i><b>佥</b><i>→</i><strong>{member.hanzi}</strong><small>{member.word} · {member.lesson}</small>
              </span>
            ))}
          </div>
        </article>
        <article className="pilot-review-card">
          <div><span>间隔复习</span><strong>{dueCount ? `${dueCount} 个待复习` : startedCount ? "今日已安排" : `${characters.length} 个待学习`}</strong><small>答错立即再练；答对后按 1、3、7 天拉开间隔</small></div>
          <div className="pilot-review-list">
            {visibleReviewStates.map(({ character, label, tone }) => (
              <button className={`is-${tone}`} key={character.id} onClick={() => onCharacter(character)}><b>{character.hanzi}</b><small>{label}</small></button>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function LessonWordMap({
  lesson,
  profile,
  onBack,
  onCharacter,
  onTrackLesson,
}: {
  lesson: LessonItem;
  profile: StudyProfile;
  onBack: () => void;
  onCharacter: (character: CharacterItem) => void;
  onTrackLesson: (track: TrackId, lessonId: string) => void;
}) {
  const groups = getWordGroups(lesson.id, "curriculum");
  const extensionGroups = getWordGroups(lesson.id, "extension");
  const completed = new Set(profile.completed.words);
  const progress = trackProgress(profile, "words", lesson.id);
  const illustration = lessonVisuals[lesson.id];
  const isLessonThreePilot = lesson.id === LESSON_THREE_ID;

  return (
    <div className="page lesson-page">
      <PageHeading
        kicker={"第 " + lesson.position + " 课" + (lesson.skimming ? " · 略读" : "")}
        title={lesson.title}
        copy={`${lesson.skimming ? "会认字" : "识字写字表"} · ${progress.completed} / ${progress.total} 个课内字已完成整套识字小测`}
        onBack={onBack}
      />

      <section className="lesson-scene-banner">
        <Image
          src={illustration.src}
          alt={illustration.alt}
          fill
          priority
          sizes="(max-width: 760px) 100vw, 920px"
        />
        <div>
          <span>课文场景</span>
          <strong>{lesson.title}</strong>
          <small>{lesson.context || "先进入画面，再从词语认识汉字"}</small>
        </div>
      </section>

      <section className="lesson-learning-path" aria-label={`${lesson.title}内容理解路线`}>
        <div className="learning-path-heading">
          <span>{lesson.mode || "课文理解"}</span>
          <div><strong>先读懂课文，再把字放回故事里</strong><small>{lesson.skimming ? "略读课：抓住关键变化，练习复述" : "精读课：沿内容顺序理解、识字、巩固"}</small></div>
        </div>
        <ol>
          {(lesson.learningPath || []).map((step, index) => (
            <li key={step}><i>{index + 1}</i><span>{step}</span></li>
          ))}
        </ol>
      </section>

      {isLessonThreePilot && (
        <LessonThreeMethodOverview characters={getOfficialLessonCharacters(lesson.id)} profile={profile} onCharacter={onCharacter} />
      )}

      <section className="word-map-board">
        <div className="board-title"><span>{lesson.skimming ? "课内会认字" : "课内识字写字表"}</span><i>把官方字表放回词语，区分会认、会写与多音字</i></div>
        <div className="word-groups">
          {groups.map((group) => (
            <article className="word-group" key={group[0].id}>
              <p>{group[0].word}</p>
              <div>
                {group.map((character) => (
                  <button
                    className={
                      "word-chip " +
                      (completed.has(character.id) ? "is-complete " : "") +
                      (!getTrackExercises(character, "words").length ? "is-extension" : "")
                    }
                    key={character.id}
                    onClick={() => onCharacter(character)}
                  >
                    <strong>{character.hanzi}</strong>
                    {completed.has(character.id) && <small>✓</small>}
                    {!completed.has(character.id) && <em>{character.polyphonic ? "多" : character.curriculumRole === "write" ? "写" : "认"}</em>}
                    {isLessonThreePilot && <span className="pilot-chip-method">{getLessonThreeKnowledge(character.hanzi)?.method === "phonosemantic" ? "形声" : "部件"}</span>}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {extensionGroups.length > 0 && (
        <section className="word-map-board extension-board">
          <div className="board-title"><span>课文语境拓展</span><i>保留原有深度字卡，不计入官方字表进度</i></div>
          <div className="word-groups">
            {extensionGroups.map((group) => (
              <article className="word-group" key={group[0].id}>
                <p>{group[0].word}</p>
                <div>
                  {group.map((character) => (
                    <button className="word-chip is-extension" key={character.id} onClick={() => onCharacter(character)}>
                      <strong>{character.hanzi}</strong><em>拓</em>
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="lesson-practice-strip">
        <div>
          <p className="kicker">学完词语表，再来巩固</p>
          <h2>同一批字，换三种方式练习</h2>
        </div>
        <div className="practice-strip-items">
          {(["split", "honglan", "structure"] as TrackId[]).map((track) => {
            const meta = trackMeta[track];
            const itemProgress = trackProgress(profile, track, lesson.id);
            return (
              <button className={meta.tone} key={track} onClick={() => onTrackLesson(track, lesson.id)}>
                <span>{meta.glyph}</span>
                <strong>{meta.menu}</strong>
                <small>{itemProgress.completed}/{itemProgress.total}</small>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function TrackMap({
  track,
  profile,
  onBack,
  onContinue,
  onLesson,
}: {
  track: TrackId;
  profile: StudyProfile;
  onBack: () => void;
  onContinue: () => void;
  onLesson: (lessonId: string) => void;
}) {
  const meta = trackMeta[track];
  const next = getNextCharacter(track, profile);
  const progress = trackProgress(profile, track);

  return (
    <div className={"page track-map-page " + meta.tone}>
      <PageHeading
        kicker="专项关卡"
        title={meta.label}
        copy={meta.copy}
        onBack={onBack}
      />
      <div className="track-map-layout">
        <section className="level-map">
          <div className="level-map-title">
            <h2>选择课次</h2>
            <span>共 {lessonList.length} 课 · 完成 {progress.completed} / {progress.total}</span>
          </div>
          <div className="level-list">
            {lessonList.map((lesson) => {
              const itemProgress = trackProgress(profile, track, lesson.id);
              return (
                <button key={lesson.id} onClick={() => onLesson(lesson.id)}>
                  <span className="level-number">第 {lesson.position} 课</span>
                  <strong>{lesson.title}</strong>
                  <i>{itemProgress.completed}/{itemProgress.total}</i>
                  <b><ArrowRight aria-hidden="true" /></b>
                </button>
              );
            })}
          </div>
        </section>

        <aside className="track-map-aside">
          <section className={"track-hero " + meta.tone}>
            <div className="track-symbol">{meta.glyph}</div>
            <div>
              <p>上次学到</p>
              <h2>{next ? next.hanzi + " 字" : "准备开始"}</h2>
              <span>{next ? "来自第 " + next.lessonPosition + " 课 · " + next.lessonTitle : "从第一课开始闯关"}</span>
            </div>
            <button className="game-button white" onClick={onContinue}>{meta.action} <ArrowRight aria-hidden="true" /></button>
          </section>
          <section className="track-method-card">
            <p className="kicker">这项练习在训练什么</p>
            <h2>{meta.eyebrow}</h2>
            <p>{meta.copy}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function TrackLessonMap({
  track,
  lesson,
  profile,
  onBack,
  onCharacter,
}: {
  track: TrackId;
  lesson: { id: string; title: string; position: number };
  profile: StudyProfile;
  onBack: () => void;
  onCharacter: (character: CharacterItem) => void;
}) {
  const meta = trackMeta[track];
  const chars = getTrackCharacters(track, lesson.id);
  const completed = new Set(profile.completed[track]);
  const progress = trackProgress(profile, track, lesson.id);

  return (
    <div className="page track-lesson-page">
      <PageHeading
        kicker={meta.label}
        title={lesson.title}
        copy={"选择一个字开始本关练习 · 已完成 " + progress.completed + " / " + progress.total}
        onBack={onBack}
      />
      <section className={"track-lesson-board " + meta.tone}>
        <div className="track-lesson-note">
          <span>{meta.glyph}</span>
          <p>{meta.copy}</p>
        </div>
        <div className="track-character-grid">
          {chars.map((character, index) => (
            <button
              className={completed.has(character.id) ? "is-complete" : ""}
              key={character.id}
              onClick={() => onCharacter(character)}
            >
              <small>{String(index + 1).padStart(2, "0")}</small>
              <strong>{character.hanzi}</strong>
              <i>{completed.has(character.id) ? "✓" : "开始"}</i>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function ComponentStudio({
  profile,
  selected,
  search,
  onBack,
  onSearch,
  onSelect,
  onCharacter,
}: {
  profile: StudyProfile;
  selected: ComponentItem;
  search: string;
  onBack: () => void;
  onSearch: (value: string) => void;
  onSelect: (component: ComponentItem) => void;
  onCharacter: (character: CharacterItem) => void;
}) {
  const [sortMode, setSortMode] = useState<"frequency" | "recent">("frequency");
  const useCount = useMemo(() => {
    const map = new Map<string, number>();
    allCharacters.forEach((character) =>
      character.parts.forEach((part) => map.set(part.char, (map.get(part.char) || 0) + 1)),
    );
    return map;
  }, []);
  const visible = allComponents
    .filter((component) => {
      const term = search.trim().toLocaleLowerCase();
      return !term || [component.title, component.glyph, component.examples.join(" ")].join(" ").toLocaleLowerCase().includes(term);
    })
    .sort((a, b) => {
      if (sortMode === "recent") {
        const aIndex = profile.recentComponents.indexOf(a.id);
        const bIndex = profile.recentComponents.indexOf(b.id);
        const aRank = aIndex < 0 ? Number.MAX_SAFE_INTEGER : aIndex;
        const bRank = bIndex < 0 ? Number.MAX_SAFE_INTEGER : bIndex;
        return aRank - bRank || a.sequence - b.sequence;
      }
      return (useCount.get(b.glyph) || 0) - (useCount.get(a.glyph) || 0) || a.sequence - b.sequence;
    });
  const connected = allCharacters.filter((character) => character.parts.some((part) => part.char === selected.glyph));
  const recent = allComponents.find((component) => component.id === profile.recentComponents[0]);

  return (
    <div className="page components-page">
      <PageHeading
        kicker="部件精讲"
        title="从常见部件入手，识字更轻松"
        copy="先按课内出现次数排序，再把一个部件放回真实的词语中理解。"
        onBack={onBack}
      />
      {recent && (
        <section className="component-resume">
          <span>上次学到</span><strong>{recent.glyph}</strong><p>{recent.title}</p>
          <button className="game-button ghost" onClick={() => onSelect(recent)}>继续 →</button>
        </section>
      )}
      <div className="component-layout">
        <section className="component-browser">
          <div className="component-browser-toolbar">
            <div className="component-sort-tabs">
              <button className={sortMode === "frequency" ? "is-active" : ""} onClick={() => setSortMode("frequency")}>按出现次数</button>
              <button className={sortMode === "recent" ? "is-active" : ""} onClick={() => setSortMode("recent")}>最近学习</button>
            </div>
            <label>
              <i>⌕</i>
              <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="搜部件或例字" />
            </label>
          </div>
          <div className="component-card-grid">
            {visible.map((component) => (
              <button
                className={
                  (component.id === selected.id ? "is-selected " : "") +
                  (profile.learnedComponents.includes(component.id) ? "is-learned" : "")
                }
                key={component.id}
                onClick={() => onSelect(component)}
              >
                <strong>{component.glyph}</strong>
                <span>{component.title}</span>
                <small>课内 {useCount.get(component.glyph) || 0} 次</small>
              </button>
            ))}
          </div>
        </section>

        <aside className="component-story">
          <div className="component-story-glyph">{selected.glyph}</div>
          <p className="kicker">部件精讲</p>
          <h2>{selected.title}</h2>
          <p>{selected.description}</p>
          <section>
            <span>常见例字</span>
            <div>{selected.examples.map((item) => <i key={item}>{item}</i>)}</div>
          </section>
          <section>
            <span>本册里遇见它</span>
            <div className="component-linked-list">
              {connected.length ? connected.map((character) => (
                <button key={character.id} onClick={() => onCharacter(character)}>
                  <b>{character.hanzi}</b><small>{character.word}</small>
                </button>
              )) : <p>这个部件会在后续词语里出现。</p>}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function LearningRecords({
  profile,
  track,
  onBack,
  onTrack,
  onDetail,
}: {
  profile: StudyProfile;
  track: TrackId;
  onBack: () => void;
  onTrack: (track: TrackId) => void;
  onDetail: (character: CharacterItem) => void;
}) {
  const meta = trackMeta[track];
  const trackQuestionIds = new Set(
    getTrackCharacters(track).flatMap((character) =>
      getTrackExercises(character, track).map((question) => question.id),
    ),
  );
  const allStats = Object.entries(profile.answers)
    .filter(([id]) => trackQuestionIds.has(id))
    .map(([, stat]) => stat);
  const correct = allStats.reduce((sum, item) => sum + item.correct, 0);
  const attempts = allStats.reduce((sum, item) => sum + item.attempts, 0);

  return (
    <div className="page records-page">
      <PageHeading
        kicker="学习记录"
        title="看见自己一步一步学会的过程"
        copy="每道题记录做了几次、答对几次，以及最后一次是否答对。"
        onBack={onBack}
      />
      <section className="record-stat-row">
        <div><span>已完成</span><strong>{profile.completed[track].length}</strong><small>个本关字</small></div>
        <div><span>累计作答</span><strong>{attempts}</strong><small>次</small></div>
        <div><span>答对次数</span><strong>{correct}</strong><small>次</small></div>
      </section>
      <div className="record-tabs">
        {trackIds.map((id) => (
          <button className={id === track ? "is-active" : ""} key={id} onClick={() => onTrack(id)}>
            {trackMeta[id].menu}
          </button>
        ))}
      </div>
      <section className="record-lessons">
        {lessonList.map((lesson) => {
          const chars = getTrackCharacters(track, lesson.id);
          const hasRecords = chars.some((character) =>
            getTrackExercises(character, track).some((question) => profile.answers[question.id]),
          );
          return (
            <article className="record-lesson" key={lesson.id}>
              <header>
                <div><p>第 {lesson.position} 课</p><h2>{lesson.title}</h2></div>
                <span>{trackProgress(profile, track, lesson.id).completed}/{chars.length} 已完成</span>
              </header>
              {hasRecords ? (
                <div className="record-character-list">
                  {chars.filter((character) => getTrackExercises(character, track).some((question) => profile.answers[question.id])).map((character) => (
                    <button key={character.id} onClick={() => onDetail(character)}>
                      <strong>{character.hanzi}</strong>
                      <div>
                        <b>{profile.completed[track].includes(character.id) ? "已完成" : "正在练习"}</b>
                        <span>{getTrackExercises(character, track).map((question) => {
                          const stat = profile.answers[question.id];
                          return stat ? (stat.lastCorrect ? "✓" : "·") : "○";
                        }).join(" ")}</span>
                      </div>
                      <small>查看 →</small>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="record-empty">这一课的{meta.menu}记录，会在第一次闯关后出现在这里。</div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}

function RecordDetail({
  character,
  profile,
  track,
  onBack,
  onPractice,
}: {
  character: CharacterItem;
  profile: StudyProfile;
  track: TrackId;
  onBack: () => void;
  onPractice: (index: number) => void;
}) {
  const meta = trackMeta[track];
  const exercises = getTrackExercises(character, track);
  const completed = profile.completed[track].includes(character.id);
  const correctCount = exercises.filter((question) => profile.answers[question.id]?.lastCorrect).length;

  return (
    <div className="page record-detail-page">
      <PageHeading
        kicker={meta.label + " · 学习记录"}
        title={"“" + character.hanzi + "”的闯关足迹"}
        copy={"来自第 " + character.lessonPosition + " 课《" + character.lessonTitle + "》；每一题都保留最后一次作答状态。"}
        onBack={onBack}
      />
      <section className={"record-detail-summary " + meta.tone}>
        <div className="record-detail-glyph">{character.hanzi}</div>
        <div>
          <p>{completed ? "这一关已完成" : "还差几步，就能完成这一关"}</p>
          <h2>{correctCount} / {exercises.length} 题最后一次答对</h2>
          <span>{meta.copy}</span>
        </div>
      </section>
      <section className="record-question-list">
        {exercises.map((question, index) => {
          const stat = profile.answers[question.id];
          const status = !stat ? "is-new" : stat.lastCorrect ? "is-correct" : "is-wrong";
          return (
            <article className={status} key={question.id}>
              <span className="record-question-index">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p>{questionTypeLabel(question, track)}</p>
                <h2>{question.prompt}</h2>
                {stat ? (
                  <small>
                    已作答 {stat.attempts} 次 · 答对 {stat.correct} 次 · 最后一次 {stat.lastCorrect ? "答对" : "待再试"}
                    {stat.lastAt ? " · " + formatDate(stat.lastAt) : ""}
                  </small>
                ) : (
                  <small>还没有开始这一题</small>
                )}
              </div>
              <button className="game-button ghost" onClick={() => onPractice(index)}>
                {stat?.lastCorrect ? "再练" : stat ? "继续" : "开始"}
              </button>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function ReadAloud({
  profile,
  onBack,
  onSession,
}: {
  profile: StudyProfile;
  onBack: () => void;
  onSession: () => void;
}) {
  const [lessonId, setLessonId] = useState(initialLesson.id);
  const [activeText, setActiveText] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<"idle" | "saving" | "saved" | "local">("idle");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const lesson = lessonList.find((item) => item.id === lessonId) || initialLesson;
  const sentences = [...new Set(getLessonCharacters(lesson.id).map((item) => item.originalText).filter(Boolean))].slice(0, 4);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (recordingUrl?.startsWith("blob:")) URL.revokeObjectURL(recordingUrl);
    };
  }, [recordingUrl]);

  useEffect(() => {
    let active = true;
    void fetch(`/api/recordings?lessonId=${encodeURIComponent(lessonId)}`, { cache: "no-store" })
      .then((response) => response.ok
        ? response.json() as Promise<{ recordings?: { url: string }[] }>
        : Promise.reject())
      .then((payload: { recordings?: { url: string }[] }) => {
        if (active && payload.recordings?.[0]) {
          setRecordingUrl(payload.recordings[0].url);
          setRecordingStatus("saved");
        } else if (active) {
          setRecordingUrl(null);
          setRecordingStatus("idle");
        }
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [lessonId]);

  function play(text: string) {
    setActiveText(text);
    setSpeaking(true);
    speak(text, () => setSpeaking(false));
  }

  function selectLesson(nextLessonId: string) {
    setRecordingUrl(null);
    setRecordingStatus("idle");
    setLessonId(nextLessonId);
  }

  async function toggleRecording() {
    if (recording && recorderRef.current) {
      recorderRef.current.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        const contentType = recorder.mimeType || chunksRef.current[0]?.type || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: contentType });
        if (recordingUrl?.startsWith("blob:")) URL.revokeObjectURL(recordingUrl);
        const localUrl = URL.createObjectURL(blob);
        setRecordingUrl(localUrl);
        setRecordingStatus("saving");
        setRecording(false);
        stream.getTracks().forEach((track) => track.stop());
        onSession();
        try {
          const response = await fetch(`/api/recordings?lessonId=${encodeURIComponent(lesson.id)}`, {
            method: "POST",
            headers: { "content-type": blob.type || "audio/webm" },
            body: blob,
          });
          if (!response.ok) throw new Error("save failed");
          const payload = await response.json() as { recording: { url: string } };
          URL.revokeObjectURL(localUrl);
          setRecordingUrl(payload.recording.url);
          setRecordingStatus("saved");
        } catch {
          setRecordingStatus("local");
        }
      };
      recorder.start();
      setRecording(true);
    } catch {
      window.alert("麦克风没有开启。你也可以先使用“范读”跟读。");
    }
  }

  return (
    <div className="page read-page">
      <PageHeading
        kicker="日日朗读"
        title="先听一遍，再把句子读出来"
        copy={"已完成 " + profile.readSessions + " 次朗读练习。登录状态下，录音可跨设备回听。"}
        onBack={onBack}
      />
      <div className="read-lesson-tabs">
        {lessonList.map((item) => (
          <button className={item.id === lesson.id ? "is-active" : ""} key={item.id} onClick={() => selectLesson(item.id)}>
            第 {item.position} 课 · {item.title}
          </button>
        ))}
      </div>
      <section className="read-studio">
        <div className="read-mascot">读</div>
        <div>
          <p className="kicker">跟读小任务</p>
          <h2>{lesson.title}</h2>
          <p>选择一句，先听范读，再按下录音键读一遍。</p>
        </div>
        <button className={"game-button " + (recording ? "recording" : "primary")} onClick={toggleRecording}>
          {recording ? <><CircleStop aria-hidden="true" />结束录音</> : <><Mic2 aria-hidden="true" />开始录音</>}
        </button>
      </section>
      <div className="sentence-list">
        {sentences.map((text) => (
          <article className={activeText === text ? "is-speaking" : ""} key={text}>
            <p>“{text}”</p>
            <button onClick={() => play(text)}><Volume2 aria-hidden="true" />{speaking && activeText === text ? "正在范读…" : "范读"}</button>
          </article>
        ))}
      </div>
      {recordingUrl && (
        <section className="recording-result">
          <span><CheckCircle2 aria-hidden="true" /></span>
          <div><strong>{recordingStatus === "saving" ? "正在保存录音…" : "这次朗读已经录好"}</strong><p>{recordingStatus === "saved" ? "录音已安全同步，可以稍后回来继续听。" : recordingStatus === "local" ? "当前网络不可用，录音暂存在本页。" : "你可以在这里回听。"}</p></div>
          <audio controls src={recordingUrl} />
        </section>
      )}
    </div>
  );
}

function ProfilePanel({
  profile,
  identity,
  syncState,
  onName,
  onGrade,
  onTheme,
  onReset,
}: {
  profile: StudyProfile;
  identity: AccountIdentity | null;
  syncState: ProfileSyncState;
  onName: (name: string) => void;
  onGrade: (grade: number) => void;
  onTheme: () => void;
  onReset: () => void;
}) {
  const totalCompleted = trackIds.reduce((sum, track) => sum + profile.completed[track].length, 0);
  return (
    <div className="page profile-page">
      <PageHeading
        kicker="我的账户"
        title="这是属于你的学习空间"
        copy={syncState === "synced" ? "学习进度已经安全同步，换设备后也能从上次的位置继续。" : "当前处于离线模式，恢复网络后会自动同步。"}
      />
      <section className="account-identity-card">
        <div><span>{identity?.mode === "workspace" ? "已登录账户" : "本设备学习身份"}</span><strong>{identity?.email || identity?.displayName || "小探险家"}</strong></div>
        <i className={syncState === "synced" ? "is-synced" : ""}>{syncState === "synced" ? "● 已同步" : "○ 离线"}</i>
      </section>
      <section className="profile-card">
        <div className="profile-avatar">{profile.name ? profile.name.slice(0, 1) : "学"}</div>
        <div>
          <label>学习小名<input value={profile.name} onChange={(event) => onName(event.target.value)} placeholder="给自己取一个名字" maxLength={18} /></label>
          <label>孩子年级
            <select value={profile.grade} onChange={(event) => onGrade(Number(event.target.value))}>
              {[1, 2, 3, 4, 5, 6].map((grade) => <option value={grade} key={grade}>{grade} 年级</option>)}
            </select>
          </label>
          <p>已完成 {totalCompleted} 个学习关卡 · 认识 {profile.learnedComponents.length} 个部件</p>
        </div>
      </section>
      <div className="profile-actions">
        <button onClick={onTheme}>{profile.theme === "light" ? <MoonStar aria-hidden="true" /> : <SunMedium aria-hidden="true" />}{profile.theme === "light" ? "切换夜读模式" : "切换日间模式"}</button>
        <button className="is-danger" onClick={onReset}><RotateCcw aria-hidden="true" />清除学习记录</button>
        {identity?.mode === "workspace" && <Link className="account-signout" href="/signout-with-chatgpt?return_to=%2F"><LogOut aria-hidden="true" />退出登录</Link>}
      </div>
    </div>
  );
}

const semanticRoles = [
  { token: "--action", label: "行动", use: "主按钮 · 进度 · 答对" },
  { token: "--radical", label: "表意部首", use: "四步第 2 步 · 红蓝的红" },
  { token: "--part", label: "形音部件", use: "四步第 3 步 · 红蓝的蓝" },
  { token: "--wrong", label: "再试", use: "答错 · 待复习" },
  { token: "--violet", label: "题型标签", use: "中性分类，不表对错" },
];

function Playground({
  kind,
  onBack,
  onKind,
}: {
  kind: PlaygroundKind;
  onBack: () => void;
  onKind: (kind: PlaygroundKind) => void;
}) {
  const [presses, setPresses] = useState(0);
  const [grade, setGrade] = useState("一年级");
  const [puzzle, setPuzzle] = useState<string[]>([]);
  const [quiz, setQuiz] = useState<string | null>(null);
  const labels: Record<PlaygroundKind, string> = { kit: "组件 Kit", lesson: "课程动效", puzzle: "拆字拼图", quiz: "答题反馈" };
  return (
    <div className="page playground-page">
      <PageHeading kicker="设计实验室" title={labels[kind]} copy="用于验证游戏化组件、动效、触控和学习反馈的内部体验页面。" onBack={onBack} />
      <nav className="playground-tabs" aria-label="实验页面">
        {(Object.keys(labels) as PlaygroundKind[]).map((id) => <button className={id === kind ? "is-active" : ""} key={id} onClick={() => onKind(id)}>{labels[id]}</button>)}
      </nav>
      {kind === "kit" && (
        <section className="playground-board">
          <h2>语义色 · 一个颜色一个意思</h2>
          <div className="kit-swatches">
            {semanticRoles.map((role) => (
              <div key={role.token}>
                <i style={{ background: `var(${role.token})` }} />
                <strong>{role.label}</strong>
                <small>{role.use}</small>
              </div>
            ))}
          </div>

          <h2>GameButton · 变体</h2>
          <div className="kit-buttons">
            <button className="game-button primary" onClick={() => setPresses((value) => value + 1)}>
              继续 <ArrowRight aria-hidden="true" />
            </button>
            <button className="game-button ghost">次要操作</button>
            <button className="game-button ghost" disabled>禁用</button>
          </div>
          <p>主按钮被按了 {presses} 次</p>
          <label>Selector · 年级<select value={grade} onChange={(event) => setGrade(event.target.value)}>{["一年级", "二年级", "三年级"].map((item) => <option key={item}>{item}</option>)}</select></label>
        </section>
      )}
      {kind === "lesson" && (
        <section className="playground-board lesson-demo">
          <span className="demo-sun">日</span><span className="demo-arrow">→</span><span className="demo-glyph">字</span>
          <h2>一句讲清字形，再把线索放回课文</h2>
          <p>动效遵循“出现—聚焦—连接—完成”的节奏，不让装饰抢走学习注意力。</p>
        </section>
      )}
      {kind === "puzzle" && (
        <section className="playground-board puzzle-demo">
          <h2>把“桂”字搭出来</h2>
          <div className="puzzle-slots"><span>{puzzle[0] || "?"}</span><b>＋</b><span>{puzzle[1] || "?"}</span></div>
          <div className="kit-buttons">{["木", "圭", "女", "寸"].map((part) => <button className={puzzle.includes(part) ? "is-selected" : ""} key={part} disabled={puzzle.length >= 2 && !puzzle.includes(part)} onClick={() => setPuzzle((value) => value.includes(part) ? value.filter((item) => item !== part) : [...value, part])}>{part}</button>)}</div>
          <p>{puzzle.join("") === "木圭" ? "搭对了：木表意，圭提示读音。" : "选择两个部件，顺序也很重要。"}</p>
        </section>
      )}
      {kind === "quiz" && (
        <section className="playground-board quiz-demo">
          <h2>“桂”是什么结构？</h2>
          <div className="kit-buttons">{["左右结构", "上下结构", "独体字", "半包围结构"].map((option) => <button className={quiz === option ? (option === "左右结构" ? "is-correct" : "is-wrong") : ""} key={option} onClick={() => setQuiz(option)}>{option}</button>)}</div>
          {quiz && <p>{quiz === "左右结构" ? "正确，木和圭左右站立。" : "再看看两个部件的位置。"}</p>}
        </section>
      )}
    </div>
  );
}

function PageHeading({
  kicker,
  title,
  copy,
  onBack,
}: {
  kicker: string;
  title: string;
  copy: string;
  onBack?: () => void;
}) {
  return (
    <header className={onBack ? "page-heading" : "page-heading is-root"}>
      {onBack && <button className="back-button" onClick={onBack}><ArrowLeft aria-hidden="true" />返回</button>}
      <div>
        <p className="kicker">{kicker}</p>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      <MapIcon className="page-heading-mark" aria-hidden="true" />
    </header>
  );
}
