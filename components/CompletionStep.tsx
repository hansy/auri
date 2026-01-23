
import React from 'react';
import { Calendar, CheckCircle } from 'lucide-react';

interface CompletionStepProps {
  onRestart: () => void;
}

const CompletionStep: React.FC<CompletionStepProps> = ({ onRestart }) => {
  return (
    <div className="text-center space-y-12 animate-in zoom-in duration-1000">
      <div className="relative inline-block">
        <div className="absolute inset-0 bg-green-500/10 blur-3xl rounded-full animate-pulse" />
        <CheckCircle className="w-24 h-24 text-stone-900 relative z-10 mx-auto" />
      </div>

      <div className="space-y-4">
        <h2 className="text-4xl md:text-5xl font-semibold text-stone-900 serif">Nice work.</h2>
        <p className="text-lg text-stone-500 leading-relaxed max-w-sm mx-auto">
          You've completed your daily ritual. Your progress has been saved silently.
        </p>
      </div>

      <div className="p-8 bg-stone-100/50 rounded-3xl border border-stone-200 max-w-sm mx-auto flex items-center gap-6">
        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-stone-400">
          <Calendar className="w-6 h-6" />
        </div>
        <div className="text-left">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Next Lesson</p>
          <p className="text-lg font-medium text-stone-800">Available tomorrow</p>
        </div>
      </div>

      <div className="pt-8">
        <button
          onClick={onRestart}
          className="text-stone-400 hover:text-stone-900 font-medium transition-colors underline underline-offset-8 decoration-stone-200 hover:decoration-stone-900"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default CompletionStep;
