import { catalogOrigin } from "./data/runtime-contract";

function resolveApiBaseUrl() {
  try {
    return wx.getDeviceInfo().platform === "devtools"
      ? "http://localhost:3000"
      : catalogOrigin;
  } catch {
    return catalogOrigin;
  }
}

export const API_BASE_URL = resolveApiBaseUrl();

export function assetUrl(path: string) {
  if (!path) return "";
  if (/^https:\/\//u.test(path)) return path;
  if (path.startsWith("/illustrations/")) {
    return `${catalogOrigin}/api/mini-asset/v1${path}`;
  }
  return `${catalogOrigin}${path.startsWith("/") ? path : `/${path}`}`;
}
