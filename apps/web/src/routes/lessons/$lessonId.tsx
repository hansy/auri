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
    head: ({ loaderData }) => ({
        meta: [
            {
                title: `${loaderData?.lesson?.json?.title || 'Daily Lesson'} - auri`,
            },
            {
                name: 'description',
                content: `Daily immersion lesson: ${loaderData?.lesson?.json?.title}. Practice ${loaderData?.lesson?.language} at ${loaderData?.lesson?.json?.level} level.`,
            },
            {
                property: 'og:title',
                content: `${loaderData?.lesson?.json?.title || 'Daily Lesson'} - auri`,
            },
            {
                property: 'og:description',
                content: `Daily immersion lesson: ${loaderData?.lesson?.json?.title}. Practice ${loaderData?.lesson?.language} at ${loaderData?.lesson?.json?.level} level.`,
            },
        ],
    }),
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
