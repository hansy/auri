import { schedules } from "@trigger.dev/sdk/v3";
import { generateLessonTask } from "./generateLesson";
import { UserService } from "../services/users";

export const dailyLessonCron = schedules.task({
    id: "daily-lesson-cron",
    cron: "0 0 * * *", // Run at UTC midnight
    run: async () => {
        const users = await UserService.getConfirmedUsers();

        console.log(`Starting daily lesson generation for ${users.length} users.`);

        for (const user of users) {
            await generateLessonTask.trigger({
                userId: user.id,
                isWelcome: false
            });
        }

        return {
            success: true,
            triggeredCount: users.length
        };
    },
});
