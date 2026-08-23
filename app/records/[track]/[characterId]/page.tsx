import { notFound } from "next/navigation";
import { loadLessonContent } from "../../../data/lesson-content";
import { characterLessons } from "../../../data/route-index.generated";
import { getTrackExercises } from "../../../domain/practice";
import { RecordDetailRoute } from "../../../features/records/records-routes";
import { trackIds, type TrackId } from "../../../lib/profile-model";

export default async function RecordDetailPage({
  params,
}: {
  params: Promise<{ track: string; characterId: string }>;
}) {
  const { track, characterId } = await params;
  if (!trackIds.includes(track as TrackId)) notFound();
  const lessonId = characterLessons[characterId];
  const content = lessonId ? await loadLessonContent(lessonId) : null;
  const character = content?.characters.find((item) => item.id === characterId);
  if (!character || !getTrackExercises(character, track as TrackId).length) notFound();
  return <RecordDetailRoute character={character} track={track as TrackId} />;
}
