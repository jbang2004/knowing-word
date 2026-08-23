import LearningRoute from "../../../_shared/learning-route";

export default async function RecordDetailPage({
  params,
}: {
  params: Promise<{ track: string; characterId: string }>;
}) {
  const { track, characterId } = await params;
  return <LearningRoute path={`/records/${track}/${characterId}`} />;
}
