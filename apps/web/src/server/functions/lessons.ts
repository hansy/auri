import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { lessons, users } from "../db/schema";
import { eq } from "drizzle-orm";
import { getSignedUrl } from "../services/storage";
import { LessonJSON } from "@auri/shared/types";
import { getConversationToken, toISO6391 } from "../services/elevenlabs";

export const getLessonFn = createServerFn({ method: "GET" })
    .inputValidator((data: { lessonId: string }) => data)
    .handler(async (ctx) => {
        const { lessonId } = ctx.data;

        try {
            const [result] = await db.select({
                lesson: lessons,
                targetLanguage: users.targetLanguage,
            })
                .from(lessons)
                .innerJoin(users, eq(lessons.userId, users.id))
                .where(eq(lessons.id, lessonId));

            if (!result) {
                return { success: false, error: 'Lesson not found' };
            }

            const lesson = result.lesson;
            let audioUrl = lesson.audioUrl;

            // If it's a gs:// URL, get a signed URL
            if (audioUrl && audioUrl.startsWith('gs://')) {
                try {
                    const bucketName = process.env.GCS_BUCKET_NAME || 'auri-content';
                    const prefix = `gs://${bucketName}/`;
                    if (audioUrl.startsWith(prefix)) {
                        const filename = audioUrl.slice(prefix.length);
                        audioUrl = await getSignedUrl(filename);
                    }
                } catch (e) {
                    console.error('Error generating signed URL:', e);
                }
            }

            // Read proficiency level guideline from qa/levels/<level>.md
            const fs = await import('fs/promises');
            const path = await import('path');
            const sharedPromptsPath = path.resolve(process.cwd(), '../../packages/shared/prompts');
            const level = lesson.proficiencyLevel.toLowerCase();
            let proficiencyLevelGuideline = '';
            try {
                proficiencyLevelGuideline = await fs.readFile(
                    path.join(sharedPromptsPath, `qa/levels/${level}.md`),
                    'utf-8'
                );
            } catch {
                console.warn(`Could not read QA level instructions for ${level}`);
            }

            return {
                success: true,
                lesson: {
                    ...lesson,
                    contentJson: lesson.contentJson as unknown as LessonJSON,
                    audioUrl,
                    language: toISO6391(result.targetLanguage) ?? 'en',
                    proficiencyLevelGuideline,
                }
            };
        } catch (e) {
            console.error('Get lesson error:', e);
            return { success: false, error: 'Failed to load lesson' };
        }
    });

export const getConversationTokenFn = createServerFn({ method: "POST" })
    .handler(async () => {
        try {
            console.log('Getting conversation token...');
            const token = await getConversationToken();
            console.log(token)
            return { success: true as const, token };
        } catch (e) {
            console.error('Error getting conversation token:', e);
            return { success: false as const, error: 'Failed to start conversation' };
        }
    });

export const submitFeedbackFn = createServerFn({ method: "POST" })
    .inputValidator((data: { lessonId: string; feedback: string }) => data)
    .handler(async (ctx) => {
        const { lessonId, feedback } = ctx.data;

        try {
            await db.update(lessons)
                .set({ feedback })
                .where(eq(lessons.id, lessonId));

            return { success: true };
        } catch (e) {
            console.error('Submit feedback error:', e);
            return { success: false, error: 'Failed to submit feedback' };
        }
    });
