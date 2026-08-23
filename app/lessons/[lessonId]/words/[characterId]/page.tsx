import LearningRoute from "../../../../_shared/learning-route";

export default async function CharacterPage({
  params,
}: {
  params: Promise<{ lessonId: string; characterId: string }>;
}) {
  const { lessonId, characterId } = await params;
  return <LearningRoute path={`/lessons/${lessonId}/words/${characterId}`} />;
}
