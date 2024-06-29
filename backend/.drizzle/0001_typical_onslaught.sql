ALTER TABLE "user_dojos" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_dojos" ALTER COLUMN "dojo_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_dojos" ALTER COLUMN "role" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;