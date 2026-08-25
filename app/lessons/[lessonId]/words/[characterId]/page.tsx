import { notFound } from "next/navigation";
import { getComponentByGlyph } from "../../../../data/component-index";
import { loadLessonContent } from "../../../../data/lesson-content";
import { getPublishableLessonDocument } from "../../../../data/lesson-documents";
import { loadLessonMedia } from "../../../../data/lesson-media";
import { narrationMedia } from "../../../../domain/narration-media";
import CharacterStudyRoute from "../../../../features/character-study/character-study-route";
import { safeInternalReturnPath } from "../../../../lib/navigation";

export default async function CharacterPage({
  params,
  searchParams,
}: {
  params: Promise<{ lessonId: string; characterId: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { lessonId, characterId } = await params;
  const { returnTo: returnToParam } = await searchParams;
  const [content, lessonMedia] = await Promise.all([
    loadLessonContent(lessonId),
    loadLessonMedia(lessonId),
  ]);
  const character = content?.characters.find((item) => item.id === characterId);
  const media = lessonMedia?.[characterId];
  if (!character || !media) notFound();
  const document = getPublishableLessonDocument(lessonId);
  const componentIds = Object.fromEntries(
    character.parts
      .map((part) => [part.char, getComponentByGlyph(part.char)?.id])
      .filter((entry): entry is [string, string] => Boolean(entry[1])),
  );
  return (
    <CharacterStudyRoute
      character={character}
      componentIds={componentIds}
      media={{
        visual: media.visual,
        heritage: media.heritage,
        scene: media.scene,
        narration: narrationMedia(character.id, media.transcript, character.description),
      }}
      returnTo={safeInternalReturnPath(returnToParam)}
      returnContextLabel={document?.format === "guide" ? "导读" : "语境"}
    />
  );
}
