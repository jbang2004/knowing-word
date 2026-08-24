import { notFound } from "next/navigation";
import { loadLessonContent } from "../data/lesson-content";
import { loadLessonMedia } from "../data/lesson-media";
import { getPracticeSteps, type PracticeMode } from "../domain/practice";
import PracticeSessionRoute from "../features/practice-session/practice-session-route";
import type { TrackId } from "../lib/profile-model";

export default async function PracticeRoutePage({
  params,
  searchParams,
  track,
  mode = "track",
}: {
  params: Promise<{ lessonId: string; characterId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
  track: TrackId;
  mode?: PracticeMode;
}) {
  const [{ lessonId, characterId }, query] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({} as Record<string, string | string[] | undefined>),
  ]);
  const [content, lessonMedia] = await Promise.all([
    loadLessonContent(lessonId),
    loadLessonMedia(lessonId),
  ]);
  const character = content?.characters.find((item) => item.id === characterId);
  const media = lessonMedia?.[characterId];
  if (!content || !character || !media || !getPracticeSteps(character, track, mode).length) notFound();
  const candidateIds = content.characters
    .filter((item) => item.primary && item.official !== false && getPracticeSteps(item, track, mode).length > 0)
    .map((item) => item.id);
  const rawIndex = Array.isArray(query.question) ? query.question[0] : query.question;
  const parsedIndex = typeof rawIndex === "string" && /^\d{1,2}$/u.test(rawIndex)
    ? Number(rawIndex)
    : undefined;
  const initialQuestionIndex = parsedIndex !== undefined && parsedIndex < getPracticeSteps(character, track, mode).length
    ? parsedIndex
    : undefined;
  return (
    <PracticeSessionRoute
      character={character}
      track={track}
      mode={mode}
      candidateIds={candidateIds}
      initialQuestionIndex={initialQuestionIndex}
      media={{
        answerLabel: media.visual?.label,
        optionVisuals: media.practiceOptionVisuals,
        redBlueAsset: media.heritage?.redBlue,
      }}
    />
  );
}
