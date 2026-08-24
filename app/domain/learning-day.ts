export const LEARNING_TIME_ZONE = "Asia/Shanghai";

export function learningDayKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: LEARNING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function totalReadSessions(daily: Readonly<Record<string, { readSessions: number }>>) {
  return Object.values(daily).reduce((total, activity) => total + activity.readSessions, 0);
}
