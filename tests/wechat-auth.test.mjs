import assert from "node:assert/strict";
import test from "node:test";
import {
  exchangeWechatCode,
  findWechatSession,
  WechatLoginError,
} from "../app/server/services/wechat-auth-service.ts";

function authDb() {
  const sessions = new Map();
  return {
    sessions,
    prepare(sql) {
      return {
        sql,
        values: [],
        bind(...values) { this.values = values; return this; },
        async first() {
          if (!sql.includes("FROM wechat_sessions")) return null;
          const row = sessions.get(this.values[0]);
          return row && row.expires_at > this.values[1] ? row : null;
        },
      };
    },
    async batch(statements) {
      for (const statement of statements) {
        if (statement.sql.includes("INSERT INTO wechat_sessions")) {
          sessions.set(statement.values[0], {
            user_id: statement.values[1],
            expires_at: statement.values[3],
          });
        }
      }
    },
  };
}

test("WeChat code exchange stores only hashed identifiers and an opaque session", async () => {
  const db = authDb();
  let requestedUrl;
  const session = await exchangeWechatCode({
    db,
    code: "temporary-code",
    appId: "wx-test-app",
    appSecret: "server-only-secret",
    now: new Date("2026-08-27T00:00:00.000Z"),
    fetcher: async (url) => {
      requestedUrl = new URL(url);
      return Response.json({ openid: "private-openid", unionid: "private-unionid", session_key: "discard-me" });
    },
  });
  assert.equal(requestedUrl.hostname, "api.weixin.qq.com");
  assert.equal(requestedUrl.searchParams.get("grant_type"), "authorization_code");
  assert.match(session.token, /^[A-Za-z0-9_-]{40,64}$/u);
  assert.match(session.userId, /^wechat:[a-f0-9]{40}$/u);
  assert.doesNotMatch(JSON.stringify([...db.sessions.entries()]), /private-openid|private-unionid|discard-me|server-only-secret/u);
  assert.deepEqual(
    await findWechatSession(db, session.token, new Date("2026-08-28T00:00:00.000Z")),
    { userId: session.userId, expiresAt: session.expiresAt },
  );
});

test("WeChat login fails closed when server credentials are absent", async () => {
  await assert.rejects(
    exchangeWechatCode({ db: authDb(), code: "code" }),
    (error) => error instanceof WechatLoginError && error.code === "wechat-not-configured" && error.status === 503,
  );
});
