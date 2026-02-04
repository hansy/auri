import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { getConfirmationDetailsFn, confirmFn } from '../../server/functions';
import { LANGUAGE_VARIANTS } from '@dictation/shared/constants';
import { Language } from '@dictation/shared/types';
import { Loader2, CheckCircle2, AlertCircle, Globe, GraduationCap, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export const Route = createFileRoute('/users/confirm/$token')({
    component: UserConfirmationPage,
});

function UserConfirmationPage() {
    const { token } = Route.useParams() as any;
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'ready'>('loading');
    const [error, setError] = useState<string | null>(null);
    const [details, setDetails] = useState<{ language: string; level: string } | null>(null);
    const [selectedVariant, setSelectedVariant] = useState<string>('');
    const [isConfirming, setIsConfirming] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const result = await (getConfirmationDetailsFn as any)({ data: { token } });
                if (result.success && 'language' in result) {
                    setDetails({ language: result.language, level: result.level });
                    const variants = LANGUAGE_VARIANTS[result.language as Language];
                    if (variants && variants.length > 0) {
                        setSelectedVariant(variants[0]);
                    }
                    setStatus('ready');
                } else {
                    const errMsg = 'error' in result ? (result.error as string) : 'Failed to load confirmation details';
                    toast.error(errMsg);
                    setError(errMsg);
                    setStatus('error');
                }
            } catch (err) {
                setError('An unexpected error occurred');
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
                    languageVariant: selectedVariant,
                }
            });
            if (result.success) {
                setStatus('success');
                toast.success('Email confirmed successfully!');
            } else {
                const errMsg = 'error' in result ? (result.error as string) : 'Failed to confirm email';
                toast.error(errMsg);
                setError(errMsg);
                setStatus('error');
            }
        } catch (err) {
            setError('An unexpected error occurred during confirmation');
            setStatus('error');
        } finally {
            setIsConfirming(false);
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
                <div className="w-full max-w-xl bg-white border border-stone-200 rounded-[2.5rem] p-10 md:p-14 shadow-xl text-center">
                    {status === 'error' && (
                        <div className="space-y-6">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                                <AlertCircle className="w-10 h-10 text-red-500" />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-light serif text-stone-800">Something went wrong</h1>
                                <p className="text-stone-500 leading-relaxed font-medium">
                                    {error || "The link might be expired or invalid. Please try subscribing again from the homepage."}
                                </p>
                            </div>
                            <button
                                onClick={() => navigate({ to: '/' })}
                                className="px-8 py-4 bg-stone-900 text-white rounded-2xl font-semibold hover:bg-stone-800 transition-all shadow-md mt-4"
                            >
                                Back to Homepage
                            </button>
                        </div>
                    )}

                    {status === 'ready' && details && (
                        <div className="space-y-10">
                            <div className="space-y-4">
                                <h1 className="text-4xl font-light serif text-stone-800">Confirm Your Subscription</h1>
                                <p className="text-stone-400 font-medium">Almost there! Just a few quick preferences for your daily lessons.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-left">
                                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                        <Globe className="w-5 h-5 text-stone-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-0.5">Language</p>
                                        <p className="font-semibold text-stone-700">{details.language}</p>
                                    </div>
                                </div>
                                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                                        <GraduationCap className="w-5 h-5 text-stone-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-0.5">Proficiency</p>
                                        <p className="font-semibold text-stone-700">{details.level}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 text-left">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Preferred Dialect / Variant</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {LANGUAGE_VARIANTS[details.language as Language]?.map(variant => (
                                        <button
                                            key={variant}
                                            onClick={() => setSelectedVariant(variant)}
                                            className={`px-5 py-4 rounded-2xl text-sm font-semibold transition-all text-left border-2 ${selectedVariant === variant
                                                ? 'bg-stone-900 border-stone-900 text-white shadow-md'
                                                : 'bg-white border-stone-100 text-stone-600 hover:border-stone-200'
                                                }`}
                                        >
                                            {variant}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleConfirm}
                                disabled={isConfirming}
                                className="group w-full px-8 py-5 bg-stone-900 text-white rounded-2xl font-semibold text-lg hover:bg-stone-800 transition-all flex items-center justify-center gap-3 shadow-xl active:translate-y-0.5 disabled:opacity-50"
                            >
                                <span>{isConfirming ? 'Setting up...' : 'Confirm Subscription'}</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="space-y-8 py-4">
                            <div className="w-24 h-24 bg-stone-900 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                                <CheckCircle2 className="w-12 h-12 text-white" />
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-4xl font-light serif text-stone-800">You're All Set!</h1>
                                <p className="text-stone-500 text-lg leading-relaxed font-medium max-w-sm mx-auto">
                                    Your email is confirmed. We're curating your first lesson now—it'll be in your inbox shortly.
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
