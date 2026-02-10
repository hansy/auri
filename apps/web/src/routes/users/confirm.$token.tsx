import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { getConfirmationDetailsFn, confirmFn, resendConfirmationFn } from '../../server/functions';
import { Language, CEFR } from '@auri/shared/types';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, Mail, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { isValidEmail } from '@auri/shared/validation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { LanguageSelector } from '../../components/LanguageSelector';
import { LevelSelector } from '../../components/LevelSelector';

export const Route = createFileRoute('/users/confirm/$token')({
    head: () => ({
        meta: [
            {
                title: 'Confirm Your Email - auri',
            },
            {
                name: 'description',
                content: 'Confirm your email and set up your language learning preferences to start your daily lessons.',
            },
            {
                property: 'og:title',
                content: 'Confirm Your Email - auri',
            },
            {
                property: 'og:description',
                content: 'Confirm your email and set up your language learning preferences to start your daily lessons.',
            },
        ],
    }),
    component: UserConfirmationPage,
});

function UserConfirmationPage() {
    const { token } = Route.useParams() as any;
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'ready'>('loading');
    const [selectedLanguage, setSelectedLanguage] = useState<Language>(Language.ENGLISH_USA);
    const [selectedLevel, setSelectedLevel] = useState<CEFR>(CEFR.A2);
    const [isConfirming, setIsConfirming] = useState(false);

    const [resendEmail, setResendEmail] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const result = await (getConfirmationDetailsFn as any)({ data: { token } });
                if (result.success && 'language' in result) {
                    setSelectedLanguage(result.language as Language);
                    setSelectedLevel(result.proficiencyLevel as CEFR);
                    setStatus('ready');
                } else {
                    const errMsg = 'error' in result ? (result.error as string) : 'Failed to load confirmation details';
                    toast.error(errMsg);
                    setStatus('error');
                }
            } catch (err) {
                setStatus('error');
            }
        };

        fetchDetails();
    }, [token]);

    const handleConfirm = async () => {
        setIsConfirming(true);
        try {
            const result = await (confirmFn as any)({
                data: {
                    token,
                    targetLanguage: selectedLanguage,
                    level: selectedLevel
                }
            });
            if (result.success) {
                setStatus('success');
                toast.success('Email confirmed successfully!');
            } else {
                const errMsg = 'error' in result ? (result.error as string) : 'Failed to confirm email';
                toast.error(errMsg);
                setStatus('error');
            }
        } catch (err) {
            setStatus('error');
        } finally {
            setIsConfirming(false);
        }
    };

    const handleResend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValidEmail(resendEmail)) {
            toast.error('Please enter a valid email');
            return;
        }

        setIsResending(true);
        try {
            const result = await (resendConfirmationFn as any)({ data: { email: resendEmail } });
            if (result.success) {
                setResendSuccess(true);
                toast.success('Confirmation link resent!');
            } else {
                toast.error(result.error || 'Failed to resend link');
            }
        } catch (err) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsResending(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-stone-50">
                <Loader2 className="w-12 h-12 mb-4 animate-spin text-stone-400" />
                <h2 className="text-2xl font-light serif text-stone-600">Verifying your request...</h2>
            </div>
        );
    }

    return (
        <main className="max-w-6xl mx-auto min-h-screen px-6 py-12 md:py-24 flex flex-col">
            <Header user={null} />

            <div className="flex-grow flex items-center justify-center py-12">
                <div className="w-full max-w-xl bg-white border border-stone-200 rounded-[2.5rem] p-10 md:p-14 shadow-xl text-center transition-all duration-500">
                    {status === 'error' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                                <AlertCircle className="w-10 h-10 text-amber-500" />
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-3xl font-light serif text-stone-800">Link Expired or Invalid</h1>
                                <p className="text-stone-500 leading-relaxed font-medium max-w-sm mx-auto">
                                    This confirmation link is no longer valid. Don't worry, you can request a new one below.
                                </p>
                            </div>

                            {!resendSuccess ? (
                                <form onSubmit={handleResend} className="space-y-4 max-w-sm mx-auto pt-4">
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-300" />
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            value={resendEmail}
                                            onChange={(e) => setResendEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-900/5 focus:border-stone-900 transition-all text-stone-800 placeholder:text-stone-300"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isResending}
                                        className="w-full px-8 py-4 bg-stone-900 text-white rounded-2xl font-semibold hover:bg-stone-800 transition-all flex items-center justify-center gap-3 shadow-md disabled:opacity-50"
                                    >
                                        {isResending ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <RefreshCw className="w-5 h-5" />
                                        )}
                                        <span>Resend Confirmation Link</span>
                                    </button>
                                </form>
                            ) : (
                                <div className="p-6 bg-stone-50 border border-stone-200 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-sm mx-auto">
                                    <div className="w-10 h-10 bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                    </div>
                                    <h4 className="text-lg font-light serif text-stone-800 mb-1">Link Sent</h4>
                                    <p className="text-stone-400 text-xs font-medium">Please check your inbox at <span className="text-stone-600 font-bold">{resendEmail}</span></p>
                                </div>
                            )}

                            <div className="pt-4 border-t border-stone-100 mt-8">
                                <button
                                    onClick={() => navigate({ to: '/' })}
                                    className="text-stone-400 hover:text-stone-600 transition-colors text-sm font-medium flex items-center justify-center gap-2 mx-auto"
                                >
                                    <span>Return to Homepage</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {status === 'ready' && (
                        <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
                            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="w-8 h-8 text-stone-900" />
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-4xl font-light serif text-stone-800">Welcome Aboard!</h1>
                                <p className="text-stone-400 font-medium">Confirm or adjust your settings before we start your adventure.</p>
                            </div>

                            <div className="space-y-12 py-4">
                                <div className="space-y-4">
                                    <LanguageSelector
                                        selectedLanguage={selectedLanguage}
                                        onLanguageChange={setSelectedLanguage}
                                        className="text-left"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <LevelSelector
                                        selectedLevel={selectedLevel}
                                        onLevelChange={setSelectedLevel}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleConfirm}
                                disabled={isConfirming}
                                className="group w-full px-8 py-5 bg-stone-900 text-white rounded-2xl font-semibold text-lg hover:bg-stone-800 transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl active:translate-y-0.5 disabled:opacity-50"
                            >
                                <span>{isConfirming ? 'Finalizing...' : 'Confirm & Start Lessons'}</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="space-y-8 py-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="w-24 h-24 bg-stone-900 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                                <CheckCircle2 className="w-12 h-12 text-white" />
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-4xl font-light serif text-stone-800">You're All Set!</h1>
                                <p className="text-stone-500 text-lg leading-relaxed font-medium max-w-sm mx-auto">
                                    Email confirmed. We've queued up your first lesson for <span className="text-stone-900 font-semibold">{selectedLanguage}</span>. It should arrive shortly.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate({ to: '/' })}
                                className="px-10 py-5 bg-stone-50 text-stone-900 border border-stone-200 rounded-2xl font-bold hover:bg-stone-100 transition-all"
                            >
                                Back to Homepage
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </main>
    );
}
