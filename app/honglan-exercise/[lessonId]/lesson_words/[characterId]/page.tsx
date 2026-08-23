import LearningRoute from "../../../../_shared/learning-route";

export default async function HonglanCharacterPage({
  params,
}: {
  params: Promise<{ lessonId: string; characterId: string }>;
}) {
  const { lessonId, characterId } = await params;
  return <LearningRoute path={`/honglan-exercise/${lessonId}/lesson_words/${characterId}`} />;
}
