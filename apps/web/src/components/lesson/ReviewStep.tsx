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
                    {(() => {
                        const processedSegments: { speaker_id: string; text: string }[] = [];
                        let currentSegment: { speaker_id: string; text: string } | null = null;

                        lessonContent?.segments?.forEach((segment) => {
                            // Strip emotion tags like [cheerfully]
                            const cleanText = segment.text.replace(/\[.*?\]/g, '').trim();
                            if (!cleanText) return;

                            if (currentSegment && currentSegment.speaker_id === segment.speaker_id) {
                                currentSegment.text += ' ' + cleanText;
                            } else {
                                if (currentSegment) {
                                    processedSegments.push(currentSegment);
                                }
                                currentSegment = { ...segment, text: cleanText };
                            }
                        });


                        if (currentSegment) {
                            processedSegments.push(currentSegment);
                        }

                        if (processedSegments.length === 0) {
                            return (
                                <p className="text-muted-foreground italic">No content available for review.</p>
                            );
                        }

                        return processedSegments.map((segment, index) => (
                            <p key={index} className="leading-relaxed">
                                {segment.text}
                            </p>
                        ));
                    })()}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="w-full bg-card p-8 rounded-xl shadow-sm border space-y-6"
            >
                <h3 className="text-xl font-semibold">Questions Asked</h3>
                <div className="space-y-4">
                    {lessonContent?.questions?.map((question, index) => (
                        <div key={question.id || index} className="p-4 bg-muted/50 rounded-lg">
                            <p className="font-medium text-lg">{question.text}</p>
                        </div>
                    ))}
                    {!lessonContent?.questions?.length && (
                        <p className="text-muted-foreground italic">No questions available for review.</p>
                    )}
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
