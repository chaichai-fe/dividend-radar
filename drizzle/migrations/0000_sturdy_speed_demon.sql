CREATE TABLE `holdings` (
	`code` text PRIMARY KEY NOT NULL,
	`amount` real DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
