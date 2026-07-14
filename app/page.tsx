"use client";

import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import {
  characters,
  components,
  course,
  lessons,
  type CharacterItem,
  type ComponentItem,
  type Exercise,
} from "./data/catalog";

type View = "home" | "library" | "practice" | "components" | "progress";

type StudyProfile = {
  mastered: string[];
  favorites: string[];
  attempts: number;
  correct: number;
  lastActive: string | null;
  recent: {
    id: string;
    character: string;
    prompt: string;
    correct: boolean;
    at: string;
  }[];
  theme: "light" | "night";
};

type PracticeQuestion = Exercise & {
  characterId: string;
  character: string;
  pinyin: string;
  parts: { char: string; radical: boolean }[];
};

const allCharacters = characters as unknown as CharacterItem[];
const allComponents = components as unknown as ComponentItem[];
const initialCharacter = allCharacters.find((item) => item.ready) || allCharacters[0];
const initialComponent = allComponents[0];
const STORAGE_KEY = "knowing-word:local-profile:v1";

const emptyProfile: StudyProfile = {
  mastered: [],
  favorites: [],
  attempts: 0,
  correct: 0,
  lastActive: null,
  recent: [],
  theme: "light",
};

const navItems: { id: View; label: string; marker: string }[] = [
  { id: "home", label: "今日", marker: "01" },
  { id: "library", label: "字库", marker: "02" },
  { id: "practice", label: "练习", marker: "03" },
  { id: "components", label: "部件", marker: "04" },
  { id: "progress", label: "足迹", marker: "05" },
];

function buildPracticeQueue(focus?: CharacterItem): PracticeQuestion[] {
  const source = focus ? [focus] : allCharacters;
  const questions = source.flatMap((character) =>
    character.exercises.map((exercise) => ({
      ...exercise,
      characterId: character.id,
      character: character.hanzi,
      pinyin: character.pinyin,
      parts: character.parts,
    })),
  );

  return questions
    .sort(() => Math.random() - 0.5)
    .slice(0, focus ? Math.min(10, questions.length) : 12);
}

function todayLabel() {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getLessonProgress(lessonId: string, mastered: string[]) {
  const lessonCharacters = allCharacters.filter((item) => item.lessonId === lessonId);
  const complete = lessonCharacters.filter((item) => mastered.includes(item.id)).length;
  return { complete, total: lessonCharacters.length };
}

function speakCharacter(character: CharacterItem) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(character.hanzi);
  utterance.lang = "zh-CN";
  utterance.rate = 0.72;
  window.speechSynthesis.speak(utterance);
}

export default function Home() {
  const [activeView, setActiveView] = useState<View>("home");
  const [profile, setProfile] = useState<StudyProfile>(emptyProfile);
  const [selectedCharacterId, setSelectedCharacterId] = useState(initialCharacter.id);
  const [selectedComponentId, setSelectedComponentId] = useState(initialComponent.id);
  const [search, setSearch] = useState("");
  const [lessonFilter, setLessonFilter] = useState("all");
  const [componentSearch, setComponentSearch] = useState("");
  const [practiceQueue, setPracticeQueue] = useState<PracticeQuestion[]>(() =>
    buildPracticeQueue(),
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [writeComplete, setWriteComplete] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<StudyProfile>;
          setProfile({
            ...emptyProfile,
            ...parsed,
            mastered: Array.isArray(parsed.mastered) ? parsed.mastered : [],
            favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
            recent: Array.isArray(parsed.recent) ? parsed.recent : [],
          });
        }
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
  }, [profile, hydrated]);

  const selectedCharacter =
    allCharacters.find((item) => item.id === selectedCharacterId) || initialCharacter;
  const selectedComponent =
    allComponents.find((item) => item.id === selectedComponentId) || initialComponent;
  const currentQuestion = practiceQueue[questionIndex];

  const filteredCharacters = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return allCharacters.filter((item) => {
      const matchesLesson = lessonFilter === "all" || item.lessonId === lessonFilter;
      const matchesSearch =
        !term ||
        [item.hanzi, item.word, item.pinyin, item.originalMeaning, item.lessonTitle]
          .join(" ")
          .toLocaleLowerCase()
          .includes(term);
      return matchesLesson && matchesSearch;
    });
  }, [lessonFilter, search]);

  const filteredComponents = useMemo(() => {
    const term = componentSearch.trim().toLocaleLowerCase();
    if (!term) return allComponents;
    return allComponents.filter((item) =>
      [item.title, item.glyph, item.examples.join(" "), item.description]
        .join(" ")
        .toLocaleLowerCase()
        .includes(term),
    );
  }, [componentSearch]);

  const masteredSet = useMemo(() => new Set(profile.mastered), [profile.mastered]);
  const favoriteSet = useMemo(() => new Set(profile.favorites), [profile.favorites]);
  const masteryRate = Math.round((profile.mastered.length / allCharacters.length) * 100);
  const accuracy = profile.attempts
    ? Math.round((profile.correct / profile.attempts) * 100)
    : 0;

  function navigate(view: View) {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateProfile(updater: (previous: StudyProfile) => StudyProfile) {
    setProfile((previous) => updater(previous));
  }

  function toggleMastered(characterId: string) {
    updateProfile((previous) => {
      const mastered = previous.mastered.includes(characterId)
        ? previous.mastered.filter((id) => id !== characterId)
        : [...previous.mastered, characterId];
      return { ...previous, mastered, lastActive: new Date().toISOString() };
    });
  }

  function toggleFavorite(characterId: string) {
    updateProfile((previous) => {
      const favorites = previous.favorites.includes(characterId)
        ? previous.favorites.filter((id) => id !== characterId)
        : [...previous.favorites, characterId];
      return { ...previous, favorites };
    });
  }

  function startPractice(focus?: CharacterItem) {
    const queue = buildPracticeQueue(focus);
    setPracticeQueue(queue);
    setQuestionIndex(0);
    setSelectedOptions([]);
    setChecked(false);
    setWriteComplete(false);
    navigate("practice");
  }

  function chooseOption(optionId: string) {
    if (!currentQuestion || checked) return;
    const multiSelect =
      currentQuestion.kind === "components" &&
      currentQuestion.options.filter((option) => option.correct).length > 1;

    if (!multiSelect) {
      setSelectedOptions([optionId]);
      return;
    }

    setSelectedOptions((previous) =>
      previous.includes(optionId)
        ? previous.filter((id) => id !== optionId)
        : [...previous, optionId],
    );
  }

  function assessQuestion() {
    if (!currentQuestion || checked) return;

    const correctIds = currentQuestion.options
      .filter((option) => option.correct)
      .map((option) => option.id)
      .sort();
    const chosenIds =
      currentQuestion.kind === "write"
        ? writeComplete
          ? ["written"]
          : []
        : [...selectedOptions].sort();
    const correct =
      currentQuestion.kind === "write"
        ? writeComplete
        : correctIds.length === chosenIds.length &&
          correctIds.every((id, index) => id === chosenIds[index]);

    setChecked(true);
    updateProfile((previous) => ({
      ...previous,
      attempts: previous.attempts + 1,
      correct: previous.correct + (correct ? 1 : 0),
      lastActive: new Date().toISOString(),
      recent: [
        {
          id: currentQuestion.id + "-" + Date.now(),
          character: currentQuestion.character,
          prompt: currentQuestion.prompt,
          correct,
          at: new Date().toISOString(),
        },
        ...previous.recent,
      ].slice(0, 12),
    }));
  }

  function nextQuestion() {
    if (!currentQuestion) return;
    if (questionIndex >= practiceQueue.length - 1) {
      startPractice(
        allCharacters.find((item) => item.id === currentQuestion.characterId),
      );
      return;
    }
    setQuestionIndex((previous) => previous + 1);
    setSelectedOptions([]);
    setChecked(false);
    setWriteComplete(false);
  }

  function selectCharacter(character: CharacterItem) {
    setSelectedCharacterId(character.id);
    navigate("library");
  }

  function resetProgress() {
    if (!window.confirm("清除这台设备上的学习足迹吗？课程内容不会受影响。")) return;
    setProfile((previous) => ({ ...emptyProfile, theme: previous.theme }));
  }

  return (
    <main className="app-shell">
      <aside className="app-rail" aria-label="主导航">
        <button className="brand" onClick={() => navigate("home")} aria-label="回到首页">
          <span className="brand-kicker">汉字故事实验室</span>
          <span className="brand-name">KNOWING<br />WORD</span>
          <span className="brand-dot" />
        </button>

        <nav className="primary-nav">
          {navItems.map((item) => (
            <button
              className={"nav-item " + (activeView === item.id ? "is-active" : "")}
              key={item.id}
              onClick={() => navigate(item.id)}
            >
              <span>{item.marker}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="rail-footer">
          <button
            className="theme-switch"
            onClick={() =>
              updateProfile((previous) => ({
                ...previous,
                theme: previous.theme === "light" ? "night" : "light",
              }))
            }
          >
            <span aria-hidden="true">{profile.theme === "light" ? "◐" : "◑"}</span>
            {profile.theme === "light" ? "夜读模式" : "日间模式"}
          </button>
          <p>五上 · 统编版</p>
        </div>
      </aside>

      <section className="main-stage">
        <header className="topbar">
          <div>
            <p className="eyebrow">中文识字 · 学习空间</p>
            <p className="topbar-date">{todayLabel()}</p>
          </div>
          <div className="topbar-meta">
            <span className="status-dot" />
            <span>{hydrated ? "学习足迹已保存在本机" : "正在准备你的学习空间"}</span>
          </div>
        </header>

        <nav className="mobile-nav" aria-label="移动端导航">
          {navItems.map((item) => (
            <button
              className={activeView === item.id ? "is-active" : ""}
              key={item.id}
              onClick={() => navigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {activeView === "home" && (
          <HomeView
            masteryRate={masteryRate}
            mastered={profile.mastered}
            nextCharacter={
              allCharacters.find((item) => !masteredSet.has(item.id)) || initialCharacter
            }
            onLearn={(character) => selectCharacter(character)}
            onPractice={() => startPractice()}
          />
        )}

        {activeView === "library" && (
          <LibraryView
            characters={filteredCharacters}
            selected={selectedCharacter}
            lessons={lessons}
            lessonFilter={lessonFilter}
            search={search}
            mastered={masteredSet}
            favorites={favoriteSet}
            onSearch={setSearch}
            onLessonFilter={setLessonFilter}
            onSelect={setSelectedCharacterId}
            onToggleMastered={toggleMastered}
            onToggleFavorite={toggleFavorite}
            onSpeak={speakCharacter}
            onPractice={startPractice}
          />
        )}

        {activeView === "practice" && (
          <PracticeView
            question={currentQuestion}
            questionIndex={questionIndex}
            total={practiceQueue.length}
            selectedOptions={selectedOptions}
            checked={checked}
            writeComplete={writeComplete}
            selectedCharacter={selectedCharacter}
            onSelectOption={chooseOption}
            onCheck={assessQuestion}
            onNext={nextQuestion}
            onWrite={() => setWriteComplete(true)}
            onClearWrite={() => setWriteComplete(false)}
            onRestart={(focus) => startPractice(focus)}
          />
        )}

        {activeView === "components" && (
          <ComponentsView
            components={filteredComponents}
            selected={selectedComponent}
            search={componentSearch}
            onSearch={setComponentSearch}
            onSelect={setSelectedComponentId}
            onOpenCharacter={selectCharacter}
          />
        )}

        {activeView === "progress" && (
          <ProgressView
            profile={profile}
            masteryRate={masteryRate}
            accuracy={accuracy}
            mastered={masteredSet}
            onSelectCharacter={selectCharacter}
            onReset={resetProgress}
          />
        )}
      </section>
    </main>
  );
}

function HomeView({
  masteryRate,
  mastered,
  nextCharacter,
  onLearn,
  onPractice,
}: {
  masteryRate: number;
  mastered: string[];
  nextCharacter: CharacterItem;
  onLearn: (character: CharacterItem) => void;
  onPractice: () => void;
}) {
  return (
    <div className="view home-view">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow">把每一个字，读成一个世界</p>
          <h1>
            从笔画出发，
            <em>看见文字的来处。</em>
          </h1>
          <p className="hero-description">
            用结构、故事与主动练习，把抽象的汉字变成可以理解、可以记住的线索。
          </p>
          <div className="hero-actions">
            <button className="button button-primary" onClick={() => onLearn(nextCharacter)}>
              继续认识「{nextCharacter.hanzi}」
              <span aria-hidden="true">↗</span>
            </button>
            <button className="button button-quiet" onClick={onPractice}>
              来一轮练习
            </button>
          </div>
          <div className="hero-footnote">
            <span>本地学习档案</span>
            <span>{allCharacters.length} 个字</span>
            <span>{allComponents.length} 个部件</span>
          </div>
        </div>
        <div className="hero-art">
          <Image
            src="/og.png"
            alt=""
            fill
            priority
            sizes="(max-width: 920px) 100vw, 50vw"
          />
          <div className="hero-score">
            <span>今日进度</span>
            <strong>{masteryRate}<small>%</small></strong>
            <i />
          </div>
          <div className="hero-stamp">字<br />见</div>
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="card learning-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">学习航线</p>
              <h2>每次一小步，记忆自然有回声</h2>
            </div>
            <span className="card-number">{String(mastered.length).padStart(2, "0")}</span>
          </div>
          <div className="mastery-track" aria-label={"已掌握 " + mastered.length + " 个字"}>
            {allCharacters.slice(0, 32).map((character) => (
              <span
                className={mastered.includes(character.id) ? "is-mastered" : ""}
                key={character.id}
                title={character.hanzi}
              />
            ))}
          </div>
          <div className="learning-note">
            <span className="note-glyph">{nextCharacter.hanzi}</span>
            <div>
              <strong>下一站：{nextCharacter.word}</strong>
              <p>{nextCharacter.pinyin} · {nextCharacter.originalMeaning}</p>
            </div>
            <button className="text-link" onClick={() => onLearn(nextCharacter)}>开始学习 ↗</button>
          </div>
        </article>

        <article className="card curriculum-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">本册地图</p>
              <h2>{course.title}</h2>
            </div>
            <span className="edition-tag">{course.edition}</span>
          </div>
          <div className="lesson-stack">
            {lessons.map((lesson, index) => {
              const progress = getLessonProgress(lesson.id, mastered);
              return (
                <div className="lesson-row" key={lesson.id}>
                  <span className="lesson-index">0{index + 1}</span>
                  <div>
                    <strong>{lesson.title}</strong>
                    <p>{progress.complete} / {progress.total} 已收录</p>
                  </div>
                  <span className="lesson-progress">{Math.round((progress.complete / progress.total) * 100)}%</span>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="principle-band">
        <p className="eyebrow">学习方法</p>
        <div>
          <strong>看结构</strong>
          <span>→</span>
          <strong>懂本义</strong>
          <span>→</span>
          <strong>做练习</strong>
          <span>→</span>
          <strong>留住记忆</strong>
        </div>
        <p>不只会写，更知道为什么这样写。</p>
      </section>
    </div>
  );
}

function LibraryView({
  characters,
  selected,
  lessons: lessonList,
  lessonFilter,
  search,
  mastered,
  favorites,
  onSearch,
  onLessonFilter,
  onSelect,
  onToggleMastered,
  onToggleFavorite,
  onSpeak,
  onPractice,
}: {
  characters: CharacterItem[];
  selected: CharacterItem;
  lessons: { id: string; title: string; position: number }[];
  lessonFilter: string;
  search: string;
  mastered: Set<string>;
  favorites: Set<string>;
  onSearch: (value: string) => void;
  onLessonFilter: (value: string) => void;
  onSelect: (value: string) => void;
  onToggleMastered: (value: string) => void;
  onToggleFavorite: (value: string) => void;
  onSpeak: (value: CharacterItem) => void;
  onPractice: (value: CharacterItem) => void;
}) {
  return (
    <div className="view library-view">
      <ViewHeader
        eyebrow="字库"
        title="把每一个字，放回它自己的故事里"
        description={"本册已收录 " + allCharacters.length + " 个学习字，支持按课文、拼音和释义快速找字。"}
      />

      <div className="library-toolbar">
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="搜索汉字、词语或拼音"
            aria-label="搜索汉字、词语或拼音"
          />
          {search && <button onClick={() => onSearch("")} aria-label="清除搜索">×</button>}
        </label>
        <div className="filter-pills" aria-label="按课文筛选">
          <button
            className={lessonFilter === "all" ? "is-active" : ""}
            onClick={() => onLessonFilter("all")}
          >
            全部
          </button>
          {lessonList.map((lesson) => (
            <button
              className={lessonFilter === lesson.id ? "is-active" : ""}
              key={lesson.id}
              onClick={() => onLessonFilter(lesson.id)}
            >
              {lesson.title}
            </button>
          ))}
        </div>
      </div>

      <div className="library-layout">
        <section className="character-grid-wrap">
          <div className="grid-caption">
            <span>显示 {characters.length} 个字</span>
            <span>● 已掌握　○ 待探索</span>
          </div>
          <div className="character-grid">
            {characters.map((character) => (
              <button
                className={
                  "character-tile " +
                  (selected.id === character.id ? "is-selected " : "") +
                  (mastered.has(character.id) ? "is-mastered" : "")
                }
                key={character.id}
                onClick={() => onSelect(character.id)}
                aria-pressed={selected.id === character.id}
              >
                <span className="tile-character">{character.hanzi}</span>
                <span>{character.pinyin}</span>
                {favorites.has(character.id) && <i aria-label="已收藏">✦</i>}
              </button>
            ))}
          </div>
          {!characters.length && (
            <div className="empty-state">
              <span>字</span>
              <p>没有找到相符的字，换个关键词试试。</p>
            </div>
          )}
        </section>

        <CharacterDetail
          character={selected}
          mastered={mastered.has(selected.id)}
          favorite={favorites.has(selected.id)}
          onToggleMastered={() => onToggleMastered(selected.id)}
          onToggleFavorite={() => onToggleFavorite(selected.id)}
          onSpeak={() => onSpeak(selected)}
          onPractice={() => onPractice(selected)}
        />
      </div>
    </div>
  );
}

function CharacterDetail({
  character,
  mastered,
  favorite,
  onToggleMastered,
  onToggleFavorite,
  onSpeak,
  onPractice,
}: {
  character: CharacterItem;
  mastered: boolean;
  favorite: boolean;
  onToggleMastered: () => void;
  onToggleFavorite: () => void;
  onSpeak: () => void;
  onPractice: () => void;
}) {
  return (
    <aside className="character-detail">
      <div className="detail-topline">
        <span>{character.lessonTitle}</span>
        <button
          className={"favorite-button " + (favorite ? "is-active" : "")}
          onClick={onToggleFavorite}
          aria-label={favorite ? "取消收藏" : "收藏这个字"}
        >
          {favorite ? "✦" : "✧"}
        </button>
      </div>
      <div className="character-display">
        <span>{character.hanzi}</span>
        <div>
          <p>{character.pinyin}</p>
          <strong>{character.word}</strong>
        </div>
      </div>
      <div className="detail-tags">
        <span>{character.charType}</span>
        <span>{character.decomposition}</span>
      </div>

      <section className="detail-section">
        <div className="section-label"><span>01</span> 字形拆解</div>
        <div className="parts-assembly">
          {character.parts.length ? (
            character.parts.map((part, index) => (
              <div className={part.radical ? "part radical" : "part"} key={part.char + index}>
                <b>{part.char}</b>
                <small>{part.radical ? "表意" : "提示线索"}</small>
              </div>
            ))
          ) : (
            <div className="part solo"><b>{character.hanzi}</b><small>独体字</small></div>
          )}
        </div>
      </section>

      <section className="detail-section">
        <div className="section-label"><span>02</span> 字义故事</div>
        <h3>本义：{character.originalMeaning}</h3>
        <p className="detail-copy">{character.description}</p>
      </section>

      <section className="detail-section origin-quote">
        <div className="section-label"><span>03</span> 课文里</div>
        <blockquote>“{character.originalText}”</blockquote>
      </section>

      {character.compositions.length > 0 && (
        <section className="detail-section composition-section">
          <div className="section-label"><span>04</span> 部件小档案</div>
          <div className="composition-list">
            {character.compositions.slice(0, 3).map((composition) => (
              <div key={composition.char}>
                <b>{composition.char}</b>
                <p>{composition.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="detail-actions">
        <button className="button button-quiet" onClick={onSpeak}>听读音</button>
        <button className="button button-primary" onClick={onPractice}>专项练习 ↗</button>
      </div>
      <button
        className={"master-button " + (mastered ? "is-mastered" : "")}
        onClick={onToggleMastered}
      >
        {mastered ? "✓ 已收录到我的字库" : "标记为已掌握"}
      </button>
    </aside>
  );
}

function PracticeView({
  question,
  questionIndex,
  total,
  selectedOptions,
  checked,
  writeComplete,
  selectedCharacter,
  onSelectOption,
  onCheck,
  onNext,
  onWrite,
  onClearWrite,
  onRestart,
}: {
  question: PracticeQuestion | undefined;
  questionIndex: number;
  total: number;
  selectedOptions: string[];
  checked: boolean;
  writeComplete: boolean;
  selectedCharacter: CharacterItem;
  onSelectOption: (optionId: string) => void;
  onCheck: () => void;
  onNext: () => void;
  onWrite: () => void;
  onClearWrite: () => void;
  onRestart: (focus?: CharacterItem) => void;
}) {
  if (!question) {
    return (
      <div className="view practice-view">
        <ViewHeader
          eyebrow="练习"
          title="准备好了吗？"
          description="为当前课程挑选一轮有节奏的识字练习。"
        />
        <button className="button button-primary" onClick={() => onRestart()}>
          开始综合练习 ↗
        </button>
      </div>
    );
  }

  const needsSelection = question.kind !== "write";
  const readyToCheck = question.kind === "write" ? writeComplete : selectedOptions.length > 0;
  const multiSelect =
    question.kind === "components" &&
    question.options.filter((option) => option.correct).length > 1;
  const correctAnswers = question.options
    .filter((option) => option.correct)
    .map((option) => option.text)
    .join("、");
  const chosenCorrect =
    question.kind === "write"
      ? writeComplete
      : question.options
          .filter((option) => selectedOptions.includes(option.id))
          .every((option) => option.correct) &&
        question.options
          .filter((option) => option.correct)
          .every((option) => selectedOptions.includes(option.id));

  return (
    <div className="view practice-view">
      <ViewHeader
        eyebrow="练习工坊"
        title="让理解，在一次次选择里变得笃定"
        description="题目覆盖字义、结构、部件识别与书写。每次核对后立即获得反馈。"
      />

      <div className="practice-switcher">
        <button className="switch-pill is-active" onClick={() => onRestart()}>综合挑战 · 12 题</button>
        <button className="switch-pill" onClick={() => onRestart(selectedCharacter)}>
          「{selectedCharacter.hanzi}」专项
        </button>
      </div>

      <section className="practice-card">
        <div className="practice-progress">
          <div>
            <span>{question.origin}</span>
            <strong>第 {questionIndex + 1} / {total} 题</strong>
          </div>
          <div className="progress-line" aria-label={"练习进度 " + (questionIndex + 1) + " / " + total}>
            <i style={{ width: ((questionIndex + 1) / total) * 100 + "%" }} />
          </div>
        </div>

        <div className="question-layout">
          <div className="question-sigil">
            <span>{question.character}</span>
            <small>{question.pinyin}</small>
          </div>
          <div className="question-content">
            <p className="question-type">
              {question.kind === "write" ? "动手写一写" : multiSelect ? "可多选" : "请选择一项"}
            </p>
            <h2>{question.prompt}</h2>

            {question.kind === "write" ? (
              <WritingPad
                character={question.character}
                onWrite={onWrite}
                onClear={onClearWrite}
              />
            ) : (
              <div className={"answer-grid " + (question.kind === "components" ? "component-answers" : "")}>
                {question.options.map((option) => {
                  const selected = selectedOptions.includes(option.id);
                  const state =
                    !checked
                      ? selected
                        ? "is-selected"
                        : ""
                      : option.correct
                        ? "is-correct"
                        : selected
                          ? "is-wrong"
                          : "";
                  return (
                    <button
                      className={"answer-option " + state}
                      key={option.id}
                      onClick={() => onSelectOption(option.id)}
                      aria-pressed={selected}
                    >
                      {question.kind === "components" && <span className={option.radical ? "option-part is-radical" : "option-part"}>{option.text}</span>}
                      {question.kind !== "components" && <span className="option-marker" />}
                      <span>{question.kind === "components" ? (option.radical ? "表意部件" : "字形部件") : option.text}</span>
                      {question.kind === "components" && <b>{option.text}</b>}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="check-row">
              {!checked ? (
                <button
                  className="button button-primary"
                  disabled={!readyToCheck}
                  onClick={onCheck}
                >
                  {needsSelection ? "核对答案" : "完成书写"}
                  <span aria-hidden="true">↗</span>
                </button>
              ) : (
                <div className={"feedback " + (chosenCorrect ? "is-correct" : "is-wrong")}>
                  <span>{chosenCorrect ? "✓" : "!"}</span>
                  <div>
                    <strong>{chosenCorrect ? "答得漂亮！" : "再看一眼线索"}</strong>
                    <p>
                      {question.kind === "write"
                        ? "书写完成后，再读一遍这个字的故事。"
                        : "正确答案：" + correctAnswers + "。"}
                    </p>
                    {question.explanation && <p>{question.explanation}</p>}
                  </div>
                  <button className="button button-quiet" onClick={onNext}>
                    {questionIndex >= total - 1 ? "再来一轮" : "下一题"} →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <p className="practice-tip">提示：部件题可能有多个正确答案；书写题会记录一次完成，不会上传你的笔迹。</p>
    </div>
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

    function setupCanvas() {
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      context.scale(ratio, ratio);
      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = 5;
      context.strokeStyle = "#172a4c";
    }

    setupCanvas();
    const observer = new ResizeObserver(setupCanvas);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  function position(event: ReactPointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function begin(event: ReactPointerEvent<HTMLCanvasElement>) {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;
    const point = position(event);
    drawingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(point.x, point.y);
    onWrite();
  }

  function move(event: ReactPointerEvent<HTMLCanvasElement>) {
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
    <div className="writing-pad">
      <div className="writing-guide" aria-hidden="true">{character}</div>
      <canvas
        ref={canvasRef}
        onPointerDown={begin}
        onPointerMove={move}
        onPointerUp={stop}
        onPointerCancel={stop}
        onPointerLeave={stop}
        aria-label={"书写“" + character + "”"}
      />
      <div className="writing-pad-footer">
        <span>在方格中写一写，笔迹只保留在当前页面</span>
        <button onClick={clear}>重写</button>
      </div>
    </div>
  );
}

function ComponentsView({
  components,
  selected,
  search,
  onSearch,
  onSelect,
  onOpenCharacter,
}: {
  components: ComponentItem[];
  selected: ComponentItem;
  search: string;
  onSearch: (value: string) => void;
  onSelect: (value: string) => void;
  onOpenCharacter: (value: CharacterItem) => void;
}) {
  const connectedCharacters = allCharacters.filter((character) =>
    character.parts.some((part) => part.char === selected.glyph),
  );

  return (
    <div className="view components-view">
      <ViewHeader
        eyebrow="部件库"
        title="偏旁不是碎片，是汉字的线索"
        description={"收录 " + allComponents.length + " 个部件，从象形本义到例字，建立可迁移的识字路径。"}
      />

      <div className="component-layout">
        <section className="component-browser">
          <label className="search-field compact">
            <span aria-hidden="true">⌕</span>
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="搜索部件或例字"
              aria-label="搜索部件或例字"
            />
          </label>
          <p className="grid-caption">共 {components.length} 个部件</p>
          <div className="component-grid">
            {components.map((component) => (
              <button
                className={selected.id === component.id ? "is-selected" : ""}
                key={component.id}
                onClick={() => onSelect(component.id)}
              >
                <strong>{component.glyph}</strong>
                <span>{component.title}</span>
              </button>
            ))}
          </div>
        </section>

        <aside className="component-detail">
          <div className="component-display">
            <span>{selected.glyph}</span>
            <div>
              <p>部件 · {String(selected.sequence).padStart(2, "0")}</p>
              <h2>{selected.title}</h2>
            </div>
          </div>
          <p className="component-story">{selected.description}</p>
          <section>
            <div className="section-label"><span>例</span> 常见字</div>
            <div className="example-characters">
              {selected.examples.map((example) => <span key={example}>{example}</span>)}
            </div>
          </section>
          <section>
            <div className="section-label"><span>本册</span> 课程关联</div>
            <div className="linked-characters">
              {(connectedCharacters.length ? connectedCharacters : []).map((character) => (
                <button key={character.id} onClick={() => onOpenCharacter(character)}>
                  <b>{character.hanzi}</b>
                  <span>{character.word}</span>
                </button>
              ))}
              {!connectedCharacters.length && (
                <p>这个部件暂未出现在本册的主学习字中。</p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function ProgressView({
  profile,
  masteryRate,
  accuracy,
  mastered,
  onSelectCharacter,
  onReset,
}: {
  profile: StudyProfile;
  masteryRate: number;
  accuracy: number;
  mastered: Set<string>;
  onSelectCharacter: (value: CharacterItem) => void;
  onReset: () => void;
}) {
  return (
    <div className="view progress-view">
      <ViewHeader
        eyebrow="学习足迹"
        title="每一次回看，都在给记忆加一笔"
        description="这些数据只保存在当前设备，用来帮助你找到下一步最合适的学习节奏。"
      />

      <section className="metric-row">
        <article className="metric-card metric-ink">
          <p>已掌握</p>
          <strong>{profile.mastered.length}<small> / {allCharacters.length}</small></strong>
          <span>汉字卡片</span>
        </article>
        <article className="metric-card metric-saffron">
          <p>掌握进度</p>
          <strong>{masteryRate}<small>%</small></strong>
          <span>持续前进就很好</span>
        </article>
        <article className="metric-card metric-coral">
          <p>练习正确率</p>
          <strong>{accuracy}<small>%</small></strong>
          <span>{profile.attempts ? profile.attempts + " 次作答" : "等你完成第一题"}</span>
        </article>
      </section>

      <section className="progress-layout">
        <article className="card mastery-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">我的字库</p>
              <h2>已掌握的字，会慢慢连成地图</h2>
            </div>
            <span className="card-number">{masteryRate}%</span>
          </div>
          <div className="mastery-character-grid">
            {allCharacters.map((character) => (
              <button
                className={mastered.has(character.id) ? "is-mastered" : ""}
                key={character.id}
                onClick={() => onSelectCharacter(character)}
                title={"查看“" + character.hanzi + "”"}
              >
                {character.hanzi}
              </button>
            ))}
          </div>
        </article>

        <article className="card activity-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">最近练习</p>
              <h2>你刚刚留下的线索</h2>
            </div>
          </div>
          <div className="activity-list">
            {profile.recent.length ? (
              profile.recent.map((item) => (
                <div className="activity-row" key={item.id}>
                  <span className={item.correct ? "activity-mark is-correct" : "activity-mark"}>{item.correct ? "✓" : "·"}</span>
                  <div>
                    <strong>「{item.character}」{item.correct ? "答对了" : "正在复习"}</strong>
                    <p>{item.prompt}</p>
                  </div>
                  <time>{formatShortDate(item.at)}</time>
                </div>
              ))
            ) : (
              <div className="empty-activity">
                <span>↗</span>
                <p>完成一题练习后，记录会出现在这里。</p>
              </div>
            )}
          </div>
          <button className="reset-button" onClick={onReset}>清除本机学习记录</button>
        </article>
      </section>
    </div>
  );
}

function ViewHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="view-header">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}
