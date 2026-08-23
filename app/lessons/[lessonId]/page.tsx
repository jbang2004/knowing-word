import LearningRoute from "../../_shared/learning-route";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  return <LearningRoute path={`/lessons/${lessonId}`} />;
}
