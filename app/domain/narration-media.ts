export const NARRATION_RELEASE_VERSION = "narration-v5-fish-s2.1-pro-free-20260824";

export type NarrationMedia = {
  audio: string;
  marks: string;
  transcript: string;
};

// The released audio for this record was authored against the legacy word
// “煞气”, while the curriculum correctly teaches “煞有介事”. Withhold that
// byte-for-byte release until a newly reviewed recording exists; the player
// falls back to browser speech for the current card description meanwhile.
const withheldNarrationIds = new Set(["g5v1-l25-c09-u715e"]);

function versioned(source: string) {
  return `${source}?v=${encodeURIComponent(NARRATION_RELEASE_VERSION)}`;
}

export function narrationMedia(
  characterId: string,
  releasedTranscript: string,
  fallbackTranscript = releasedTranscript,
): NarrationMedia {
  if (withheldNarrationIds.has(characterId)) {
    return {
      audio: "",
      marks: "",
      transcript: fallbackTranscript,
    };
  }
  const base = `/media/narration/v5/${characterId}`;
  return {
    audio: versioned(`${base}/audio.webm`),
    marks: versioned(`${base}/audio-marks.json`),
    transcript: releasedTranscript,
  };
}
