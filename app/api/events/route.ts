import { parseLearningEvent } from "../../domain/learning-event.ts";
import { readBoundedJson } from "../../lib/request-body.ts";
import { getDb, jsonError, jsonWithIdentity, resolveApiIdentity } from "../../lib/server-store.ts";
import { saveLearningEvent } from "../../server/services/learning-event-service.ts";

export const dynamic = "force-dynamic";
const MAX_EVENT_REQUEST_BYTES = 16 * 1024;

export async function POST(request: Request) {
  const identity = await resolveApiIdentity(request);
  if (identity instanceof Response) return identity;
  const input = await readBoundedJson(request, MAX_EVENT_REQUEST_BYTES);
  if (input.status === "too-large") {
    return jsonWithIdentity(identity, { error: "学习事件过大" }, { status: 413 });
  }
  if (input.status !== "ok") {
    return jsonWithIdentity(identity, { error: "学习事件不是有效的 JSON" }, { status: 400 });
  }
  const payload = parseLearningEvent(input.value);
  if (!payload) {
    return jsonWithIdentity(identity, { error: "无效的学习事件" }, { status: 400 });
  }
  if (identity.mode === "device") {
    return jsonWithIdentity(identity, { ok: true, stored: false });
  }
  try {
    const result = await saveLearningEvent(getDb(), identity.userId, payload);
    if (result.status === "quota") {
      return jsonWithIdentity(identity, { error: "今日学习事件数量已达到上限" }, {
        status: 429,
        headers: { "retry-after": "3600" },
      });
    }
    return jsonWithIdentity(identity, { ok: true, ...result });
  } catch (error) {
    return jsonError(identity, request, "暂时无法保存学习事件", error);
  }
}
