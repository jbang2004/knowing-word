import {
  characters,
  lessons,
  components,
  course,
} from "../data/catalog";
import { catalogContentVersion, catalogSchemaVersion } from "../data/runtime-contract";
import { assetUrl } from "../config";
import type { CatalogCharacter, CatalogLesson, LessonContent } from "../types/models";
import { publicRequest } from "./api";

const CACHE_FAMILY_PREFIX = "knowing-word:lesson-cache";
const CACHE_NAMESPACE = `${CACHE_FAMILY_PREFIX}:${catalogSchemaVersion}:${catalogContentVersion}`;
const CACHE_PREFIX = `${CACHE_NAMESPACE}:lesson:`;
const CACHE_INDEX_KEY = `${CACHE_NAMESPACE}:index`;
const MAX_CACHED_LESSONS = 10;
let cachePrepared = false;

export const courseIndex = course;
export const lessonIndex = lessons as CatalogLesson[];
export const characterIndex = characters as CatalogCharacter[];
export const componentIndex = components;

/** Keep the native app on the same official core course as the Web app. */
export function isCoreCharacter(character: CatalogCharacter) {
  return character.ready && character.primary && character.official !== false && character.tier !== "extension";
}

export function lessonCover(lesson: CatalogLesson) {
  return assetUrl(lesson.visualPath ?? lesson.visual?.src ?? "");
}

export function charactersForLesson(lessonId: string) {
  return characterIndex.filter((character) => character.lessonId === lessonId);
}

export function findCharacter(characterId: string) {
  return characterIndex.find((character) => character.id === characterId);
}

function prepareLessonCache() {
  if (cachePrepared) return;
  cachePrepared = true;
  try {
    for (const key of wx.getStorageInfoSync().keys) {
      if (key.startsWith(CACHE_FAMILY_PREFIX) && !key.startsWith(`${CACHE_NAMESPACE}:`)) {
        wx.removeStorageSync(key);
      }
    }
  } catch {
    // Storage cleanup is opportunistic; the current content-addressed cache
    // remains safe even when an older client cannot enumerate its keys.
  }
}

function isCurrentLessonContent(value: unknown): value is LessonContent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<LessonContent>;
  return candidate.schemaVersion === catalogSchemaVersion
    && Boolean(candidate.lesson && typeof candidate.lesson.id === "string")
    && Array.isArray(candidate.characters);
}

function readCachedLesson(lessonId: string): LessonContent | null {
  prepareLessonCache();
  const cached = wx.getStorageSync<unknown>(`${CACHE_PREFIX}${lessonId}`);
  return isCurrentLessonContent(cached) ? cached : null;
}

function rememberLesson(lessonId: string, content: LessonContent) {
  prepareLessonCache();
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
  const content = await publicRequest<unknown>(`/api/catalog?lessonId=${encodeURIComponent(lessonId)}`);
  if (!isCurrentLessonContent(content)) throw new Error("课程数据版本不兼容，请更新小程序");
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
