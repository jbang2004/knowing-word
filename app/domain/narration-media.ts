export const NARRATION_RELEASE_VERSION = "narration-v3-qwen3-4bit-r37e955a";

export type NarrationMedia = {
  audio: string;
  marks: string;
  transcript: string;
};

function versioned(source: string) {
  return `${source}?v=${encodeURIComponent(NARRATION_RELEASE_VERSION)}`;
}

export function narrationMedia(characterId: string, transcript: string): NarrationMedia {
  const base = `/media/narration/v3/${characterId}`;
  return {
    audio: versioned(`${base}/audio.webm`),
    marks: versioned(`${base}/audio-marks.json`),
    transcript,
  };
}
