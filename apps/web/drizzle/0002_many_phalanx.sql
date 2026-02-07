ALTER TYPE "public"."cefr_level" RENAME TO "proficiency_level";--> statement-breakpoint
ALTER TYPE "public"."proficiency_level" ADD VALUE 'A0' BEFORE 'A2';--> statement-breakpoint
ALTER TYPE "public"."proficiency_level" ADD VALUE 'A1' BEFORE 'A2';--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "level" TO "proficiency_level";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "native_language" text DEFAULT 'English (USA)' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "language_variant";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "domain_index";