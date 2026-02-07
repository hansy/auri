import { createServerFn } from "@tanstack/react-start";
import { tasks } from "@trigger.dev/sdk/v3";
import { confirmEmailTask } from "./trigger/confirmEmail";
import { generateLessonTask } from "./trigger/generateLesson";
import { normalizeEmail } from "@auri/shared/validation";
import { UserService } from "./services/users";
import { CEFR } from "@auri/shared/types";
import { db } from "./db";
import { users, emailConfirmations } from "./db/schema";
import { eq } from "drizzle-orm";

export const subscribeFn = createServerFn({ method: "POST" })
    .inputValidator((data: { email: string; language: string; level: string }) => data)
    .handler(async (ctx) => {
        const { email, language, level } = ctx.data;
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail) {
            return { success: false, error: 'Email is required' };
        }

        try {
            const existingUser = await UserService.getByEmail(normalizedEmail);

            let userId: string;
            let token: string;

            if (existingUser) {
                if (existingUser.isConfirmed) {
                    return { success: false, error: 'User is already signed up' };
                }

                userId = existingUser.id;
                await UserService.updatePreferences(userId, language, level as CEFR);

                const activeConfirmation = await UserService.getActiveConfirmation(userId);
                if (activeConfirmation) {
                    token = activeConfirmation.token;
                } else {
                    const newConfirmation = await UserService.createConfirmation(userId);
                    token = newConfirmation.token;
                }
            } else {
                const newUser = await UserService.createUser(normalizedEmail, language, level as CEFR);
                userId = newUser.id;
                const newConfirmation = await UserService.createConfirmation(userId);
                token = newConfirmation.token;
            }

            // 3. Trigger confirmation email task
            await tasks.trigger<typeof confirmEmailTask>("send-confirmation-email", {
                email: normalizedEmail,
                token,
            });

            return { success: true, message: 'Check your inbox for confirmation' };
        } catch (e) {
            console.error('Subscription error:', e);
            return { success: false, error: 'Failed to process subscription. Please try again later.' };
        }
    });

export const getConfirmationDetailsFn = createServerFn({ method: "GET" })
    .inputValidator((data: { token: string }) => data)
    .handler(async (ctx) => {
        const { token } = ctx.data;

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
    .inputValidator((data: { token: string; targetLanguage?: string; languageVariant?: string }) => data)
    .handler(async (ctx) => {
        const { token, targetLanguage, languageVariant } = ctx.data;

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
                    targetLanguage: targetLanguage,
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

export const resendConfirmationFn = createServerFn({ method: "POST" })
    .inputValidator((data: { email: string }) => data)
    .handler(async (ctx) => {
        const { email } = ctx.data;
        const normalizedEmail = normalizeEmail(email);

        if (!normalizedEmail) {
            return { success: false, error: 'Email is required' };
        }

        try {
            const user = await UserService.getByEmail(normalizedEmail);

            if (!user) {
                return { success: false, error: 'Email not found. Please sign up first.' };
            }

            if (user.isConfirmed) {
                return { success: false, error: 'User is already signed up and confirmed.' };
            }

            let token: string;
            const activeConfirmation = await UserService.getActiveConfirmation(user.id);
            if (activeConfirmation) {
                token = activeConfirmation.token;
            } else {
                const newConfirmation = await UserService.createConfirmation(user.id);
                token = newConfirmation.token;
            }

            await tasks.trigger<typeof confirmEmailTask>("send-confirmation-email", {
                email: normalizedEmail,
                token,
            });

            return { success: true, message: 'New confirmation link sent! Check your inbox.' };
        } catch (e) {
            console.error('Resend error:', e);
            return { success: false, error: 'Failed to resend confirmation. Please try again later.' };
        }
    });
