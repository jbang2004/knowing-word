import LearningRoute from "../../_shared/learning-route";

export default async function StructureLessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  return <LearningRoute path={`/space-structure-exercise/${lessonId}`} />;
}
