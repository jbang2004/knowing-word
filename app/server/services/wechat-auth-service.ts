const WECHAT_CODE_TO_SESSION_URL = "https://api.weixin.qq.com/sns/jscode2session";
const SESSION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

type WechatCodeResponse = {
  openid?: string;
  unionid?: string;
  session_key?: string;
  errcode?: number;
  errmsg?: string;
};

export type WechatSession = {
  token: string;
  expiresAt: string;
  userId: string;
};

export class WechatLoginError extends Error {
  readonly publicMessage: string;
  readonly status: number;
  readonly code: string;

  constructor(
    message: string,
    publicMessage: string,
    status: number,
    code: string,
  ) {
    super(message);
    this.name = "WechatLoginError";
    this.publicMessage = publicMessage;
    this.status = status;
    this.code = code;
  }
}

function bytesToHex(bytes: Uint8Array) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToHex(new Uint8Array(digest));
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function configured(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed && !/^replace[-_ ]?me$/iu.test(trimmed) ? trimmed : null;
}

export async function exchangeWechatCode({
  db,
  code,
  appId,
  appSecret,
  fetcher = fetch,
  now = new Date(),
}: {
  db: D1Database;
  code: string;
  appId?: string;
  appSecret?: string;
  fetcher?: typeof fetch;
  now?: Date;
}): Promise<WechatSession> {
  const resolvedAppId = configured(appId);
  const resolvedSecret = configured(appSecret);
  if (!resolvedAppId || !resolvedSecret) {
    throw new WechatLoginError(
      "WeChat application credentials are unavailable",
      "微信登录尚未配置，当前学习记录会先保存在本机",
      503,
      "wechat-not-configured",
    );
  }
  if (!code || code.length > 160) {
    throw new WechatLoginError("Invalid WeChat login code", "微信登录凭证无效", 400, "invalid-code");
  }

  const url = new URL(WECHAT_CODE_TO_SESSION_URL);
  url.search = new URLSearchParams({
    appid: resolvedAppId,
    secret: resolvedSecret,
    js_code: code,
    grant_type: "authorization_code",
  }).toString();

  let response: Response;
  try {
    response = await fetcher(url, {
      method: "GET",
      signal: AbortSignal.timeout(8_000),
    });
  } catch (error) {
    throw new WechatLoginError(
      `WeChat code exchange failed: ${error instanceof Error ? error.message : String(error)}`,
      "微信登录服务暂时不可用，请稍后重试",
      503,
      "wechat-unavailable",
    );
  }

  let payload: WechatCodeResponse;
  try {
    payload = await response.json() as WechatCodeResponse;
  } catch {
    throw new WechatLoginError(
      `WeChat code exchange returned ${response.status} with invalid JSON`,
      "微信登录服务返回异常，请稍后重试",
      502,
      "wechat-invalid-response",
    );
  }
  if (!response.ok || payload.errcode || !payload.openid) {
    throw new WechatLoginError(
      `WeChat code exchange rejected the request (${payload.errcode ?? response.status}: ${payload.errmsg ?? "missing openid"})`,
      "微信登录没有完成，请重新进入小程序后再试",
      401,
      "wechat-code-rejected",
    );
  }

  const [openidHash, unionidHash] = await Promise.all([
    sha256(payload.openid),
    payload.unionid ? sha256(payload.unionid) : Promise.resolve(null),
  ]);
  const userId = `wechat:${openidHash.slice(0, 40)}`;
  const token = randomToken();
  const tokenHash = await sha256(token);
  const createdAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + SESSION_LIFETIME_MS).toISOString();

  await db.batch([
    db.prepare(`INSERT INTO wechat_accounts
      (openid_hash, user_id, unionid_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(openid_hash) DO UPDATE SET
        unionid_hash = COALESCE(excluded.unionid_hash, wechat_accounts.unionid_hash),
        updated_at = excluded.updated_at`)
      .bind(openidHash, userId, unionidHash, createdAt, createdAt),
    db.prepare(`DELETE FROM wechat_sessions WHERE expires_at <= ?`).bind(createdAt),
    db.prepare(`INSERT INTO wechat_sessions
      (token_hash, user_id, created_at, expires_at)
      VALUES (?, ?, ?, ?)`)
      .bind(tokenHash, userId, createdAt, expiresAt),
  ]);

  return { token, expiresAt, userId };
}

export async function findWechatSession(db: D1Database, token: string, now = new Date()) {
  if (!/^[A-Za-z0-9_-]{40,64}$/u.test(token)) return null;
  const tokenHash = await sha256(token);
  const row = await db.prepare(`SELECT user_id, expires_at
    FROM wechat_sessions
    WHERE token_hash = ? AND expires_at > ?
    LIMIT 1`)
    .bind(tokenHash, now.toISOString())
    .first<{ user_id: string; expires_at: string }>();
  return row ? { userId: row.user_id, expiresAt: row.expires_at } : null;
}
