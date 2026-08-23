type RuntimeEnv = Partial<Pick<Env, "DB" | "MEDIA">>;

export type RequestIdentity = {
  userId: string;
  displayName: string;
  email: string | null;
  mode: "workspace" | "device";
  cookie?: string;
};

const DEVICE_COOKIE = "knowing_word_device";
const DEVICE_PATTERN = /^[a-f0-9-]{20,64}$/i;

export function getDb() {
  const db = (globalThis as typeof globalThis & { __KNOWING_WORD_ENV__?: RuntimeEnv }).__KNOWING_WORD_ENV__?.DB;
  if (!db) throw new Error("D1 binding DB is unavailable");
  return db;
}

export function getMedia() {
  const media = (globalThis as typeof globalThis & { __KNOWING_WORD_ENV__?: RuntimeEnv }).__KNOWING_WORD_ENV__?.MEDIA;
  if (!media) throw new Error("R2 binding MEDIA is unavailable");
  return media;
}

export function resolveIdentity(request: Request): RequestIdentity {
  const authenticatedUserId = request.headers.get("oai-authenticated-user-id")?.trim();
  const email = request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase();
  const encodedName = request.headers.get("oai-authenticated-user-full-name");
  const nameEncoding = request.headers.get("oai-authenticated-user-full-name-encoding");
  if (authenticatedUserId || email) {
    let fullName: string | null = null;
    if (encodedName && nameEncoding === "percent-encoded-utf-8") {
      try {
        fullName = decodeURIComponent(encodedName);
      } catch {
        fullName = null;
      }
    }
    return {
      userId: `workspace:${authenticatedUserId || email}`,
      displayName: fullName || email?.split("@")[0] || "学习者",
      email: email || null,
      mode: "workspace",
    };
  }

  const cookieHeader = request.headers.get("cookie") || "";
  const existing = cookieHeader
    .split(";")
    .map((item) => item.trim().split("="))
    .find(([key]) => key === DEVICE_COOKIE)?.[1];
  const deviceId = existing && DEVICE_PATTERN.test(existing) ? existing : crypto.randomUUID();
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return {
    userId: `device:${deviceId}`,
    displayName: "小探险家",
    email: null,
    mode: "device",
    cookie: existing
      ? undefined
      : `${DEVICE_COOKIE}=${deviceId}; Path=/; Max-Age=31536000; SameSite=Lax${secure}; HttpOnly`,
  };
}

export function jsonWithIdentity(identity: RequestIdentity, body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  if (identity.cookie) headers.append("set-cookie", identity.cookie);
  return new Response(JSON.stringify(body), { ...init, headers });
}

export function dayKey(value = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}
