CREATE TABLE `profile_answer_shards` (
	`user_id` text NOT NULL,
	`bucket` integer NOT NULL,
	`answers_json` text NOT NULL,
	`updated_at` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`user_id`, `bucket`)
);
