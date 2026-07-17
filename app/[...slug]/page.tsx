import KnowingWord from "../experience";

export const dynamic = "force-dynamic";

export default async function RoutedKnowingWord({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  return <KnowingWord initialPath={`/${slug.join("/")}`} />;
}
