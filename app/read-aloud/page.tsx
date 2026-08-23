import { ReadAloudRoute } from "../features/tools/utility-routes";
import { grade5Lessons } from "../data/generated/grade5-volume1/course";
import { safeInternalReturnPath } from "../lib/navigation";

export default async function ReadAloudPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const returnTo = safeInternalReturnPath(params.returnTo);
  const requestedLessonId = Array.isArray(params.lessonId) ? params.lessonId[0] : params.lessonId;
  const initialLessonId = grade5Lessons.some((lesson) => lesson.id === requestedLessonId) ? requestedLessonId : undefined;
  return <ReadAloudRoute initialLessonId={initialLessonId} returnTo={returnTo} />;
}
