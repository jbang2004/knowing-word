ALTER TABLE `learning_events` ADD COLUMN `dimension` text;
--> statement-breakpoint
ALTER TABLE `learning_events` ADD COLUMN `cue_level` integer;
--> statement-breakpoint
ALTER TABLE `learning_events` ADD COLUMN `answer_mode` text;
--> statement-breakpoint
ALTER TABLE `learning_events` ADD COLUMN `latency_ms` integer;
--> statement-breakpoint
ALTER TABLE `learning_events` ADD COLUMN `error_tags_json` text;
