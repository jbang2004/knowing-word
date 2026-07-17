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
  const name = profile.name || "小探险家";
  const navigate = (path: string) => router.push(path);

  return (
    <main className="game-shell">
      <HomeNavigation name={profile.name} onNavigate={navigate} />
      <div className="page home-page">
        <section className="home-hero">
          <div className="hero-copy">
            <label className="course-selector">
              <span>当前课程</span>
              <select aria-label="选择课程" value={profile.courseId} onChange={() => undefined}>
                <option value="chinese-grade-5-volume-1">语文 · 五年级上册</option>
              </select>
            </label>
            <div className="hero-eyebrow"><Sparkles aria-hidden="true" /> 每日汉字探索</div>
            <h1><span>你好，{name}！</span><span>今天从一个字出发。</span></h1>
            <p>每个学习区都在训练不同能力：先懂字义，再会拆字、分部首、认结构。</p>
            <div className="hero-buttons">
              <button className="game-button primary" onClick={() => navigate(continuePath("words", nextWord))}>
                {nextWord ? `继续学习「${nextWord.hanzi}」` : "开始识字"} <ArrowRight aria-hidden="true" />
              </button>
              <button className="game-button ghost" onClick={() => navigate("/lessons")}>
                <BookOpenText aria-hidden="true" />查看课本
              </button>
            </div>
            <div className="hero-status">
              {syncState === "local" ? <CloudOff aria-hidden="true" /> : <Cloud aria-hidden="true" />}
              {!hydrated
                ? "正在准备学习空间"
                : syncState === "synced"
                  ? `今天已作答 ${today.attempts} 次 · 云端已同步`
                  : `今天已作答 ${today.attempts} 次 · 当前离线，稍后自动同步`}
            </div>
            <dl className="hero-metrics" aria-label="今日学习概览">
              <div><dt>今日作答</dt><dd>{today.attempts}<small> 次</small></dd></div>
              <div><dt>识字进度</dt><dd>{wordProgress.completed}<small> / {wordProgress.total}</small></dd></div>
              <div><dt>朗读练习</dt><dd>{profile.readSessions}<small> 次</small></dd></div>
            </dl>
          </div>
          <div className="hero-illustration">
            <picture className="hero-picture">
              <source
                media="(max-width: 760px)"
                srcSet="/illustrations/system/home-hero-640.avif"
                type="image/avif"
              />
              <img
                src="/illustrations/system/home-hero.webp"
                alt="两名孩子跟随蓝金色喜鹊，在桂花与书卷之间探索汉字"
                width="896"
                height="896"
                decoding="async"
                fetchPriority="high"
              />
            </picture>
            <div className="hero-badge">
              <span>当前识字进度</span>
              <strong>{wordProgress.completed}<small> / {wordProgress.total}</small></strong>
            </div>
          </div>
        </section>

        <section className="mission-heading">
          <div><p className="kicker">今天可以做什么</p><h2>五条学习路线，一起把字学扎实</h2></div>
          <button className="text-button" onClick={() => navigate("/records")}>查看学习记录 <ArrowRight aria-hidden="true" /></button>
        </section>

        <section className="mission-grid">
          {trackIds.map((track) => {
            const meta = trackMeta[track];
            const progress = trackProgress(profile, track);
            const next = nextCandidate(track, profile);
            return (
              <article className={`mission-card ${meta.tone}`} key={track}>
                <div className="mission-card-top">
                  <span className="mission-glyph">{meta.glyph}</span>
                  <span className="mission-count">{progress.completed} / {progress.total}</span>
                </div>
                <p>{meta.eyebrow}</p>
                <h3>{meta.label}</h3>
                <div className="mission-next">
                  <span>{next ? `上次到「${next.hanzi}」` : "准备开始"}</span>
                  <button onClick={() => navigate(continuePath(track, next))}>{meta.action} <ArrowRight aria-hidden="true" /></button>
                </div>
                <div className="mission-progress" aria-hidden="true">
                  <i style={{ width: `${progress.total ? (progress.completed / progress.total) * 100 : 0}%` }} />
                </div>
                <button className="card-link" onClick={() => navigate(trackMapPath(track))} aria-label={`查看${meta.label}关卡地图`} />
              </article>
            );
          })}

          <article className="mission-card reading-card">
            <div className="mission-card-top"><span className="mission-glyph">读</span><span className="mission-count">{profile.readSessions} 次</span></div>
            <p>朗读 · 跟读 · 录音</p>
            <h3>日日朗读</h3>
            <div className="mission-next">
              <span>把课文里的句子读出声</span>
              <button onClick={() => navigate("/read-aloud")}>去朗读 <ArrowRight aria-hidden="true" /></button>
            </div>
            <div className="mission-progress" aria-hidden="true"><i style={{ width: `${Math.min(profile.readSessions * 12.5, 100)}%` }} /></div>
          </article>
        </section>

        <section className="home-bottom-grid">
          <article className="course-glance">
            <div><p className="kicker">关卡地图</p><h2>跟着课文，一课一课往前走</h2></div>
            <div className="lesson-dots">
              {homeCourse.lessons.map((lesson) => {
                const progress = trackProgress(profile, "words", lesson.id);
                return (
                  <button key={lesson.id} onClick={() => navigate("/lessons")}>
                    <span>{String(lesson.position).padStart(2, "0")}</span>
                    <strong>{lesson.title}</strong>
                    <small>{progress.completed} / {progress.total} 字</small>
                  </button>
                );
              })}
            </div>
          </article>
          <article className="learning-promise">
            <span><Sparkles aria-hidden="true" /></span>
            <div><p className="kicker">学习方法</p><h2>看得懂字义，也能说清它是怎么搭起来的。</h2></div>
          </article>
        </section>
      </div>
    </main>
  );
}

function HomeNavigation({ name, onNavigate }: { name: string; onNavigate: (path: string) => void }) {
  const nav: { label: string; path: string; icon: LucideIcon }[] = [
    { label: "首页", path: "/", icon: HomeIcon },
    { label: "课本", path: "/lessons", icon: BookOpenText },
    { label: "专项", path: "/split-exercise", icon: Route },
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
