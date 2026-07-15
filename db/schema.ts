/** Canonical D1 schema used by the migration in drizzle/0000_complete_learning.sql. */
export const schemaTables = {
  studyProfiles: "study_profiles",
  learningEvents: "learning_events",
  recordings: "recordings",
  dailyActivity: "daily_activity",
} as const;
