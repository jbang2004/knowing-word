"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpenText,
  ChartNoAxesColumnIncreasing,
  Cloud,
  CloudOff,
  Home as HomeIcon,
  Layers3,
  Route,
  Sparkles,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  homeCandidates,
  homeCourse,
  type HomeCandidate,
  type HomeTrackId,
} from "./data/home-index.generated";
import { nextCandidateId } from "./lib/progress-model";

type ResumePoint = {
  lessonId: string;
  characterId: string;
  questionIndex: number;
};

type HomeProfile = {
  name: string;
  courseId: string;
  theme: "light" | "night";
  completed: Record<HomeTrackId, string[]>;
  last: Record<HomeTrackId, ResumePoint | null>;
  daily: Record<string, { attempts: number; correct: number; skips: number; readSessions: number }>;
  readSessions: number;
};

type TrackMeta = {
  label: string;
  eyebrow: string;
  action: string;
  glyph: string;
  tone: string;
};

const trackIds: HomeTrackId[] = ["words", "split", "honglan", "structure"];
const practiceTrackIds: HomeTrackId[] = ["split", "honglan", "structure"];
const STORAGE_KEY = "knowing-word:course-progress:v3";
const STORAGE_UPDATED_KEY = "knowing-word:course-progress:updated-at";
const VERSION_TWO_STORAGE_KEY = "knowing-word:course-progress:v2";
const LEGACY_STORAGE_KEY = "knowing-word:local-profile:v1";

const trackMeta: Record<HomeTrackId, TrackMeta> = {
  words: {
    label: "词语表与写字表",
    eyebrow: "理解字义，认识字形",
    action: "继续识字",
    glyph: "字",
    tone: "coral",
  },
  split: {
    label: "课后练习",
    eyebrow: "拆一拆，再写一写",
    action: "继续拆字",
    glyph: "拆",
    tone: "saffron",
  },
  honglan: {
    label: "红蓝练习",
    eyebrow: "分清部首与其他部件",
    action: "继续红蓝",
    glyph: "红蓝",
    tone: "lapis",
  },
  structure: {
    label: "空间结构",
    eyebrow: "像搭积木一样看汉字",
    action: "继续结构",
    glyph: "构",
    tone: "jade",
  },
};

function emptyProfile(): HomeProfile {
  return {
    name: "",
    courseId: "chinese-grade-5-volume-1",
    theme: "light",
    completed: { words: [], split: [], honglan: [], structure: [] },
    last: { words: null, split: null, honglan: null, structure: null },
    daily: {},
    readSessions: 0,
  };
}

function normalizeProfile(value: unknown): HomeProfile {
  const raw = (value || {}) as Partial<HomeProfile> & { mastered?: unknown };
  const normalized = emptyProfile();
  const legacyMastered = Array.isArray(raw.mastered)
    ? raw.mastered.filter((item): item is string => typeof item === "string")
    : [];

  for (const track of trackIds) {
    const completed = raw.completed?.[track];
    normalized.completed[track] = Array.isArray(completed)
      ? completed.filter((item): item is string => typeof item === "string")
      : track === "words"
        ? legacyMastered
        : [];
    const resume = raw.last?.[track];
    normalized.last[track] =
      resume &&
      typeof resume.lessonId === "string" &&
      typeof resume.characterId === "string" &&
      typeof resume.questionIndex === "number"
        ? resume
        : null;
  }

  normalized.name = typeof raw.name === "string" ? raw.name.slice(0, 18) : "";
  normalized.courseId = typeof raw.courseId === "string"
    ? raw.courseId
    : "chinese-grade-5-volume-1";
  normalized.theme = raw.theme === "night" ? "night" : "light";
  normalized.daily = raw.daily && typeof raw.daily === "object" ? raw.daily : {};
  normalized.readSessions = typeof raw.readSessions === "number" && Number.isFinite(raw.readSessions)
    ? raw.readSessions
    : 0;
  return normalized;
}

function todayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function nextCandidate(track: HomeTrackId, profile: HomeProfile) {
  const candidates = homeCandidates[track];
  const id = nextCandidateId(
    candidates.map((candidate) => candidate.id),
    profile.completed[track],
    profile.last[track]?.characterId,
  );
  return candidates.find((candidate) => candidate.id === id);
}

function trackProgress(profile: HomeProfile, track: HomeTrackId, lessonId?: string) {
  const targets = lessonId
    ? homeCandidates[track].filter((candidate) => candidate.lessonId === lessonId)
    : homeCandidates[track];
  return {
    completed: targets.filter((candidate) => profile.completed[track].includes(candidate.id)).length,
    total: targets.length,
  };
}

function trackMapPath(track: HomeTrackId) {
  if (track === "words") return "/lessons";
  if (track === "split") return "/split-exercise";
  if (track === "honglan") return "/honglan-exercise";
  return "/space-structure-exercise";
}

function trackLessonPath(track: HomeTrackId, lessonId: string) {
  return track === "words" ? `/lessons/${lessonId}` : `${trackMapPath(track)}/${lessonId}`;
}

function continuePath(track: HomeTrackId, candidate: HomeCandidate | undefined) {
  if (!candidate) return trackMapPath(track);
  if (track === "words") {
    return `/lessons/${candidate.lessonId}/words/${candidate.id}/quizzes`;
  }
  const base = trackMapPath(track);
  const segment = track === "split" ? "words" : "lesson_words";
  return `${base}/${candidate.lessonId}/${segment}/${candidate.id}`;
}

export default function HomeLanding() {
  const router = useRouter();
  const [profile, setProfile] = useState<HomeProfile>(emptyProfile);
  const [hydrated, setHydrated] = useState(false);
  const [syncState, setSyncState] = useState<"loading" | "synced" | "local">("loading");

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(async () => {
      let localProfile: HomeProfile | null = null;
      let localUpdatedAt = 0;
      try {
        const stored =
          window.localStorage.getItem(STORAGE_KEY) ||
          window.localStorage.getItem(VERSION_TWO_STORAGE_KEY) ||
          window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (stored) localProfile = normalizeProfile(JSON.parse(stored));
        localUpdatedAt = Date.parse(window.localStorage.getItem(STORAGE_UPDATED_KEY) || "") || 0;
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }

      try {
        const response = await fetch("/api/profile", { cache: "no-store" });
        if (!response.ok) throw new Error("profile unavailable");
        const payload = await response.json() as { profile?: unknown; updatedAt?: string | null };
        if (!active) return;
        const serverUpdatedAt = Date.parse(payload.updatedAt || "") || 0;
        if (payload.profile && (!localProfile || serverUpdatedAt >= localUpdatedAt)) {
          setProfile(normalizeProfile(payload.profile));
        } else if (localProfile) {
          setProfile(localProfile);
        }
        setSyncState("synced");
      } catch {
        if (active && localProfile) setProfile(localProfile);
        if (active) setSyncState("local");
      } finally {
        if (active) setHydrated(true);
      }
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = profile.theme;
  }, [profile.theme]);

  const likelyPath = useMemo(
    () => continuePath("words", nextCandidate("words", profile)),
    [profile],
  );

  useEffect(() => {
    const prefetch = () => {
      router.prefetch("/lessons");
      if (likelyPath !== "/lessons") router.prefetch(likelyPath);
    };
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (idleWindow.requestIdleCallback) {
      const id = idleWindow.requestIdleCallback(prefetch, { timeout: 1800 });
      return () => idleWindow.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(prefetch, 900);
    return () => window.clearTimeout(id);
  }, [likelyPath, router]);

  const today = profile.daily[todayKey()] || { attempts: 0, correct: 0, skips: 0, readSessions: 0 };
  const nextWord = nextCandidate("words", profile);
  const wordProgress = trackProgress(profile, "words");
  const currentLesson = homeCourse.lessons.find((lesson) => lesson.id === nextWord?.lessonId) || homeCourse.lessons[0];
  const currentLessonProgress = trackProgress(profile, "words", currentLesson.id);
  const currentLessonIndex = Math.max(0, homeCourse.lessons.findIndex((lesson) => lesson.id === currentLesson.id));
  const nearbyLessons = homeCourse.lessons.slice(Math.max(0, currentLessonIndex - 1), Math.min(homeCourse.lessons.length, currentLessonIndex + 5));
  const reinforcementProgress = practiceTrackIds.reduce(
    (summary, track) => {
      const progress = trackProgress(profile, track, currentLesson.id);
      return { completed: summary.completed + progress.completed, total: summary.total + progress.total };
    },
    { completed: 0, total: 0 },
  );
  const name = profile.name || "小探险家";
  const navigate = (path: string) => router.push(path);

  return (
    <main className="game-shell">
      <HomeNavigation name={profile.name} onNavigate={navigate} />
      <div className="page home-page">
        <section className="home-command-center" aria-label="继续学习">
          <article className="home-resume-card">
            <div className="home-resume-copy">
              <div className="home-course-line">
                <span>语文 · 五年级上册</span>
                <i>第 {currentLesson.position} 课</i>
              </div>
              <p className="home-greeting">你好，{name}</p>
              <h1>接着认识<em>「{nextWord?.hanzi || "鹭"}」</em></h1>
              <p className="home-resume-intro">
                回到《{currentLesson.title}》的词语里，先弄懂字义和字形，再用不同方法把它记牢。
              </p>
              <div className="home-resume-actions">
                <button className="game-button primary" onClick={() => navigate(continuePath("words", nextWord))}>
                  {nextWord ? "继续这个字" : "开始识字"} <ArrowRight aria-hidden="true" />
                </button>
                <button className="game-button ghost" onClick={() => navigate(`/lessons/${currentLesson.id}`)}>
                  <BookOpenText aria-hidden="true" />回到本课
                </button>
              </div>
            </div>
            <div className="home-resume-art">
              <picture>
                <source media="(max-width: 760px)" srcSet="/illustrations/system/home-hero-640.avif" type="image/avif" />
                <img
                  src="/illustrations/system/home-hero.webp"
                  alt="两名孩子跟随蓝金色喜鹊，在桂花与书卷之间探索汉字"
                  width="896"
                  height="896"
                  decoding="async"
                  fetchPriority="high"
                />
              </picture>
              <span className="home-art-caption"><Sparkles aria-hidden="true" /> 从一个字，看见一方世界</span>
            </div>
          </article>

          <aside className="home-today-card">
            <div className="home-today-heading">
              <div><span>今日学习</span><strong>完成一个字，就很好</strong></div>
              <i>{currentLessonProgress.completed}/{currentLessonProgress.total}</i>
            </div>
            <div className="home-lesson-progress" aria-label={`本课已完成 ${currentLessonProgress.completed} 个，共 ${currentLessonProgress.total} 个字`}>
              <i style={{ width: `${currentLessonProgress.total ? (currentLessonProgress.completed / currentLessonProgress.total) * 100 : 0}%` }} />
            </div>
            <dl className="home-today-metrics">
              <div><dt>今日作答</dt><dd>{today.attempts}<small> 次</small></dd></div>
              <div><dt>全册识字</dt><dd>{wordProgress.completed}<small> / {wordProgress.total}</small></dd></div>
              <div><dt>朗读练习</dt><dd>{profile.readSessions}<small> 次</small></dd></div>
            </dl>
            <button className="home-course-link" onClick={() => navigate("/lessons")}>
              查看完整课程地图 <ArrowRight aria-hidden="true" />
            </button>
            <div className="home-sync-state">
              {syncState === "local" ? <CloudOff aria-hidden="true" /> : <Cloud aria-hidden="true" />}
              {!hydrated ? "正在准备学习空间" : syncState === "synced" ? "学习记录已同步" : "当前离线，稍后自动同步"}
            </div>
          </aside>
        </section>

        <section className="home-learning-flow" aria-labelledby="home-flow-title">
          <div className="home-section-heading">
            <div><p className="kicker">本课学习路径</p><h2 id="home-flow-title">先学懂，再练会，最后读出来</h2></div>
            <span>《{currentLesson.title}》</span>
          </div>
          <ol>
            <li>
              <button onClick={() => navigate(`/lessons/${currentLesson.id}`)}>
                <i>01</i><span><small>进入课文</small><strong>读懂本课</strong></span><b>查看内容 <ArrowRight aria-hidden="true" /></b>
              </button>
            </li>
            <li className="is-current">
              <button onClick={() => navigate(continuePath("words", nextWord))}>
                <i>02</i><span><small>当前任务</small><strong>认识字词</strong></span><b>{currentLessonProgress.completed}/{currentLessonProgress.total} 字 <ArrowRight aria-hidden="true" /></b>
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/practice")}>
                <i>03</i><span><small>换种方法</small><strong>三种巩固</strong></span><b>{reinforcementProgress.completed}/{reinforcementProgress.total} 关 <ArrowRight aria-hidden="true" /></b>
              </button>
            </li>
            <li>
              <button onClick={() => navigate("/read-aloud")}>
                <i>04</i><span><small>读出声音</small><strong>朗读收尾</strong></span><b>{profile.readSessions} 次 <ArrowRight aria-hidden="true" /></b>
              </button>
            </li>
          </ol>
        </section>

        <section className="home-practice-section" aria-labelledby="home-practice-title">
          <div className="home-section-heading">
            <div><p className="kicker">本课巩固</p><h2 id="home-practice-title">同一批字，换三种眼光再看一遍</h2></div>
            <button className="text-button" onClick={() => navigate("/practice")}>进入练习中心 <ArrowRight aria-hidden="true" /></button>
          </div>
          <div className="home-practice-grid">
            {practiceTrackIds.map((track, index) => {
              const meta = trackMeta[track];
              const lessonProgress = trackProgress(profile, track, currentLesson.id);
              return (
                <article className={`home-practice-card ${meta.tone}`} key={track}>
                  <div className="home-practice-index"><span>{String(index + 1).padStart(2, "0")}</span><i>{lessonProgress.completed}/{lessonProgress.total}</i></div>
                  <span className="home-practice-glyph">{meta.glyph}</span>
                  <div><p>{meta.eyebrow}</p><h3>{meta.label}</h3></div>
                  <button onClick={() => navigate(trackLessonPath(track, currentLesson.id))}>练习本课 <ArrowRight aria-hidden="true" /></button>
                </article>
              );
            })}
          </div>
        </section>

        <section className="home-course-section" aria-labelledby="home-course-title">
          <div className="home-section-heading">
            <div><p className="kicker">课程进度</p><h2 id="home-course-title">从这一课，继续往前走</h2></div>
            <button className="text-button" onClick={() => navigate("/lessons")}>全部 26 课 <ArrowRight aria-hidden="true" /></button>
          </div>
          <div className="home-course-strip">
            {nearbyLessons.map((lesson) => {
              const progress = trackProgress(profile, "words", lesson.id);
              const isCurrent = lesson.id === currentLesson.id;
              return (
                <button className={isCurrent ? "is-current" : ""} key={lesson.id} onClick={() => navigate(`/lessons/${lesson.id}`)}>
                  <span>{String(lesson.position).padStart(2, "0")}</span>
                  <strong>{lesson.title}</strong>
                  <small>{progress.completed}/{progress.total} 字</small>
                  <i><ArrowRight aria-hidden="true" /></i>
                </button>
              );
            })}
          </div>
        </section>

        <section className="home-method-note">
          <div><Sparkles aria-hidden="true" /><span><small>学习方法</small><strong>不是看过图片就算会了，而是能理解、能拆解、能在没有图片时想起来。</strong></span></div>
          <button onClick={() => navigate("/literacy-lab")}>看看识字方法 <ArrowRight aria-hidden="true" /></button>
        </section>
      </div>
    </main>
  );
}

function HomeNavigation({ name, onNavigate }: { name: string; onNavigate: (path: string) => void }) {
  const nav: { label: string; path: string; icon: LucideIcon }[] = [
    { label: "首页", path: "/", icon: HomeIcon },
    { label: "课本", path: "/lessons", icon: BookOpenText },
    { label: "练习", path: "/practice", icon: Route },
    { label: "部件", path: "/bujian", icon: Layers3 },
    { label: "记录", path: "/records", icon: ChartNoAxesColumnIncreasing },
  ];

  return (
    <header className="top-navigation">
      <button className="wordmark" onClick={() => onNavigate("/")} aria-label="回到 Knowing Word 首页">
        <span className="brand-seal" aria-hidden="true">知</span>
        <span className="wordmark-copy"><strong>KNOWING WORD</strong><span className="wordmark-flag">从一个字，看见一方世界</span></span>
      </button>
      <nav aria-label="主菜单">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <button className={item.path === "/" ? "is-active" : ""} key={item.label} onClick={() => onNavigate(item.path)}>
              <Icon aria-hidden="true" /><span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <button className="profile-pill" onClick={() => onNavigate("/account")} aria-label={`打开${name || "我的"}学习空间`}>
        <span>{name ? name.slice(0, 1) : "学"}</span>
        <small>{name || "学习空间"}</small>
        <UserRound aria-hidden="true" />
      </button>
    </header>
  );
}
