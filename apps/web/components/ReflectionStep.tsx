
import React, { useState } from 'react';
import { ReflectionFeedback } from '../types';
import { Smile, Meh, Frown, Send } from 'lucide-react';

interface ReflectionStepProps {
  onComplete: (feedback: ReflectionFeedback) => void;
}

const ReflectionStep: React.FC<ReflectionStepProps> = ({ onComplete }) => {
  const [selected, setSelected] = useState<'Too easy' | 'About right' | 'Too hard' | null>(null);

  const options: { label: 'Too easy' | 'About right' | 'Too hard', icon: any, color: string }[] = [
    { label: 'Too easy', icon: Smile, color: 'hover:bg-green-50 hover:text-green-600 hover:border-green-200' },
    { label: 'About right', icon: Meh, color: 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200' },
    { label: 'Too hard', icon: Frown, color: 'hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200' },
  ];

  return (
    <div className="space-y-12 animate-in slide-in-from-right-8 duration-500">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-semibold text-stone-900 serif">How did it feel?</h2>
        <p className="text-stone-400">Your feedback helps us adjust tomorrow's lesson difficulty.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = selected === opt.label;
          return (
            <button
              key={opt.label}
              onClick={() => setSelected(opt.label)}
              className={`flex flex-col items-center justify-center gap-4 p-8 rounded-3xl border-2 transition-all ${
                isSelected 
                  ? 'bg-stone-900 border-stone-900 text-white shadow-xl scale-105' 
                  : `bg-white border-stone-100 text-stone-400 ${opt.color}`
              }`}
            >
              <Icon className={`w-12 h-12 ${isSelected ? 'text-white' : ''}`} />
              <span className="font-semibold">{opt.label}</span>
            </button>
          );
        })}
      </div>

      <div className="pt-8">
        <button
          disabled={!selected}
          onClick={() => selected && onComplete({ difficulty: selected })}
          className={`w-full py-5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${
            selected 
              ? 'bg-stone-900 text-white hover:bg-stone-800' 
              : 'bg-stone-100 text-stone-300 cursor-not-allowed'
          }`}
        >
          <span>Submit & Complete</span>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ReflectionStep;
