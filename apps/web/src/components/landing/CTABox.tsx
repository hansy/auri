import React, { useState } from 'react';
import { Language, CEFR, UserProfile } from '@auri/shared/types';
import { LANGUAGES, CEFR_LEVELS } from '@auri/shared/constants';
import { Mail, ArrowRight, Sparkles, Info } from 'lucide-react';
import { subscribeFn } from '../../server/functions';
import { toast } from 'sonner';

interface CTABoxProps {
    onStart: (lang?: Language, level?: CEFR) => void;
    user: UserProfile | null;
}

const CTABox: React.FC<CTABoxProps> = ({ onStart, user }) => {
    const [selectedLanguage, setSelectedLanguage] = useState<Language>(Language.ENGLISH);
    const [selectedLevel, setSelectedLevel] = useState<CEFR>(CEFR.B1);
    const [email, setEmail] = useState('');
    const [showTooltip, setShowTooltip] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubscribe = async () => {
        if (!email) {
            toast.error('Please enter your email');
            return;
        }
        setIsSubmitting(true);
        try {
            const result = await (subscribeFn as any)({
                data: {
                    email,
                    language: selectedLanguage,
                    level: selectedLevel,
                }
            });
            if (result.success) {
                setIsSuccess(true);
                toast.success('Subscription successful! Please check your email.');
            } else {
                toast.error('Error: ' + (result as any).error);
            }
        } catch (e) {
            toast.error('Failed to connect to server');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div id="cta-box" className="w-full max-w-lg bg-white border border-stone-200 rounded-[2.5rem] p-8 md:p-10 shadow-xl flex flex-col items-center text-center relative z-10 transition-all">
            {!user ? (
                <>
                    {/* Language Selection */}
                    <div className="w-full space-y-4 mb-8">
                        <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400 block">Target Language</label>
                        <div className="flex flex-wrap justify-center gap-2">
                            {LANGUAGES.map(lang => (
                                <button
                                    key={lang}
                                    type="button"
                                    onClick={() => setSelectedLanguage(lang)}
                                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${selectedLanguage === lang
                                        ? 'bg-stone-900 text-white'
                                        : 'bg-stone-50 text-stone-600 border border-stone-100 hover:border-stone-300'
                                        }`}
                                >
                                    {lang}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Proficiency Selection */}
                    <div className="w-full space-y-4 mb-10">
                        <div className="flex items-center justify-center gap-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.25em] text-stone-400">Proficiency Level</label>
                            <div className="relative flex items-center">
                                <button
                                    type="button"
                                    onMouseEnter={() => setShowTooltip(true)}
                                    onMouseLeave={() => setShowTooltip(false)}
                                    className="text-stone-300 hover:text-stone-500 transition-colors cursor-help"
                                    aria-label="Level information"
                                >
                                    <Info className="w-3.5 h-3.5" />
                                </button>
                                {showTooltip && (
                                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64 p-4 bg-stone-900 text-white text-[11px] font-medium leading-relaxed rounded-2xl shadow-2xl z-[100] animate-in fade-in slide-in-from-bottom-2">
                                        <p>Designed for learners with basic knowledge (A2+). Not optimized for absolute beginners starting from zero.</p>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-stone-900" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            {CEFR_LEVELS.map(lvl => (
                                <button
                                    key={lvl}
                                    type="button"
                                    onClick={() => setSelectedLevel(lvl)}
                                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${selectedLevel === lvl
                                        ? 'bg-stone-900 text-white'
                                        : 'bg-stone-50 text-stone-600 border border-stone-100 hover:border-stone-300'
                                        }`}
                                >
                                    {lvl}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Email Input + Button Group */}
                    <div className="w-full">
                        {isSuccess ? (
                            <div className="p-6 bg-stone-50 border border-stone-200 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <h4 className="text-xl font-light serif text-stone-800 mb-1">Check your inbox</h4>
                                <p className="text-stone-400 text-sm font-medium">We sent a confirmation link to <span className="text-stone-600">{email}</span>. Click it to complete your subscription.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-grow px-6 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 transition-all text-stone-800 placeholder:text-stone-300"
                                />
                                <button
                                    onClick={handleSubscribe}
                                    disabled={isSubmitting}
                                    className="group shrink-0 px-8 py-4 bg-stone-900 text-white rounded-2xl font-semibold hover:bg-stone-800 transition-all flex items-center justify-center gap-3 shadow-md active:translate-y-0.5 disabled:opacity-50"
                                >
                                    <span>{isSubmitting ? 'Subscribing...' : 'Subscribe'}</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="w-full space-y-6">
                    <div className="flex items-center justify-center gap-4 p-6 bg-stone-900 text-white rounded-[2rem]">
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs uppercase tracking-widest opacity-60 font-bold">Welcome back</p>
                            <p className="font-semibold">{user.targetLanguage} • {user.level} Session</p>
                        </div>
                    </div>

                    <button
                        onClick={() => onStart()}
                        className="group relative w-full px-8 py-5 bg-stone-900 text-white rounded-2xl font-semibold text-lg hover:bg-stone-800 transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl active:translate-y-0.5"
                    >
                        <Mail className="w-5 h-5 opacity-70" />
                        <span>Open Today's Lesson</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default CTABox;
