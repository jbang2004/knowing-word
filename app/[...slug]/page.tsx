import KnowingWord from "../experience";

export const dynamic = "force-dynamic";

export default async function RoutedKnowingWord({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (Array.isArray(value)) value.forEach((item) => query.append(key, item));
    else if (typeof value === "string") query.set(key, value);
  }
  const suffix = query.size ? `?${query}` : "";
  return <KnowingWord initialPath={`/${slug.join("/")}${suffix}`} />;
}
