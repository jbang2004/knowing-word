"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { CharacterItem, LessonItem } from "../../data/catalog-types";
import { homeCandidates } from "../../data/home-index.generated";
import { grade5Course, grade5Lessons } from "../../data/generated/grade5-volume1/course";
import { lessonVisuals } from "../../data/illustrations";
import type { LessonDocument } from "../../data/lesson-documents";
import {
  LESSON_THREE_ID,
  getLessonThreeKnowledge,
  qianPhoneticFamily,
} from "../../data/lesson3-literacy";
import { getTrackExercises } from "../../domain/practice";
import { trackMeta } from "../../domain/tracks";
import { useStudyProfile } from "../profile/use-study-profile";
import { routeForTrack } from "../../lib/app-route";
import type { StudyProfile, TrackId } from "../../lib/profile-model";
import { nextCandidateId } from "../../lib/progress-model";
import { LearningPageShell, PageHeading } from "../shell/learning-page-shell";
import {
  LessonReader,
  LessonViewNavigation,
  type LessonView,
} from "../lesson-reader/lesson-reader";

const practiceTrackIds: Exclude<TrackId, "words">[] = ["split", "honglan", "structure"];
const courseUnits = [
  { label: "第一单元", start: 1, end: 4 },
  { label: "第二单元", start: 5, end: 8 },
  { label: "第三单元", start: 9, end: 11 },
  { label: "第四单元", start: 12, end: 14 },
  { label: "第五单元", start: 15, end: 17 },
  { label: "第六单元", start: 18, end: 20 },
  { label: "第七单元", start: 21, end: 24 },
  { label: "第八单元", start: 25, end: 26 },
] as const;

function targets(track: TrackId, lessonId?: string) {
  return lessonId
    ? homeCandidates[track].filter((item) => item.lessonId === lessonId)
    : homeCandidates[track];
}

function trackProgress(profile: StudyProfile, track: TrackId, lessonId?: string) {
  const candidates = targets(track, lessonId);
  return {
    completed: candidates.filter((item) => profile.completed[track].includes(item.id)).length,
    total: candidates.length,
  };
}

function nextCandidate(track: TrackId, profile: StudyProfile) {
  const candidates = homeCandidates[track];
  const id = nextCandidateId(
    candidates.map((item) => item.id),
    profile.completed[track],
    profile.last[track]?.characterId,
  );
  return candidates.find((item) => item.id === id);
}

function wordGroups(characters: CharacterItem[], extension: boolean) {
  const groups = new Map<string, CharacterItem[]>();
  for (const character of characters.filter(
    (item) => item.primary && (item.official === false) === extension,
  )) {
    const key = `${character.wordPosition}-${character.word}`;
    groups.set(key, [...(groups.get(key) ?? []), character]);
  }
  return [...groups.values()];
}

function challengePath(track: TrackId, lessonId: string, characterId: string) {
  return routeForTrack(track, lessonId, characterId);
}

export function PracticeHubRoute() {
  const { profile } = useStudyProfile({ writable: false });
  const nextWord = nextCandidate("words", profile);
  const currentLesson = grade5Lessons.find((lesson) => lesson.id === nextWord?.lessonId) ?? grade5Lessons[0];
  const wordProgress = trackProgress(profile, "words", currentLesson.id);

  return (
    <LearningPageShell active="practice" name={profile.name}>
      <div className="page practice-hub-page">
        <PageHeading
          kicker="巩固练习"
          title="同一批字，换三种眼光再看一遍"
          copy="拆字看组成，红蓝看部件分工，结构看空间站位。三种方法服务于同一个目标：离开图片后，仍然能把字想起来。"
        />
        <section className="practice-context-band" aria-label="当前课程">
          <div>
            <span>当前建议</span>
            <h2>练习第 {currentLesson.position} 课《{currentLesson.title}》</h2>
            <p>本课识字已完成 {wordProgress.completed}/{wordProgress.total} 个，练习会围绕同一批字展开。</p>
          </div>
          <i>{nextWord?.hanzi ?? "字"}</i>
        </section>
        <section className="practice-route-grid" aria-label="三种巩固方式">
          {practiceTrackIds.map((track, index) => {
            const meta = trackMeta[track];
            const lessonProgress = trackProgress(profile, track, currentLesson.id);
            const totalProgress = trackProgress(profile, track);
            return (
              <article className={`practice-route-card ${meta.tone}`} key={track}>
                <div className="practice-route-top">
                  <i>{meta.glyph}</i>
                  <div><p>{meta.eyebrow}</p><h2>{meta.label}</h2></div>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="practice-route-progress">
                  <span>本课 {lessonProgress.completed}/{lessonProgress.total}</span>
                  <span>全册 {totalProgress.completed}/{totalProgress.total}</span>
                </div>
                <div className="practice-route-actions">
                  <Link className="game-button primary" href={routeForTrack(track, currentLesson.id)}>
                    练习本课 <ArrowRight aria-hidden="true" />
                  </Link>
                  <Link className="text-button" href={routeForTrack(track)}>全部课程</Link>
                </div>
              </article>
            );
          })}
        </section>
        <section className="practice-sequence-note">
          <span><Sparkles aria-hidden="true" /></span>
          <div><p className="kicker">建议顺序</p><h2>先拆组成，再辨功能，最后看空间。</h2></div>
          <ol><li>拆一拆</li><li>涂红蓝</li><li>认结构</li></ol>
        </section>
      </div>
    </LearningPageShell>
  );
}

export function CourseMapRoute() {
  const { profile } = useStudyProfile({ writable: false });
  return (
    <LearningPageShell active="course" name={profile.name}>
      <div className="page course-page">
        <PageHeading
          kicker="课程地图"
          title={grade5Course.title}
          copy="新版五年级上册共 26 课：按官方会认、会写和多音字清单学习，再用专项关卡反复巩固。"
        />
        <nav className="course-unit-nav" aria-label="快速跳转到单元">
          {courseUnits.map((unit, index) => <a href={`#course-unit-${index + 1}`} key={unit.label}>{unit.label}</a>)}
        </nav>
        <div className="course-units">
          {courseUnits.map((unit, unitIndex) => {
            const lessons = grade5Lessons.filter((lesson) => lesson.position >= unit.start && lesson.position <= unit.end);
            const progress = lessons.reduce((total, lesson) => {
              const item = trackProgress(profile, "words", lesson.id);
              return { completed: total.completed + item.completed, total: total.total + item.total };
            }, { completed: 0, total: 0 });
            return (
              <section className="course-unit" id={`course-unit-${unitIndex + 1}`} key={unit.label}>
                <header>
                  <div><span>{unit.label}</span><h2>第 {unit.start}—{unit.end} 课</h2></div>
                  <p>已认识 {progress.completed}/{progress.total} 个字</p>
                </header>
                <div className="lesson-route">
                  {lessons.map((lesson) => {
                    const chars = targets("words", lesson.id);
                    const itemProgress = trackProgress(profile, "words", lesson.id);
                    const illustration = lessonVisuals[lesson.id];
                    return (
                      <Link
                        className={`lesson-route-card lesson-tone-${(lesson.position - 1) % 4}${lesson.skimming ? " is-skimming" : ""}`}
                        href={`/lessons/${lesson.id}`}
                        key={lesson.id}
                      >
                        <span className="route-index">第 {lesson.position} 课{lesson.skimming ? " · 略读" : ""}</span>
                        <div className="route-scene">
                          <Image src={illustration.src} alt={illustration.alt} fill sizes="180px" />
                          <div className="route-character-cloud" aria-hidden="true">
                            {chars.slice(0, 4).map((character) => <i key={character.id}>{character.hanzi}</i>)}
                          </div>
                        </div>
                        <div className="route-copy">
                          <h2>{lesson.title}</h2>
                          <p>{lesson.officialCount} 个课内字 · 已完成 {itemProgress.completed} 个</p>
                        </div>
                        <span className="route-arrow">→</span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
        <section className="course-method-card">
          <span>26</span><p>精读课分会认、会写与多音字；略读课以会认和理解为主。教材正文不复制，所有讲解和练习都经过重新组织。</p>
        </section>
      </div>
    </LearningPageShell>
  );
}

function LessonThreeOverview({ characters }: { characters: CharacterItem[] }) {
  const phonosemantic = characters.filter((item) => getLessonThreeKnowledge(item.hanzi)?.method === "phonosemantic");
  const structural = characters.filter((item) => getLessonThreeKnowledge(item.hanzi)?.method === "structure");
  return (
    <section className="pilot-method-overview" aria-labelledby="pilot-method-title">
      <div className="pilot-overview-heading">
        <div>
          <p className="kicker">第三课 · 识字方法试点</p>
          <h2 id="pilot-method-title">先分方法，再使用图片</h2>
          <p>本课 11 个课内字按构形关系分组：图片只在开始时搭桥，最后必须离图认读和回忆。</p>
        </div>
        <span className="pilot-source-badge">规范字形教学拆分<br /><small>不等同历史字源</small></span>
      </div>
      <div className="pilot-method-grid">
        {([
          ["01", "形旁 + 声旁", "用字族迁移", phonosemantic, "is-phonetic"],
          ["02", "部件 + 位置", "不强编字源", structural, "is-structure"],
        ] as const).map(([index, title, copy, items, tone]) => (
          <article className={`pilot-method-lane ${tone}`} key={index}>
            <div><span>{index}</span><p><strong>{title}</strong><small>{items.length} 个字 · {copy}</small></p></div>
            <div className="pilot-character-list">
              {items.map((character) => (
                <Link href={`/lessons/${character.lessonId}/words/${character.id}`} key={character.id}>
                  <strong>{character.hanzi}</strong><small>{getLessonThreeKnowledge(character.hanzi)?.equation}</small>
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
      <div className="pilot-overview-bottom">
        <article className="pilot-family-card">
          <div><span>声旁家族</span><strong>佥</strong><small>读音只提供线索，不保证完全相同</small></div>
          <div className="pilot-family-flow">
            {qianPhoneticFamily.map((member) => (
              <span className={member.active ? "is-active" : ""} key={member.hanzi}>
                <b>{member.semantic}</b><i>+</i><b>佥</b><i>→</i><strong>{member.hanzi}</strong><small>{member.word} · {member.lesson}</small>
              </span>
            ))}
          </div>
        </article>
        <article className="pilot-review-card">
          <div><span>间隔复习</span><strong>{characters.length} 个待学习</strong><small>答错立即再练；答对后按 1、3、7 天拉开间隔</small></div>
        </article>
      </div>
    </section>
  );
}

export function LessonRoute({
  lesson,
  characters,
  document,
  view = "read",
}: {
  lesson: LessonItem;
  characters: CharacterItem[];
  document?: LessonDocument;
  view?: LessonView;
}) {
  const { profile } = useStudyProfile({ writable: false });
  const officialGroups = wordGroups(characters, false);
  const extensionGroups = wordGroups(characters, true);
  const completed = new Set(profile.completed.words);
  const progress = trackProgress(profile, "words", lesson.id);
  const illustration = lessonVisuals[lesson.id];
  const usesReader = Boolean(document);
  const usesGuide = document?.format === "guide";
  const headingCopy = view === "read"
    ? usesGuide
      ? `带着三条阅读线索打开课本，本课 ${progress.total} 个字都能从重点词进入字卡`
      : `在原创语境中发现本课 ${progress.total} 个字，点击标注生字可直接进入字卡`
    : view === "words"
      ? `${lesson.skimming ? "会认字" : "识字写字表"} · ${progress.completed} / ${progress.total} 个课内字已完成整套识字小测`
      : "读完语境、看过字卡后，再用三种方法把字形真正记牢";
  return (
    <LearningPageShell active="course" name={profile.name}>
      <div className={`page lesson-page${usesReader ? " has-reader" : ""}`}>
        <PageHeading
          kicker={`第 ${lesson.position} 课${lesson.skimming ? " · 略读" : ""}`}
          title={lesson.title}
          copy={usesReader ? headingCopy : `${lesson.skimming ? "会认字" : "识字写字表"} · ${progress.completed} / ${progress.total} 个课内字已完成整套识字小测`}
          backHref="/lessons"
        />
        {usesReader && <LessonViewNavigation lessonId={lesson.id} view={view} format={document?.format} />}

        {usesReader && view === "read" && document && (
          <LessonReader
            lesson={lesson}
            document={document}
            characters={characters}
            completed={completed}
            illustration={illustration}
          />
        )}

        {(!usesReader || view === "words") && <>
          <section className="lesson-scene-banner">
            <Image src={illustration.src} alt={illustration.alt} fill priority sizes="(max-width: 760px) 100vw, 920px" />
            <div><span>{usesReader ? "主题场景" : "课文场景"}</span><strong>{lesson.title}</strong><small>{lesson.context ?? "先进入画面，再从词语认识汉字"}</small></div>
          </section>
          {!usesReader && <section className="lesson-learning-path" aria-label={`${lesson.title}内容理解路线`}>
            <div className="learning-path-heading">
              <span>{lesson.mode ?? "课文理解"}</span>
              <div><strong>先读懂课文，再把字放回故事里</strong><small>{lesson.skimming ? "略读课：抓住关键变化，练习复述" : "精读课：沿内容顺序理解、识字、巩固"}</small></div>
            </div>
            <ol>{(lesson.learningPath ?? []).map((step, index) => <li key={step}><i>{index + 1}</i><span>{step}</span></li>)}</ol>
          </section>}
          {lesson.id === LESSON_THREE_ID && <LessonThreeOverview characters={characters.filter((item) => item.official !== false)} />}
          <WordBoard groups={officialGroups} completed={completed} extension={false} />
          {extensionGroups.length > 0 && <WordBoard groups={extensionGroups} completed={completed} extension />}
        </>}

        {(!usesReader || view === "practice") && <>
          {usesReader && <section className="lesson-learning-path" aria-label={`${lesson.title}内容理解路线`}>
            <div className="learning-path-heading">
              <span>{usesGuide ? "课文导读线索" : "原创阅读线索"}</span>
              <div>
                <strong>{usesGuide ? "沿着三个问题，再把字放回重点词里" : "沿着三段语境，再把字放回词语里"}</strong>
                <small>{usesGuide ? "回到纸质课本阅读全文，再用导读中的词语巩固本课生字" : "回看阅读顺序，用熟悉的上下文巩固本课生字"}</small>
              </div>
            </div>
            <ol>{document?.sections.map((section, index) => <li key={section.id}><i>{index + 1}</i><span>{section.title}</span></li>)}</ol>
          </section>}
          <section className="lesson-practice-strip">
            <div><p className="kicker">学完词语表，再来巩固</p><h2>同一批字，换三种方式练习</h2></div>
            <div className="practice-strip-items">
              {practiceTrackIds.map((track) => {
                const meta = trackMeta[track];
                const itemProgress = trackProgress(profile, track, lesson.id);
                return (
                  <Link className={meta.tone} href={routeForTrack(track, lesson.id)} key={track}>
                    <span>{meta.glyph}</span><strong>{meta.menu}</strong><small>{itemProgress.completed}/{itemProgress.total}</small>
                  </Link>
                );
              })}
            </div>
          </section>
        </>}
      </div>
    </LearningPageShell>
  );
}

function WordBoard({
  groups,
  completed,
  extension,
}: {
  groups: CharacterItem[][];
  completed: Set<string>;
  extension: boolean;
}) {
  return (
    <section className={`word-map-board${extension ? " extension-board" : ""}`}>
      <div className="board-title">
        <span>{extension ? "课文语境拓展" : "课内识字写字表"}</span>
        <i>{extension ? "保留深度字卡，不计入官方字表进度" : "把官方字表放回词语，区分会认、会写与多音字"}</i>
      </div>
      <div className="word-groups">
        {groups.map((group) => (
          <article className="word-group" key={group[0].id}>
            <p>{group[0].word}</p>
            <div>{group.map((character) => (
              <Link
                className={`word-chip${completed.has(character.id) ? " is-complete" : ""}${extension ? " is-extension" : ""}`}
                href={`/lessons/${character.lessonId}/words/${character.id}`}
                key={character.id}
              >
                <strong>{character.hanzi}</strong>
                <b>{character.pinyin}</b>
                {completed.has(character.id) ? <small aria-label="已学会">✓</small> : <em>{extension ? "拓" : character.polyphonic ? "多" : character.curriculumRole === "write" ? "写" : "认"}</em>}
                {character.lessonId === LESSON_THREE_ID && <span className="pilot-chip-method">{getLessonThreeKnowledge(character.hanzi)?.method === "phonosemantic" ? "形声" : "部件"}</span>}
              </Link>
            ))}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function TrackMapRoute({ track }: { track: Exclude<TrackId, "words"> }) {
  const { profile } = useStudyProfile({ writable: false });
  const meta = trackMeta[track];
  const next = nextCandidate(track, profile);
  const nextLesson = grade5Lessons.find((lesson) => lesson.id === next?.lessonId);
  const progress = trackProgress(profile, track);
  const continueHref = next ? challengePath(track, next.lessonId, next.id) : routeForTrack(track, grade5Lessons[0].id);
  return (
    <LearningPageShell active="practice" name={profile.name}>
      <div className={`page track-map-page ${meta.tone}`}>
        <PageHeading kicker="专项关卡" title={meta.label} copy={meta.copy} backHref="/practice" />
        <div className="track-map-layout">
          <section className="level-map">
            <div className="level-map-title"><h2>选择课次</h2><span>共 {grade5Lessons.length} 课 · 完成 {progress.completed} / {progress.total}</span></div>
            <div className="level-list">
              {grade5Lessons.map((lesson) => {
                const item = trackProgress(profile, track, lesson.id);
                return (
                  <Link href={routeForTrack(track, lesson.id)} key={lesson.id}>
                    <span className="level-number">第 {lesson.position} 课</span><strong>{lesson.title}</strong><i>{item.completed}/{item.total}</i><b><ArrowRight aria-hidden="true" /></b>
                  </Link>
                );
              })}
            </div>
          </section>
          <aside className="track-map-aside">
            <section className={`track-hero ${meta.tone}`}>
              <div className="track-symbol">{meta.glyph}</div>
              <div><p>上次学到</p><h2>{next ? `${next.hanzi} 字` : "准备开始"}</h2><span>{nextLesson ? `来自第 ${nextLesson.position} 课 · ${nextLesson.title}` : "从第一课开始闯关"}</span></div>
              <Link className="game-button white" href={continueHref}>{meta.action} <ArrowRight aria-hidden="true" /></Link>
            </section>
            <section className="track-method-card"><p className="kicker">这项练习在训练什么</p><h2>{meta.eyebrow}</h2><p>{meta.copy}</p></section>
          </aside>
        </div>
      </div>
    </LearningPageShell>
  );
}

export function TrackLessonRoute({
  track,
  lesson,
  characters,
}: {
  track: Exclude<TrackId, "words">;
  lesson: LessonItem;
  characters: CharacterItem[];
}) {
  const { profile } = useStudyProfile({ writable: false });
  const meta = trackMeta[track];
  const eligible = characters.filter((item) => item.primary && item.official !== false && getTrackExercises(item, track).length > 0);
  const completed = new Set(profile.completed[track]);
  const progress = trackProgress(profile, track, lesson.id);
  return (
    <LearningPageShell active="practice" name={profile.name}>
      <div className="page track-lesson-page">
        <PageHeading kicker={meta.label} title={lesson.title} copy={`选择一个字开始本关练习 · 已完成 ${progress.completed} / ${progress.total}`} backHref={routeForTrack(track)} />
        <section className={`track-lesson-board ${meta.tone}`}>
          <div className="track-lesson-note"><span>{meta.glyph}</span><p>{meta.copy}</p></div>
          <div className="track-character-grid">
            {eligible.map((character, index) => (
              <Link className={completed.has(character.id) ? "is-complete" : ""} href={challengePath(track, lesson.id, character.id)} key={character.id}>
                <small>{String(index + 1).padStart(2, "0")}</small><strong>{character.hanzi}</strong><i>{completed.has(character.id) ? "✓" : "开始"}</i>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </LearningPageShell>
  );
}
