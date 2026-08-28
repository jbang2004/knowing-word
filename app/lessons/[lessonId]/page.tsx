import { notFound } from "next/navigation";
import { loadLessonContent } from "../../data/lesson-content";
import { LessonRoute } from "../../features/catalog/catalog-routes";
import type { LessonView } from "../../features/lesson-reader/lesson-reader";

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ lessonId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { lessonId } = await params;
  const { view: viewParam } = await searchParams;
  const content = await loadLessonContent(lessonId);
  if (!content) notFound();
  const view: LessonView = viewParam === "words" || viewParam === "practice" ? viewParam : "read";
  const characters = content.characters.map((character) => ({
    id: character.id,
    lessonId: character.lessonId,
    word: character.word,
    wordPosition: character.wordPosition,
    hanzi: character.hanzi,
    primary: character.primary,
    pinyin: character.pinyin,
    curriculumRole: character.curriculumRole,
    polyphonic: character.polyphonic,
    official: character.official,
  }));
  return (
    <LessonRoute
      lesson={content.lesson}
      characters={characters}
      document={content.document}
      view={view}
    />
  );
}
