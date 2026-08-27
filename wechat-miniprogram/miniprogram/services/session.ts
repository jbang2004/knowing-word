import { API_BASE_URL } from "../config";

const SESSION_KEY = "knowing-word:wechat-session:v1";

type StoredSession = {
  token: string;
  expiresAt: string;
};

let pendingLogin: Promise<StoredSession | null> | null = null;
let retryAfter = 0;

function readSession(): StoredSession | null {
  const stored = wx.getStorageSync<StoredSession>(SESSION_KEY);
  if (!stored?.token || !stored.expiresAt) return null;
  if (Date.parse(stored.expiresAt) <= Date.now() + 60_000) {
    wx.removeStorageSync(SESSION_KEY);
    return null;
  }
  return stored;
}

function loginCode() {
  return new Promise<string>((resolve, reject) => {
    wx.login({
      timeout: 8_000,
      success: (result) => result.code ? resolve(result.code) : reject(new Error("微信未返回登录凭证")),
      fail: reject,
    });
  });
}

function exchangeCode(code: string) {
  return new Promise<StoredSession>((resolve, reject) => {
    wx.request<{ token?: string; expiresAt?: string; error?: string }>({
      url: `${API_BASE_URL}/api/auth/wechat`,
      method: "POST",
      data: { code },
      header: { "content-type": "application/json" },
      timeout: 10_000,
      success: (response) => {
        if (response.statusCode === 200 && response.data.token && response.data.expiresAt) {
          resolve({ token: response.data.token, expiresAt: response.data.expiresAt });
          return;
        }
        reject(new Error(response.data.error || `微信登录失败（${response.statusCode}）`));
      },
      fail: reject,
    });
  });
}

export function getSessionToken() {
  return readSession()?.token ?? null;
}

export function clearWechatSession() {
  wx.removeStorageSync(SESSION_KEY);
  retryAfter = 0;
}

export function getSessionStatus() {
  const session = readSession();
  return session
    ? { connected: true, expiresAt: session.expiresAt }
    : { connected: false, expiresAt: "" };
}

export async function ensureWechatSession(force = false): Promise<StoredSession | null> {
  if (!force) {
    const current = readSession();
    if (current) return current;
    if (Date.now() < retryAfter) return null;
  }
  if (pendingLogin) return pendingLogin;
  pendingLogin = (async () => {
    try {
      const session = await exchangeCode(await loginCode());
      wx.setStorageSync(SESSION_KEY, session);
      retryAfter = 0;
      return session;
    } catch (error) {
      retryAfter = Date.now() + 5 * 60_000;
      console.info("WeChat session is unavailable; continuing with local progress", error);
      return null;
    } finally {
      pendingLogin = null;
    }
  })();
  return pendingLogin;
}
