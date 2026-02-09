import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LessonContent } from '@auri/shared/types';
import { DictationStep } from './DictationStep';
import { ComprehensionStep } from './ComprehensionStep';
import { ReviewStep } from './ReviewStep';
import { FeedbackStep } from './FeedbackStep';
import { useNavigate } from '@tanstack/react-router';

interface LessonWizardProps {
    lesson: LessonContent;
}

enum WizardStep {
    DICTATION = 0,
    COMPREHENSION = 1,
    REVIEW = 2,
    FEEDBACK = 3,
}

export function LessonWizard({ lesson }: LessonWizardProps) {
    const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.DICTATION);
    const navigate = useNavigate();

    const nextStep = () => {
        setCurrentStep((prev) => Math.min(prev + 1, WizardStep.FEEDBACK));
    };

    const handleComplete = () => {
        // Navigate back to dashboard or home
        navigate({ to: '/' });
    };

    const steps = [
        {
            component: <DictationStep audioUrl={lesson.audioUrl} onNext={nextStep} />,
            key: 'dictation',
        },
        {
            component: <ComprehensionStep lesson={lesson} onNext={nextStep} />,
            key: 'comprehension',
        },
        {
            component: <ReviewStep lessonContent={lesson.json} onNext={nextStep} />,
            key: 'review',
        },
        {
            component: <FeedbackStep lessonId={lesson.id} onComplete={handleComplete} />,
            key: 'feedback',
        },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground p-6 md:p-12 flex flex-col">
            {/* Progress Bar */}
            <div className="w-full max-w-3xl mx-auto mb-12 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            <div className="flex-1 w-full max-w-4xl mx-auto relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={steps[currentStep].key}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                    >
                        {steps[currentStep].component}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
