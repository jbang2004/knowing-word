export type PrimaryNavigationId = "home" | "course" | "practice" | "profile";

export const primaryNavigation: ReadonlyArray<{
  id: PrimaryNavigationId;
  label: string;
  href: string;
}> = [
  { id: "home", label: "学习", href: "/" },
  { id: "course", label: "课本", href: "/lessons" },
  { id: "practice", label: "练习", href: "/practice" },
  { id: "profile", label: "我的", href: "/account" },
];

const appRouteRoots = new Set([
  "account",
  "bujian",
  "honglan-exercise",
  "lessons",
  "playground",
  "practice",
  "read-aloud",
  "records",
  "space-structure-exercise",
  "split-exercise",
]);

export function safeInternalReturnPath(value: unknown) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > 512 ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) return undefined;

  try {
    const url = new URL(value, "https://knowing-word.local");
    if (url.origin !== "https://knowing-word.local") return undefined;
    const root = url.pathname.split("/").filter(Boolean)[0];
    if (root && !appRouteRoots.has(root)) return undefined;
    return `${url.pathname}${url.search}`;
  } catch {
    return undefined;
  }
}

export function returnPathFromUrl(pathValue: string) {
  try {
    const url = new URL(pathValue, "https://knowing-word.local");
    return safeInternalReturnPath(url.searchParams.get("returnTo"));
  } catch {
    return undefined;
  }
}

export function withReturnTo(destination: string, returnTo: string) {
  const safeDestination = safeInternalReturnPath(destination);
  const safeReturn = safeInternalReturnPath(returnTo);
  if (!safeDestination || !safeReturn) return safeDestination || "/";
  const url = new URL(safeDestination, "https://knowing-word.local");
  url.searchParams.set("returnTo", safeReturn);
  return `${url.pathname}${url.search}`;
}
