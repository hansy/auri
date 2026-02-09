ALTER TABLE "lessons" ALTER COLUMN "sent_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "lessons" ALTER COLUMN "sent_at" DROP NOT NULL;