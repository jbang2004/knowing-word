import { notFound } from "next/navigation";
import { getComponentByGlyph } from "../../../../data/catalog";
import { loadLessonContent } from "../../../../data/lesson-content";
import { getPublishableLessonDocument } from "../../../../data/lesson-documents";
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
  const content = await loadLessonContent(lessonId);
  const character = content?.characters.find((item) => item.id === characterId);
  if (!character) notFound();
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
      returnTo={safeInternalReturnPath(returnToParam)}
      returnContextLabel={document?.format === "guide" ? "导读" : "语境"}
    />
  );
}
