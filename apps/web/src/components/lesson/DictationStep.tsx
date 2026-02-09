import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';

interface DictationStepProps {
    audioUrl?: string;
    onNext: () => void;
}

export function DictationStep({ audioUrl, onNext }: DictationStepProps) {
    const audioRef = useRef<HTMLAudioElement>(null);

    return (
        <div className="flex flex-col items-center justify-center space-y-8 text-center max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
            >
                <h2 className="text-3xl font-bold tracking-tight">Dictation Exercise</h2>
                <div className="bg-muted p-6 rounded-lg text-lg">
                    <p className="mb-4">
                        Please take a pen and paper. You will hear a short story.
                    </p>
                    <p className="font-medium">
                        Listen carefully and write down exactly what you hear. Do your best!
                    </p>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-full"
            >
                {audioUrl ? (
                    <audio
                        ref={audioRef}
                        controls
                        src={audioUrl}
                        className="w-full"
                    />
                ) : (
                    <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                        Audio not available
                    </div>
                )}
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <Button onClick={onNext} size="lg" className="mt-8">
                    I'm done writing
                </Button>
            </motion.div>
        </div>
    );
}
