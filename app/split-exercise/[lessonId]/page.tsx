import LearningRoute from "../../_shared/learning-route";

export default async function SplitLessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  return <LearningRoute path={`/split-exercise/${lessonId}`} />;
}
