
import React, { useRef, useState, useEffect } from 'react';
import { LessonContent } from '@dictation/shared/types';
import { Play, Pause, RotateCcw, Check, Info } from 'lucide-react';
import { decodePCM, decodeAudioData } from '../services/gemini';

interface DictationStepProps {
    lesson: LessonContent;
    onComplete: () => void;
}

const DictationStep: React.FC<DictationStepProps> = ({ lesson, onComplete }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const audioBufferRef = useRef<AudioBuffer | null>(null);
    const startTimeRef = useRef<number>(0);
    const pausedAtRef = useRef<number>(0);

    useEffect(() => {
        const initAudio = async () => {
            if (!lesson.audioBase64) return;

            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass({ sampleRate: 24000 });
            audioContextRef.current = ctx;

            const pcmData = decodePCM(lesson.audioBase64);
            const buffer = await decodeAudioData(pcmData, ctx, 24000, 1);
            audioBufferRef.current = buffer;
        };

        initAudio();
        return () => {
            stopAudio();
            audioContextRef.current?.close();
        };
    }, [lesson.audioBase64]);

    const playAudio = () => {
        if (!audioContextRef.current || !audioBufferRef.current) return;

        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }

        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBufferRef.current;
        source.connect(audioContextRef.current.destination);

        source.onended = () => {
            setIsPlaying(false);
            pausedAtRef.current = 0;
        };

        const offset = pausedAtRef.current;
        source.start(0, offset);
        startTimeRef.current = audioContextRef.current.currentTime - offset;
        sourceNodeRef.current = source;
        setIsPlaying(true);
    };

    const stopAudio = () => {
        if (sourceNodeRef.current) {
            try {
                sourceNodeRef.current.stop();
                if (audioContextRef.current) {
                    pausedAtRef.current = audioContextRef.current.currentTime - startTimeRef.current;
                }
            } catch (e) { }
            sourceNodeRef.current = null;
        }
        setIsPlaying(false);
    };

    const togglePlayback = () => {
        if (isPlaying) {
            stopAudio();
        } else {
            playAudio();
        }
    };

    const restartAudio = () => {
        stopAudio();
        pausedAtRef.current = 0;
        playAudio();
    };

    return (
        <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-500">
            <div className="space-y-4">
                <h2 className="text-3xl font-semibold text-stone-900">Step 1: Listen & Write</h2>
                <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-blue-800">
                    <Info className="w-5 h-5 mt-1 shrink-0" />
                    <p className="text-sm leading-relaxed">
                        Listen carefully. Write down what you hear using <strong>pen and paper</strong>.
                        You may replay the audio as many times as you like. No transcript is provided yet.
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-8 py-12 bg-stone-100/30 rounded-3xl border border-stone-200 border-dashed">
                <div className="relative group">
                    <div className={`absolute -inset-4 bg-stone-900/5 rounded-full blur-xl transition-all duration-700 ${isPlaying ? 'scale-150 opacity-100' : 'scale-100 opacity-0'}`} />
                    <button
                        onClick={togglePlayback}
                        className="relative w-24 h-24 bg-stone-900 text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-xl active:scale-95"
                    >
                        {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
                    </button>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={restartAudio}
                        className="p-3 text-stone-400 hover:text-stone-900 transition-colors flex flex-col items-center gap-1"
                    >
                        <RotateCcw className="w-5 h-5" />
                        <span className="text-[10px] font-bold tracking-widest uppercase">Restart</span>
                    </button>
                </div>
            </div>

            <div className="pt-8">
                <button
                    onClick={onComplete}
                    className="w-full py-5 bg-white border-2 border-stone-200 rounded-2xl font-semibold text-stone-900 hover:border-stone-900 transition-all flex items-center justify-center gap-2 group"
                >
                    <span>I've finished writing</span>
                    <Check className="w-5 h-5 text-stone-400 group-hover:text-stone-900 transition-colors" />
                </button>
            </div>
        </div>
    );
};

export default DictationStep;
