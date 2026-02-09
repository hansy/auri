import React, { useState } from 'react';
import { CEFR } from '@auri/shared/types';
import { CEFR_LEVELS, CEFR_DESCRIPTIONS } from '@auri/shared/constants';
import { Star, Info } from 'lucide-react';

interface LevelSelectorProps {
    selectedLevel: CEFR;
    onLevelChange: (level: CEFR) => void;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
    selectedLevel,
    onLevelChange
}) => {
    const [hoveredLevel, setHoveredLevel] = useState<CEFR | null>(null);

    const handleLevelClick = (level: CEFR) => {
        onLevelChange(level);
    };

    const isLowLevel = selectedLevel === CEFR.A0 || selectedLevel === CEFR.A1;

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-center gap-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400">Proficiency Level</label>
                <div className="relative group">
                    <Info className="w-3.5 h-3.5 text-stone-300 group-hover:text-stone-500 transition-colors cursor-help" />
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 p-4 bg-stone-900 text-white text-[11px] font-medium leading-relaxed rounded-2xl shadow-2xl transition-all opacity-0 pointer-events-none group-hover:opacity-100 z-[100]">
                        <p>Our curriculum is designed for learners with basic knowledge. Absolute beginners (A0/A1) may find the pace fast.</p>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-stone-900" />
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 relative">
                {CEFR_LEVELS.map(lvl => (
                    <div key={lvl} className="relative">
                        <button
                            type="button"
                            onClick={() => handleLevelClick(lvl)}
                            onMouseEnter={() => setHoveredLevel(lvl)}
                            onMouseLeave={() => setHoveredLevel(null)}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${selectedLevel === lvl
                                ? 'bg-stone-900 text-white'
                                : 'bg-stone-50 text-stone-600 border border-stone-100 hover:border-stone-300'
                                }`}
                        >
                            {lvl === CEFR.A2 && <Star className={`w-3.5 h-3.5 ${selectedLevel === lvl ? 'text-yellow-400 fill-yellow-400' : 'text-stone-400'}`} />}
                            {lvl}
                        </button>

                        {/* Individual Tooltip */}
                        {hoveredLevel === lvl && (
                            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-48 p-3 bg-stone-900 text-white text-[10px] font-medium leading-tight rounded-xl shadow-2xl z-[110] animate-in fade-in slide-in-from-bottom-2">
                                <p>{CEFR_DESCRIPTIONS[lvl]}</p>
                                {lvl === CEFR.A2 && (
                                    <p className="mt-1.5 text-yellow-400 font-bold">Recommended level</p>
                                )}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-6 border-transparent border-t-stone-900" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {isLowLevel && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-300">
                    <p className="text-[11px] font-medium text-amber-600 bg-amber-50 py-2 px-4 rounded-xl border border-amber-100">
                        Note: Optimized for A2+ learners. This may be quite challenging at your level.
                    </p>
                </div>
            )}
        </div>
    );
};
