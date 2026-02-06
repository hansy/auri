import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { confirmFn, getConfirmationDetailsFn } from '../server/functions';
import { LanguageSelector } from './LanguageSelector';
import { Language } from '@auri/shared/types';

interface ConfirmStepProps {
    token: string;
    onComplete: () => void;
}

const ConfirmStep: React.FC<ConfirmStepProps> = ({ token, onComplete }) => {
    const [status, setStatus] = useState<'loading' | 'preparing' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');
    const [selectedLanguage, setSelectedLanguage] = useState<Language>(Language.ENGLISH);
    const [selectedVariant, setSelectedVariant] = useState<string>('');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const result = await getConfirmationDetailsFn({
                    data: { token }
                });
                if (result.success) {
                    setSelectedLanguage(result.language as Language);
                    setStatus('preparing');
                    setMessage('Confirm your language settings');
                } else {
                    setStatus('error');
                    setMessage((result as any).error || 'Invalid or expired token');
                }
            } catch (e) {
                setStatus('error');
                setMessage('Failed to connect to server');
            }
        };

        fetchDetails();
    }, [token]);

    const handleConfirm = async () => {
        setStatus('loading');
        setMessage('Finalizing your subscription...');
        try {
            const result = await confirmFn({
                data: {
                    token,
                    targetLanguage: selectedLanguage,
                    languageVariant: selectedVariant
                }
            });
            if (result.success) {
                setStatus('success');
                setMessage(result.message);
            } else {
                setStatus('error');
                setMessage((result as any).error);
            }
        } catch (e) {
            setStatus('error');
            setMessage('Failed to connect to server');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-8 py-12 text-center animate-in fade-in duration-700">
            {status === 'loading' && (
                <div className="flex flex-col items-center gap-6">
                    <Loader2 className="w-16 h-16 text-stone-300 animate-spin" />
                    <h2 className="text-2xl font-light text-stone-900 serif">{message}</h2>
                </div>
            )}

            {status === 'preparing' && (
                <div className="w-full max-w-md bg-white border border-stone-200 rounded-[2.5rem] p-8 md:p-10 shadow-xl flex flex-col items-center animate-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-6">
                        <Sparkles className="w-8 h-8 text-stone-900" />
                    </div>

                    <h2 className="text-2xl font-light text-stone-900 serif mb-2">Welcome Aboard!</h2>
                    <p className="text-stone-500 text-sm mb-8">Confirm or adjust your settings before we start.</p>

                    <LanguageSelector
                        selectedLanguage={selectedLanguage}
                        onLanguageChange={setSelectedLanguage}
                        selectedVariant={selectedVariant}
                        onVariantChange={setSelectedVariant}
                        className="mb-10 text-left"
                    />

                    <button
                        onClick={handleConfirm}
                        className="group w-full px-8 py-4 bg-stone-900 text-white rounded-2xl font-semibold hover:bg-stone-800 transition-all flex items-center justify-center gap-2 shadow-lg active:translate-y-0.5"
                    >
                        <span>Confirm & Start Lessons</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            )}

            {status === 'success' && (
                <div className="flex flex-col items-center max-w-sm">
                    <div className="w-20 h-20 bg-stone-900 rounded-full flex items-center justify-center text-white mb-6 animate-bounce-short">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-light text-stone-900 serif mb-4">You're All Set!</h2>
                    <p className="text-stone-500 mb-8">
                        {message} We've queued up your first lesson for <span className="text-stone-900 font-semibold">{selectedLanguage}</span>. It should arrive in your inbox shortly.
                    </p>
                    <button
                        onClick={onComplete}
                        className="px-8 py-4 border-2 border-stone-900 text-stone-900 rounded-2xl font-semibold hover:bg-stone-900 hover:text-white transition-all flex items-center gap-2"
                    >
                        <span>Return to Home</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            )}

            {status === 'error' && (
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-6 font-bold text-3xl">!</div>
                    <h2 className="text-2xl font-light text-stone-900 serif mb-2">Something went wrong</h2>
                    <p className="text-stone-500 max-w-xs">{message}</p>
                    <button
                        onClick={onComplete}
                        className="mt-8 px-8 py-4 bg-stone-900 text-white rounded-2xl font-semibold hover:bg-stone-800 transition-all"
                    >
                        Back to Home
                    </button>
                </div>
            )}
        </div>
    );
};

export default ConfirmStep;
