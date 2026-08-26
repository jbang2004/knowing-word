export type AdventureSoundId = "collect" | "snap" | "combine" | "mist" | "page" | "brush" | "stamp";

let audioContext: AudioContext | null = null;
let lastBrushAt = 0;

function context() {
  if (typeof window === "undefined") return null;
  const AudioContextConstructor = window.AudioContext
    ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextConstructor) return null;
  audioContext ??= new AudioContextConstructor();
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
}

function tone(
  ctx: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  volume: number,
  type: OscillatorType = "sine",
  endFrequency = frequency,
) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(24, endFrequency), start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + Math.min(0.025, duration * 0.2));
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function noise(ctx: AudioContext, start: number, duration: number, volume: number, highpass = 600) {
  const sampleRate = ctx.sampleRate;
  const buffer = ctx.createBuffer(1, Math.ceil(sampleRate * duration), sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < samples.length; index += 1) {
    const envelope = Math.sin(Math.PI * index / samples.length);
    samples[index] = (Math.random() * 2 - 1) * envelope;
  }
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = buffer;
  filter.type = "highpass";
  filter.frequency.value = highpass;
  gain.gain.value = volume;
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(start);
}

export function playAdventureSound(id: AdventureSoundId) {
  const ctx = context();
  if (!ctx) return;
  const now = ctx.currentTime + 0.008;

  if (id === "collect") {
    tone(ctx, 420, now, 0.12, 0.055, "sine", 690);
    tone(ctx, 710, now + 0.085, 0.15, 0.045, "sine", 920);
    return;
  }
  if (id === "snap") {
    noise(ctx, now, 0.055, 0.035, 1000);
    tone(ctx, 180, now, 0.09, 0.045, "triangle", 120);
    return;
  }
  if (id === "combine") {
    tone(ctx, 260, now, 0.22, 0.05, "triangle", 520);
    tone(ctx, 390, now + 0.08, 0.24, 0.04, "sine", 780);
    tone(ctx, 780, now + 0.2, 0.2, 0.035, "sine", 1040);
    return;
  }
  if (id === "mist") {
    noise(ctx, now, 0.48, 0.013, 1200);
    tone(ctx, 240, now, 0.48, 0.018, "sine", 150);
    return;
  }
  if (id === "page") {
    noise(ctx, now, 0.2, 0.026, 850);
    tone(ctx, 340, now + 0.04, 0.14, 0.018, "sine", 240);
    return;
  }
  if (id === "brush") {
    const stamp = performance.now();
    if (stamp - lastBrushAt < 90) return;
    lastBrushAt = stamp;
    noise(ctx, now, 0.075, 0.009, 1700);
    return;
  }
  noise(ctx, now, 0.07, 0.04, 450);
  tone(ctx, 115, now, 0.24, 0.09, "triangle", 72);
  tone(ctx, 230, now + 0.045, 0.3, 0.035, "sine", 150);
}

export function pulseAdventureHaptic(pattern: "light" | "success" = "light") {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  navigator.vibrate(pattern === "success" ? [14, 26, 18] : 12);
}
