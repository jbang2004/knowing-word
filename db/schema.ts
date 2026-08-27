/**
 * Canonical application schema. The checked-in SQL migrations in `drizzle/`
 * remain the executable history; these definitions keep the current shape in
 * one reviewable place for D1-backed services.
 */
export const studyProfilesSchema = `CREATE TABLE study_profiles (
  user_id TEXT PRIMARY KEY NOT NULL,
  payload_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  revision INTEGER DEFAULT 0 NOT NULL
)`;

export const profileAnswerShardsSchema = `CREATE TABLE profile_answer_shards (
  user_id TEXT NOT NULL,
  bucket INTEGER NOT NULL,
  answers_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  revision INTEGER DEFAULT 0 NOT NULL,
  PRIMARY KEY(user_id, bucket)
)`;

export const learningEventsSchema = `CREATE TABLE learning_events (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  track TEXT,
  lesson_id TEXT,
  character_id TEXT,
  question_id TEXT,
  correct INTEGER,
  selection_json TEXT,
  created_at TEXT NOT NULL,
  dimension TEXT,
  cue_level INTEGER,
  answer_mode TEXT,
  latency_ms INTEGER,
  error_tags_json TEXT
)`;

export const recordingsSchema = `CREATE TABLE recordings (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  object_key TEXT NOT NULL,
  content_type TEXT NOT NULL,
  byte_size INTEGER NOT NULL,
  created_at TEXT NOT NULL
)`;

export const wechatAccountsSchema = `CREATE TABLE wechat_accounts (
  openid_hash TEXT PRIMARY KEY NOT NULL,
  user_id TEXT UNIQUE NOT NULL,
  unionid_hash TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`;

export const wechatSessionsSchema = `CREATE TABLE wechat_sessions (
  token_hash TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
)`;
