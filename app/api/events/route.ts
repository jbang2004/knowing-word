import { parseLearningEvent } from "../../domain/learning-event.ts";
import { getDb, jsonError, jsonWithIdentity, resolveApiIdentity } from "../../lib/server-store.ts";
import { saveLearningEvent } from "../../server/services/learning-event-service.ts";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const identity = await resolveApiIdentity(request);
  if (identity instanceof Response) return identity;
  let input: unknown;
  try {
    input = await request.json();
  } catch {
    return jsonWithIdentity(identity, { error: "学习事件不是有效的 JSON" }, { status: 400 });
  }
  const payload = parseLearningEvent(input);
  if (!payload) {
    return jsonWithIdentity(identity, { error: "无效的学习事件" }, { status: 400 });
  }
  try {
    const result = await saveLearningEvent(getDb(), identity.userId, payload);
    return jsonWithIdentity(identity, { ok: true, ...result });
  } catch (error) {
    return jsonError(identity, request, "暂时无法保存学习事件", error);
  }
}
