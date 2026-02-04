import React from 'react';
import { PenTool, Mic2, BookCheck } from 'lucide-react';

const Methodology: React.FC = () => {
    return (
        <div className="space-y-16 border-t border-stone-200 pt-24">
            <div className="text-center space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-stone-400">The Methodology</h3>
                <h4 className="text-3xl font-semibold text-stone-900 serif">How it works</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
                <div className="space-y-6 text-center md:text-left">
                    <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-900 mx-auto md:mx-0">
                        <PenTool className="w-6 h-6" />
                    </div>
                    <div className="space-y-3">
                        <h5 className="font-semibold text-xl text-stone-800">1. Listen & Transcribe</h5>
                        <p className="text-stone-500 text-sm leading-relaxed">
                            Receive a daily story at your level. Listen and write it down by hand to bridge the gap between sound and meaning.
                        </p>
                    </div>
                </div>

                <div className="space-y-6 text-center md:text-left">
                    <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-900 mx-auto md:mx-0">
                        <Mic2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-3">
                        <h5 className="font-semibold text-xl text-stone-800">2. Oral Discussion</h5>
                        <p className="text-stone-500 text-sm leading-relaxed">
                            Engage in a spoken Q&A with our AI examiner to reinforce vocabulary and improve your active production.
                        </p>
                    </div>
                </div>

                <div className="space-y-6 text-center md:text-left">
                    <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-900 mx-auto md:mx-0">
                        <BookCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-3">
                        <h5 className="font-semibold text-xl text-stone-800">3. Review & Adjust</h5>
                        <p className="text-stone-500 text-sm leading-relaxed">
                            Compare your notes to the transcript. Provide feedback to ensure tomorrow's lesson is perfectly tuned to your progress.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Methodology;
