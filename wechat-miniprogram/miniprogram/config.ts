const PRODUCTION_API_BASE_URL = "https://knowing-word.jbang2004.chatgpt.site";
const PRODUCTION_ASSET_BASE_URL = "https://knowing-word.jbang2004.chatgpt.site";

function resolveApiBaseUrl() {
  try {
    return wx.getDeviceInfo().platform === "devtools"
      ? "http://localhost:3000"
      : PRODUCTION_API_BASE_URL;
  } catch {
    return PRODUCTION_API_BASE_URL;
  }
}

export const API_BASE_URL = resolveApiBaseUrl();
export const CATALOG_SCHEMA_VERSION = 1;

export function assetUrl(path: string) {
  if (!path) return "";
  if (/^https:\/\//u.test(path)) return path;
  return `${PRODUCTION_ASSET_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
