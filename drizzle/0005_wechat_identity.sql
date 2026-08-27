CREATE TABLE `wechat_accounts` (
	`openid_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL UNIQUE,
	`unionid_hash` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `wechat_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `wechat_sessions_user_expires_idx` ON `wechat_sessions` (`user_id`,`expires_at`);
--> statement-breakpoint
CREATE INDEX `wechat_sessions_expires_idx` ON `wechat_sessions` (`expires_at`);
--> statement-breakpoint
PRAGMA optimize;
