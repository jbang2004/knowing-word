"use client";

import Link from "next/link";
import type { CharacterItem } from "../../data/catalog-types";
import { grade5Lessons } from "../../data/generated/grade5-volume1/course";
import { homeCandidates } from "../../data/home-index.generated";
import { getTrackExercises, questionTypeLabel } from "../../domain/practice";
import { trackMeta } from "../../domain/tracks";
import { routeForTrack } from "../../lib/app-route";
import { trackIds, type TrackId } from "../../lib/profile-model";
import { useStudyProfile } from "../profile/use-study-profile";
import { LearningPageShell, PageHeading } from "../shell/learning-page-shell";

function questionPrefix(characterId: string, track: TrackId) {
  return `${characterId}-${track}-`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function RecordsRoute({ track }: { track: TrackId }) {
  const { profile } = useStudyProfile({ writable: false });
  const meta = trackMeta[track];
  const candidates = homeCandidates[track];
  const answerEntries = Object.entries(profile.answers).filter(([id]) => candidates.some((item) => id.startsWith(questionPrefix(item.id, track))));
  const attempts = answerEntries.reduce((sum, [, stat]) => sum + stat.attempts, 0);
  const correct = answerEntries.reduce((sum, [, stat]) => sum + stat.correct, 0);

  return (
    <LearningPageShell active="profile" name={profile.name}>
      <div className="page records-page">
        <PageHeading kicker="学习记录" title="看见自己一步一步学会的过程" copy="每道题记录做了几次、答对几次，以及最后一次是否答对。" backHref="/" />
        <section className="record-stat-row">
          <div><span>已完成</span><strong>{profile.completed[track].length}</strong><small>个本关字</small></div>
          <div><span>累计作答</span><strong>{attempts}</strong><small>次</small></div>
          <div><span>答对次数</span><strong>{correct}</strong><small>次</small></div>
        </section>
        <div className="record-tabs">{trackIds.map((id) => <Link className={id === track ? "is-active" : ""} href={`/records/${id}`} key={id}>{trackMeta[id].menu}</Link>)}</div>
        <section className="record-lessons">
          {grade5Lessons.map((lesson) => {
            const lessonCandidates = candidates.filter((item) => item.lessonId === lesson.id);
            const recorded = lessonCandidates.filter((character) => Object.keys(profile.answers).some((id) => id.startsWith(questionPrefix(character.id, track))));
            const completed = lessonCandidates.filter((item) => profile.completed[track].includes(item.id)).length;
            return (
              <article className="record-lesson" key={lesson.id}>
                <header><div><p>第 {lesson.position} 课</p><h2>{lesson.title}</h2></div><span>{completed}/{lessonCandidates.length} 已完成</span></header>
                {recorded.length ? (
                  <div className="record-character-list">
                    {recorded.map((character) => {
                      const stats = Object.entries(profile.answers).filter(([id]) => id.startsWith(questionPrefix(character.id, track)));
                      return (
                        <Link href={`/records/${track}/${character.id}`} key={character.id}>
                          <strong>{character.hanzi}</strong>
                          <div><b>{profile.completed[track].includes(character.id) ? "已完成" : "正在练习"}</b><span>{stats.map(([, stat]) => stat.lastCorrect ? "✓" : "·").join(" ")}</span></div>
                          <small>查看 →</small>
                        </Link>
                      );
                    })}
                  </div>
                ) : <div className="record-empty">这一课的{meta.menu}记录，会在第一次闯关后出现在这里。</div>}
              </article>
            );
          })}
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
  return (
    <LearningPageShell active="profile" name={profile.name}>
      <div className="page record-detail-page">
        <PageHeading kicker={`${meta.label} · 学习记录`} title={`“${character.hanzi}”的闯关足迹`} copy={`来自第 ${character.lessonPosition} 课《${character.lessonTitle}》；每一题都保留最后一次作答状态。`} backHref={`/records/${track}`} />
        <section className={`record-detail-summary ${meta.tone}`}>
          <div className="record-detail-glyph">{character.hanzi}</div>
          <div><p>{completed ? "这一关已完成" : "还差几步，就能完成这一关"}</p><h2>{correctCount} / {exercises.length} 题最后一次答对</h2><span>{meta.copy}</span></div>
        </section>
        <section className="record-question-list">
          {exercises.map((question, index) => {
            const stat = profile.answers[question.id];
            const status = !stat ? "is-new" : stat.lastCorrect ? "is-correct" : "is-wrong";
            const href = `${routeForTrack(track, character.lessonId, character.id)}?question=${index}`;
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
