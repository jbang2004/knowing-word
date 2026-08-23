import LearningRoute from "../../_shared/learning-route";

export default async function PlaygroundPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  return <LearningRoute path={`/playground/${kind}`} />;
}
