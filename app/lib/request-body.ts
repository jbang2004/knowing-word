export type BoundedBodyResult =
  | { status: "ok"; text: string }
  | { status: "too-large" }
  | { status: "invalid" };

export async function readBoundedText(request: Request, maximumBytes: number): Promise<BoundedBodyResult> {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maximumBytes) {
    return { status: "too-large" };
  }

  if (!request.body) return { status: "ok", text: "" };
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let byteLength = 0;
  let text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      byteLength += value.byteLength;
      if (byteLength > maximumBytes) {
        await reader.cancel("request body exceeds the configured limit");
        return { status: "too-large" };
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return { status: "ok", text };
  } catch {
    return { status: "invalid" };
  } finally {
    reader.releaseLock();
  }
}

export async function readBoundedJson(request: Request, maximumBytes: number): Promise<BoundedBodyResult & { value?: unknown }> {
  const result = await readBoundedText(request, maximumBytes);
  if (result.status !== "ok") return result;
  try {
    return { ...result, value: JSON.parse(result.text) };
  } catch {
    return { status: "invalid" };
  }
}
