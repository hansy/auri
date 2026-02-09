import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { LessonJSON } from '@auri/shared/types';

interface ReviewStepProps {
    lessonContent: LessonJSON;
    onNext: () => void;
}

export function ReviewStep({ lessonContent, onNext }: ReviewStepProps) {
    return (
        <div className="flex flex-col items-center space-y-8 max-w-3xl mx-auto w-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-2"
            >
                <h2 className="text-3xl font-bold tracking-tight">Review Story</h2>
                <p className="text-muted-foreground">
                    Here is the full text of the story. Compare it with your notes.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-full bg-card p-8 rounded-xl shadow-sm border space-y-6"
            >
                <div className="prose prose-lg dark:prose-invert max-w-none">
                    {lessonContent.segments.map((segment, index) => (
                        <p key={index} className="leading-relaxed">
                            {segment.text}
                        </p>
                    ))}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                <Button onClick={onNext} size="lg">
                    Continue to Feedback
                </Button>
            </motion.div>
        </div>
    );
}
