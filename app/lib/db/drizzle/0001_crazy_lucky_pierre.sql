CREATE TABLE "page" (
	"id" uuid PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"notif" boolean NOT NULL,
	"discord" boolean NOT NULL,
	"email" boolean NOT NULL,
	"slack" boolean NOT NULL,
	"pager_id" uuid NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pager" (
	"id" uuid PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "pager_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "page" ADD CONSTRAINT "page_pager_id_pager_id_fk" FOREIGN KEY ("pager_id") REFERENCES "public"."pager"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pager" ADD CONSTRAINT "pager_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;