import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { GoogleOAuthProvider } from '@react-oauth/google'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Warn if Google Client ID is not configured
if (!GOOGLE_CLIENT_ID) {
    console.warn(
        '⚠️ VITE_GOOGLE_CLIENT_ID is not set!\n' +
        'Google OAuth login will not work.\n' +
        'Please create a .env file with your Google Client ID.\n' +
        'See GOOGLE_OAUTH_SETUP.md for setup instructions.'
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AuthProvider>
                <App />
            </AuthProvider>
        </GoogleOAuthProvider>
    </React.StrictMode>,
)
