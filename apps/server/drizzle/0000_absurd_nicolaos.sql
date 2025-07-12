CREATE TYPE "public"."status" AS ENUM('active', 'completed', 'cancelled', 'pending', 'in_progress', 'delivered');
CREATE TYPE "public"."role" AS ENUM('admin', 'customer', 'kitchen', 'driver');--> statement-breakpoint
CREATE TABLE "delivery" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"order_id" varchar(36) NOT NULL,
	"delivery_driver_id" varchar(36) NOT NULL,
	"price" integer NOT NULL,
	"status" "status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "menu_categories" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" varchar(256) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"category_id" varchar(36) NOT NULL,
	"name" varchar(191) NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"is_available" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "menu_photos" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"menu_item_id" varchar(36) NOT NULL,
	"ext" varchar(16) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"title" varchar(191) NOT NULL,
	"price" integer NOT NULL,
	"order_number" integer NOT NULL,
	"status" "status" DEFAULT 'active' NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"ip" varchar(256) NOT NULL,
	"user_agent" varchar(256) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"first_name" varchar(256) NOT NULL,
	"last_name" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"password" varchar(256),
	"role" "role" DEFAULT 'customer' NOT NULL,
	"cep" varchar(16),
	"rua" varchar(256),
	"bairro" varchar(256),
	"cidade" varchar(128),
	"estado" varchar(64),
	"numero" varchar(16),
	"complemento" varchar(256),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_category_id_menu_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."menu_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_photos" ADD CONSTRAINT "menu_photos_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;