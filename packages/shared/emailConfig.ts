export const EMAIL_CONFIG = {
    subjects: {
        ConfirmEmail: "Confirm your auri subscription",
        DailyLessonEmail: (title: string) => `Today's auri Lesson: ${title}`,
    },
    from: "auri <lessons@hearauri.com>",
} as const;
