import { getDb, getMedia, jsonError, jsonWithIdentity, resolveApiIdentity } from "../../lib/server-store.ts";
import {
  answerBucket,
  deleteProfile,
  encodedProfileBytes,
  getProfileSnapshot,
  MAX_PROFILE_BYTES,
  MAX_PROFILE_REQUEST_BYTES,
  MAX_PROFILE_ROW_BYTES,
  partitionProfileForStorage,
  PROFILE_ANSWER_BUCKETS,
  saveProfile,
} from "../../server/services/profile-service.ts";

export const dynamic = "force-dynamic";

export {
  answerBucket,
  MAX_PROFILE_BYTES,
  MAX_PROFILE_REQUEST_BYTES,
  MAX_PROFILE_ROW_BYTES,
  partitionProfileForStorage,
  PROFILE_ANSWER_BUCKETS,
};

export async function GET(request: Request) {
  const identity = await resolveApiIdentity(request);
  if (identity instanceof Response) return identity;
  try {
    const snapshot = await getProfileSnapshot(getDb(), identity.userId);
    return jsonWithIdentity(identity, {
      identity: {
        displayName: identity.displayName,
        email: identity.email,
        mode: identity.mode,
      },
      ...snapshot,
    });
  } catch (error) {
    return jsonError(identity, request, "暂时无法读取学习档案", error);
  }
}

export async function PUT(request: Request) {
  const identity = await resolveApiIdentity(request);
  if (identity instanceof Response) return identity;
  let payload: unknown;
  try {
    const raw = await request.text();
    if (encodedProfileBytes(raw) > MAX_PROFILE_REQUEST_BYTES) {
      return jsonWithIdentity(identity, { error: "学习档案过大" }, { status: 413 });
    }
    payload = JSON.parse(raw);
  } catch {
    return jsonWithIdentity(identity, { error: "学习档案不是有效的 JSON" }, { status: 400 });
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return jsonWithIdentity(identity, { error: "学习档案格式无效" }, { status: 400 });
  }
  try {
    const result = await saveProfile(getDb(), identity.userId, payload);
    if (result.status === "too-large") {
      return jsonWithIdentity(identity, { error: "学习档案分片过大" }, { status: 413 });
    }
    if (result.status === "conflict") {
      return jsonWithIdentity(identity, { error: "学习档案正在其他设备更新，请重试" }, { status: 409 });
    }
    return jsonWithIdentity(identity, {
      ok: true,
      updatedAt: result.updatedAt,
      revision: result.revision,
      profile: result.profile,
    });
  } catch (error) {
    return jsonError(identity, request, "暂时无法保存学习档案", error);
  }
}

export async function DELETE(request: Request) {
  const identity = await resolveApiIdentity(request);
  if (identity instanceof Response) return identity;
  try {
    await deleteProfile(getDb(), getMedia(), identity.userId);
    return jsonWithIdentity(identity, { ok: true });
  } catch (error) {
    return jsonError(identity, request, "暂时无法清除学习档案", error);
  }
}
