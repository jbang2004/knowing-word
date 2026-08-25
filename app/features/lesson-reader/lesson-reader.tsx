import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  Check,
  ChevronDown,
  LayoutGrid,
  ListChecks,
  Sparkles,
} from "lucide-react";
import type { CharacterItem, LessonItem } from "../../data/catalog-types";
import type { LessonDocument } from "../../data/lesson-documents";
import type { lessonVisuals } from "../../data/illustrations";
import { withReturnTo } from "../../lib/navigation";

export type LessonView = "read" | "words" | "practice";

type LessonVisual = (typeof lessonVisuals)[keyof typeof lessonVisuals];

type ParagraphSegment = {
  text: string;
  word?: string;
};

export function lessonViewHref(lessonId: string, view: LessonView) {
  return view === "read" ? `/lessons/${lessonId}` : `/lessons/${lessonId}?view=${view}`;
}

export function LessonViewNavigation({
  lessonId,
  view,
  format = "reading",
}: {
  lessonId: string;
  view: LessonView;
  format?: LessonDocument["format"];
}) {
  const guideMode = format === "guide";
  const items = [
    {
      id: "read" as const,
      label: guideMode ? "课文导读" : "语境阅读",
      copy: guideMode ? "带着线索打开课本" : "在原创文字里发现字",
      Icon: BookOpenText,
    },
    { id: "words" as const, label: "生字表", copy: "逐字完成理解与过关", Icon: ListChecks },
    { id: "practice" as const, label: "复习巩固", copy: "按需要换一种方法练", Icon: LayoutGrid },
  ];

  return (
    <nav className="lesson-view-tabs" aria-label="本课学习方式">
      {items.map(({ id, label, copy, Icon }) => (
        <Link
          className={view === id ? "is-active" : ""}
          href={lessonViewHref(lessonId, id)}
          aria-current={view === id ? "page" : undefined}
          key={id}
        >
          <Icon aria-hidden="true" />
          <span><strong>{label}</strong><small>{copy}</small></span>
        </Link>
      ))}
    </nav>
  );
}

function documentOccurrences(document: LessonDocument, characters: CharacterItem[]) {
  const anchors = new Map<string, string>();
  for (const section of document.sections) {
    const sectionAnchor = section.paragraphs[0]?.id;
    if (sectionAnchor) {
      for (const word of section.focusWords ?? []) {
        for (const character of characters) {
          if (!anchors.has(character.hanzi) && character.word === word) {
            anchors.set(character.hanzi, sectionAnchor);
          }
        }
      }
    }
    for (const paragraph of section.paragraphs) {
      for (const character of characters) {
        if (!anchors.has(character.hanzi) && paragraph.text.includes(character.word)) {
          anchors.set(character.hanzi, paragraph.id);
        }
      }
    }
  }
  return anchors;
}

function paragraphSegments(text: string, words: readonly string[]): ParagraphSegment[] {
  const matches: { start: number; end: number; word: string }[] = [];
  for (const word of words) {
    let from = 0;
    while (from < text.length) {
      const start = text.indexOf(word, from);
      if (start === -1) break;
      matches.push({ start, end: start + word.length, word });
      from = start + word.length;
    }
  }
  matches.sort((left, right) => left.start - right.start || right.end - left.end);

  const segments: ParagraphSegment[] = [];
  let cursor = 0;
  for (const match of matches) {
    if (match.start < cursor) continue;
    if (match.start > cursor) segments.push({ text: text.slice(cursor, match.start) });
    segments.push({ text: text.slice(match.start, match.end), word: match.word });
    cursor = match.end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });
  return segments;
}

function characterHref(character: CharacterItem, paragraphId: string) {
  const returnTo = `/lessons/${character.lessonId}#${paragraphId}`;
  return withReturnTo(
    `/lessons/${character.lessonId}/words/${character.id}`,
    returnTo,
  );
}

function FocusWords({
  words,
  characters,
  completed,
  paragraphId,
}: {
  words: readonly string[];
  characters: CharacterItem[];
  completed: Set<string>;
  paragraphId: string;
}) {
  return (
    <div className="reader-focus-block">
      <header><strong>本段重点词</strong><small>点击彩色生字进入字卡</small></header>
      <div className="reader-focus-words">
        {words.map((word) => {
          const targets = characters.filter((character) => character.word === word);
          const targetByHanzi = new Map(targets.map((character) => [character.hanzi, character]));
          const complete = targets.length > 0 && targets.every((character) => completed.has(character.id));
          return (
            <div className={`reader-focus-word${word.length >= 5 ? " is-wide" : ""}${complete ? " is-complete" : ""}`} key={word}>
              <strong>
                {Array.from(word).map((glyph, index) => {
                  const character = targetByHanzi.get(glyph);
                  return character ? (
                    <Link
                      className="reader-focus-glyph"
                      href={characterHref(character, paragraphId)}
                      aria-label={`${word}里的${glyph}，进入字卡`}
                      key={`${character.id}-${index}`}
                    >
                      {glyph}
                    </Link>
                  ) : <span key={`${glyph}-${index}`}>{glyph}</span>;
                })}
              </strong>
              <small>{targets.map((character) => character.pinyin).join(" · ")}</small>
              {complete && <Check aria-label="首次学习已完成" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TargetCharacter({
  character,
  paragraphId,
  contextWord,
  occurrence,
  complete,
}: {
  character: CharacterItem;
  paragraphId: string;
  contextWord: string;
  occurrence: "first" | "repeat";
  complete: boolean;
}) {
  const role = character.polyphonic
    ? "多音字"
    : character.curriculumRole === "write"
      ? "会写字"
      : "会认字";
  return (
    <Link
      className={`reader-target is-${occurrence}${complete ? " is-complete" : ""}`}
      href={characterHref(character, paragraphId)}
      aria-label={`${contextWord}里的${character.hanzi}，本课${role}，进入字卡`}
    >
      <span>{character.hanzi}</span>
      {complete && <Check aria-hidden="true" />}
    </Link>
  );
}

function WordIndex({
  characters,
  completed,
  anchors,
  compact = false,
}: {
  characters: CharacterItem[];
  completed: Set<string>;
  anchors: Map<string, string>;
  compact?: boolean;
}) {
  return (
    <div className={`reader-word-index${compact ? " is-compact" : ""}`}>
      {characters.map((character) => {
        const complete = completed.has(character.id);
        return (
          <Link
            className={complete ? "is-complete" : ""}
            href={characterHref(character, anchors.get(character.hanzi) ?? "lesson-paragraph-1")}
            aria-label={`${character.hanzi}，${complete ? "首次学习已完成，重新查看字卡" : "进入字卡"}`}
            key={character.id}
          >
            <strong>{character.hanzi}</strong>
            <span>{character.pinyin}<small>{character.word}</small></span>
            {complete ? <Check aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
          </Link>
        );
      })}
    </div>
  );
}

export function LessonReader({
  lesson,
  document,
  characters,
  completed,
  illustration,
}: {
  lesson: LessonItem;
  document: LessonDocument;
  characters: CharacterItem[];
  completed: Set<string>;
  illustration: LessonVisual;
}) {
  const guideMode = document.format === "guide";
  const targets = characters.filter((item) => item.primary && item.official !== false);
  const characterByHanzi = new Map(targets.map((character) => [character.hanzi, character]));
  const words = [...new Set(targets.map((character) => character.word))];
  const anchors = documentOccurrences(document, targets);
  const completedCount = targets.filter((character) => completed.has(character.id)).length;
  const seenCharacters = new Set<string>();

  return (
    <>
      <div className="lesson-reader-layout">
        <article
          className={`lesson-reader-paper reader-genre-${document.genre}${guideMode ? " is-guide" : ""}`}
          aria-labelledby="lesson-reader-title"
        >
          <header className="lesson-reader-masthead">
            <span>{document.eyebrow}</span>
            <h2 id="lesson-reader-title">{document.title}</h2>
            <p>{document.dek}</p>
            <div className="reader-source-note">
              <Sparkles aria-hidden="true" />
              <span><strong>{document.rights.label}</strong><small>{document.rights.note}</small></span>
            </div>
          </header>

          <div className="lesson-reader-body">
            {guideMode && document.intro && (
              <section className="lesson-guide-intro" aria-label="导读说明">
                <span>先带着问题读</span>
                <p>{document.intro}</p>
                <small><BookOpenText aria-hidden="true" />请打开纸质课本第 {lesson.position} 课</small>
              </section>
            )}
            {document.sections.map((section) => (
              <section className={`reader-section${guideMode ? " is-guide-clue" : ""}`} aria-labelledby={`reader-section-${section.id}`} key={section.id}>
                <header>
                  <i aria-hidden="true">{section.number}</i>
                  <h3 id={`reader-section-${section.id}`}>{section.title}</h3>
                </header>
                {section.paragraphs.map((paragraph) => (
                  <p id={paragraph.id} key={paragraph.id}>
                    {paragraphSegments(paragraph.text, words).map((segment, segmentIndex) => {
                      if (!segment.word) return <span key={segmentIndex}>{segment.text}</span>;
                      return (
                        <span className="reader-context-word" key={segmentIndex}>
                          {Array.from(segment.text).map((glyph, glyphIndex) => {
                            const character = characterByHanzi.get(glyph);
                            if (!character) return <span key={glyphIndex}>{glyph}</span>;
                            const occurrence = seenCharacters.has(character.id) ? "repeat" : "first";
                            seenCharacters.add(character.id);
                            return (
                              <TargetCharacter
                                character={character}
                                complete={completed.has(character.id)}
                                contextWord={segment.word ?? segment.text}
                                occurrence={occurrence}
                                paragraphId={paragraph.id}
                                key={`${character.id}-${glyphIndex}`}
                              />
                            );
                          })}
                        </span>
                      );
                    })}
                  </p>
                ))}
                {section.question && (
                  <aside className="reader-clue-question">
                    <span>想一想</span>
                    <p>{section.question}</p>
                  </aside>
                )}
                {section.focusWords && section.paragraphs[0] && (
                  <FocusWords
                    words={section.focusWords}
                    characters={targets}
                    completed={completed}
                    paragraphId={section.paragraphs[0].id}
                  />
                )}
              </section>
            ))}
          </div>

          <footer className="lesson-reader-finish">
            <span aria-hidden="true">{completedCount === targets.length ? "成" : "读"}</span>
            <div>
              <small>本课识字进度</small>
              <strong>{completedCount === targets.length ? `${targets.length} 个字都已点亮` : `已经认识 ${completedCount} / ${targets.length} 个字`}</strong>
              <p>{guideMode ? "完成导读后，请回到纸质课本阅读全文，再用字卡和练习巩固。" : "读完原创语境后，可以查看完整字表，也可以直接换一种方式练习。"}</p>
            </div>
            <div className="lesson-reader-finish-actions">
              <Link href={lessonViewHref(lesson.id, "words")}>查看生字表</Link>
              <Link className="is-primary" href={lessonViewHref(lesson.id, "practice")}>按需复习 <ArrowRight aria-hidden="true" /></Link>
            </div>
          </footer>
        </article>

        <aside className="lesson-reader-aside" aria-label={guideMode ? "课文导读辅助" : "原创语境阅读辅助"}>
          <figure className="reader-scene-card">
            <Image src={illustration.src} alt={illustration.alt} fill priority sizes="300px" />
            <figcaption><small>第 {lesson.position} 课 · {guideMode ? "导读场景" : "原创阅读场景"}</small><strong>{lesson.title}</strong></figcaption>
          </figure>

          <section className="reader-progress-card">
            <header><span><small>本课生字</small><strong>{completedCount} / {targets.length}</strong></span><i>{Math.round((completedCount / targets.length) * 100)}%</i></header>
            <div className="reader-progress-track"><i style={{ width: `${(completedCount / targets.length) * 100}%` }} /></div>
            <p>{guideMode ? "每条线索下列出本段重点词。点击彩色生字进入字卡，首次学习完成后会显示标记。" : "正文只标出目标词里的生字。点击生字进入字卡，首次学习完成后会显示标记。"}</p>
          </section>

          <WordIndex anchors={anchors} characters={targets} completed={completed} />

          <section className="reader-route-card">
            <small>学习线索</small>
            <ol>{document.sections.map((section, index) => <li key={section.id}><i>{index + 1}</i><span>{section.title}</span></li>)}</ol>
          </section>
        </aside>
      </div>

      <details className="reader-mobile-index">
        <summary>
          <span><strong>{guideMode ? "本课重点字" : "本课生字"}</strong><small>{completedCount}/{targets.length} 已完成</small></span>
          <ChevronDown aria-hidden="true" />
        </summary>
        <div>
          <header><strong>{guideMode ? "按线索认识字" : "在语境里找字"}</strong><small>点击直接进入字卡</small></header>
          <WordIndex anchors={anchors} characters={targets} completed={completed} compact />
        </div>
      </details>
    </>
  );
}
