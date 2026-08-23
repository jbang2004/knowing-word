import PracticeRoutePage from "../../../../_shared/practice-route-page";

export default async function SplitCharacterPage({
  params,
}: {
  params: Promise<{ lessonId: string; characterId: string }>;
}) {
  const { lessonId, characterId } = await params;
  return <PracticeRoutePage lessonId={lessonId} characterId={characterId} track="split" />;
}
