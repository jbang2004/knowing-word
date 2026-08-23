import PracticeRoutePage from "../../../../_shared/practice-route-page";

export default async function HonglanCharacterPage({
  params,
  searchParams,
}: {
  params: Promise<{ lessonId: string; characterId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <PracticeRoutePage params={params} searchParams={searchParams} track="honglan" />;
}
