CREATE TABLE `book_likes` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`book_id` bigint unsigned NOT NULL,
	`liker_key` varchar(80) NOT NULL,
	`network_key` varchar(80),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `book_likes_id` PRIMARY KEY(`id`),
	CONSTRAINT `book_likes_liker_unique` UNIQUE(`book_id`,`liker_key`),
	CONSTRAINT `book_likes_network_unique` UNIQUE(`book_id`,`network_key`)
);
--> statement-breakpoint
CREATE TABLE `books` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`open_library_work_key` varchar(32) NOT NULL,
	`title` varchar(300) NOT NULL,
	`authors` varchar(500) NOT NULL,
	`cover_id` int unsigned,
	`first_publish_year` smallint,
	`status` enum('pending','approved','rejected','reading','read') NOT NULL DEFAULT 'pending',
	`proposer_user_id` bigint unsigned,
	`likes_count` int unsigned NOT NULL DEFAULT 0,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`reviewed_at` datetime,
	`read_at` datetime,
	CONSTRAINT `books_id` PRIMARY KEY(`id`),
	CONSTRAINT `books_work_key_unique` UNIQUE(`open_library_work_key`)
);
--> statement-breakpoint
CREATE TABLE `moderation_actions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`actor_user_id` bigint unsigned,
	`action` enum('approve_book','reject_book','restore_book','delete_book','mark_read','mark_unread','start_reading','update_chapter','finish_reading','cancel_reading','grant_moderator','revoke_moderator','restore_moderator') NOT NULL,
	`book_id` bigint unsigned,
	`book_title` varchar(300),
	`target_kick_user_id` bigint unsigned,
	`detail` varchar(300),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `moderation_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `moderators` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`kick_user_id` bigint unsigned NOT NULL,
	`username` varchar(64) NOT NULL,
	`source` enum('manual','chat_badge') NOT NULL,
	`granted_by_user_id` bigint unsigned,
	`granted_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`revoked_at` datetime,
	`revoked_by_user_id` bigint unsigned,
	CONSTRAINT `moderators_id` PRIMARY KEY(`id`),
	CONSTRAINT `moderators_kick_user_id_unique` UNIQUE(`kick_user_id`)
);
--> statement-breakpoint
CREATE TABLE `processed_webhook_messages` (
	`message_id` varchar(64) NOT NULL,
	`received_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `processed_webhook_messages_message_id` PRIMARY KEY(`message_id`)
);
--> statement-breakpoint
CREATE TABLE `rate_limit_buckets` (
	`bucket_key` varchar(160) NOT NULL,
	`window_start` datetime NOT NULL,
	`hits` int unsigned NOT NULL DEFAULT 1,
	CONSTRAINT `rate_limit_buckets_bucket_key_window_start_pk` PRIMARY KEY(`bucket_key`,`window_start`)
);
--> statement-breakpoint
CREATE TABLE `readings` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`book_id` bigint unsigned NOT NULL,
	`current_chapter` varchar(120),
	`started_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`finished_at` datetime,
	`open_marker` tinyint GENERATED ALWAYS AS ((case when finished_at is null then 1 else null end)) STORED,
	CONSTRAINT `readings_id` PRIMARY KEY(`id`),
	CONSTRAINT `readings_single_open_unique` UNIQUE(`open_marker`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`token_hash` char(64) NOT NULL,
	`user_id` bigint unsigned NOT NULL,
	`expires_at` datetime NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_token_hash` PRIMARY KEY(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`kick_user_id` bigint unsigned NOT NULL,
	`username` varchar(64) NOT NULL,
	`avatar_url` varchar(512),
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_kick_user_id_unique` UNIQUE(`kick_user_id`)
);
--> statement-breakpoint
ALTER TABLE `book_likes` ADD CONSTRAINT `book_likes_book_id_books_id_fk` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `books` ADD CONSTRAINT `books_proposer_user_id_users_id_fk` FOREIGN KEY (`proposer_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `moderation_actions` ADD CONSTRAINT `moderation_actions_actor_user_id_users_id_fk` FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `moderators` ADD CONSTRAINT `moderators_granted_by_user_id_users_id_fk` FOREIGN KEY (`granted_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `moderators` ADD CONSTRAINT `moderators_revoked_by_user_id_users_id_fk` FOREIGN KEY (`revoked_by_user_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `readings` ADD CONSTRAINT `readings_book_id_books_id_fk` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `books_status_likes_idx` ON `books` (`status`,`likes_count`);--> statement-breakpoint
CREATE INDEX `books_status_created_idx` ON `books` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `moderation_actions_created_idx` ON `moderation_actions` (`created_at`);--> statement-breakpoint
CREATE INDEX `readings_book_id_idx` ON `readings` (`book_id`);--> statement-breakpoint
CREATE INDEX `sessions_user_id_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_expires_at_idx` ON `sessions` (`expires_at`);