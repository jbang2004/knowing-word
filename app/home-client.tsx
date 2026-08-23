"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpenText,
  Check,
  CloudOff,
  CircleCheckBig,
  Flame,
  Home as HomeIcon,
  LayoutGrid,
  UserRound,
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
  const streak = currentStreak(profile.daily);
  const nextWord = nextCandidate("words", profile);
  const currentLesson =
    homeCourse.lessons.find((lesson) => lesson.id === nextWord?.lessonId) || homeCourse.lessons[0];
  const lessonProgress = trackProgress(profile, "words", currentLesson.id);
  const nodes = buildLessonPath(profile, currentLesson.id, nextWord?.id);
  const name = profile.name || "小探险家";
  const navigate = (path: string) => router.push(path);

  return (
    <main className="path-home">
      <header className="path-header">
        <button className="path-avatar" onClick={() => navigate("/account")} aria-label="打开学习空间">
          {name.slice(0, 1)}
        </button>
        <span className="path-greeting">
          <strong>你好，{name}</strong>
          <small>{homeCourse.title}</small>
        </span>
        <span className="path-metric is-streak" title="连续学习天数">
          <Flame aria-hidden="true" size={15} />
          {streak}
        </span>
        <span className="path-metric is-today" title="今日作答次数">
          <CircleCheckBig aria-hidden="true" size={14} />
          {today.attempts}
        </span>
      </header>

      <section className="path-lesson" aria-label={`第 ${currentLesson.position} 课 ${currentLesson.title}`}>
        <div>
          <small>第 {currentLesson.position} 课</small>
          <strong>{currentLesson.title}</strong>
          <span className="path-lesson-progress">
            <i>
              <b style={{ width: `${lessonProgress.total ? (lessonProgress.completed / lessonProgress.total) * 100 : 0}%` }} />
            </i>
            <small>{lessonProgress.completed} / {lessonProgress.total} 字</small>
          </span>
        </div>
        <button onClick={() => navigate(`/lessons/${currentLesson.id}`)}>
          <BookOpenText aria-hidden="true" size={20} />
          <small>课文</small>
        </button>
      </section>

      {(!hydrated || syncState === "local") && (
        <p className="path-sync" role="status">
          <CloudOff aria-hidden="true" size={14} />
          {hydrated ? "当前离线，学习记录会在联网后自动同步" : "正在准备学习空间"}
        </p>
      )}

      <ol className="path-track">
        {nodes.map((node, index) => {
          const offset = PATH_OFFSETS[index % PATH_OFFSETS.length];
          if (node.kind === "reinforce") {
            const meta = trackMeta[node.track];
            return (
              <li className="path-gate" key={node.key}>
                <button onClick={() => navigate(trackLessonPath(node.track, currentLesson.id))}>
                  <span className={`path-gate-glyph tone-${meta.tone}`} aria-hidden="true">{meta.glyph}</span>
                  <span>
                    <strong>巩固关 · {meta.label}</strong>
                    <small>{meta.eyebrow} · 已完成 {node.completed}/{node.total}</small>
                  </span>
                  <ArrowRight aria-hidden="true" size={18} />
                </button>
              </li>
            );
          }

          return (
            <li className={`path-node is-${node.state}`} key={node.key} style={{ marginLeft: offset }}>
              {node.state === "current" && <span className="path-node-bubble">开始</span>}
              <button
                onClick={() => navigate(node.href)}
                disabled={node.state === "locked"}
                aria-label={`${node.hanzi}${node.state === "done" ? "，已学会" : node.state === "current" ? "，从这里继续" : "，尚未解锁"}`}
              >
                {node.hanzi}
              </button>
              {node.state === "done" && (
                <span className="path-node-check" aria-hidden="true">
                  <Check size={12} strokeWidth={3.4} />
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <nav className="path-tabs" aria-label="主菜单">
        <button className="is-active" onClick={() => navigate("/")}>
          <HomeIcon aria-hidden="true" size={22} />
          <small>学习</small>
        </button>
        <button onClick={() => navigate("/lessons")}>
          <BookOpenText aria-hidden="true" size={22} />
          <small>课本</small>
        </button>
        <button onClick={() => navigate("/practice")}>
          <LayoutGrid aria-hidden="true" size={22} />
          <small>练习</small>
        </button>
        <button onClick={() => navigate("/account")}>
          <UserRound aria-hidden="true" size={22} />
          <small>我的</small>
        </button>
      </nav>
    </main>
  );
}

// A gentle S so consecutive nodes never line up in a column.
const PATH_OFFSETS = [0, 56, 78, 34, -34, -78, -56, 0];

// Consecutive days ending today or yesterday that have at least one answer.
function currentStreak(daily: HomeProfile["daily"]) {
  const active = new Set(
    Object.entries(daily)
      .filter(([, value]) => (value?.attempts || 0) > 0 || (value?.readSessions || 0) > 0)
      .map(([date]) => date),
  );
  if (!active.size) return 0;

  const cursor = new Date(`${todayKey()}T00:00:00Z`);
  if (!active.has(todayKey())) cursor.setUTCDate(cursor.getUTCDate() - 1);

  let streak = 0;
  while (streak < 400) {
    const key = cursor.toISOString().slice(0, 10);
    if (!active.has(key)) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

type PathNode =
  | { kind: "character"; key: string; hanzi: string; href: string; state: "done" | "current" | "locked" }
  | { kind: "reinforce"; key: string; track: HomeTrackId; completed: number; total: number };

// One line instead of four parallel maps: the lesson's characters in order,
// with a reinforcement gate after every fourth character cycling through the
// three practice routes. Children previously had to switch between separate
// 识字 / 拆字 / 红蓝 / 结构 maps to see what a lesson still owed them.
const GATE_EVERY = 4;

function buildLessonPath(profile: HomeProfile, lessonId: string, currentId: string | undefined) {
  const lessonWords = homeCandidates.words.filter((candidate) => candidate.lessonId === lessonId);
  const nodes: PathNode[] = [];
  let seenCurrent = false;

  lessonWords.forEach((candidate, index) => {
    const done = profile.completed.words.includes(candidate.id);
    const isCurrent = !done && (candidate.id === currentId || !seenCurrent);
    if (isCurrent) seenCurrent = true;
    nodes.push({
      kind: "character",
      key: candidate.id,
      hanzi: candidate.hanzi,
      href: `/lessons/${lessonId}/words/${candidate.id}`,
      state: done ? "done" : isCurrent ? "current" : "locked",
    });

    const gateIndex = index + 1;
    if (gateIndex % GATE_EVERY === 0) {
      const track = practiceTrackIds[(gateIndex / GATE_EVERY - 1) % practiceTrackIds.length];
      const progress = trackProgress(profile, track, lessonId);
      nodes.push({
        kind: "reinforce",
        key: `${lessonId}-gate-${gateIndex}`,
        track,
        completed: progress.completed,
        total: progress.total,
      });
    }
  });

  return nodes;
}
