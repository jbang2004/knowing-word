import type { JsonTransport } from "../platform/contracts.ts";

export type RecordingSummary = {
  id: string;
  lessonId: string;
  contentType: string;
  byteSize: number;
  createdAt: string;
  url: string;
};

export function createRecordingsClient(transport: JsonTransport) {
  return {
    async latestForLesson(lessonId: string) {
      const payload = await transport.request<{ recordings?: RecordingSummary[] }>(
        `/api/recordings?lessonId=${encodeURIComponent(lessonId)}`,
        { cache: "no-store" },
      );
      return payload.recordings?.[0] ?? null;
    },

    async upload(lessonId: string, body: unknown, contentType: string) {
      const payload = await transport.request<{ recording: RecordingSummary }>(
        `/api/recordings?lessonId=${encodeURIComponent(lessonId)}`,
        {
          method: "POST",
          headers: { "content-type": contentType },
          body,
        },
      );
      return payload.recording;
    },
  };
}
