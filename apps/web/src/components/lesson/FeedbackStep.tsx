import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { submitFeedbackFn } from '@/server/functions/lessons';
import { Loader2, CheckCircle } from 'lucide-react';

interface FeedbackStepProps {
    lessonId: string;
    onComplete: () => void;
}

export function FeedbackStep({ lessonId, onComplete }: FeedbackStepProps) {
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await submitFeedbackFn({ data: { lessonId, feedback } });
            setIsSuccess(true);
            setTimeout(() => {
                onComplete();
            }, 1500);
        } catch (error) {
            console.error('Failed to submit feedback:', error); // Handle error visually if needed
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex flex-col items-center justify-center space-y-6 py-20">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-green-500"
                >
                    <CheckCircle className="w-24 h-24" />
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-3xl font-bold"
                >
                    Lesson Completed!
                </motion.h2>
                <p className="text-muted-foreground">Great job today.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center space-y-8 max-w-2xl mx-auto w-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-2"
            >
                <h2 className="text-3xl font-bold tracking-tight">Feedback</h2>
                <p className="text-muted-foreground">
                    How was this lesson? Any thoughts on the difficulty or content? (Optional)
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full space-y-4"
            >
                <Textarea
                    placeholder="Type your feedback here..."
                    className="min-h-[150px] text-lg resize-none"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                />

                <div className="flex justify-end gap-4">
                    <Button variant="ghost" onClick={onComplete} disabled={isSubmitting}>
                        Skip
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} size="lg">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit & Finish
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
