import { getRuntimeEnv } from "./runtime-env.ts";
import { findWechatSession } from "../server/services/wechat-auth-service.ts";

export type RequestIdentity = {
  userId: string;
  displayName: string;
  email: string | null;
  mode: "workspace" | "device" | "wechat";
  cookie?: string;
};

const DEVICE_COOKIE = "knowing_word_device";
const DEVICE_PATTERN = /^[a-f0-9-]{20,64}$/i;

export function getDb() {
  const db = getRuntimeEnv()?.DB;
  if (!db) throw new Error("D1 binding DB is unavailable");
  return db;
}

export function getMedia() {
  const media = getRuntimeEnv()?.MEDIA;
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

function bearerToken(request: Request) {
  const authorization = request.headers.get("authorization")?.trim() ?? "";
  const match = /^Bearer\s+([^\s]+)$/iu.exec(authorization);
  return match?.[1] ?? null;
}

export async function resolveRequestIdentity(request: Request): Promise<RequestIdentity | null> {
  const token = bearerToken(request);
  if (!token) return resolveIdentity(request);
  const session = await findWechatSession(getDb(), token);
  if (!session) return null;
  return {
    userId: session.userId,
    displayName: "微信学习者",
    email: null,
    mode: "wechat",
  };
}

export function jsonUnauthorized(request: Request) {
  const requestId = request.headers.get("cf-ray")?.slice(0, 80) || crypto.randomUUID();
  return new Response(JSON.stringify({ error: "登录状态已失效，请重新进入小程序", requestId }), {
    status: 401,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export function jsonIdentityError(request: Request, error: unknown) {
  const requestId = request.headers.get("cf-ray")?.slice(0, 80) || crypto.randomUUID();
  console.error(JSON.stringify({
    level: "error",
    requestId,
    method: request.method,
    pathname: new URL(request.url).pathname,
    message: error instanceof Error ? error.message : String(error),
  }));
  return new Response(JSON.stringify({ error: "暂时无法验证登录状态", requestId }), {
    status: 503,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export async function resolveApiIdentity(request: Request): Promise<RequestIdentity | Response> {
  try {
    return await resolveRequestIdentity(request) ?? jsonUnauthorized(request);
  } catch (error) {
    return jsonIdentityError(request, error);
  }
}

export function jsonWithIdentity(identity: RequestIdentity, body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("cache-control", "no-store");
  if (identity.cookie) headers.append("set-cookie", identity.cookie);
  return new Response(JSON.stringify(body), { ...init, headers });
}

export function jsonError(
  identity: RequestIdentity,
  request: Request,
  publicMessage: string,
  error: unknown,
  status = 503,
) {
  const requestId = request.headers.get("cf-ray")?.slice(0, 80) || crypto.randomUUID();
  console.error(JSON.stringify({
    level: "error",
    requestId,
    method: request.method,
    pathname: new URL(request.url).pathname,
    message: error instanceof Error ? error.message : String(error),
  }));
  return jsonWithIdentity(identity, { error: publicMessage, requestId }, { status });
}
