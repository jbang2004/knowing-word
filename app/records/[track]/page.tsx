import LearningRoute from "../../_shared/learning-route";

export default async function TrackRecordsPage({
  params,
}: {
  params: Promise<{ track: string }>;
}) {
  const { track } = await params;
  return <LearningRoute path={`/records/${track}`} />;
}
