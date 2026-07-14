"use client";

import Image from "next/image";
import {
  type PointerEvent as ReactPointerEvent,
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
  type Exercise,
} from "./data/catalog";

type Screen =
  | "home"
  | "course"
  | "lesson"
  | "character"
  | "trackMap"
  | "trackLesson"
  | "challenge"
  | "components"
  | "records"
  | "recordDetail"
  | "read"
  | "profile";

type TrackId = "words" | "split" | "honglan" | "structure";

type AnswerStat = {
  attempts: number;
  correct: number;
  lastCorrect: boolean;
  lastAt: string;
};

type ResumePoint = {
  lessonId: string;
  characterId: string;
  questionIndex: number;
};

type StudyProfile = {
  version: 2;
  name: string;
  theme: "light" | "night";
  favorites: string[];
  completed: Record<TrackId, string[]>;
  last: Record<TrackId, ResumePoint | null>;
  answers: Record<string, AnswerStat>;
  learnedComponents: string[];
  readSessions: number;
};

type TrackMeta = {
  id: TrackId;
  label: string;
  menu: string;
  eyebrow: string;
  copy: string;
  action: string;
  origin: string;
  glyph: string;
  tone: string;
};

const allCharacters = characters as unknown as CharacterItem[];
const allComponents = components as unknown as ComponentItem[];
const lessonList = lessons as unknown as { id: string; title: string; position: number }[];
const initialLesson = lessonList[0];
const initialCharacter =
  allCharacters.find((item) => item.lessonId === initialLesson.id && item.primary) ||
  allCharacters[0];
const trackIds: TrackId[] = ["words", "split", "honglan", "structure"];
const STORAGE_KEY = "knowing-word:course-progress:v2";
const LEGACY_STORAGE_KEY = "knowing-word:local-profile:v1";

const trackMeta: Record<TrackId, TrackMeta> = {
  words: {
    id: "words",
    label: "词语表与写字表",
    menu: "识字",
    eyebrow: "理解字义，认识字形",
    copy: "从课文词语出发，先听故事、看字形，再完成一套由浅入深的小测。",
    action: "继续识字",
    origin: "识字小测",
    glyph: "字",
    tone: "coral",
  },
  split: {
    id: "split",
    label: "课后练习",
    menu: "拆字",
    eyebrow: "拆一拆，再写一写",
    copy: "把汉字拆成部首和部件，自己搭回去，再落笔写完整的字。",
    action: "继续拆字",
    origin: "拆一拆",
    glyph: "拆",
    tone: "saffron",
  },
  honglan: {
    id: "honglan",
    label: "红蓝练习",
    menu: "红蓝",
    eyebrow: "分清部首与其他部件",
    copy: "让表意的部首和其他部件穿上不同颜色，建立字形的颜色记忆。",
    action: "继续红蓝",
    origin: "红蓝字",
    glyph: "红蓝",
    tone: "lapis",
  },
  structure: {
    id: "structure",
    label: "空间结构",
    menu: "结构",
    eyebrow: "像搭积木一样看汉字",
    copy: "左右、上下、包围……先看部件怎样站位，再选出正确的空间结构。",
    action: "继续结构",
    origin: "空间结构",
    glyph: "构",
    tone: "jade",
  },
};

function emptyProfile(): StudyProfile {
  return {
    version: 2,
    name: "",
    theme: "light",
    favorites: [],
    completed: {
      words: [],
      split: [],
      honglan: [],
      structure: [],
    },
    last: {
      words: null,
      split: null,
      honglan: null,
      structure: null,
    },
    answers: {},
    learnedComponents: [],
    readSessions: 0,
  };
}

function normalizeProfile(value: unknown): StudyProfile {
  const raw = (value || {}) as Partial<StudyProfile> & { mastered?: unknown };
  const fallback = emptyProfile();
  const legacyMastered = Array.isArray(raw.mastered)
    ? raw.mastered.filter((item): item is string => typeof item === "string")
    : [];

  for (const id of trackIds) {
    const rawCompleted = raw.completed?.[id];
    fallback.completed[id] = Array.isArray(rawCompleted)
      ? rawCompleted.filter((item): item is string => typeof item === "string")
      : id === "words"
        ? legacyMastered
        : [];

    const rawLast = raw.last?.[id];
    fallback.last[id] =
      rawLast &&
      typeof rawLast.lessonId === "string" &&
      typeof rawLast.characterId === "string" &&
      typeof rawLast.questionIndex === "number"
        ? rawLast
        : null;
  }

  return {
    ...fallback,
    version: 2,
    name: typeof raw.name === "string" ? raw.name.slice(0, 18) : "",
    theme: raw.theme === "night" ? "night" : "light",
    favorites: Array.isArray(raw.favorites)
      ? raw.favorites.filter((item): item is string => typeof item === "string")
      : [],
    answers:
      raw.answers && typeof raw.answers === "object"
        ? (raw.answers as Record<string, AnswerStat>)
        : {},
    learnedComponents: Array.isArray(raw.learnedComponents)
      ? raw.learnedComponents.filter((item): item is string => typeof item === "string")
      : [],
    readSessions:
      typeof raw.readSessions === "number" && Number.isFinite(raw.readSessions)
        ? raw.readSessions
        : 0,
  };
}

function getLessonCharacters(lessonId: string) {
  return allCharacters.filter((item) => item.lessonId === lessonId && item.primary);
}

function getTrackExercises(character: CharacterItem, track: TrackId) {
  return character.exercises.filter((exercise) => exercise.origin === trackMeta[track].origin);
}

function getTrackCharacters(track: TrackId, lessonId?: string) {
  return allCharacters.filter(
    (item) =>
      item.primary &&
      (!lessonId || item.lessonId === lessonId) &&
      getTrackExercises(item, track).length > 0,
  );
}

function getWordGroups(lessonId: string) {
  const map = new Map<string, CharacterItem[]>();
  for (const item of getLessonCharacters(lessonId)) {
    const key = String(item.wordPosition) + "-" + item.word;
    const existing = map.get(key) || [];
    existing.push(item);
    map.set(key, existing);
  }
  return [...map.values()];
}

function optionText(
  option: Exercise["options"][number],
  character: CharacterItem,
  index: number,
) {
  if (option.text) return option.text;
  if (option.correct) return character.originalMeaning || "与字义相关的图意";

  const source = allCharacters.find(
    (item, sourceIndex) =>
      item.id !== character.id &&
      Boolean(item.originalMeaning) &&
      sourceIndex % 3 === index % 3,
  );
  return source?.originalMeaning || "另一种图意";
}

function questionTypeLabel(question: Exercise, track: TrackId) {
  if (question.kind === "write") return "写整字";
  if (track === "honglan") return "红蓝字";
  if (track === "split") return "组字 · 选字";
  if (question.kind === "structure") return "结构选择";
  if (question.questionType === "image_single_select") return "看图选择";
  if (question.kind === "components") return "组字 · 选字";
  return "选择题";
}

function getExpectedIds(question: Exercise, character: CharacterItem, track: TrackId) {
  if (track === "split" && question.kind === "components") {
    const inOrder = character.parts
      .map((part) =>
        question.options.find((option) => option.correct && option.text === part.char)?.id,
      )
      .filter((id): id is string => Boolean(id));
    if (inOrder.length) return inOrder;
  }
  return question.options.filter((option) => option.correct).map((option) => option.id);
}

function isAnswerCorrect(
  question: Exercise,
  character: CharacterItem,
  track: TrackId,
  selected: string[],
  wrote: boolean,
) {
  if (question.kind === "write") return wrote;
  const expected = getExpectedIds(question, character, track);
  if (track === "split" && question.kind === "components") {
    return expected.length === selected.length && expected.every((id, index) => selected[index] === id);
  }
  const current = [...selected].sort();
  const target = [...expected].sort();
  return current.length === target.length && current.every((id, index) => id === target[index]);
}

function getNextCharacter(
  track: TrackId,
  profile: StudyProfile,
  lessonId?: string,
) {
  const candidates = getTrackCharacters(track, lessonId);
  if (!candidates.length) return undefined;
  const last = profile.last[track];
  const lastIndex = last
    ? candidates.findIndex((item) => item.id === last.characterId)
    : -1;
  const ordered =
    lastIndex >= 0
      ? [...candidates.slice(lastIndex + 1), ...candidates.slice(0, lastIndex + 1)]
      : candidates;
  return ordered.find((item) => !profile.completed[track].includes(item.id)) || ordered[0];
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

function speak(text: string, onEnd?: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.76;
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [profile, setProfile] = useState<StudyProfile>(emptyProfile);
  const [selectedLessonId, setSelectedLessonId] = useState(initialLesson.id);
  const [selectedCharacterId, setSelectedCharacterId] = useState(initialCharacter.id);
  const [selectedTrack, setSelectedTrack] = useState<TrackId>("words");
  const [selectedComponentId, setSelectedComponentId] = useState(allComponents[0]?.id || "");
  const [componentSearch, setComponentSearch] = useState("");
  const [recordTrack, setRecordTrack] = useState<TrackId>("words");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [wrote, setWrote] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored =
          window.localStorage.getItem(STORAGE_KEY) ||
          window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (stored) setProfile(normalizeProfile(JSON.parse(stored)));
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    document.documentElement.dataset.theme = profile.theme;
  }, [hydrated, profile]);

  const selectedLesson =
    lessonList.find((lesson) => lesson.id === selectedLessonId) || initialLesson;
  const selectedCharacter =
    allCharacters.find((item) => item.id === selectedCharacterId) || initialCharacter;
  const selectedComponent =
    allComponents.find((item) => item.id === selectedComponentId) || allComponents[0];
  const challengeExercises = getTrackExercises(selectedCharacter, selectedTrack);
  const currentQuestion = challengeExercises[questionIndex];
  const favoriteSet = useMemo(() => new Set(profile.favorites), [profile.favorites]);

  function navigate(next: Screen) {
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateProfile(updater: (previous: StudyProfile) => StudyProfile) {
    setProfile((previous) => updater(previous));
  }

  function openLesson(lessonId: string) {
    setSelectedLessonId(lessonId);
    navigate("lesson");
  }

  function openCharacter(character: CharacterItem) {
    setSelectedLessonId(character.lessonId);
    setSelectedCharacterId(character.id);
    navigate("character");
  }

  function openTrackMap(track: TrackId) {
    setSelectedTrack(track);
    navigate("trackMap");
  }

  function openTrackLesson(track: TrackId, lessonId: string) {
    setSelectedTrack(track);
    setSelectedLessonId(lessonId);
    navigate("trackLesson");
  }

  function openRecordDetail(character: CharacterItem, track: TrackId) {
    setRecordTrack(track);
    setSelectedTrack(track);
    setSelectedLessonId(character.lessonId);
    setSelectedCharacterId(character.id);
    navigate("recordDetail");
  }

  function openChallenge(track: TrackId, character: CharacterItem, index = 0) {
    const questions = getTrackExercises(character, track);
    if (!questions.length) return;
    setSelectedTrack(track);
    setSelectedLessonId(character.lessonId);
    setSelectedCharacterId(character.id);
    setQuestionIndex(Math.min(Math.max(index, 0), questions.length - 1));
    setSelectedOptions([]);
    setWrote(false);
    setResult(null);
    navigate("challenge");
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

  function checkAnswer() {
    if (!currentQuestion || result !== null) return;
    const correct = isAnswerCorrect(
      currentQuestion,
      selectedCharacter,
      selectedTrack,
      selectedOptions,
      wrote,
    );
    const questionIds = challengeExercises.map((item) => item.id);
    const now = new Date().toISOString();
    setResult(correct);

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
      const allCorrect = questionIds.every(
        (id) => id === currentQuestion.id ? correct : answers[id]?.lastCorrect,
      );
      const completed = { ...previous.completed };
      if (allCorrect && !completed[selectedTrack].includes(selectedCharacter.id)) {
        completed[selectedTrack] = [...completed[selectedTrack], selectedCharacter.id];
      }

      return {
        ...previous,
        answers,
        completed,
        last: {
          ...previous.last,
          [selectedTrack]: {
            lessonId: selectedCharacter.lessonId,
            characterId: selectedCharacter.id,
            questionIndex,
          },
        },
      };
    });
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
      openChallenge(selectedTrack, selectedCharacter, questionIndex + 1);
      return;
    }

    if (selectedTrack === "words") {
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
    }));
  }

  function resetProfile() {
    if (!window.confirm("清除这台设备上的学习足迹吗？课程内容不会受影响。")) return;
    setProfile((previous) => ({ ...emptyProfile(), theme: previous.theme }));
  }

  return (
    <main className="game-shell">
      <TopNavigation
        active={screen}
        name={profile.name}
        onNavigate={navigate}
        onProfile={() => navigate("profile")}
      />

      {screen === "home" && (
        <HomeHub
          profile={profile}
          hydrated={hydrated}
          onCourse={() => navigate("course")}
          onTrackMap={openTrackMap}
          onContinue={continueTrack}
          onRecords={() => navigate("records")}
          onRead={() => navigate("read")}
        />
      )}

      {screen === "course" && (
        <CourseMap
          profile={profile}
          onBack={() => navigate("home")}
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
        <CharacterStudy
          character={selectedCharacter}
          profile={profile}
          favorite={favoriteSet.has(selectedCharacter.id)}
          onBack={() => openLesson(selectedCharacter.lessonId)}
          onFavorite={() => toggleFavorite(selectedCharacter.id)}
          onSpeak={() => speak(selectedCharacter.hanzi)}
          onStart={() => openChallenge("words", selectedCharacter)}
          onComponent={(glyph) => {
            const component = allComponents.find((item) => item.glyph === glyph);
            if (component) {
              setSelectedComponentId(component.id);
              navigate("components");
            }
          }}
        />
      )}

      {screen === "trackMap" && (
        <TrackMap
          track={selectedTrack}
          profile={profile}
          onBack={() => navigate("home")}
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
        />
      )}

      {screen === "components" && selectedComponent && (
        <ComponentStudio
          profile={profile}
          selected={selectedComponent}
          search={componentSearch}
          onBack={() => navigate("home")}
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
          onTrack={setRecordTrack}
          onDetail={(character) => openRecordDetail(character, recordTrack)}
        />
      )}

      {screen === "recordDetail" && (
        <RecordDetail
          character={selectedCharacter}
          profile={profile}
          track={recordTrack}
          onBack={() => navigate("records")}
          onPractice={(index) => openChallenge(recordTrack, selectedCharacter, index)}
        />
      )}

      {screen === "read" && (
        <ReadAloud
          profile={profile}
          onBack={() => navigate("home")}
          onSession={() =>
            updateProfile((previous) => ({
              ...previous,
              readSessions: previous.readSessions + 1,
            }))
          }
        />
      )}

      {screen === "profile" && (
        <ProfilePanel
          profile={profile}
          onBack={() => navigate("home")}
          onName={(name) => updateProfile((previous) => ({ ...previous, name }))}
          onTheme={() =>
            updateProfile((previous) => ({
              ...previous,
              theme: previous.theme === "light" ? "night" : "light",
            }))
          }
          onReset={resetProfile}
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
  const nav: { label: string; screen: Screen; active: Screen[] }[] = [
    { label: "首页", screen: "home", active: ["home"] },
    { label: "课本", screen: "course", active: ["course", "lesson", "character"] },
    { label: "专项", screen: "trackMap", active: ["trackMap", "trackLesson", "challenge"] },
    { label: "部件", screen: "components", active: ["components"] },
    { label: "记录", screen: "records", active: ["records", "recordDetail"] },
  ];

  return (
    <header className="top-navigation">
      <button className="wordmark" onClick={() => onNavigate("home")} aria-label="回到 Knowing Word 首页">
        <span className="wordmark-flag">汉字学习旅程</span>
        <strong>KNOWING<br />WORD</strong>
      </button>
      <nav aria-label="主菜单">
        {nav.map((item) => (
          <button
            className={item.active.includes(active) ? "is-active" : ""}
            key={item.label}
            onClick={() => onNavigate(item.screen)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <button className="profile-pill" onClick={onProfile}>
        <span>{name ? name.slice(0, 1) : "学"}</span>
        <small>{name || "我的书包"}</small>
      </button>
    </header>
  );
}

function HomeHub({
  profile,
  hydrated,
  onCourse,
  onTrackMap,
  onContinue,
  onRecords,
  onRead,
}: {
  profile: StudyProfile;
  hydrated: boolean;
  onCourse: () => void;
  onTrackMap: (track: TrackId) => void;
  onContinue: (track: TrackId) => void;
  onRecords: () => void;
  onRead: () => void;
}) {
  const nextWord = getNextCharacter("words", profile);
  const wordProgress = trackProgress(profile, "words");
  const name = profile.name || "小探险家";

  return (
    <div className="page home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <p className="kicker">语文 · 五年级上册</p>
          <h1>你好，{name}！<br />今天从一个字出发。</h1>
          <p>
            每个学习区都在训练不同能力：先懂字义，再会拆字、分部首、认结构。
          </p>
          <div className="hero-buttons">
            <button className="game-button primary" onClick={() => onContinue("words")}>
              {nextWord ? "继续学习「" + nextWord.hanzi + "」" : "开始识字"} <span>→</span>
            </button>
            <button className="game-button ghost" onClick={onCourse}>查看课本</button>
          </div>
          <div className="hero-status">
            <span className="pulse-dot" />
            {hydrated ? "你的学习足迹只保存在这台设备" : "正在准备学习空间"}
          </div>
        </div>
        <div className="hero-illustration">
          <Image
            src="/og.png"
            alt=""
            fill
            priority
            sizes="(max-width: 760px) 100vw, 46vw"
          />
          <div className="hero-badge">
            <span>当前识字进度</span>
            <strong>{wordProgress.completed}<small> / {wordProgress.total}</small></strong>
          </div>
        </div>
      </section>

      <section className="mission-heading">
        <div>
          <p className="kicker">今天可以做什么</p>
          <h2>四条学习路线，一起把字学扎实</h2>
        </div>
        <button className="text-button" onClick={onRecords}>查看学习记录 →</button>
      </section>

      <section className="mission-grid">
        {trackIds.map((track) => {
          const meta = trackMeta[track];
          const progress = trackProgress(profile, track);
          const next = getNextCharacter(track, profile);
          return (
            <article className={"mission-card " + meta.tone} key={track}>
              <div className="mission-card-top">
                <span className="mission-glyph">{meta.glyph}</span>
                <span className="mission-count">{progress.completed} / {progress.total}</span>
              </div>
              <p>{meta.eyebrow}</p>
              <h3>{meta.label}</h3>
              <div className="mission-next">
                <span>{next ? "上次到「" + next.hanzi + "」" : "准备开始"}</span>
                <button onClick={() => onContinue(track)}>{meta.action} →</button>
              </div>
              <button className="card-link" onClick={() => onTrackMap(track)} aria-label={"查看" + meta.label + "关卡地图"} />
            </article>
          );
        })}

        <article className="mission-card reading-card">
          <div className="mission-card-top">
            <span className="mission-glyph">读</span>
            <span className="mission-count">{profile.readSessions} 次</span>
          </div>
          <p>朗读 · 跟读 · 录音</p>
          <h3>日日朗读</h3>
          <div className="mission-next">
            <span>把课文里的句子读出声</span>
            <button onClick={onRead}>去朗读 →</button>
          </div>
        </article>
      </section>

      <section className="home-bottom-grid">
        <article className="course-glance">
          <div>
            <p className="kicker">关卡地图</p>
            <h2>跟着课文，一课一课往前走</h2>
          </div>
          <div className="lesson-dots">
            {lessonList.map((lesson) => {
              const progress = trackProgress(profile, "words", lesson.id);
              return (
                <button key={lesson.id} onClick={onCourse}>
                  <span>{String(lesson.position).padStart(2, "0")}</span>
                  <strong>{lesson.title}</strong>
                  <small>{progress.completed} / {progress.total} 字</small>
                </button>
              );
            })}
          </div>
        </article>
        <article className="learning-promise">
          <span>✦</span>
          <div>
            <p className="kicker">学习方法</p>
            <h2>看得懂字义，也能说清它是怎么搭起来的。</h2>
          </div>
        </article>
      </section>
    </div>
  );
}

function CourseMap({
  profile,
  onBack,
  onLesson,
}: {
  profile: StudyProfile;
  onBack: () => void;
  onLesson: (lessonId: string) => void;
}) {
  return (
    <div className="page course-page">
      <PageHeading
        kicker="课程地图"
        title={course.title}
        copy="按课文进入词语表：先认识词语里的每个字，再用后续专项反复巩固。"
        onBack={onBack}
      />
      <div className="lesson-route">
        {lessonList.map((lesson, index) => {
          const chars = getLessonCharacters(lesson.id);
          const progress = trackProgress(profile, "words", lesson.id);
          return (
            <button className={"lesson-route-card lesson-tone-" + index} key={lesson.id} onClick={() => onLesson(lesson.id)}>
              <span className="route-index">第 {lesson.position} 课</span>
              <div className="route-character-cloud" aria-hidden="true">
                {chars.slice(0, 4).map((character) => <i key={character.id}>{character.hanzi}</i>)}
              </div>
              <div className="route-copy">
                <h2>{lesson.title}</h2>
                <p>{chars.length} 个核心字 · 已完成 {progress.completed} 个</p>
              </div>
              <span className="route-arrow">→</span>
            </button>
          );
        })}
      </div>
      <section className="course-method-card">
        <span>01</span><p>词语表中完成“认识 → 理解 → 小测”，再进入三条专项关卡重复提取记忆。</p>
      </section>
    </div>
  );
}

function LessonWordMap({
  lesson,
  profile,
  onBack,
  onCharacter,
  onTrackLesson,
}: {
  lesson: { id: string; title: string; position: number };
  profile: StudyProfile;
  onBack: () => void;
  onCharacter: (character: CharacterItem) => void;
  onTrackLesson: (track: TrackId, lessonId: string) => void;
}) {
  const groups = getWordGroups(lesson.id);
  const completed = new Set(profile.completed.words);
  const progress = trackProgress(profile, "words", lesson.id);

  return (
    <div className="page lesson-page">
      <PageHeading
        kicker={"第 " + lesson.position + " 课"}
        title={lesson.title}
        copy={"词语表 · " + progress.completed + " / " + progress.total + " 个字已完成整套识字小测"}
        onBack={onBack}
      />

      <section className="word-map-board">
        <div className="board-title"><span>词语表</span><i>把词语拆成一个个可理解的汉字</i></div>
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
                      (!character.ready ? "is-extension" : "")
                    }
                    key={character.id}
                    onClick={() => onCharacter(character)}
                  >
                    <strong>{character.hanzi}</strong>
                    {completed.has(character.id) && <small>✓</small>}
                    {!character.ready && !completed.has(character.id) && <em>荐</em>}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

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

function CharacterStudy({
  character,
  profile,
  favorite,
  onBack,
  onFavorite,
  onSpeak,
  onStart,
  onComponent,
}: {
  character: CharacterItem;
  profile: StudyProfile;
  favorite: boolean;
  onBack: () => void;
  onFavorite: () => void;
  onSpeak: () => void;
  onStart: () => void;
  onComponent: (glyph: string) => void;
}) {
  const exercises = getTrackExercises(character, "words");
  const isComplete = profile.completed.words.includes(character.id);
  const completedQuestions = exercises.filter((question) => profile.answers[question.id]?.lastCorrect).length;

  return (
    <div className="page character-page">
      <div className="character-topbar">
        <button className="back-button" onClick={onBack}>← 返回词语表</button>
        <div>
          <p>{character.lessonTitle} · {character.word}</p>
          <h1>{character.hanzi}<small>{character.pinyin}</small></h1>
        </div>
        <button className={"favorite-star " + (favorite ? "is-active" : "")} onClick={onFavorite} aria-label={favorite ? "取消收藏" : "收藏这个字"}>
          {favorite ? "★" : "☆"}
        </button>
      </div>

      <section className="character-story-card">
        <div className="story-character-column">
          <div className="story-glyph">{character.hanzi}</div>
          <button className="listen-button" onClick={onSpeak}>▷ 听一听</button>
          <span className={isComplete ? "learned-badge is-complete" : "learned-badge"}>
            {isComplete ? "✓ 已学会" : "正在认识"}
          </span>
        </div>
        <div className="story-copy">
          <div className="story-meta">
            <span>{character.charType}</span>
            <span>{character.decomposition}</span>
            <span>本义：{character.originalMeaning}</span>
          </div>
          <p>{character.description}</p>
          <div className="script-line" aria-label="字形演变线索">
            {["古字线索", "篆书", "隶书", "楷书"].map((stage, index) => (
              <div key={stage}>
                <strong className={"script-stage stage-" + index}>{character.hanzi}</strong>
                <small>{stage}</small>
              </div>
            ))}
          </div>
          <blockquote>课文原文：{character.originalText}</blockquote>
        </div>
      </section>

      <section className="character-map-card">
        <div className="map-card-heading">
          <div>
            <p className="kicker">字形推理图</p>
            <h2>点击部件，看它从哪里来</h2>
          </div>
          <span>{character.parts.length || 1} 个主要部件</span>
        </div>
        <div className="character-tree">
          <div className="tree-root">{character.hanzi}</div>
          <div className="tree-branches">
            {(character.parts.length ? character.parts : [{ char: character.hanzi, radical: true }]).map((part, index) => {
              const composition = character.compositions.find((item) => item.char === part.char);
              return (
                <div className="tree-branch" key={part.char + index}>
                  <button className={part.radical ? "is-radical" : ""} onClick={() => onComponent(part.char)}>
                    {part.char}
                    <small>{part.radical ? "表意" : "字形线索"}</small>
                  </button>
                  {composition?.children.length ? (
                    <div className="tree-children">
                      {composition.children.map((child, childIndex) => <span key={child + childIndex}>{child}</span>)}
                    </div>
                  ) : (
                    <p>{composition?.description || "这个字形部件正在等待你去发现。"}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="word-quest-card">
        <div>
          <p className="kicker">识字闯关</p>
          <h2>理解过后，马上练一练</h2>
          <p>按照“本义 → 结构 → 图意 → 组字 → 书写”的顺序完成 {exercises.length} 题。</p>
          <div className="quest-dots">
            {exercises.map((exercise) => (
              <span className={profile.answers[exercise.id]?.lastCorrect ? "is-done" : ""} key={exercise.id} title={questionTypeLabel(exercise, "words")} />
            ))}
            <small>{completedQuestions} / {exercises.length}</small>
          </div>
        </div>
        <button className="game-button primary" onClick={onStart}>
          {isComplete ? "再练一轮" : "学会了，练习一下"} →
        </button>
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
      <section className={"track-hero " + meta.tone}>
        <div className="track-symbol">{meta.glyph}</div>
        <div>
          <p>上次学到</p>
          <h2>{next ? next.hanzi + " 字" : "准备开始"}</h2>
          <span>{next ? "来自第 " + next.lessonPosition + " 课 · " + next.lessonTitle : "从第一课开始闯关"}</span>
        </div>
        <button className="game-button white" onClick={onContinue}>{meta.action} →</button>
      </section>

      <section className="level-map">
        <div className="level-map-title">
          <h2>关卡地图</h2>
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
                <b>→</b>
              </button>
            );
          })}
        </div>
      </section>
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

function ChallengeRoom({
  track,
  character,
  question,
  questionIndex,
  total,
  selected,
  wrote,
  result,
  profile,
  onBack,
  onChoose,
  onRemove,
  onWrite,
  onClearWrite,
  onCheck,
  onNext,
}: {
  track: TrackId;
  character: CharacterItem;
  question: Exercise;
  questionIndex: number;
  total: number;
  selected: string[];
  wrote: boolean;
  result: boolean | null;
  profile: StudyProfile;
  onBack: () => void;
  onChoose: (id: string) => void;
  onRemove: (id: string) => void;
  onWrite: () => void;
  onClearWrite: () => void;
  onCheck: () => void;
  onNext: () => void;
}) {
  const meta = trackMeta[track];
  const expected = getExpectedIds(question, character, track);
  const needsMultiple = expected.length > 1;
  const ready = question.kind === "write" ? wrote : selected.length > 0;
  const answerText = expected
    .map((id) => question.options.find((option) => option.id === id))
    .filter(Boolean)
    .map((option) => optionText(option as Exercise["options"][number], character, 0))
    .join("、");
  const finalStep = questionIndex === total - 1;
  const record = profile.answers[question.id];

  return (
    <div className={"challenge-page track-" + meta.tone}>
      <header className="challenge-header">
        <button className="back-button" onClick={onBack}>← 返回</button>
        <div>
          <p>{meta.label} · {character.lessonTitle}</p>
          <h1>{meta.menu} · <span>{character.hanzi}</span></h1>
        </div>
        <span className="challenge-count">第 {questionIndex + 1} / {total} 题</span>
      </header>
      <div className="challenge-progress"><i style={{ width: ((questionIndex + 1) / total) * 100 + "%" }} /></div>

      <section className="challenge-board">
        <div className="challenge-question">
          <span className="question-tag">{questionTypeLabel(question, track)}</span>
          <h2>{question.prompt}</h2>
          {needsMultiple && <p>这题需要选择多个部件。</p>}
        </div>

        {question.kind === "write" ? (
          <WritingPad character={character.hanzi} onWrite={onWrite} onClear={onClearWrite} />
        ) : question.kind === "components" && track === "split" ? (
          <AssemblyExercise
            character={character}
            question={question}
            selected={selected}
            result={result}
            onChoose={onChoose}
            onRemove={onRemove}
          />
        ) : question.kind === "components" && track === "honglan" ? (
          <RedBlueExercise
            character={character}
            question={question}
            selected={selected}
            result={result}
            onChoose={onChoose}
          />
        ) : (
          <ChoiceExercise
            character={character}
            question={question}
            selected={selected}
            result={result}
            onChoose={onChoose}
          />
        )}

        <div className="challenge-footer">
          {result === null ? (
            <button className="game-button primary" disabled={!ready} onClick={onCheck}>
              核对答案 →
            </button>
          ) : (
            <div className={"answer-feedback " + (result ? "is-correct" : "is-wrong")}>
              <span>{result ? "✓" : "!"}</span>
              <div>
                <strong>{result ? "答得真棒！" : "再试一次，慢慢来。"}</strong>
                <p>
                  {result
                    ? question.explanation || (finalStep ? "这一关完成了，回到地图看看下一站。" : "记住这个线索，再去下一题。")
                    : "正确线索是：" + (question.kind === "write" ? "在方格里写完整的“" + character.hanzi + "”" : answerText || "仔细看字形。")}
                </p>
                {record && <small>本题已尝试 {record.attempts} 次</small>}
              </div>
              <button className="game-button ghost" onClick={onNext}>
                {result ? (finalStep ? "完成本关" : "下一题 →") : "重新作答"}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ChoiceExercise({
  character,
  question,
  selected,
  result,
  onChoose,
}: {
  character: CharacterItem;
  question: Exercise;
  selected: string[];
  result: boolean | null;
  onChoose: (id: string) => void;
}) {
  const visual = question.questionType === "image_single_select";
  return (
    <div className={"choice-grid " + (visual ? "is-visual" : "")}>
      {question.options.map((option, index) => {
        const isSelected = selected.includes(option.id);
        const state =
          result === null
            ? isSelected
              ? "is-selected"
              : ""
            : option.correct
              ? "is-correct"
              : isSelected
                ? "is-wrong"
                : "";
        return (
          <button
            className={"choice-card " + state}
            key={option.id}
            onClick={() => onChoose(option.id)}
            aria-pressed={isSelected}
          >
            {visual ? (
              <span className={"meaning-symbol symbol-" + index}>{option.correct ? character.hanzi : "？"}</span>
            ) : question.kind === "structure" ? (
              <StructureShape code={option.idcCode} />
            ) : (
              <span className="choice-dot" />
            )}
            <strong>{optionText(option, character, index)}</strong>
            {question.kind === "structure" && <small>{option.idcCode}</small>}
          </button>
        );
      })}
    </div>
  );
}

function AssemblyExercise({
  character,
  question,
  selected,
  result,
  onChoose,
  onRemove,
}: {
  character: CharacterItem;
  question: Exercise;
  selected: string[];
  result: boolean | null;
  onChoose: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const expected = getExpectedIds(question, character, "split");
  const slots = Math.max(expected.length, character.parts.length, 1);
  return (
    <div className="assembly-exercise">
      <div className="assembly-target">
        <span>把「{character.hanzi}」搭出来</span>
        <div className="assembly-slots">
          {Array.from({ length: slots }).map((_, index) => {
            const option = question.options.find((item) => item.id === selected[index]);
            const state =
              result === null
                ? ""
                : option?.correct && expected[index] === option.id
                  ? "is-correct"
                  : option
                    ? "is-wrong"
                    : "";
            return (
              <button
                className={"assembly-slot " + state}
                key={index}
                disabled={!option || result !== null}
                onClick={() => option && onRemove(option.id)}
              >
                {option ? optionText(option, character, index) : "？"}
              </button>
            );
          })}
        </div>
      </div>
      <div className="assembly-choices">
        {question.options.map((option) => (
          <button
            className={selected.includes(option.id) ? "is-picked" : ""}
            disabled={result !== null}
            key={option.id}
            onClick={() => onChoose(option.id)}
          >
            {optionText(option, character, 0)}
          </button>
        ))}
      </div>
    </div>
  );
}

function RedBlueExercise({
  character,
  question,
  selected,
  result,
  onChoose,
}: {
  character: CharacterItem;
  question: Exercise;
  selected: string[];
  result: boolean | null;
  onChoose: (id: string) => void;
}) {
  return (
    <div className="redblue-exercise">
      <div className="redblue-word" aria-label={"“" + character.hanzi + "”的红蓝字形"}>
        {(character.parts.length ? character.parts : [{ char: character.hanzi, radical: true }]).map((part, index) => (
          <span className={part.radical ? "is-red" : "is-blue"} key={part.char + index}>{part.char}</span>
        ))}
      </div>
      <p><i className="red-key" /> 表意部首　<i className="blue-key" /> 其他部件</p>
      <div className="redblue-options">
        {question.options.map((option, index) => {
          const isSelected = selected.includes(option.id);
          const state =
            result === null
              ? isSelected
                ? "is-selected"
                : ""
              : option.correct
                ? "is-correct"
                : isSelected
                  ? "is-wrong"
                  : "";
          return (
            <button className={state} key={option.id} disabled={result !== null} onClick={() => onChoose(option.id)}>
              <span className={option.radical ? "is-red" : "is-blue"}>{optionText(option, character, index)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StructureShape({ code }: { code: string }) {
  const type =
    code === "⿰" || code === "⿲"
      ? "side"
      : code === "⿱" || code === "⿳"
        ? "stack"
        : code.includes("⿴")
          ? "surround"
          : code
            ? "half"
            : "single";
  return (
    <span className={"structure-shape " + type} aria-hidden="true">
      <i /><i /><i />
    </span>
  );
}

function WritingPad({
  character,
  onWrite,
  onClear,
}: {
  character: string;
  onWrite: () => void;
  onClear: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const setup = () => {
      const context = canvas.getContext("2d");
      if (!context) return;
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      context.scale(ratio, ratio);
      context.strokeStyle = "#263b64";
      context.lineWidth = 5;
      context.lineCap = "round";
      context.lineJoin = "round";
    };
    setup();
    const observer = new ResizeObserver(setup);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  function position(event: ReactPointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function start(event: ReactPointerEvent<HTMLCanvasElement>) {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    const point = position(event);
    drawingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(point.x, point.y);
    onWrite();
  }

  function draw(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    const point = position(event);
    context.lineTo(point.x, point.y);
    context.stroke();
  }

  function stop() {
    drawingRef.current = false;
  }

  function clear() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    onClear();
  }

  return (
    <div className="writing-board">
      <div className="writing-guide" aria-hidden="true">{character}</div>
      <canvas
        ref={canvasRef}
        aria-label={"书写“" + character + "”"}
        onPointerDown={start}
        onPointerMove={draw}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
      />
      <div className="writing-footer">
        <span>在方格中写一写，笔迹不会上传</span>
        <button onClick={clear}>重新写</button>
      </div>
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
    .sort((a, b) => (useCount.get(b.glyph) || 0) - (useCount.get(a.glyph) || 0) || a.sequence - b.sequence);
  const connected = allCharacters.filter((character) => character.parts.some((part) => part.char === selected.glyph));

  return (
    <div className="page components-page">
      <PageHeading
        kicker="部件精讲"
        title="从常见部件入手，识字更轻松"
        copy="先按课内出现次数排序，再把一个部件放回真实的词语中理解。"
        onBack={onBack}
      />
      <div className="component-layout">
        <section className="component-browser">
          <div className="component-browser-toolbar">
            <span>按出现次数</span>
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
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const lesson = lessonList.find((item) => item.id === lessonId) || initialLesson;
  const sentences = [...new Set(getLessonCharacters(lesson.id).map((item) => item.originalText).filter(Boolean))].slice(0, 4);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    };
  }, [recordingUrl]);

  function play(text: string) {
    setActiveText(text);
    setSpeaking(true);
    speak(text, () => setSpeaking(false));
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
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (recordingUrl) URL.revokeObjectURL(recordingUrl);
        setRecordingUrl(URL.createObjectURL(blob));
        setRecording(false);
        stream.getTracks().forEach((track) => track.stop());
        onSession();
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
        copy={"已完成 " + profile.readSessions + " 次本机朗读练习。录音仅留在当前浏览器页面。"}
        onBack={onBack}
      />
      <div className="read-lesson-tabs">
        {lessonList.map((item) => (
          <button className={item.id === lesson.id ? "is-active" : ""} key={item.id} onClick={() => setLessonId(item.id)}>
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
          {recording ? "■ 结束录音" : "● 开始录音"}
        </button>
      </section>
      <div className="sentence-list">
        {sentences.map((text) => (
          <article className={activeText === text ? "is-speaking" : ""} key={text}>
            <p>“{text}”</p>
            <button onClick={() => play(text)}>{speaking && activeText === text ? "正在范读…" : "▷ 范读"}</button>
          </article>
        ))}
      </div>
      {recordingUrl && (
        <section className="recording-result">
          <span>✓</span>
          <div><strong>这次朗读已经录好</strong><p>你可以在这里回听，刷新页面后录音会自动清除。</p></div>
          <audio controls src={recordingUrl} />
        </section>
      )}
    </div>
  );
}

function ProfilePanel({
  profile,
  onBack,
  onName,
  onTheme,
  onReset,
}: {
  profile: StudyProfile;
  onBack: () => void;
  onName: (name: string) => void;
  onTheme: () => void;
  onReset: () => void;
}) {
  const totalCompleted = trackIds.reduce((sum, track) => sum + profile.completed[track].length, 0);
  return (
    <div className="page profile-page">
      <PageHeading
        kicker="我的书包"
        title="这是属于你的学习空间"
        copy="名字、主题和学习记录都保存在当前设备，不会上传到服务器。"
        onBack={onBack}
      />
      <section className="profile-card">
        <div className="profile-avatar">{profile.name ? profile.name.slice(0, 1) : "学"}</div>
        <div>
          <label>学习小名<input value={profile.name} onChange={(event) => onName(event.target.value)} placeholder="给自己取一个名字" maxLength={18} /></label>
          <p>已完成 {totalCompleted} 个学习关卡 · 认识 {profile.learnedComponents.length} 个部件</p>
        </div>
      </section>
      <div className="profile-actions">
        <button onClick={onTheme}><span>{profile.theme === "light" ? "◐" : "◑"}</span>{profile.theme === "light" ? "切换夜读模式" : "切换日间模式"}</button>
        <button className="is-danger" onClick={onReset}><span>↺</span>清除本机学习记录</button>
      </div>
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
  onBack: () => void;
}) {
  return (
    <header className="page-heading">
      <button className="back-button" onClick={onBack}>← 返回</button>
      <div>
        <p className="kicker">{kicker}</p>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
    </header>
  );
}
