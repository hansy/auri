import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

interface ConfirmStepProps {
    token: string;
    onComplete: () => void;
}

const ConfirmStep: React.FC<ConfirmStepProps> = ({ token, onComplete }) => {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const confirmEmail = async () => {
            try {
                const response = await fetch(`http://localhost:3001/api/confirm?token=${token}`);
                const result = await response.json();
                if (result.success) {
                    setStatus('success');
                    setMessage(result.message);
                } else {
                    setStatus('error');
                    setMessage(result.error);
                }
            } catch (e) {
                setStatus('error');
                setMessage('Failed to connect to server');
            }
        };

        confirmEmail();
    }, [token]);

    return (
        <div className="flex flex-col items-center justify-center space-y-8 py-20 text-center animate-in fade-in duration-700">
            {status === 'loading' && (
                <>
                    <Loader2 className="w-16 h-16 text-stone-300 animate-spin" />
                    <h2 className="text-2xl font-semibold text-stone-900 serif">{message}</h2>
                </>
            )}

            {status === 'success' && (
                <>
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-4">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-semibold text-stone-900 serif">Subscription Confirmed!</h2>
                    <p className="text-stone-500 max-w-sm mx-auto">
                        {message} We've queued up your first lesson. It should arrive in your inbox shortly.
                    </p>
                    <button
                        onClick={onComplete}
                        className="mt-8 px-8 py-4 bg-stone-900 text-white rounded-2xl font-semibold hover:bg-stone-800 transition-all flex items-center gap-2"
                    >
                        <span>Go to Landing</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </>
            )}

            {status === 'error' && (
                <>
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-600 mb-4">
                        <CheckCircle2 className="w-12 h-12" /> {/* Should be an X icon but CheckCircle is imported */}
                    </div>
                    <h2 className="text-2xl font-semibold text-stone-900 serif">Oops! Something went wrong.</h2>
                    <p className="text-stone-500">{message}</p>
                    <button
                        onClick={onComplete}
                        className="mt-8 px-8 py-4 bg-stone-900 text-white rounded-2xl font-semibold hover:bg-stone-800 transition-all"
                    >
                        Back to Home
                    </button>
                </>
            )}
        </div>
    );
};

export default ConfirmStep;
