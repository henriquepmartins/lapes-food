CREATE TYPE "public"."status" AS ENUM('active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "menu_photos" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"menu_item_id" varchar(36) NOT NULL,
	"ext" varchar(16) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"title" varchar(191) NOT NULL,
	"price" integer NOT NULL,
	"order_number" integer NOT NULL,
	"status" "status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone,
	"user_id" varchar(36) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "menu_photos" ADD CONSTRAINT "menu_photos_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id") ON DELETE no action ON UPDATE no action;