import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Grid, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { login, register, loginWithGoogle } = useAuth() as any;
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state && location.state.message) {
            setSuccessMessage(location.state.message);
            // Clear state so message doesn't persist on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        // Email validation for registration
        if (isRegistering) {
            // STRICT @gmail.com check
            const emailRegex = /^[^\s@]+@gmail\.com$/;
            if (!emailRegex.test(username)) {
                setError('Registration is restricted to @gmail.com addresses only.');
                return;
            }
        }

        if (isRegistering) {
            // Default role to TEACHER
            const result = await register(username, password, 'TEACHER');
            if (result.success) {
                setIsRegistering(false);
                setSuccessMessage(result.message || 'Account created successfully! Please login.');
                setError(''); // Explicitly clear error
                setUsername('');
                setPassword('');
            } else {
                setError(result.message || 'Registration failed. Username may be taken.');
                setSuccessMessage(''); // Explicitly clear success
            }
        } else {
            const result = await login(username, password);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.message || 'Invalid credentials.');
                setSuccessMessage(''); // Explicitly clear success
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6 font-medium transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                </button>
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
                        <Grid className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {isRegistering ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="text-gray-600">
                        {isRegistering ? 'Start creating AI-powered exams' : 'Sign in to your account'}
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-fadeIn">
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <p className="text-green-800 font-medium text-sm">{successMessage}</p>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fadeIn">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-red-800 font-medium text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {isRegistering ? 'Email Address' : 'Username'}
                            </label>
                            <input
                                type={isRegistering ? 'email' : 'text'}
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                placeholder={isRegistering ? 'Enter your email address' : 'Enter your username'}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            {isRegistering ? 'Create Account' : 'Sign In'}
                        </button>
                    </form>

                    {!isRegistering && import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                        <>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500 uppercase tracking-wider text-[10px] font-bold">Or continue with</span>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <GoogleLogin
                                    onSuccess={async (credentialResponse) => {
                                        if (credentialResponse.credential) {
                                            const success = await loginWithGoogle(credentialResponse.credential);
                                            if (success) {
                                                navigate('/dashboard');
                                            } else {
                                                setError('Google sign-in failed.');
                                            }
                                        }
                                    }}
                                    onError={() => {
                                        setError('Google sign-in encountered an error.');
                                    }}
                                    useOneTap
                                    shape="circle"
                                    theme="outline"
                                    text="signin_with"
                                    width="100%"
                                />
                            </div>
                        </>
                    )}

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsRegistering(!isRegistering);
                                setError('');
                                setSuccessMessage('');
                            }}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                        >
                            {isRegistering
                                ? 'Already have an account? Sign in'
                                : "Don't have an account? Create one"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
