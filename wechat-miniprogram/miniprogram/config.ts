export const API_BASE_URL = "https://knowing-word.jbang2004.chatgpt.site";
export const CATALOG_SCHEMA_VERSION = 1;

export function assetUrl(path: string) {
  if (!path) return "";
  if (/^https:\/\//u.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
