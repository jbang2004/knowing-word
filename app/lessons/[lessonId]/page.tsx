import { notFound } from "next/navigation";
import { loadLessonContent } from "../../data/lesson-content";
import { LessonRoute } from "../../features/catalog/catalog-routes";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const content = await loadLessonContent(lessonId);
  if (!content) notFound();
  return <LessonRoute lesson={content.lesson} characters={content.characters} />;
}
