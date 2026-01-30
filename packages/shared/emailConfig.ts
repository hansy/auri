export const EMAIL_CONFIG = {
    subjects: {
        ConfirmEmail: "Confirm your Dictation subscription",
        DailyLessonEmail: (title: string) => `Today's Lesson: ${title}`,
    },
    from: "Dictation App <lessons@dictation-app.com>",
} as const;
