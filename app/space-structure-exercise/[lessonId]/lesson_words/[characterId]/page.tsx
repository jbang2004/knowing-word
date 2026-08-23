import LearningRoute from "../../../../_shared/learning-route";

export default async function StructureCharacterPage({
  params,
}: {
  params: Promise<{ lessonId: string; characterId: string }>;
}) {
  const { lessonId, characterId } = await params;
  return <LearningRoute path={`/space-structure-exercise/${lessonId}/lesson_words/${characterId}`} />;
}
