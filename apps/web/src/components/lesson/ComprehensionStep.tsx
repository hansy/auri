import { useState, useCallback, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import { getConversationTokenFn } from '@/server/functions/lessons';
import { Button } from '@/components/ui/button';
import { Mic, Square, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { LessonJSON } from '@auri/shared/types';
import { useServerFn } from '@tanstack/react-start';
import { useQuery } from '@tanstack/react-query';

interface ComprehensionStepProps {
    lesson: {
        contentJson: LessonJSON;
        language: string;
        proficiencyLevelGuideline: string;
    };
    onNext: () => void;
}

export function ComprehensionStep({ lesson, onNext }: ComprehensionStepProps) {
    const [error, setError] = useState<string | null>(null);

    const conversation = useConversation({
        onConnect: () => console.log('Connected to ElevenLabs'),
        onDisconnect: (details) => console.log('Disconnected from ElevenLabs:', JSON.stringify(details, null, 2)),
        onMessage: (message: any) => console.log('Message:', message),
        onError: (error: any) => console.error('Error:', error),
    });

    const { status, isSpeaking } = conversation;

    const getConversationToken = useServerFn(getConversationTokenFn);

    const { data } = useQuery({
        queryKey: ['conversation-token'],
        queryFn: () => getConversationToken(),
    })

    // useEffect(() => {
    //     const getMicPermission = async () => {
    //         await navigator.mediaDevices.getUserMedia({ audio: true });
    //     }
    //     getMicPermission();
    // }, [])

    const startConversation = useCallback(async () => {
        console.log(data)
        if (!data?.success) return;

        const { contentJson, language, proficiencyLevelGuideline } = lesson;
        const voiceId = contentJson.speakers?.[0]?.voiceId;
        console.log(voiceId)
        const story = contentJson.segments.map(seg => seg.text).join('\n');
        const questions = JSON.stringify(contentJson.questions);

        try {
            console.log('Starting conversation...')
            console.log('gettin permission')
            await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('got permission')
            console.log(data.token)
            await conversation.startSession({
                signedUrl: data.token,
                overrides: {
                    agent: {
                        language: language as any,
                    },
                    tts: {
                        voiceId: voiceId,
                    }
                },
                dynamicVariables: {
                    proficiencyLevelGuideline,
                    story,
                    questions,
                },
            });
        } catch (err) {
            console.error('Failed to start session:', err);
            setError('Failed to start conversation session');
        }
    }, [data, lesson, conversation]);

    const stopConversation = useCallback(async () => {
        await conversation.endSession();
    }, [conversation]);

    return (
        <div className="flex flex-col items-center justify-center space-y-8 text-center max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
            >
                <h2 className="text-3xl font-bold tracking-tight">Comprehension Check</h2>
                <p className="text-lg text-muted-foreground">
                    Let's discuss the story you just heard. I'll ask you a few questions.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex flex-col items-center space-y-6"
            >
                {/* Status Indicator */}
                <div className={`relative flex items-center justify-center w-32 h-32 rounded-full border-4 transition-colors duration-300 ${status === 'connected' ? (isSpeaking ? 'border-primary bg-primary/10' : 'border-green-500 bg-green-50') : 'border-muted bg-muted/20'}`}>
                    {status === 'connecting' ? (
                        <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
                    ) : status === 'connected' ? (
                        isSpeaking ? (
                            <div className="flex space-x-1 items-center h-8">
                                {[1, 2, 3, 4].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="w-1 bg-primary"
                                        animate={{ height: [10, 24, 10] }}
                                        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <Mic className="w-12 h-12 text-green-600 animate-pulse" />
                        )
                    ) : (
                        <Mic className="w-12 h-12 text-muted-foreground" />
                    )}
                </div>

                <div className="space-y-2">
                    <p className="font-medium text-lg">
                        {status === 'connected' ? (isSpeaking ? 'Agent is speaking...' : 'Listening...') : 'Ready to start'}
                    </p>
                    {error && <p className="text-destructive text-sm">{error}</p>}
                </div>

                <div className="flex gap-4">
                    {status === 'connected' ? (
                        <Button variant="destructive" size="lg" onClick={stopConversation}>
                            <Square className="mr-2 h-5 w-5" />
                            End Conversation
                        </Button>
                    ) : (
                        <Button disabled={!data?.success} onClick={startConversation} size="lg" className="min-w-[200px]">
                            {data?.success ? 'Start QA Session' : <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {!data?.success && 'Loading...'}
                        </Button>
                    )}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                <Button variant="ghost" onClick={onNext} className="mt-8">
                    Skip / Continue to Review
                </Button>
            </motion.div>
        </div>
    );
}
