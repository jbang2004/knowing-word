/* A physical pulse is reserved for corrective feedback. Success already has
   sound and positive visual motion, so vibrating there reads like an error. */

export function pulseRetryHaptic() {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  navigator.vibrate(22);
}
