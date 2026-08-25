"use client";

import { useRouter } from "next/navigation";
import type { CharacterItem } from "../../data/catalog-types";
import { withReturnTo } from "../../lib/navigation";
import { withPreferenceUpdate } from "../../lib/profile-model";
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
  const returnDestination = returnTo ?? `/lessons/${character.lessonId}?view=words`;
  const returnPath = withReturnTo(characterPath, returnDestination);
  const backLabel = !returnTo || returnDestination.includes("view=words")
    ? "返回生字表"
    : returnDestination.includes("view=practice") || returnDestination === "/practice"
      ? "返回复习巩固"
      : returnDestination.startsWith("/records")
        ? "返回学习记录"
        : returnDestination === "/"
          ? "返回学习首页"
          : `返回《${character.lessonTitle}》${returnContextLabel}`;

  return (
    <CharacterStudy
      key={character.id}
      character={character}
      media={media}
      profile={profile}
      favorite={profile.favorites.includes(character.id)}
      backLabel={backLabel}
      onBack={() => router.push(returnDestination)}
      onFavorite={() => setProfile((previous) => withPreferenceUpdate(
        previous,
        "favorites",
        previous.favorites.includes(character.id)
          ? previous.favorites.filter((id) => id !== character.id)
          : [...previous.favorites, character.id],
      ))}
      onStart={() => router.push(withReturnTo(`${characterPath}/quizzes`, returnDestination))}
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
