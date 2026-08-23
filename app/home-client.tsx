"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpenText,
  Check,
  ChevronDown,
  ChevronUp,
  CircleCheckBig,
  CloudOff,
  Flame,
  LockKeyhole,
  MapPinned,
  Target,
} from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
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
  glyph: string;
  tone: string;
};

const practiceTrackIds: TrackId[] = ["split", "honglan", "structure"];

const trackMeta: Record<TrackId, TrackMeta> = {
  words: {
    label: "词语表与写字表",
    eyebrow: "理解字义，认识字形",
    glyph: "字",
    tone: "coral",
  },
  split: {
    label: "拆字练习",
    eyebrow: "拆一拆，再写一写",
    glyph: "拆",
    tone: "saffron",
  },
  honglan: {
    label: "红蓝练习",
    eyebrow: "分清部首与其他部件",
    glyph: "辨",
    tone: "lapis",
  },
  structure: {
    label: "空间结构",
    eyebrow: "像搭积木一样看汉字",
    glyph: "构",
    tone: "jade",
  },
};

const phaseMeta = [
  { title: "认识字义", copy: "把字放回课文，先听懂它的意思" },
  { title: "看清部件", copy: "找准偏旁与结构，建立字形线索" },
  { title: "回到课文", copy: "再次辨认朗读，把整课串联起来" },
] as const;

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
  const [showFullRoute, setShowFullRoute] = useState(false);

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
  const pathNodes = buildLessonPath(profile, currentLesson.id, nextWord?.id);
  const segments = segmentLessonPath(pathNodes);
  const characters = pathNodes.filter((node): node is CharacterPathNode => node.kind === "character");
  const currentCharacter = characters.find((node) => node.state === "current") || characters.at(-1);
  const currentPosition = currentCharacter?.position || 1;
  const currentPhase = phaseMeta[Math.min(phaseMeta.length - 1, Math.floor((currentPosition - 1) / GATE_EVERY))];
  const mobileWindowStart = currentPosition;
  const mobileWindowEnd = Math.min(characters.length, currentPosition + 3);
  const progressPercent = lessonProgress.total
    ? Math.round((lessonProgress.completed / lessonProgress.total) * 100)
    : 0;
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
                    <b style={{ width: `${progressPercent}%` }} />
                  </i>
                  <small>{lessonProgress.completed} / {lessonProgress.total} 字</small>
                </span>
              </div>
              <button onClick={() => navigate(`/lessons/${currentLesson.id}`)}>
                <BookOpenText aria-hidden="true" size={20} />
                <small>课文</small>
              </button>
            </section>

            {currentCharacter && (
              <section className="path-resume" aria-label="当前学习任务">
                <div className="path-resume-heading">
                  <span className="path-resume-glyph" aria-hidden="true">{currentCharacter.hanzi}</span>
                  <span>
                    <small>当前任务 · 第 {currentPosition} 字</small>
                    <strong>继续认识「{currentCharacter.hanzi}」</strong>
                  </span>
                </div>
                <p>{currentPhase.copy}</p>
                <button onClick={() => navigate(currentCharacter.href)}>
                  继续学习
                  <ArrowRight aria-hidden="true" size={17} />
                </button>
              </section>
            )}

            <section className="path-milestone" aria-label="下一学习阶段">
              <Target aria-hidden="true" size={18} />
              <span>
                <small>正在进行</small>
                <strong>{currentPhase.title}</strong>
              </span>
              <b>{Math.min(GATE_EVERY, ((currentPosition - 1) % GATE_EVERY) + 1)} / {GATE_EVERY}</b>
            </section>

            {(!hydrated || syncState === "local") && (
              <p className="path-sync" role="status">
                <CloudOff aria-hidden="true" size={14} />
                {hydrated ? "当前离线，学习记录会在联网后自动同步" : "正在准备学习空间"}
              </p>
            )}
          </aside>

          <div className="path-main">
            {currentCharacter && (
              <div className="path-mobile-progress">
                <span>
                  <small>第 {currentLesson.position} 课 · {lessonProgress.completed}/{lessonProgress.total}</small>
                  <strong>{currentLesson.title} · 继续「{currentCharacter.hanzi}」</strong>
                </span>
                <button onClick={() => navigate(currentCharacter.href)} aria-label={`继续学习${currentCharacter.hanzi}`}>
                  <ArrowRight aria-hidden="true" size={18} />
                </button>
              </div>
            )}

            <section className="path-map" aria-labelledby="lesson-path-title">
              <header className="path-map-header">
                <div>
                  <span className="path-map-kicker">
                    <MapPinned aria-hidden="true" size={15} />
                    本课学习路线
                  </span>
                  <h1 id="lesson-path-title">沿着字迹，读懂《{currentLesson.title}》</h1>
                  <p>每认识四个字，就停下来练一练。</p>
                </div>
                <span className="path-map-progress" aria-label={`本课完成 ${progressPercent}%`}>
                  <strong>{progressPercent}%</strong>
                  <small>本课进度</small>
                </span>
              </header>

              <ol
                className={`path-track${showFullRoute ? " is-expanded" : ""}`}
                style={{ "--path-progress": `${progressPercent}%` } as CSSProperties}
              >
                {segments.map((segment, segmentIndex) => {
                  const phase = phaseMeta[Math.min(segmentIndex, phaseMeta.length - 1)];
                  const gate = segment.gate;
                  const segmentStart = segment.characters[0]?.position || 1;
                  const segmentEnd = segment.characters.at(-1)?.position || segmentStart;
                  const segmentVisible = segmentEnd >= mobileWindowStart && segmentStart <= mobileWindowEnd;
                  const gateVisible = Boolean(
                    gate && segmentEnd >= mobileWindowStart && segmentEnd <= mobileWindowEnd,
                  );
                  return (
                    <li
                      className={`path-segment${segmentVisible || gateVisible ? "" : " is-mobile-hidden"}`}
                      key={segment.key}
                    >
                      <header className="path-segment-heading">
                        <span>章{chapterNumeral(segmentIndex)}</span>
                        <div>
                          <strong>{phase.title}</strong>
                          <small>{phase.copy}</small>
                        </div>
                      </header>

                      <ol className="path-segment-steps">
                        {segment.characters.map((node) => {
                          const mobileVisible = node.position >= mobileWindowStart && node.position <= mobileWindowEnd;
                          return (
                            <li
                              className={`path-node path-character-row is-${node.state}${mobileVisible ? "" : " is-mobile-hidden"}`}
                              key={node.key}
                            >
                              <button
                                className="path-character-seal"
                                onClick={() => navigate(node.href)}
                                disabled={node.state === "locked"}
                                aria-label={`${node.hanzi}${node.state === "done" ? "，已学会" : node.state === "current" ? "，从这里继续" : "，完成前一步后解锁"}`}
                              >
                                {node.hanzi}
                              </button>
                              <span className="path-node-copy">
                                <small>第 {node.position} 字</small>
                                <strong>
                                  {node.state === "done" && `已掌握「${node.hanzi}」`}
                                  {node.state === "current" && `继续认识「${node.hanzi}」`}
                                  {node.state === "locked" && `接下来认识「${node.hanzi}」`}
                                </strong>
                                <em>
                                  {node.state === "done" && "字义、字形与课文线索已经点亮"}
                                  {node.state === "current" && "当前任务 · 点击进入学习"}
                                  {node.state === "locked" && <><LockKeyhole aria-hidden="true" size={12} /> 完成前一步后开启</>}
                                </em>
                              </span>
                              {node.state === "done" && (
                                <span className="path-node-check" aria-hidden="true">
                                  <Check size={12} strokeWidth={3.4} />
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ol>

                      {gate && (
                        <div className={`path-gate${gateVisible ? "" : " is-mobile-hidden"}`}>
                          <button onClick={() => navigate(trackLessonPath(gate.track, currentLesson.id))}>
                            <span className={`path-gate-glyph tone-${trackMeta[gate.track].tone}`} aria-hidden="true">
                              {trackMeta[gate.track].glyph}
                            </span>
                            <span>
                              <small>练习驿站 · 已完成 {gate.completed}/{gate.total}</small>
                              <strong>巩固练习 · {trackMeta[gate.track].label}</strong>
                              <em>{trackMeta[gate.track].eyebrow}</em>
                            </span>
                            <ArrowRight aria-hidden="true" size={18} />
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>

              <div className="path-route-disclosure">
                <button onClick={() => setShowFullRoute((value) => !value)} aria-expanded={showFullRoute}>
                  {showFullRoute ? <ChevronUp aria-hidden="true" size={17} /> : <ChevronDown aria-hidden="true" size={17} />}
                  {showFullRoute ? "收起完整路线" : `查看本课完整路线 · ${characters.length} 字`}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </LearningPageShell>
  );
}

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
  gate?: ReinforcementPathNode;
};

// One route instead of four parallel maps: the lesson's characters stay in
// reading order and each four-character chapter ends at a practice station.
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

function segmentLessonPath(nodes: PathNode[]) {
  const segments: PathSegment[] = [];
  let characters: CharacterPathNode[] = [];

  nodes.forEach((node) => {
    if (node.kind === "character") {
      characters.push(node);
      return;
    }
    segments.push({ key: `segment-${segments.length + 1}`, characters, gate: node });
    characters = [];
  });

  if (characters.length) {
    segments.push({ key: `segment-${segments.length + 1}`, characters });
  }
  return segments;
}

function chapterNumeral(index: number) {
  return ["一", "二", "三", "四", "五", "六"][index] || String(index + 1);
}
