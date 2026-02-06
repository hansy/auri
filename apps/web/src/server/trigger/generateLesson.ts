import { task } from "@trigger.dev/sdk/v3";
// import { db } from "../db/index";
// import { users, lessons } from "../db/schema";
// import { eq } from "drizzle-orm";
// import { generateLessonJson } from "../services/gemini";
// import { textToSpeech } from "../services/elevenlabs";
// import { DOMAINS } from "@dictation/shared";


export const generateLessonTask = task({
    id: "generate-daily-lesson",
    run: async (_payload: { userId: string }) => {
        // const { userId } = payload;

        // const [user] = await db.select().from(users).where(eq(users.id, userId));
        // if (!user) {
        //     throw new Error(`User ${userId} not found`);
        // }

        // const domain = DOMAINS[user.domainIndex % DOMAINS.length];

        // const lessonJson = await generateLessonJson(user.targetLanguage as any, user.level as any, domain as any);
        // const audioContent = await textToSpeech(lessonJson.dictation.script);

        // // Note: In a real app, you'd upload audioContent to an S3 bucket and get a URL.
        // // For now, we'll just save the JSON content.

        // await db.insert(lessons).values({
        //     userId: user.id,
        //     contentJson: lessonJson,
        // });

        // const lessonUrl = `${process.env.FRONTEND_URL}/lesson/${userId}`;
        // const { sendEmailTask } = await import("./sendEmail");
        // await sendEmailTask.trigger({
        //     to: user.email,
        //     templaate: "DailyLessonEmail",
        //     props: { title: lessonJson.dictation.title, lessonUrl },
        // });


        return { success: true };
    },
});
