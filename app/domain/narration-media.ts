export const NARRATION_RELEASE_VERSION = "narration-v4-fish-s2.1-pro-free-20260824";

export type NarrationMedia = {
  audio: string;
  marks: string;
  transcript: string;
};

function versioned(source: string) {
  return `${source}?v=${encodeURIComponent(NARRATION_RELEASE_VERSION)}`;
}

export function narrationMedia(characterId: string, transcript: string): NarrationMedia {
  const base = `/media/narration/v4/${characterId}`;
  return {
    audio: versioned(`${base}/audio.webm`),
    marks: versioned(`${base}/audio-marks.json`),
    transcript,
  };
}
