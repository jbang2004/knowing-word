import { course, lessons } from "../../data/catalog.ts";
import { loadLessonContent } from "../../data/lesson-content.ts";
import { loadLessonMedia } from "../../data/lesson-media.ts";
import { lessonVisuals } from "../../data/illustrations.ts";
import { narrationMedia } from "../../domain/narration-media.ts";

export const dynamic = "force-dynamic";

const CATALOG_SCHEMA_VERSION = 2;
const PRODUCTION_ASSET_ORIGIN = "https://knowing-word.jbang2004.chatgpt.site";

function absoluteAsset(request: Request, source?: string) {
  if (!source) return "";
  const requestUrl = new URL(request.url);
  const base = requestUrl.protocol === "https:"
    ? requestUrl.origin
    : PRODUCTION_ASSET_ORIGIN;
  const asset = new URL(source, base);
  if (asset.origin === base && asset.pathname.startsWith("/illustrations/")) {
    return new URL(`/api/mini-asset/v1${asset.pathname}`, base).toString();
  }
  return asset.toString();
}

function jsonCatalog(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": status === 200
        ? "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400"
        : "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

export async function GET(request: Request) {
  const lessonId = new URL(request.url).searchParams.get("lessonId")?.trim();
  if (!lessonId) {
    return jsonCatalog({
      schemaVersion: CATALOG_SCHEMA_VERSION,
      course,
      lessons: lessons.map((lesson) => ({
        ...lesson,
        visual: lessonVisuals[lesson.id]
          ? {
              ...lessonVisuals[lesson.id],
              src: absoluteAsset(request, lessonVisuals[lesson.id].src),
            }
          : null,
      })),
    });
  }

  const [content, media] = await Promise.all([
    loadLessonContent(lessonId),
    loadLessonMedia(lessonId),
  ]);
  if (!content || !media) {
    return jsonCatalog({ error: "课次不存在" }, 404);
  }

  const visual = lessonVisuals[lessonId];
  return jsonCatalog({
    schemaVersion: CATALOG_SCHEMA_VERSION,
    course,
    lesson: {
      ...content.lesson,
      visual: visual ? { ...visual, src: absoluteAsset(request, visual.src) } : null,
    },
    document: content.document ?? null,
    characters: content.characters.map((character) => {
      const characterMedia = media[character.id];
      const narration = narrationMedia(
        character.id,
        characterMedia?.transcript ?? character.description,
        character.description,
      );
      return {
        ...character,
        media: characterMedia
          ? {
              visual: characterMedia.visual
                ? {
                    ...characterMedia.visual,
                    src: absoluteAsset(request, characterMedia.visual.src),
                  }
                : null,
              scene: characterMedia.scene,
              narration: {
                transcript: narration.transcript,
                audio: narration.audio
                  ? absoluteAsset(request, narration.audio.replace("/audio.webm", "/audio.m4a"))
                  : "",
                marks: narration.marks ? absoluteAsset(request, narration.marks) : "",
              },
              practiceOptionVisuals: Object.fromEntries(
                Object.entries(characterMedia.practiceOptionVisuals).map(([key, option]) => [
                  key,
                  { ...option, src: absoluteAsset(request, option.src) },
                ]),
              ),
            }
          : null,
      };
    }),
  });
}
