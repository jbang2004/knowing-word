import LearningRoute, { pathWithSearch, type RouteSearchParams } from "../_shared/learning-route";

export default async function ReadAloudPage({ searchParams }: { searchParams: RouteSearchParams }) {
  return <LearningRoute path={pathWithSearch("/read-aloud", await searchParams)} />;
}
