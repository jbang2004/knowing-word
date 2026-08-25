import { notFound } from "next/navigation";
import { loadLessonContent } from "../../data/lesson-content";
import { loadLessonMedia } from "../../data/lesson-media";
import CharacterAdventure from "../../features/character-adventure/character-adventure";

const CHARACTER_ID = "g5v1-l01-c02-u5acc";

export default async function XianAdventurePage() {
  const [content, media] = await Promise.all([
    loadLessonContent("g5v1-l01"),
    loadLessonMedia("g5v1-l01"),
  ]);
  const character = content?.characters.find((item) => item.id === CHARACTER_ID);
  const characterMedia = media?.[CHARACTER_ID];
  if (!character || !characterMedia?.visual) notFound();

  return (
    <CharacterAdventure
      character={character}
      visual={characterMedia.visual}
    />
  );
}
