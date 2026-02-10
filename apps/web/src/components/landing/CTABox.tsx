import React, { useState } from 'react';
import { Language, CEFR } from '@auri/shared/types';
import { Mail, ArrowRight, Sparkles } from 'lucide-react';
import { subscribeFn } from '../../server/functions';
import { toast } from 'sonner';
import { SubscriptionSchema } from '@auri/shared/validation';
import { LanguageSelector } from '../LanguageSelector';
import { LevelSelector } from '../LevelSelector';

const CTABox: React.FC = () => {
    const [selectedLanguage, setSelectedLanguage] = useState<Language>(Language.ENGLISH_USA);
    const [selectedLevel, setSelectedLevel] = useState<CEFR>(CEFR.A2);
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubscribe = async () => {
        const validation = SubscriptionSchema.safeParse({
            email,
            language: selectedLanguage,
            proficiencyLevel: selectedLevel,
        });

        if (!validation.success) {
            const firstError = validation.error.errors[0]?.message || 'Invalid input';
            toast.error(firstError);
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await (subscribeFn as any)({
                data: validation.data
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
            <>
                {/* Language Selection */}
                <div className="w-full mb-8">
                    <LanguageSelector
                        selectedLanguage={selectedLanguage}
                        onLanguageChange={setSelectedLanguage}
                    />
                </div>

                {/* Proficiency Selection */}
                <div className="w-full mb-10">
                    <LevelSelector
                        selectedLevel={selectedLevel}
                        onLevelChange={setSelectedLevel}
                    />
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
        </div>
    );
};

export default CTABox;
