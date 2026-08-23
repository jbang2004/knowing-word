import LearningRoute, { pathWithSearch, type RouteSearchParams } from "../_shared/learning-route";

export default async function ComponentsPage({ searchParams }: { searchParams: RouteSearchParams }) {
  return <LearningRoute path={pathWithSearch("/bujian", await searchParams)} />;
}
