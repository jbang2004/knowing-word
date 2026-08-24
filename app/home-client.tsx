"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpenText,
  Check,
  ChevronDown,
  CircleCheckBig,
  CloudOff,
  Flame,
  LockKeyhole,
  Mic2,
} from "lucide-react";
import { useEffect, useMemo, type CSSProperties } from "react";
import {
  homeCandidates,
  homeCourse,
  type HomeCandidate,
} from "./data/home-index.generated";
import { nextTrackCandidate, trackProgress } from "./domain/catalog-progress";
import {
  learningTrackProgress,
  nextLessonActivity,
  recommendedLessonId,
} from "./domain/learning-plan";
import { learningDayKey } from "./domain/learning-day";
import { practiceTrackIds, trackMeta } from "./domain/tracks";
import { routeForTrack } from "./lib/app-route";
import type { StudyProfile, TrackId } from "./lib/profile-model";
import { candidatePathStates } from "./lib/progress-model";
import { useStudyProfile } from "./features/profile/use-study-profile";
import { LearningPageShell } from "./features/shell/learning-page-shell";

const phaseMeta = [
  { title: "从词语认字", copy: "先听懂字义，再辨认完整字形" },
  { title: "看清字形", copy: "观察结构和部件，建立记忆线索" },
  { title: "独立回想", copy: "离开提示，再把这个字想起来" },
] as const;

function continuePath(track: TrackId, candidate: HomeCandidate | undefined) {
  return candidate
    ? routeForTrack(track, candidate.lessonId, candidate.id)
    : routeForTrack(track);
}

export default function HomeLanding() {
  const router = useRouter();
  const { profile, hydrated, syncState } = useStudyProfile({ writable: false });

  const likelyPath = useMemo(
    () => continuePath("words", nextTrackCandidate("words", profile)),
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

  const today = profile.daily[learningDayKey()] || { attempts: 0, correct: 0, skips: 0, readSessions: 0 };
  const streak = currentStreak(profile.daily);
  const nextWord = nextTrackCandidate("words", profile);
  const guidedLessonId = recommendedLessonId(profile);
  const currentLesson =
    homeCourse.lessons.find((lesson) => lesson.id === guidedLessonId) || homeCourse.lessons[0];
  const lessonProgress = trackProgress(profile, "words", currentLesson.id);
  const pathNodes = buildLessonPath(profile, currentLesson.id, nextWord?.id);
  const segments = segmentLessonPath(pathNodes);
  const foundCurrentSegment = segments.findIndex((segment) =>
    segment.characters.some((node) => node.state === "current"),
  );
  const currentSegmentIndex = foundCurrentSegment >= 0
    ? foundCurrentSegment
    : Math.max(0, segments.length - 1);
  const currentPhase = phaseMeta[Math.min(phaseMeta.length - 1, currentSegmentIndex)];
  const progressPercent = lessonProgress.total
    ? Math.round((lessonProgress.completed / lessonProgress.total) * 100)
    : 0;
  const name = profile.name || "小探险家";
  const navigate = (path: string) => router.push(path);
  const allWordsComplete = lessonProgress.total > 0 && lessonProgress.completed === lessonProgress.total;
  const nextActivity = nextLessonActivity(profile, currentLesson.id);
  const allPracticeComplete = allWordsComplete && practiceTrackIds.every((track) => {
    const progress = learningTrackProgress(profile, track, currentLesson.id);
    return progress.total > 0 && progress.completed === progress.total;
  });

  return (
    <LearningPageShell active="home" name={profile.name}>
      <div className="path-home">
        <div className="path-workspace">
          <aside className="path-rail">
            <header className="path-status">
              <button className="path-avatar" onClick={() => navigate("/account")} aria-label="打开学习空间">
                {name.slice(0, 1)}
              </button>
              <span className="path-status-spacer" />
              <span className="path-metric is-streak" title="连续学习天数">
                <Flame aria-hidden="true" size={17} />
                <b>{streak}</b>
              </span>
              <span className="path-metric is-today" title="今日作答次数">
                <CircleCheckBig aria-hidden="true" size={17} />
                <b>{today.attempts}</b>
              </span>
            </header>

            <section className="path-lesson" aria-label={`第 ${currentLesson.position} 课 ${currentLesson.title}`}>
              <div>
                <small>第 {currentLesson.position} 课</small>
                <strong>{currentLesson.title}</strong>
                <span className="path-lesson-progress">
                  <i><b style={{ width: `${progressPercent}%` }} /></i>
                  <small>{lessonProgress.completed} / {lessonProgress.total} 字</small>
                </span>
              </div>
              <button onClick={() => navigate(`/lessons/${currentLesson.id}`)} aria-label={`打开《${currentLesson.title}》课文`}>
                <BookOpenText aria-hidden="true" size={21} />
                <small>课文</small>
              </button>
            </section>

            <section className="path-chapter-note" aria-label="本章要学什么">
              <small>章{chapterNumeral(currentSegmentIndex)} 正在进行</small>
              <strong>{currentPhase.title}</strong>
              <p>{currentPhase.copy}</p>
            </section>

            {(!hydrated || syncState === "local") && (
              <p className="path-sync" role="status">
                <CloudOff aria-hidden="true" size={15} />
                {hydrated ? "当前离线，学习记录会在联网后自动同步" : "正在准备学习空间"}
              </p>
            )}
          </aside>

          <div className="path-main">
            <ol className="path-track" aria-label={`《${currentLesson.title}》学习路线`}>
              {segments.map((segment, segmentIndex) => {
                const phase = phaseMeta[Math.min(segmentIndex, phaseMeta.length - 1)];
                const chapterDone = segment.characters.every((node) => node.state === "done");
                const isPast = segmentIndex < currentSegmentIndex;

                // A finished chapter collapses to one row of small seals: the
                // route stays scannable instead of replaying every learned字.
                if (chapterDone && isPast) {
                  return (
                    <li className="path-segment is-collapsed" key={segment.key}>
                      <button
                        className="path-chapter-done"
                        onClick={() => navigate(segment.characters[0].href)}
                        aria-label={`章${chapterNumeral(segmentIndex)} ${phase.title}，${segment.characters.length} 个字已掌握`}
                      >
                        <span className="path-chapter-seals" aria-hidden="true">
                          {segment.characters.slice(0, 4).map((node) => <i key={node.key}>{node.hanzi}</i>)}
                        </span>
                        <span>
                          <strong>章{chapterNumeral(segmentIndex)} · {phase.title}</strong>
                          <small>{segment.characters.length} 个字已掌握</small>
                        </span>
                        <ChevronDown aria-hidden="true" size={19} />
                      </button>
                    </li>
                  );
                }

                return (
                  <li className="path-segment" key={segment.key}>
                    <p className="path-chapter-rule"><span>章{chapterNumeral(segmentIndex)} · {phase.title}</span></p>
                    <ol className="path-segment-steps">
                      {segment.characters.map((node, nodeIndex) => (
                        <li className={`path-node is-${node.state}`} key={node.key}>
                          <button
                            className="path-seal"
                            onClick={() => navigate(node.href)}
                            disabled={node.state === "locked"}
                            style={{ "--path-offset": `${nodeOffset(nodeIndex)}px` } as CSSProperties}
                            aria-label={`${node.hanzi}${node.state === "done" ? "，已学会" : node.state === "current" ? "，从这里继续" : "，完成前一步后解锁"}`}
                          >
                            {node.hanzi}
                            {node.state === "done" && (
                              <i className="path-seal-check" aria-hidden="true"><Check size={13} strokeWidth={4} /></i>
                            )}
                            {node.state === "locked" && (
                              <i className="path-seal-lock" aria-hidden="true"><LockKeyhole size={13} strokeWidth={2.6} /></i>
                            )}
                          </button>
                        </li>
                      ))}
                    </ol>
                  </li>
                );
              })}
            </ol>
            <section className={`path-practice-plan${allWordsComplete ? " is-ready" : " is-locked"}`} aria-label="本课综合巩固">
              <header>
                <small>{allWordsComplete ? "本课生字已经学完" : `完成 ${lessonProgress.completed}/${lessonProgress.total} 个识字小测后解锁`}</small>
                <strong>整课巩固</strong>
                <p>按整体结构、拆字重组、部件功能的顺序，把这课生字重新想一遍。</p>
              </header>
              <div>
                {practiceTrackIds.map((track) => {
                  const progress = learningTrackProgress(profile, track, currentLesson.id);
                  const isCurrent = allWordsComplete && nextActivity.track === track;
                  const href = isCurrent && nextActivity.candidate
                    ? routeForTrack(track, currentLesson.id, nextActivity.candidate.id)
                    : routeForTrack(track, currentLesson.id);
                  return (
                    <GateNode
                      available={allWordsComplete}
                      current={isCurrent}
                      gate={{
                        kind: "reinforce",
                        key: `${currentLesson.id}-${track}`,
                        track,
                        completed: progress.completed,
                        total: progress.total,
                      }}
                      href={href}
                      key={track}
                      navigate={navigate}
                    />
                  );
                })}
              </div>
              <button
                className="path-read-finish"
                disabled={!allPracticeComplete}
                onClick={() => navigate(`/read-aloud?lessonId=${encodeURIComponent(currentLesson.id)}&returnTo=%2F`)}
              >
                <Mic2 aria-hidden="true" />
                <span><strong>朗读收尾</strong><small>{profile.readLessons.includes(currentLesson.id) ? "本课已朗读" : allPracticeComplete ? "听范读，再完整读一遍" : "完成三项巩固后解锁"}</small></span>
                <ArrowRight aria-hidden="true" size={19} />
              </button>
            </section>
          </div>
        </div>
      </div>
    </LearningPageShell>
  );
}

function GateNode({
  gate,
  href,
  available,
  current,
  navigate,
}: {
  gate: ReinforcementPathNode;
  href: string;
  available: boolean;
  current: boolean;
  navigate: (path: string) => void;
}) {
  const meta = trackMeta[gate.track];
  const complete = gate.total > 0 && gate.completed >= gate.total;
  return (
    <div className={`path-gate${complete ? " is-complete" : ""}${current ? " is-current" : ""}`}>
      <button disabled={!available} onClick={() => navigate(href)}>
        <span className="path-gate-glyph" aria-hidden="true">{meta.glyph}</span>
        <span>
          <strong>{meta.label}</strong>
          <small>{available ? `${gate.completed} / ${gate.total} 已通关` : "学完本课生字后解锁"}</small>
        </span>
        {complete
          ? <i className="path-gate-check" aria-hidden="true"><Check size={17} strokeWidth={3.4} /></i>
          : <ArrowRight aria-hidden="true" size={19} />}
      </button>
    </div>
  );
}

// The route snakes so the eye tracks it as a path rather than a column.
const PATH_OFFSETS = [0, 52, 72, 52, 0, -52, -72, -52];

function nodeOffset(index: number) {
  return PATH_OFFSETS[index % PATH_OFFSETS.length];
}

function currentStreak(daily: StudyProfile["daily"]) {
  const active = new Set(
    Object.entries(daily)
      .filter(([, value]) => (value?.attempts || 0) > 0 || (value?.readSessions || 0) > 0)
      .map(([date]) => date),
  );
  if (!active.size) return 0;

  const today = learningDayKey();
  const cursor = new Date(`${today}T00:00:00Z`);
  if (!active.has(today)) cursor.setUTCDate(cursor.getUTCDate() - 1);

  let streak = 0;
  while (streak < 400) {
    const key = cursor.toISOString().slice(0, 10);
    if (!active.has(key)) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

type CharacterPathNode = {
  kind: "character";
  key: string;
  hanzi: string;
  href: string;
  position: number;
  state: "done" | "current" | "locked";
};

type ReinforcementPathNode = {
  kind: "reinforce";
  key: string;
  track: TrackId;
  completed: number;
  total: number;
};

type PathNode = CharacterPathNode | ReinforcementPathNode;

type PathSegment = {
  key: string;
  characters: CharacterPathNode[];
};

// The character path stays in reading order. Four-character chunks keep each
// screen digestible; specialist practice now opens once at the end of the
// lesson instead of interrupting a chunk with the whole lesson's question set.
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
      position: index + 1,
      state: states[candidate.id],
    });

  });

  return nodes;
}

function segmentLessonPath(nodes: PathNode[]): PathSegment[] {
  const characters = nodes.filter((node): node is CharacterPathNode => node.kind === "character");
  return Array.from({ length: Math.ceil(characters.length / GATE_EVERY) }, (_, index) => ({
    key: `segment-${index + 1}`,
    characters: characters.slice(index * GATE_EVERY, (index + 1) * GATE_EVERY),
  }));
}

function chapterNumeral(index: number) {
  return ["一", "二", "三", "四", "五", "六"][index] || String(index + 1);
}
