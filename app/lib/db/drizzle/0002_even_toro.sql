ALTER TABLE "page" ALTER COLUMN "discord" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "page" ALTER COLUMN "discord" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "page" ALTER COLUMN "email" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "page" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "page" ALTER COLUMN "slack" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "page" ALTER COLUMN "slack" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "page" ADD COLUMN "webhook" text;