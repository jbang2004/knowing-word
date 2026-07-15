CREATE TABLE `study_profiles` (
  `user_id` text PRIMARY KEY NOT NULL,
  `payload_json` text NOT NULL,
  `updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `learning_events` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `action` text NOT NULL,
  `track` text,
  `lesson_id` text,
  `character_id` text,
  `question_id` text,
  `correct` integer,
  `selection_json` text,
  `created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `learning_events_user_created_idx` ON `learning_events` (`user_id`,`created_at`);
--> statement-breakpoint
CREATE TABLE `recordings` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `lesson_id` text NOT NULL,
  `object_key` text NOT NULL,
  `content_type` text NOT NULL,
  `byte_size` integer NOT NULL,
  `created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `recordings_user_lesson_idx` ON `recordings` (`user_id`,`lesson_id`,`created_at`);
--> statement-breakpoint
CREATE TABLE `daily_activity` (
  `user_id` text NOT NULL,
  `activity_date` text NOT NULL,
  `attempts` integer DEFAULT 0 NOT NULL,
  `correct` integer DEFAULT 0 NOT NULL,
  `skips` integer DEFAULT 0 NOT NULL,
  `read_sessions` integer DEFAULT 0 NOT NULL,
  `updated_at` text NOT NULL,
  PRIMARY KEY(`user_id`, `activity_date`)
);
