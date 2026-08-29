"use client";

import Link from "next/link";
import { useState } from "react";
import type { CharacterItem } from "../../data/catalog-types";
import { grade5Lessons } from "../../data/generated/grade5-volume1/course";
import { homeCandidates } from "../../data/home-index.generated";
import {
  skillDimensions,
  type DimensionMemory,
  type SkillDimension,
} from "../../domain/learning-state";
import { getTrackExercises, questionTypeLabel } from "../../domain/practice";
import { trackMeta } from "../../domain/tracks";
import { routeForTrack } from "../../lib/app-route";
import { withReturnTo } from "../../lib/navigation";
import {
  characterMemoryFromProfile,
  trackIds,
  type TrackId,
} from "../../lib/profile-model";
import { useStudyProfile } from "../profile/use-study-profile";
import { LearningPageShell, PageHeading } from "../shell/learning-page-shell";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

const dimensionMeta: Record<SkillDimension, { label: string; copy: string }> = {
  recognition: { label: "认读", copy: "看到字，能独立认出来" },
  phonology: { label: "读音", copy: "看到字，能读准字音" },
  semantics: { label: "字义", copy: "理解字义和常用词义" },
  generation: { label: "字形重构", copy: "不看答案，能按部件组出；手写由系统逐笔检查" },
  discrimination: { label: "辨析", copy: "分清形近字和同音字" },
  context: { label: "情境", copy: "能在新词句中正确使用" },
};

const memoryStatusMeta: Record<DimensionMemory["status"], string> = {
  new: "新学",
  learning: "学习中",
  review: "复习中",
  stable: "已稳定",
};

function formatDueAt(value: string) {
  return value ? formatDate(value) : "尚未安排";
}

export function RecordsRoute({ track }: { track: TrackId }) {
  const { profile } = useStudyProfile({ writable: false });
  const [showAllLessons, setShowAllLessons] = useState(false);
  const meta = trackMeta[track];
  const candidates = homeCandidates[track];
  const candidateIds = new Set(candidates.map((item) => item.id));
  const answersByCharacter = new Map<string, [string, typeof profile.answers[string]][]>();
  const trackMarker = `-${track}-`;
  for (const entry of Object.entries(profile.answers)) {
    const markerIndex = entry[0].indexOf(trackMarker);
    if (markerIndex < 0) continue;
    const characterId = entry[0].slice(0, markerIndex);
    if (!candidateIds.has(characterId)) continue;
    answersByCharacter.set(characterId, [...(answersByCharacter.get(characterId) ?? []), entry]);
  }
  const answerEntries = [...answersByCharacter.values()].flat();
  const attempts = answerEntries.reduce((sum, [, stat]) => sum + stat.attempts, 0);
  const correct = answerEntries.reduce((sum, [, stat]) => sum + stat.correct, 0);
  const lessonRows = grade5Lessons.map((lesson) => {
    const lessonCandidates = candidates.filter((item) => item.lessonId === lesson.id);
    const recorded = lessonCandidates.filter((character) => answersByCharacter.has(character.id));
    const completed = lessonCandidates.filter((item) => profile.completed[track].includes(item.id)).length;
    const latestAt = recorded
      .flatMap((character) => answersByCharacter.get(character.id) ?? [])
      .reduce((latest, [, stat]) => stat.lastAt > latest ? stat.lastAt : latest, "");
    return { lesson, lessonCandidates, recorded, completed, latestAt };
  });
  const activeLessons = lessonRows.filter((row) => row.recorded.length > 0 || row.completed > 0);
  const visibleLessons = showAllLessons ? lessonRows : activeLessons;
  const recentCharacters = candidates
    .map((character) => {
      const stats = answersByCharacter.get(character.id) ?? [];
      const latestAt = stats.reduce((latest, [, stat]) => stat.lastAt > latest ? stat.lastAt : latest, "");
      return { character, stats, latestAt };
    })
    .filter((item) => item.stats.length > 0)
    .sort((left, right) => right.latestAt.localeCompare(left.latestAt))
    .slice(0, 6);

  return (
    <LearningPageShell active="profile" name={profile.name}>
      <div className="page records-page">
        <PageHeading density="utility" kicker="学习记录" title="看见自己一步一步学会的过程" copy="优先呈现最近练习和已有记录，需要时再展开全部课次。" backHref="/" />
        <section className="record-stat-row">
          <div><span>已完成</span><strong>{profile.completed[track].length}</strong><small>个本关字</small></div>
          <div><span>累计作答</span><strong>{attempts}</strong><small>次</small></div>
          <div><span>答对次数</span><strong>{correct}</strong><small>次</small></div>
        </section>
        <div className="record-tabs">{trackIds.map((id) => <Link className={id === track ? "is-active" : ""} href={`/records/${id}`} key={id}>{trackMeta[id].menu}</Link>)}</div>
        {recentCharacters.length > 0 && (
          <section className="record-recent" aria-labelledby="record-recent-title">
            <header><div><p className="kicker">最近练习</p><h2 id="record-recent-title">从刚才学到的地方继续</h2></div><span>最近 {recentCharacters.length} 个字</span></header>
            <div>
              {recentCharacters.map(({ character, stats, latestAt }) => (
                <Link href={`/records/${track}/${character.id}`} key={character.id}>
                  <strong>{character.hanzi}</strong>
                  <span>{profile.completed[track].includes(character.id) ? "已完成" : "正在练习"}</span>
                  <small>{stats.reduce((sum, [, stat]) => sum + stat.attempts, 0)} 次作答 · {formatDate(latestAt)}</small>
                </Link>
              ))}
            </div>
          </section>
        )}
        <div className="record-scope-bar">
          <div><strong>{activeLessons.length} 课有记录</strong><span>{showAllLessons ? `正在显示全部 ${lessonRows.length} 课` : "默认隐藏尚未开始的课次"}</span></div>
          <button aria-pressed={showAllLessons} onClick={() => setShowAllLessons((visible) => !visible)}>
            {showAllLessons ? "只看有记录" : `显示全部 ${lessonRows.length} 课`}
          </button>
        </div>
        <section className="record-lessons">
          {visibleLessons.length ? visibleLessons.map(({ lesson, lessonCandidates, recorded, completed }) => (
              <article className={`record-lesson${recorded.length ? "" : " is-empty"}`} key={lesson.id}>
                <header><div><p>第 {lesson.position} 课</p><h2>{lesson.title}</h2></div><span>{completed}/{lessonCandidates.length} 已完成</span></header>
                {recorded.length ? (
                  <div className="record-character-list">
                    {recorded.map((character) => {
                      const stats = answersByCharacter.get(character.id) ?? [];
                      return (
                        <Link href={`/records/${track}/${character.id}`} key={character.id}>
                          <strong>{character.hanzi}</strong>
                          <div><b>{profile.completed[track].includes(character.id) ? "已完成" : "正在练习"}</b><span>{stats.map(([, stat]) => stat.lastCorrect ? "✓" : "·").join(" ")}</span></div>
                          <small>查看 →</small>
                        </Link>
                      );
                    })}
                  </div>
                ) : <div className="record-empty">尚未开始{meta.menu}</div>}
              </article>
          )) : (
            <div className="record-zero-state">
              <span aria-hidden="true">✦</span>
              <h2>还没有{meta.menu}记录</h2>
              <p>完成第一次闯关后，最近练习与课次记录会自动整理在这里。</p>
              <Link
                className="game-button primary"
                href={withReturnTo(
                  routeForTrack(track, candidates[0].lessonId, candidates[0].id),
                  `/records/${track}`,
                )}
              >
                开始第一次练习
              </Link>
            </div>
          )}
        </section>
      </div>
    </LearningPageShell>
  );
}

export function RecordDetailRoute({ character, track }: { character: CharacterItem; track: TrackId }) {
  const { profile } = useStudyProfile({ writable: false });
  const meta = trackMeta[track];
  const exercises = getTrackExercises(character, track);
  const completed = profile.completed[track].includes(character.id);
  const correctCount = exercises.filter((question) => profile.answers[question.id]?.lastCorrect).length;
  const storedMemory = profile.memory[character.id];
  const memory = characterMemoryFromProfile(profile, character.id);
  const hasStoredMemory = Boolean(storedMemory && Object.keys(storedMemory).length > 0);
  const routeFootprints = trackIds.map((id) => {
    const routeExercises = getTrackExercises(character, id);
    return {
      id,
      completed: profile.completed[id].includes(character.id),
      correct: routeExercises.filter((question) => profile.answers[question.id]?.lastCorrect).length,
      questions: routeExercises.length,
      attempts: routeExercises.reduce((sum, question) => sum + (profile.answers[question.id]?.attempts ?? 0), 0),
    };
  });
  return (
    <LearningPageShell active="profile" name={profile.name}>
      <div className="page record-detail-page">
        <PageHeading density="utility" kicker={`${meta.label} · 学习记录`} title={`“${character.hanzi}”的闯关足迹`} copy={`来自第 ${character.lessonPosition} 课《${character.lessonTitle}》；每一题都保留最后一次作答状态。`} backHref={`/records/${track}`} />
        <section className={`record-detail-summary ${meta.tone}`}>
          <div className="record-detail-glyph">{character.hanzi}</div>
          <div>
            <p>首次学完 · {completed ? `${meta.menu}已达成` : `${meta.menu}尚未达成`}</p>
            <h2>{correctCount} / {exercises.length} 题最后一次答对</h2>
            <span>首次学完是永久保留的练习成就，不等同于下面会随复习变化的当前掌握。</span>
          </div>
        </section>

        <section className="record-mastery" aria-labelledby="record-mastery-title">
          <header className="record-section-heading">
            <div><p className="kicker">当前掌握</p><h2 id="record-mastery-title">六项能力，分别留下时间证据</h2></div>
            <span>首次学完 ≠ 当前已稳定</span>
          </header>
          {!hasStoredMemory && (
            <p className="record-mastery-empty" role="status">尚无独立提取证据，当前不能显示为已稳定。</p>
          )}
          <ul className="record-mastery-grid">
            {skillDimensions.map((dimension) => {
              const state = memory[dimension];
              const hasIndependentEvidence = Boolean(state.lastIndependentCorrectAt);
              return (
                <li className={`record-mastery-card is-${state.status}`} data-status={state.status} key={dimension}>
                  <header>
                    <div><strong>{dimensionMeta[dimension].label}</strong><small>{dimensionMeta[dimension].copy}</small></div>
                    <span><b>{state.status}</b>{memoryStatusMeta[state.status]}</span>
                  </header>
                  <dl>
                    <div><dt>下次到期</dt><dd>{formatDueAt(state.dueAt)}</dd></div>
                    <div><dt>独立连续</dt><dd>{state.independentStreak} 次</dd></div>
                    <div><dt>遗忘次数</dt><dd>{state.lapses} 次</dd></div>
                  </dl>
                  <p>{hasIndependentEvidence ? `最近独立答对：${formatDate(state.lastIndependentCorrectAt!)}` : "尚无独立提取证据"}</p>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="record-footprints" aria-labelledby="record-footprints-title">
          <header className="record-section-heading">
            <div><p className="kicker">练习足迹</p><h2 id="record-footprints-title">四条历史路线</h2></div>
            <span>这些统计记录做过什么，不替代当前掌握</span>
          </header>
          <div>
            {routeFootprints.map((footprint) => (
              <Link className={footprint.id === track ? "is-active" : ""} href={`/records/${footprint.id}/${character.id}`} key={footprint.id}>
                <span>{trackMeta[footprint.id].menu}</span>
                <strong>首次学完 · {footprint.completed ? "已达成" : "未达成"}</strong>
                <small>{footprint.correct}/{footprint.questions} 题最后答对 · 累计 {footprint.attempts} 次</small>
              </Link>
            ))}
          </div>
        </section>

        <header className="record-section-heading record-question-heading">
          <div><p className="kicker">本路线题目</p><h2>{meta.menu}的逐题足迹</h2></div>
          <span>最后一次作答状态</span>
        </header>
        <section className="record-question-list">
          {exercises.map((question, index) => {
            const stat = profile.answers[question.id];
            const status = !stat ? "is-new" : stat.lastCorrect ? "is-correct" : "is-wrong";
            const destination = `${routeForTrack(track, character.lessonId, character.id)}?question=${index}`;
            const href = withReturnTo(destination, `/records/${track}/${character.id}`);
            return (
              <article className={status} key={question.id}>
                <span className="record-question-index">{String(index + 1).padStart(2, "0")}</span>
                <div><p>{questionTypeLabel(question, track)}</p><h2>{question.prompt}</h2>{stat ? <small>已作答 {stat.attempts} 次 · 答对 {stat.correct} 次 · 最后一次 {stat.lastCorrect ? "答对" : "待再试"}{stat.lastAt ? ` · ${formatDate(stat.lastAt)}` : ""}</small> : <small>还没有开始这一题</small>}</div>
                <Link className="game-button ghost" href={href}>{stat?.lastCorrect ? "再练" : stat ? "继续" : "开始"}</Link>
              </article>
            );
          })}
        </section>
      </div>
    </LearningPageShell>
  );
}
