import KnowingWord from "../experience";

export type RouteSearchParams = Promise<Record<string, string | string[] | undefined>>;

export function pathWithSearch(
  pathname: string,
  searchParams?: Record<string, string | string[] | undefined>,
) {
  if (!searchParams) return pathname;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) value.forEach((item) => query.append(key, item));
    else if (typeof value === "string") query.set(key, value);
  }
  return query.size ? `${pathname}?${query}` : pathname;
}

export default function LearningRoute({ path }: { path: string }) {
  return <KnowingWord initialPath={path} />;
}
