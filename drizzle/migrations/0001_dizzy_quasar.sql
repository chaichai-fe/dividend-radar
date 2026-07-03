CREATE TABLE `snapshots` (
	`day` text PRIMARY KEY NOT NULL,
	`taken_at` integer DEFAULT (unixepoch()) NOT NULL,
	`total_amount` real DEFAULT 0 NOT NULL,
	`portfolio_yield` real DEFAULT 0 NOT NULL,
	`annual_income` real DEFAULT 0 NOT NULL,
	`holdings_count` integer DEFAULT 0 NOT NULL
);
