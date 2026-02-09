import { createFileRoute, notFound } from '@tanstack/react-router';
import { getLessonFn } from '@/server/functions/lessons';
import { LessonWizard } from '@/components/lesson/LessonWizard';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/lessons/$lessonId')({
    loader: async ({ params }) => {
        const result = await getLessonFn({ data: { lessonId: params.lessonId } });
        if (!result.success || !result.lesson) {
            throw notFound();
        }
        return { lesson: result.lesson };
    },
    component: LessonPage,
    pendingComponent: () => (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
    ),
    errorComponent: () => (
        <div className="flex items-center justify-center min-h-screen text-destructive">
            Failed to load lesson. Please try again.
        </div>
    ),
});

function LessonPage() {
    const { lesson } = Route.useLoaderData();
    return <LessonWizard lesson={lesson as any} />;
}
