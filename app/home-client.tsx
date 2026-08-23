"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpenText,
  Check,
  CloudOff,
  CircleCheckBig,
  Flame,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import {
  homeCandidates,
  homeCourse,
  type HomeCandidate,
} from "./data/home-index.generated";
import {
  todayKey,
  type StudyProfile,
  type TrackId,
} from "./lib/profile-model";
import { candidatePathStates, nextCandidateId } from "./lib/progress-model";
import { useStudyProfile } from "./features/profile/use-study-profile";
import { LearningPageShell } from "./features/shell/learning-page-shell";

type TrackMeta = {
  label: string;
  eyebrow: string;
  action: string;
  glyph: string;
  tone: string;
};

const practiceTrackIds: TrackId[] = ["split", "honglan", "structure"];

const trackMeta: Record<TrackId, TrackMeta> = {
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

function nextCandidate(track: TrackId, profile: StudyProfile) {
  const candidates = homeCandidates[track];
  const id = nextCandidateId(
    candidates.map((candidate) => candidate.id),
    profile.completed[track],
    profile.last[track]?.characterId,
  );
  return candidates.find((candidate) => candidate.id === id);
}

function trackProgress(profile: StudyProfile, track: TrackId, lessonId?: string) {
  const targets = lessonId
    ? homeCandidates[track].filter((candidate) => candidate.lessonId === lessonId)
    : homeCandidates[track];
  return {
    completed: targets.filter((candidate) => profile.completed[track].includes(candidate.id)).length,
    total: targets.length,
  };
}

function trackMapPath(track: TrackId) {
  if (track === "words") return "/lessons";
  if (track === "split") return "/split-exercise";
  if (track === "honglan") return "/honglan-exercise";
  return "/space-structure-exercise";
}

function trackLessonPath(track: TrackId, lessonId: string) {
  return track === "words" ? `/lessons/${lessonId}` : `${trackMapPath(track)}/${lessonId}`;
}

function continuePath(track: TrackId, candidate: HomeCandidate | undefined) {
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
  const { profile, hydrated, syncState } = useStudyProfile({ writable: false });

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
    <LearningPageShell active="home" name={profile.name}>
      <div className="path-home">
        <div className="path-workspace">
          <aside className="path-summary">
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
          </aside>

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
                        <strong>巩固练习 · {meta.label}</strong>
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
        </div>
      </div>
    </LearningPageShell>
  );
}

// A gentle S so consecutive nodes never line up in a column.
const PATH_OFFSETS = [0, 56, 78, 34, -34, -78, -56, 0];

function currentStreak(daily: StudyProfile["daily"]) {
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
  | { kind: "reinforce"; key: string; track: TrackId; completed: number; total: number };

// One line instead of four parallel maps: the lesson's characters in order,
// with a reinforcement prompt after every fourth character cycling through
// the three practice routes. Children previously had to switch between separate
// 识字 / 拆字 / 红蓝 / 结构 maps to see what a lesson still owed them.
const GATE_EVERY = 4;

function buildLessonPath(profile: StudyProfile, lessonId: string, currentId: string | undefined) {
  const lessonWords = homeCandidates.words.filter((candidate) => candidate.lessonId === lessonId);
  const nodes: PathNode[] = [];
  const states = candidatePathStates(
    lessonWords.map((candidate) => candidate.id),
    profile.completed.words,
    currentId,
  );

  lessonWords.forEach((candidate, index) => {
    nodes.push({
      kind: "character",
      key: candidate.id,
      hanzi: candidate.hanzi,
      href: `/lessons/${lessonId}/words/${candidate.id}`,
      state: states[candidate.id],
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
