DO $$ BEGIN
 CREATE TYPE "public"."user_dojo_role" AS ENUM('student', 'teacher');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dojos" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"master" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_dojos" (
	"user_id" integer,
	"dojo_id" integer,
	"role" "user_dojo_role",
	CONSTRAINT "user_dojos_pk" PRIMARY KEY("user_id","dojo_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dojos" ADD CONSTRAINT "dojos_master_users_id_fk" FOREIGN KEY ("master") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "email_unique_index" ON "users" USING btree (lower("email"));