import { notFound } from "next/navigation";
import { getComponentByGlyph } from "../../../../data/catalog";
import { loadLessonContent } from "../../../../data/lesson-content";
import CharacterStudyRoute from "../../../../features/character-study/character-study-route";

export default async function CharacterPage({
  params,
}: {
  params: Promise<{ lessonId: string; characterId: string }>;
}) {
  const { lessonId, characterId } = await params;
  const content = await loadLessonContent(lessonId);
  const character = content?.characters.find((item) => item.id === characterId);
  if (!character) notFound();
  const componentIds = Object.fromEntries(
    character.parts
      .map((part) => [part.char, getComponentByGlyph(part.char)?.id])
      .filter((entry): entry is [string, string] => Boolean(entry[1])),
  );
  return <CharacterStudyRoute character={character} componentIds={componentIds} />;
}
