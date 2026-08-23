import LearningRoute from "../../_shared/learning-route";

export default async function HonglanLessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  return <LearningRoute path={`/honglan-exercise/${lessonId}`} />;
}
