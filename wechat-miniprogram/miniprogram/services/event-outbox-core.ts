export function appendOutboxEvent<T>(events: readonly T[], event: T, maximum = 100) {
  return [...events, event].slice(-Math.max(1, maximum));
}

export function shouldDiscardFailedEvent(statusCode: number) {
  return statusCode >= 400 && statusCode < 500 && statusCode !== 401 && statusCode !== 429;
}
