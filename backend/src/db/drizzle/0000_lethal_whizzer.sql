CREATE TYPE "public"."category" AS ENUM('movie', 'series', 'anime', 'documentary', 'game', 'software', 'music', 'book', 'ebook', 'audiobook', 'course', 'tutorial', 'other');--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "refresh_tokens_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"tokenHash" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "torrents" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "torrents_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(255) NOT NULL,
	"description" text,
	"size" bigint NOT NULL,
	"info_hash" varchar(40) NOT NULL,
	"file_url" text NOT NULL,
	"cover_img_url" text,
	"uploader_id" integer NOT NULL,
	"category" "category" NOT NULL,
	"audio_languages" jsonb DEFAULT '[]'::jsonb,
	"subtitles" jsonb DEFAULT '[]'::jsonb,
	"completedCount" integer DEFAULT 0,
	"isPrivate" boolean DEFAULT true,
	"isDeleted" boolean DEFAULT false,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "torrents_info_hash_unique" UNIQUE("info_hash")
);
--> statement-breakpoint
CREATE TABLE "user_stat" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"uploaded" bigint DEFAULT 0,
	"downloaded" bigint DEFAULT 0,
	"ip" "inet",
	"port" integer,
	"ipUpdatedAt" timestamp,
	"passKey" varchar(40) NOT NULL,
	"passKeyCreatedAt" timestamp,
	CONSTRAINT "user_stat_passKey_unique" UNIQUE("passKey"),
	CONSTRAINT "uploaded_check" CHECK ("user_stat"."uploaded" >= 0),
	CONSTRAINT "download_check" CHECK ("user_stat"."downloaded" >= 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"passwordHash" text NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"isVerified" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "torrents" ADD CONSTRAINT "torrents_uploader_id_users_id_fk" FOREIGN KEY ("uploader_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_stat" ADD CONSTRAINT "user_stat_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "info_hash_idx" ON "torrents" USING btree ("info_hash");--> statement-breakpoint
CREATE INDEX "uploader_idx" ON "torrents" USING btree ("uploader_id");