/* Vibration patterns for immediate practice feedback. */

export type HapticPattern = "success" | "retry";

export function pulseHaptic(pattern: HapticPattern = "success") {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  navigator.vibrate(pattern === "success" ? 10 : 22);
}
