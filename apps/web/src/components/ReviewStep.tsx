
import React from 'react';
import { LessonContent } from '@dictation/shared/types';
import { BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';

interface ReviewStepProps {
    lesson: LessonContent;
    onComplete: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ lesson, onComplete }) => {
    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="space-y-2 text-center md:text-left">
                <h2 className="text-3xl font-semibold text-stone-900 serif">{lesson.json.dictation.title}</h2>
                <p className="text-stone-500">Domain: {lesson.json.storySpec.domain} • Level: {lesson.json.storySpec.level}</p>
            </div>

            <div className="space-y-8">
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-stone-400">
                        <BookOpen className="w-4 h-4" />
                        <h3 className="text-xs font-bold uppercase tracking-widest">Story Transcript</h3>
                    </div>
                    <div className="p-8 bg-white border border-stone-200 rounded-3xl shadow-sm leading-relaxed text-lg serif text-stone-800 italic">
                        {lesson.json.reviewTranscript.story}
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-stone-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <h3 className="text-xs font-bold uppercase tracking-widest">Review Questions</h3>
                    </div>
                    <ul className="space-y-3">
                        {lesson.json.reviewTranscript.questions.map((q, i) => (
                            <li key={i} className="flex gap-4 p-5 bg-stone-100/50 rounded-2xl border border-stone-200 text-stone-700">
                                <span className="font-bold text-stone-300">Q{i + 1}</span>
                                <span>{q}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            <div className="pt-8">
                <button
                    onClick={onComplete}
                    className="w-full py-5 bg-stone-900 text-white rounded-2xl font-semibold hover:bg-stone-800 transition-all flex items-center justify-center gap-2 group"
                >
                    <span>Complete Reflection</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default ReviewStep;
