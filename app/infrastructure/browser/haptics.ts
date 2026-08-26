/* Vibration patterns for immediate practice feedback. */

export type HapticPattern = "light" | "success";

export function pulseHaptic(pattern: HapticPattern = "light") {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  navigator.vibrate(pattern === "success" ? [14, 26, 18] : 12);
}
