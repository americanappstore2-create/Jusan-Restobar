CREATE TABLE `subcategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category_id` int NOT NULL,
	`name_ru` varchar(255) NOT NULL,
	`name_kz` varchar(255) NOT NULL,
	`name_en` varchar(255) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subcategories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `business_lunch_days` ADD `title_en` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `business_lunch_days` ADD `start_time` varchar(5) DEFAULT '12:00' NOT NULL;--> statement-breakpoint
ALTER TABLE `business_lunch_days` ADD `end_time` varchar(5) DEFAULT '15:00' NOT NULL;--> statement-breakpoint
ALTER TABLE `business_lunch_items` ADD `name_en` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `business_lunch_items` ADD `description_en` text;--> statement-breakpoint
ALTER TABLE `categories` ADD `name_en` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `dishes` ADD `subcategory_id` int;--> statement-breakpoint
ALTER TABLE `dishes` ADD `name_en` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `dishes` ADD `description_en` text;