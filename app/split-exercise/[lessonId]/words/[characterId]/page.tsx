import LearningRoute from "../../../../_shared/learning-route";

export default async function SplitCharacterPage({
  params,
}: {
  params: Promise<{ lessonId: string; characterId: string }>;
}) {
  const { lessonId, characterId } = await params;
  return <LearningRoute path={`/split-exercise/${lessonId}/words/${characterId}`} />;
}
