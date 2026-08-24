"use client";

import { useRouter } from "next/navigation";
import type { CharacterItem } from "../../data/catalog-types";
import { withReturnTo } from "../../lib/navigation";
import { useStudyProfile } from "../profile/use-study-profile";
import { CharacterStudy, type CharacterStudyMedia } from "./character-study";

export default function CharacterStudyRoute({
  character,
  media,
  componentIds,
  returnTo,
  returnContextLabel = "语境",
}: {
  character: CharacterItem;
  media: CharacterStudyMedia;
  componentIds: Readonly<Record<string, string>>;
  returnTo?: string;
  returnContextLabel?: "导读" | "语境";
}) {
  const router = useRouter();
  const { profile, setProfile } = useStudyProfile();
  const characterPath = `/lessons/${character.lessonId}/words/${character.id}`;
  const returnPath = returnTo ? withReturnTo(characterPath, returnTo) : characterPath;

  return (
    <CharacterStudy
      character={character}
      media={media}
      profile={profile}
      favorite={profile.favorites.includes(character.id)}
      backLabel={returnTo ? `返回《${character.lessonTitle}》${returnContextLabel}` : "返回词语表"}
      onBack={() => router.push(returnTo ?? `/lessons/${character.lessonId}`)}
      onFavorite={() => setProfile((previous) => ({
        ...previous,
        favorites: previous.favorites.includes(character.id)
          ? previous.favorites.filter((id) => id !== character.id)
          : [...previous.favorites, character.id],
      }))}
      onStart={() => router.push(`${characterPath}/quizzes`)}
      onReadAloud={() => router.push(withReturnTo(`/read-aloud?lessonId=${encodeURIComponent(character.lessonId)}`, returnPath))}
      onComponent={(glyph) => {
        const componentId = componentIds[glyph];
        const destination = componentId
          ? `/bujian?component=${encodeURIComponent(componentId)}`
          : "/bujian";
        router.push(withReturnTo(destination, returnPath));
      }}
    />
  );
}
