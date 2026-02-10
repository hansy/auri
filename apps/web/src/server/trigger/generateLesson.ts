import { task } from "@trigger.dev/sdk/v3";
import { generateStoryTextJob } from "./generateStoryText";
import { generateStoryAudioJob } from "./generateStoryAudio";
import { sendEmailTask } from "./sendEmail";
import { UserService } from "../services/users";
import { LessonService } from "../services/lessons";

export const generateLessonTask = task({
    id: "generate-daily-lesson",
    run: async (payload: { userId: string, isWelcome?: boolean }) => {
        const { userId, isWelcome } = payload;

        // 1. Get User
        const user = await UserService.getUserById(userId);
        if (!user) {
            throw new Error(`User ${userId} not found`);
        }

        // 2. Generate Story Text
        const textResult = await generateStoryTextJob.triggerAndWait({ userId });

        if (!textResult.ok) {
            throw new Error(`Failed to generate story text: ${textResult.error}`);
        }

        const { storyId } = textResult.output;

        // 3. Generate Audio
        const audioResult = await generateStoryAudioJob.triggerAndWait({ lessonId: storyId });

        if (!audioResult.ok) {
            throw new Error(`Failed to generate story audio: ${audioResult.error}`);
        }

        // 4. Send Email
        // We need to fetch the lesson again or just pass the title if we have it. 
        // generateStoryTextJob returns storyId, but not title.
        // Let's fetch the lesson to get the title.
        const lesson = await LessonService.getLessonById(storyId);
        if (!lesson) {
            throw new Error(`Lesson ${storyId} not found after generation`);
        }

        const lessonUrl = `${process.env.VITE_HOST}/lessons/${lesson.id}`;

        await sendEmailTask.trigger({
            to: user.email,
            template: "DailyLessonEmail",
            props: {
                title: lesson.title,
                lessonUrl,
                isWelcome
            },
        });

        return { success: true, lessonId: storyId };
    },
});
