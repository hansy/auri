import { createServerFn } from "@tanstack/react-start";
import { db } from "./db";
import { users, emailConfirmations } from "./db/schema";
import { eq } from "drizzle-orm";
import { tasks } from "@trigger.dev/sdk/v3";
import { confirmEmailTask } from "./trigger/confirmEmail";
import { generateLessonTask } from "./trigger/generateLesson";

export const subscribeFn = createServerFn({ method: "POST" })
    .handler(async (ctx: any) => {
        const { email, language, level } = ctx.data as { email: string; language: string; level: string };

        try {
            // 1. Create or update user
            const [user] = await db.insert(users).values({
                email,
                targetLanguage: language,
                level: level as any,
                isConfirmed: false,
            }).onConflictDoUpdate({
                target: users.email,
                set: { targetLanguage: language, level: level as any, isConfirmed: false } // Reset confirmation if they re-subscribe
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
            console.error('Subscription error:', e);
            return { success: false, error: 'Failed to process subscription. Please try again later.' };
        }
    });

export const getConfirmationDetailsFn = createServerFn({ method: "GET" })
    .handler(async (ctx: any) => {
        const { token } = ctx.data as { token: string };

        try {
            const [confirmation] = await db.select()
                .from(emailConfirmations)
                .where(eq(emailConfirmations.token, token));

            if (!confirmation || confirmation.expiresAt < new Date()) {
                return { success: false, error: 'Invalid or expired token' };
            }

            const [user] = await db.select()
                .from(users)
                .where(eq(users.id, confirmation.userId));

            if (!user) {
                return { success: false, error: 'User not found' };
            }

            return {
                success: true,
                language: user.targetLanguage,
                level: user.level,
            };
        } catch (e) {
            console.error('Confirmation details error:', e);
            return { success: false, error: 'Failed to load details. The link may be invalid.' };
        }
    });

export const confirmFn = createServerFn({ method: "POST" })
    .handler(async (ctx: any) => {
        const { token, languageVariant } = ctx.data as { token: string; languageVariant: string };

        try {
            const [confirmation] = await db.select()
                .from(emailConfirmations)
                .where(eq(emailConfirmations.token, token));

            if (!confirmation || confirmation.expiresAt < new Date()) {
                return { success: false, error: 'Invalid or expired token' };
            }

            // Confirm user and save variant
            await db.update(users)
                .set({
                    isConfirmed: true,
                    languageVariant: languageVariant
                })
                .where(eq(users.id, confirmation.userId));

            // Cleanup token
            await db.delete(emailConfirmations).where(eq(emailConfirmations.id, confirmation.id));

            // Trigger welcome lesson generation
            await tasks.trigger<typeof generateLessonTask>("generate-daily-lesson", {
                userId: confirmation.userId,
            });

            return { success: true, message: 'Email confirmed! Your first lesson is being prepared.' };
        } catch (e) {
            console.error('Confirmation error:', e);
            return { success: false, error: 'Failed to confirm email. Please try again later.' };
        }
    });
