"use client";

import { useRouter } from "next/navigation";
import type { CharacterItem } from "../../data/catalog-types";
import { withReturnTo } from "../../lib/navigation";
import { useStudyProfile } from "../profile/use-study-profile";
import { CharacterStudy } from "./character-study";

export default function CharacterStudyRoute({
  character,
  componentIds,
}: {
  character: CharacterItem;
  componentIds: Readonly<Record<string, string>>;
}) {
  const router = useRouter();
  const { profile, setProfile } = useStudyProfile();
  const returnPath = `/lessons/${character.lessonId}/words/${character.id}`;

  return (
    <CharacterStudy
      character={character}
      profile={profile}
      favorite={profile.favorites.includes(character.id)}
      onBack={() => router.push(`/lessons/${character.lessonId}`)}
      onFavorite={() => setProfile((previous) => ({
        ...previous,
        favorites: previous.favorites.includes(character.id)
          ? previous.favorites.filter((id) => id !== character.id)
          : [...previous.favorites, character.id],
      }))}
      onStart={() => router.push(`${returnPath}/quizzes`)}
      onReadAloud={() => router.push(withReturnTo("/read-aloud", returnPath))}
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
