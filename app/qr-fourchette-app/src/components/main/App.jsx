import { useState, useEffect } from 'react';
import Dashboard from './content/Dashboard';
import LoginForm from './content/LoginForm';

// Keys for storage
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const EXP_KEY = 'auth_token_exp';

export default function App() {
    console.log('App rendered');
    const [token, setToken] = useState(null);
    useEffect(() => {
        const saved = localStorage.getItem(TOKEN_KEY);
        if (saved) setToken(saved);
    }, []);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const raw = sessionStorage.getItem(USER_KEY);
        if (raw) setUser(JSON.parse(raw));
    }, []);
    const [loggedIn, setLoggedIn] = useState(!!token && !!user);
    
    // Timer ref
    let logoutTimer = null;

    // Function to save token/user/expiration
    const saveAuth = ({ token, user, expirationDate }) => {
        if (typeof window === "undefined") return; // Exit if SSR

        if (token) localStorage.setItem(TOKEN_KEY, token);
        if (user) sessionStorage.setItem(USER_KEY, JSON.stringify(user));
        if (expirationDate) localStorage.setItem(EXP_KEY, expirationDate);

        setToken(token);
        setUser(user);
        setLoggedIn(true);

        scheduleAutoLogout(expirationDate);
    };

    const clearAuth = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(EXP_KEY);
        sessionStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
        setLoggedIn(false);

        if (logoutTimer) clearTimeout(logoutTimer);
    };

    const scheduleAutoLogout = (expIso) => {
        if (logoutTimer) clearTimeout(logoutTimer);
        if (!expIso) return;

        const msLeft = new Date(expIso).getTime() - Date.now();
        if (msLeft <= 0) {
            clearAuth();
            return;
        }

        logoutTimer = setTimeout(() => {
            clearAuth();
        }, msLeft);
    };

    // On mount, check if token expired
    useEffect(() => {
        const expIso = localStorage.getItem(EXP_KEY);
        if (!token || !user || (expIso && Date.now() >= new Date(expIso).getTime())) {
            clearAuth();
        } else {
            scheduleAutoLogout(expIso);
        }

        return () => {
            if (logoutTimer) clearTimeout(logoutTimer);
        };
    }, []);

    return (
        <div>
            <header className="bg-white shadow">
                <div className="w-full px-4 py-4 flex justify-between items-center">
                <a href="#/" id="logo" className="text-2xl font-bold text-blue-600">MyApp</a>
                <nav className="flex space-x-4" aria-label="Primary">
                    
                </nav>
                </div>
            </header>

            <main id="view" className="flex-grow w-full px-4 py-8">
                {loggedIn ? (
                    <Dashboard user={user} onLogout={clearAuth} />
                ) : (
                    <LoginForm onLogin={saveAuth} />
                )}
            </main>
        </div>
    );
}