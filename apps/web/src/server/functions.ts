import { createServerFn } from "@tanstack/react-start";
import { db } from "./db";
import { users, emailConfirmations } from "./db/schema";
import { eq } from "drizzle-orm";
import { tasks } from "@trigger.dev/sdk/v3";
import { confirmEmailTask } from "./trigger/confirmEmail";
import { generateLessonTask } from "./trigger/generateLesson";

export const subscribeFn = createServerFn({ method: "POST" })
    .handler(async (ctx: any) => {
        const { email, language, level } = ctx.data as { email: string; language: string; level: any };

        try {
            // 1. Create or update user
            const [user] = await db.insert(users).values({
                email,
                targetLanguage: language,
                level,
                isConfirmed: false,
            }).onConflictDoUpdate({
                target: users.email,
                set: { targetLanguage: language, level: level }
            }).returning();

            // 2. Generate confirmation token
            const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);

            await db.insert(emailConfirmations).values({
                userId: user.id,
                token,
                expiresAt,
            });

            // 3. Trigger confirmation email task
            await tasks.trigger<typeof confirmEmailTask>("send-confirmation-email", {
                email,
                token,
            });

            return { success: true, message: 'Check your inbox for confirmation' };
        } catch (e) {
            return { success: false, error: (e as Error).message };
        }
    });

export const confirmFn = createServerFn({ method: "GET" })
    .handler(async (ctx: any) => {
        const { token } = ctx.data as { token: string };

        try {
            const [confirmation] = await db.select()
                .from(emailConfirmations)
                .where(eq(emailConfirmations.token, token));

            if (!confirmation || confirmation.expiresAt < new Date()) {
                return { success: false, error: 'Invalid or expired token' };
            }

            // Confirm user
            await db.update(users)
                .set({ isConfirmed: true })
                .where(eq(users.id, confirmation.userId));

            // Cleanup token
            await db.delete(emailConfirmations).where(eq(emailConfirmations.id, confirmation.id));

            // Trigger welcome lesson generation
            await tasks.trigger<typeof generateLessonTask>("generate-daily-lesson", {
                userId: confirmation.userId,
            });

            return { success: true, message: 'Email confirmed! Your first lesson is being prepared.' };
        } catch (e) {
            return { success: false, error: (e as Error).message };
        }
    });
