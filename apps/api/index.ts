import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { db } from './db';
import { users, emailConfirmations } from './db/schema';
import { eq } from 'drizzle-orm';
import { Language, CEFR } from '@dictation/shared';

const app = new Elysia()
    .use(cors())
    .post('/api/subscribe', async ({ body, set }) => {
        const { email, language, level } = body as { email: string; language: string; level: any };



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
            const { tasks } = await import("@trigger.dev/sdk/v3");
            const { confirmEmailTask } = await import("./trigger/confirmEmail");
            await tasks.trigger<typeof confirmEmailTask>("send-confirmation-email", {
                email,
                token,
            });

            return { success: true, message: 'Check your inbox for confirmation' };
        } catch (e) {
            set.status = 500;
            return { success: false, error: (e as Error).message };
        }
    }, {
        body: t.Object({
            email: t.String({ format: 'email' }),
            language: t.String(),
            level: t.String(),
        })
    })
    .get('/api/confirm', async ({ query, set }) => {
        const { token } = query;

        try {
            const [confirmation] = await db.select()
                .from(emailConfirmations)
                .where(eq(emailConfirmations.token, token as string));

            if (!confirmation || confirmation.expiresAt < new Date()) {
                set.status = 400;
                return { success: false, error: 'Invalid or expired token' };
            }

            // Confirm user
            await db.update(users)
                .set({ isConfirmed: true })
                .where(eq(users.id, confirmation.userId));

            // Cleanup token
            await db.delete(emailConfirmations).where(eq(emailConfirmations.id, confirmation.id));

            // Trigger welcome lesson generation
            const { tasks } = await import("@trigger.dev/sdk/v3");
            const { generateLessonTask } = await import("./trigger/generateLesson");
            await tasks.trigger<typeof generateLessonTask>("generate-daily-lesson", {
                userId: confirmation.userId,
            });


            // Redirect to a thank you page or return success
            return { success: true, message: 'Email confirmed! Your first lesson is being prepared.' };
        } catch (e) {
            set.status = 500;
            return { success: false, error: (e as Error).message };
        }
    })
    .listen(3001);

console.log(`Server is running at ${app.server?.hostname}:${app.server?.port}`);
