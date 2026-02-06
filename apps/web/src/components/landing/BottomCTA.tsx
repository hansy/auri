import React from 'react';
import { ArrowRight } from 'lucide-react';

interface BottomCTAProps {
    onStart: () => void;
}

const BottomCTA: React.FC<BottomCTAProps> = ({ }) => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="pt-32 pb-32 flex flex-col items-center gap-10 border-t border-stone-200">
            <div className="text-center space-y-6 max-w-xl">
                <h3 className="text-4xl md:text-5xl font-semibold text-stone-900 serif">Train your ear daily</h3>
                <p className="text-lg text-stone-500 leading-relaxed">
                    Consistency is the only shortcut. Spend 15 minutes a day to achieve permanent fluency.
                </p>
            </div>

            <button
                onClick={scrollToTop}
                className="group relative px-12 py-5 bg-stone-900 text-white rounded-2xl font-semibold text-lg hover:bg-stone-800 transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl active:translate-y-0.5"
            >
                <span>Start your first lesson</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
};

export default BottomCTA;
