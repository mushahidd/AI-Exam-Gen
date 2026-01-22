import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowRight, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const VerifyEmail = () => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const { verifyEmail, resendCode } = useAuth() as any;
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Get email from navigation state
        if (location.state && location.state.email) {
            setEmail(location.state.email);
        } else {
            // If no email provided, redirect to login
            navigate('/login');
        }
    }, [location, navigate]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) return; // Prevent multiple chars

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`code-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newCode = [...code];
        pastedData.split('').forEach((char, index) => {
            if (index < 6) newCode[index] = char;
        });
        setCode(newCode);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const verificationCode = code.join('');
        if (verificationCode.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        const result = await verifyEmail(email, verificationCode);

        setIsLoading(false);
        if (result.success) {
            setSuccess('Email verified successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/login', { state: { message: 'Email verified! Please login.' } });
            }, 2000);
        } else {
            setError(result.message || 'Verification failed. Please try again.');
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;

        setIsLoading(true);
        setError('');
        setSuccess('');

        const result = await resendCode(email);

        setIsLoading(false);
        if (result.success) {
            setSuccess('Verification code resent! Please check your email.');
            setCountdown(60); // 1 minute cooldown
        } else {
            setError(result.message || 'Failed to resend code.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                        <Mail className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
                    <p className="text-gray-600">
                        We've sent a 6-digit code to <br />
                        <span className="font-medium text-gray-900">{email}</span>
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-green-800 text-sm">{success}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between gap-2 mb-8">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                id={`code-${index}`}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all bg-gray-50 focus:bg-white"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || code.some(d => !d)}
                        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <RefreshCw className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                Verify Email
                                <ArrowRight className="h-5 w-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm mb-2">Didn't receive the code?</p>
                    <button
                        onClick={handleResend}
                        disabled={countdown > 0 || isLoading}
                        className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                    >
                        {countdown > 0 ? (
                            `Resend in ${countdown}s`
                        ) : (
                            <>
                                <RefreshCw className="h-4 w-4" />
                                Resend Code
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-8 text-center border-t border-gray-100 pt-6">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
