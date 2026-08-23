import { notFound } from "next/navigation";
import { PlaygroundRoute } from "../../features/tools/utility-routes";
import type { PlaygroundKind } from "../../lib/app-route";

const playgroundKinds = new Set<PlaygroundKind>(["kit", "lesson", "puzzle", "quiz"]);

export default async function PlaygroundPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  if (!playgroundKinds.has(kind as PlaygroundKind)) notFound();
  return <PlaygroundRoute kind={kind as PlaygroundKind} />;
}
