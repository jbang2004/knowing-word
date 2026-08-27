import { isGrade5LessonId } from "../../data/lesson-content.ts";
import { getDb, getMedia, jsonError, jsonWithIdentity, resolveIdentity } from "../../lib/server-store.ts";
import {
  baseContentType,
  listRecordings,
  MAX_RECORDING_BYTES,
  readRecording,
  recordingExtension,
  saveRecording,
} from "../../server/services/recording-service.ts";

export const dynamic = "force-dynamic";

const recordingIdPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/iu;

export async function GET(request: Request) {
  const identity = resolveIdentity(request);
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const lessonId = url.searchParams.get("lessonId");
  if (id && !recordingIdPattern.test(id)) {
    return jsonWithIdentity(identity, { error: "录音编号无效" }, { status: 400 });
  }
  if (lessonId && !isGrade5LessonId(lessonId)) {
    return jsonWithIdentity(identity, { error: "课次编号无效" }, { status: 400 });
  }
  try {
    const db = getDb();
    if (!id) {
      return jsonWithIdentity(identity, {
        recordings: await listRecordings(db, identity.userId, lessonId),
      });
    }
    const stored = await readRecording(db, getMedia(), identity.userId, id);
    if (!stored) return jsonWithIdentity(identity, { error: "录音不存在" }, { status: 404 });
    const headers = new Headers();
    headers.set("content-type", stored.contentType);
    headers.set("content-length", String(stored.object.size));
    headers.set("cache-control", "private, no-store");
    headers.set("x-content-type-options", "nosniff");
    return new Response(stored.object.body, { headers });
  } catch (error) {
    return jsonError(identity, request, "暂时无法读取录音", error);
  }
}

export async function POST(request: Request) {
  const identity = resolveIdentity(request);
  const lessonId = new URL(request.url).searchParams.get("lessonId");
  if (!lessonId || !isGrade5LessonId(lessonId)) {
    return jsonWithIdentity(identity, { error: "课次编号无效" }, { status: 400 });
  }
  const contentType = baseContentType(request.headers.get("content-type"));
  if (!recordingExtension(contentType)) {
    return jsonWithIdentity(identity, { error: "录音格式不受支持" }, { status: 415 });
  }
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_RECORDING_BYTES) {
    return jsonWithIdentity(identity, { error: "录音需要小于 12MB" }, { status: 413 });
  }
  try {
    const result = await saveRecording({
      db: getDb(),
      media: getMedia(),
      userId: identity.userId,
      lessonId,
      contentType,
      bytes: await request.arrayBuffer(),
    });
    if (result.status === "unsupported") {
      return jsonWithIdentity(identity, { error: "录音格式不受支持" }, { status: 415 });
    }
    if (result.status === "too-large") {
      return jsonWithIdentity(identity, { error: "录音需要小于 12MB" }, { status: 413 });
    }
    return jsonWithIdentity(identity, { recording: result.recording }, { status: 201 });
  } catch (error) {
    return jsonError(identity, request, "暂时无法保存录音", error);
  }
}
