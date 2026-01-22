import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

interface User {
    username: string;
    role: string;
}

interface AuthResponse {
    success: boolean;
    message?: string;
    requiresVerification?: boolean;
    userId?: number;
}

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<AuthResponse>;
    loginWithGoogle: (googleToken: string) => Promise<boolean>;
    register: (username: string, password: string, role: string) => Promise<AuthResponse>;
    verifyEmail: (email: string, code: string) => Promise<AuthResponse>;
    resendCode: (email: string) => Promise<AuthResponse>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, []);

    const loginWithGoogle = async (googleToken: string) => {
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/google`, { token: googleToken });
            const { token, role, username } = res.data;
            const userData = { username, role };

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(userData);
            return true;
        } catch (error) {
            console.error("Google login failed", error);
            return false;
        }
    };

    const login = async (username: string, password: string): Promise<AuthResponse> => {
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
            const { token, role, username: userParams } = res.data;
            const userData = { username: userParams, role };

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userData));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(userData);
            return { success: true };
        } catch (error: any) {
            console.error("Login failed", error);
            if (error.response && error.response.status === 403 && error.response.data.requiresVerification) {
                return {
                    success: false,
                    message: error.response.data.message,
                    requiresVerification: true
                };
            }
            return {
                success: false,
                message: error.response?.data?.error || 'Login failed'
            };
        }
    };

    const register = async (username: string, password: string, role: string): Promise<AuthResponse> => {
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/register`, { username, password, role });
            return {
                success: true,
                message: res.data.message,
                requiresVerification: res.data.requiresVerification
            };
        } catch (error: any) {
            console.error("Registration failed", error);
            return {
                success: false,
                message: error.response?.data?.error || 'Registration failed'
            };
        }
    };

    const verifyEmail = async (email: string, code: string): Promise<AuthResponse> => {
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/verify-email`, { email, code });
            return { success: true, message: res.data.message };
        } catch (error: any) {
            console.error("Verification failed", error);
            return {
                success: false,
                message: error.response?.data?.error || 'Verification failed'
            };
        }
    };

    const resendCode = async (email: string): Promise<AuthResponse> => {
        try {
            const res = await axios.post(`${API_BASE_URL}/auth/resend-code`, { email });
            return { success: true, message: res.data.message };
        } catch (error: any) {
            console.error("Resend code failed", error);
            return {
                success: false,
                message: error.response?.data?.error || 'Failed to resend code'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            loginWithGoogle,
            register,
            verifyEmail,
            resendCode,
            logout,
            loading
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
