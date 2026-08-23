import { notFound } from "next/navigation";
import { loadLessonContent } from "../data/lesson-content";
import { getTrackExercises } from "../domain/practice";
import PracticeSessionRoute from "../features/practice-session/practice-session-route";
import type { TrackId } from "../lib/profile-model";

export default async function PracticeRoutePage({
  lessonId,
  characterId,
  track,
}: {
  lessonId: string;
  characterId: string;
  track: TrackId;
}) {
  const content = await loadLessonContent(lessonId);
  const character = content?.characters.find((item) => item.id === characterId);
  if (!content || !character || !getTrackExercises(character, track).length) notFound();
  const candidateIds = content.characters
    .filter((item) => item.primary && item.official !== false && getTrackExercises(item, track).length > 0)
    .map((item) => item.id);
  return <PracticeSessionRoute character={character} track={track} candidateIds={candidateIds} />;
}
