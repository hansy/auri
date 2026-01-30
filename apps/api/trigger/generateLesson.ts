import { task } from "@trigger.dev/sdk/v3";
import { db } from "../db/index";
import { users, lessons } from "../db/schema";
import { eq } from "drizzle-orm";
import { generateLessonJson } from "../services/gemini";
import { textToSpeech } from "../services/elevenlabs";
import { sendEmail } from "../services/resend";
import { DOMAINS } from "@dictation/shared";


export const generateLessonTask = task({
    id: "generate-daily-lesson",
    run: async (payload: { userId: string }) => {
        const { userId } = payload;

        const [user] = await db.select().from(users).where(eq(users.id, userId));
        if (!user) {
            throw new Error(`User ${userId} not found`);
        }

        const domain = DOMAINS[user.domainIndex % DOMAINS.length];

        const lessonJson = await generateLessonJson(user.targetLanguage as any, user.level as any, domain as any);
        const audioContent = await textToSpeech(lessonJson.dictation.script);

        // Note: In a real app, you'd upload audioContent to an S3 bucket and get a URL.
        // For now, we'll just save the JSON content.

        await db.insert(lessons).values({
            userId: user.id,
            contentJson: lessonJson,
        });

        const lessonUrl = `${process.env.FRONTEND_URL}/lesson/${userId}`;
        await sendEmail(
            user.email,
            `Today's Lesson: ${lessonJson.dictation.title}`,
            `<p>Your lesson is ready! Click here to start: <a href="${lessonUrl}">${lessonUrl}</a></p>`
        );

        return { success: true };
    },
});
