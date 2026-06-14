CREATE TABLE `business_lunch_days` (
	`id` int AUTO_INCREMENT NOT NULL,
	`day_of_week` int NOT NULL,
	`title_ru` varchar(255) NOT NULL,
	`title_kz` varchar(255) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`price` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `business_lunch_days_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `business_lunch_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`day_id` int NOT NULL,
	`name_ru` varchar(255) NOT NULL,
	`name_kz` varchar(255) NOT NULL,
	`description_ru` text,
	`description_kz` text,
	`image_url` text,
	`image_key` text,
	`sort_order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `business_lunch_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name_ru` varchar(255) NOT NULL,
	`name_kz` varchar(255) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dishes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category_id` int NOT NULL,
	`name_ru` varchar(255) NOT NULL,
	`name_kz` varchar(255) NOT NULL,
	`description_ru` text,
	`description_kz` text,
	`price` decimal(10,2) NOT NULL,
	`image_url` text,
	`image_key` text,
	`is_available` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dishes_id` PRIMARY KEY(`id`)
);
