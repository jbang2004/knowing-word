import { getDb, jsonWithIdentity, type RequestIdentity } from "../../../lib/server-store.ts";
import { getRuntimeEnv } from "../../../lib/runtime-env.ts";
import {
  exchangeWechatCode,
  WechatLoginError,
} from "../../../server/services/wechat-auth-service.ts";

export const dynamic = "force-dynamic";

const anonymousIdentity: RequestIdentity = {
  userId: "wechat:pending",
  displayName: "微信学习者",
  email: null,
  mode: "wechat",
};

export async function POST(request: Request) {
  let code = "";
  try {
    const payload = await request.json() as { code?: unknown };
    code = typeof payload.code === "string" ? payload.code.trim() : "";
  } catch {
    return jsonWithIdentity(anonymousIdentity, { error: "微信登录请求不是有效的 JSON" }, { status: 400 });
  }

  try {
    const env = getRuntimeEnv();
    const session = await exchangeWechatCode({
      db: getDb(),
      code,
      appId: env?.WECHAT_APP_ID,
      appSecret: env?.WECHAT_APP_SECRET,
    });
    return jsonWithIdentity(anonymousIdentity, {
      token: session.token,
      expiresAt: session.expiresAt,
      identity: {
        displayName: anonymousIdentity.displayName,
        email: null,
        mode: "wechat",
      },
    });
  } catch (error) {
    if (error instanceof WechatLoginError) {
      console.warn(JSON.stringify({ level: "warn", code: error.code, message: error.message }));
      return jsonWithIdentity(anonymousIdentity, {
        error: error.publicMessage,
        code: error.code,
      }, { status: error.status });
    }
    const requestId = request.headers.get("cf-ray")?.slice(0, 80) || crypto.randomUUID();
    console.error(JSON.stringify({
      level: "error",
      requestId,
      pathname: "/api/auth/wechat",
      message: error instanceof Error ? error.message : String(error),
    }));
    return jsonWithIdentity(anonymousIdentity, { error: "微信登录服务暂时不可用", requestId }, { status: 503 });
  }
}
