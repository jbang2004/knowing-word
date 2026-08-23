import { notFound } from "next/navigation";
import { loadLessonContent } from "../../data/lesson-content";
import { TrackLessonRoute } from "../../features/catalog/catalog-routes";

export default async function StructureLessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const content = await loadLessonContent(lessonId);
  if (!content) notFound();
  return <TrackLessonRoute track="structure" lesson={content.lesson} characters={content.characters} />;
}
