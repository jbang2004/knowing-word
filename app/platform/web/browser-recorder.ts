import type { CapturedAudio, VoiceRecorder } from "../contracts.ts";

const preferredRecordingTypes = [
  "audio/webm;codecs=opus",
  "audio/mp4",
] as const;

export function createBrowserVoiceRecorder(): VoiceRecorder {
  let recorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  let chunks: Blob[] = [];
  let startedAt = 0;
  const localUrls = new Set<string>();

  return {
    async start(onComplete) {
      if (recorder?.state === "recording") return;
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks = [];
      const preferredType = preferredRecordingTypes.find((type) => MediaRecorder.isTypeSupported(type));
      recorder = new MediaRecorder(stream, preferredType ? { mimeType: preferredType } : undefined);
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      recorder.onstop = () => {
        const activeStream = stream;
        const contentType = recorder?.mimeType || chunks[0]?.type || "audio/webm";
        const blob = new Blob(chunks, { type: contentType });
        const localUrl = URL.createObjectURL(blob);
        localUrls.add(localUrl);
        const capture: CapturedAudio = {
          body: blob,
          contentType,
          durationMs: Math.max(0, Date.now() - startedAt),
          localUrl,
          release() {
            if (!localUrls.delete(localUrl)) return;
            URL.revokeObjectURL(localUrl);
          },
        };
        activeStream?.getTracks().forEach((track) => track.stop());
        stream = null;
        recorder = null;
        chunks = [];
        void onComplete(capture);
      };
      startedAt = Date.now();
      recorder.start();
    },

    stop() {
      if (recorder?.state === "recording") recorder.stop();
    },

    dispose() {
      if (recorder) {
        recorder.ondataavailable = null;
        recorder.onstop = null;
        if (recorder.state === "recording") recorder.stop();
      }
      stream?.getTracks().forEach((track) => track.stop());
      recorder = null;
      stream = null;
      chunks = [];
      for (const url of localUrls) URL.revokeObjectURL(url);
      localUrls.clear();
    },
  };
}
