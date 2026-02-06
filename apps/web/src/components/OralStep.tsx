
import React, { useState, useEffect, useRef } from 'react';
import { LessonContent } from '@auri/shared/types';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { SYSTEM_PROMPTS } from '@auri/shared/constants';
import { encodePCM, decodePCM, decodeAudioData } from '../services/gemini';
import { Mic, MicOff, ArrowRight, Loader2 } from 'lucide-react';

interface OralStepProps {
    lesson: LessonContent;
    onComplete: () => void;
}

const OralStep: React.FC<OralStepProps> = ({ lesson, onComplete }) => {
    const [isActive, setIsActive] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const outAudioContextRef = useRef<AudioContext | null>(null);
    const sessionRef = useRef<any>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const startSession = async () => {
        setIsConnecting(true);
        try {
            // Use process.env.API_KEY or the Vite equivalent
            const apiKey = process.env.API_KEY || (import.meta as any).env.VITE_GEMINI_API_KEY;
            const ai = new GoogleGenAI({ apiKey });

            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            const inCtx = new AudioContextClass({ sampleRate: 16000 });
            const outCtx = new AudioContextClass({ sampleRate: 24000 });
            audioContextRef.current = inCtx;
            outAudioContextRef.current = outCtx;

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const questionsStr = lesson.json.questions.script.map(q => q.question).join(', ');

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.0-flash',
                config: {
                    // Remove invalid responseMimeType from here, it should be in generationConfig if anywhere
                    // but usually it's inferred by responseModalities
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                    },
                    systemInstruction: SYSTEM_PROMPTS.LIVE_EXAMINER
                        .replace('{story}', lesson.json.dictation.script)
                        .replace('{questions}', questionsStr)
                        .replace('{level}', lesson.json.storySpec.level)
                        .replace('{language}', lesson.language),
                    outputAudioTranscription: {},
                    inputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        setIsConnecting(false);
                        setIsActive(true);

                        const source = inCtx.createMediaStreamSource(stream);
                        const scriptProcessor = inCtx.createScriptProcessor(4096, 1, 1);

                        scriptProcessor.onaudioprocess = (e: any) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            const l = inputData.length;
                            const int16 = new Int16Array(l);
                            for (let i = 0; i < l; i++) {
                                int16[i] = inputData[i] * 32768;
                            }
                            const pcmBlob = {
                                data: encodePCM(new Uint8Array(int16.buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                        };

                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inCtx.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        const parts = message.serverContent?.modelTurn?.parts;
                        const base64Audio = parts?.[0]?.inlineData?.data;
                        if (base64Audio && outCtx) {
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
                            const buffer = await decodeAudioData(decodePCM(base64Audio), outCtx, 24000, 1);
                            const source = outCtx.createBufferSource();
                            source.buffer = buffer;
                            source.connect(outCtx.destination);
                            source.onended = () => sourcesRef.current.delete(source);
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += buffer.duration;
                            sourcesRef.current.add(source);
                        }

                        if (message.serverContent?.interrupted) {
                            sourcesRef.current.forEach(s => s.stop());
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e) => {
                        console.error("Live Error", e);
                        setIsConnecting(false);
                        setIsActive(false);
                    },
                    onclose: () => {
                        setIsActive(false);
                    }
                }
            });

            sessionRef.current = await sessionPromise;
        } catch (err) {
            console.error(err);
            setIsConnecting(false);
        }
    };

    const stopSession = () => {
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }
        audioContextRef.current?.close();
        outAudioContextRef.current?.close();
        setIsActive(false);
    };

    useEffect(() => {
        return () => stopSession();
    }, []);

    return (
        <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-500">
            <div className="space-y-4">
                <h2 className="text-3xl font-semibold text-stone-900">Step 2: Oral Conversation</h2>
                <p className="text-stone-500 leading-relaxed">
                    The AI examiner will now lead a discussion. Answer naturally out loud.
                    Targeting CEFR {lesson.json.storySpec.level} competency.
                </p>
            </div>

            <div className="relative flex flex-col items-center justify-center space-y-8 py-20 bg-stone-900 rounded-[3rem] shadow-2xl overflow-hidden">
                {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-64 h-64 bg-stone-700/20 rounded-full animate-ping" />
                    </div>
                )}

                <div className="z-10 flex flex-col items-center gap-6">
                    {!isActive && !isConnecting ? (
                        <button
                            onClick={startSession}
                            type="button"
                            className="w-24 h-24 bg-stone-100 text-stone-900 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-xl active:scale-95"
                        >
                            <Mic className="w-10 h-10" />
                        </button>
                    ) : isConnecting ? (
                        <div className="w-24 h-24 bg-stone-800 rounded-full flex items-center justify-center">
                            <Loader2 className="w-10 h-10 text-stone-500 animate-spin" />
                        </div>
                    ) : (
                        <button
                            onClick={stopSession}
                            type="button"
                            className="w-24 h-24 bg-red-500 text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-xl active:scale-95 animate-pulse"
                        >
                            <MicOff className="w-10 h-10" />
                        </button>
                    )}

                    <p className="text-stone-400 font-medium tracking-wide uppercase text-xs">
                        {isConnecting ? "Connecting to AI..." : isActive ? "Conversation Active" : "Click to Start Speaking"}
                    </p>
                </div>
            </div>

            <div className="pt-8 flex flex-col gap-4">
                <button
                    onClick={onComplete}
                    className="w-full py-5 bg-stone-900 text-white rounded-2xl font-semibold hover:bg-stone-800 transition-all flex items-center justify-center gap-2 group"
                >
                    <span>Review Today's Story</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default OralStep;
