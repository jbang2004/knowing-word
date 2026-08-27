import { characters, lessons, components, course } from "../data/catalog";
import { CATALOG_SCHEMA_VERSION, assetUrl } from "../config";
import type { CatalogCharacter, CatalogLesson, LessonContent } from "../types/models";
import { publicRequest } from "./api";

const CACHE_PREFIX = "knowing-word:lesson-cache:v1:";
const CACHE_INDEX_KEY = "knowing-word:lesson-cache-index:v1";
const MAX_CACHED_LESSONS = 10;

export const courseIndex = course;
export const lessonIndex = lessons as CatalogLesson[];
export const characterIndex = characters as CatalogCharacter[];
export const componentIndex = components;

export function lessonCover(lesson: CatalogLesson) {
  return assetUrl(lesson.visualPath ?? lesson.visual?.src ?? "");
}

export function charactersForLesson(lessonId: string) {
  return characterIndex.filter((character) => character.lessonId === lessonId);
}

export function findCharacter(characterId: string) {
  return characterIndex.find((character) => character.id === characterId);
}

function readCachedLesson(lessonId: string): LessonContent | null {
  const cached = wx.getStorageSync<LessonContent>(`${CACHE_PREFIX}${lessonId}`);
  return cached?.schemaVersion === CATALOG_SCHEMA_VERSION ? cached : null;
}

function rememberLesson(lessonId: string, content: LessonContent) {
  try {
    wx.setStorageSync(`${CACHE_PREFIX}${lessonId}`, content);
    const previous = wx.getStorageSync<string[]>(CACHE_INDEX_KEY) || [];
    const index = [lessonId, ...previous.filter((id) => id !== lessonId)];
    for (const staleId of index.slice(MAX_CACHED_LESSONS)) {
      wx.removeStorageSync(`${CACHE_PREFIX}${staleId}`);
    }
    wx.setStorageSync(CACHE_INDEX_KEY, index.slice(0, MAX_CACHED_LESSONS));
  } catch (error) {
    console.info("Lesson cache is full; continuing without persistent cache", error);
  }
}

export async function getLessonContent(lessonId: string, refresh = false): Promise<LessonContent> {
  const cached = !refresh ? readCachedLesson(lessonId) : null;
  if (cached) return cached;
  const content = await publicRequest<LessonContent>(`/api/catalog?lessonId=${encodeURIComponent(lessonId)}`);
  if (content.schemaVersion !== CATALOG_SCHEMA_VERSION) throw new Error("课程数据版本不兼容，请更新小程序");
  rememberLesson(lessonId, content);
  return content;
}

export function searchCatalog(query: string) {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return characterIndex;
  return characterIndex.filter((character) => [
    character.hanzi,
    character.word,
    character.pinyin,
    character.lessonTitle,
  ].some((value) => value.toLowerCase().includes(keyword)));
}
