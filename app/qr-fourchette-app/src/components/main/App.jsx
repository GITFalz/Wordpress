import { useState, useEffect, use } from 'react';
import Dashboard from './content/Dashboard';
import LoginForm from './content/LoginForm';
import Accueil from './content/Accueil';
import MonCompte from './content/MonCompte';
import Inscription from './content/Inscription';

// Keys for storage
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const EXP_KEY = 'auth_token_exp';

export default function App() {
    const [token, setToken] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(TOKEN_KEY);
        }
        return null;
    });

    const [user, setUser] = useState(() => {
        if (typeof window !== 'undefined') {
            const userData = localStorage.getItem(USER_KEY);
            return userData ? JSON.parse(userData) : null;
        }
        return null;
    });

    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        setLoggedIn(!!token && !!user);
    }, [token, user]);

    let logoutTimer = null;

    const saveAuth = ({ token, user, expirationDate }) => {
        if (typeof window === "undefined") return;

        if (token) localStorage.setItem(TOKEN_KEY, token);
        if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
        if (expirationDate) localStorage.setItem(EXP_KEY, expirationDate);

        setToken(token);
        setUser(user);

        scheduleAutoLogout(expirationDate);

        window.location.hash = `edit/menu`;
    };

    const clearAuth = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(EXP_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
        setLoggedIn(false);
        setAccueilPage('accueil');

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

    // UI
    const [burgerMenuOpen, setBurgerMenuOpen] = useState(false);
    const [accueilPage, setAccueilPage] = useState("accueil");

    return (
        <div className="flex flex-col items-center justify-center h-full min-h-screen">
            { burgerMenuOpen && (
                <nav className="bg-[#f1ede8] fixed top-0 mt-[80px] left-0 w-full h-full z-30 flex flex-col items-center justify-center space-y-6">
                    <a href="#" className="text-3xl text-gray-500">À propos</a>
                    <a href="#" className="text-3xl text-gray-500">Services</a>
                    <a href="#" className="text-3xl text-gray-500">FAQ</a>
                    <a href="#" className="text-3xl text-gray-500">Contact</a>
                    <a>
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-facebook text-gray-500" viewBox="0 0 16 16">
                            <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/>
                        </svg>
                    </a>
                </nav>
            )}
            <header className="w-full bg-white shadow-lg flex justify-center fixed top-0 z-50">
                <div className="w-full py-4 flex justify-between items-center px-3">
                    <div id="logo" className="text-2xl font-bold text-blue-600 cursor-pointer" onClick={() => setAccueilPage('accueil')}>
                        <img src="/src/assets/images/qr-fourchette-logo.png" alt="MyApp Logo" className="md:h-12 h-10" />
                    </div>
                    <nav className="flex space-x-3 items-center text-sm text-gray-400" aria-label="Primary">
                        <div className="hidden gap-3 md:flex">
                            <p>À propos</p>
                            <p>Services</p>
                            <p>FAQ</p>
                            <p>Contact</p>
                            <p className="flex gap-2 items-center font-semibold text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className=" mb-1 bi bi-telephone-fill" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"/>
                                </svg>
                                06 08 00 64 55
                            </p>
                        </div>
                        
                        
                        
                        <div className="bg-gradient-to-r from-orange-400 to-[#ffb500] text-white sm:px-4 px-2 py-2 mb-1 rounded-full cursor-pointer transition-colors shadow-lg shadow-orange-200 flex items-center"
                            onClick={() => setAccueilPage('inscription')}
                        >
                            <p className="md:text-sm text-xs hidden sm:block mt-1">S'INSCRIRE</p>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="sm:hidden bi bi-check2-square" viewBox="0 0 16 16">
                                <path d="M3 14.5A1.5 1.5 0 0 1 1.5 13V3A1.5 1.5 0 0 1 3 1.5h8a.5.5 0 0 1 0 1H3a.5.5 0 0 0-.5.5v10a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5V8a.5.5 0 0 1 1 0v5a1.5 1.5 0 0 1-1.5 1.5z"/>
                                <path d="m8.354 10.354 7-7a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0"/>
                            </svg>
                        </div>
                        <div className="rounded-full sm:px-4 px-2 py-2 mb-1 shadow-xl flex items-center cursor-pointer"
                            onClick={() => setAccueilPage('mon-compte')}
                        >
                            <p className="md:sm text-xs hidden sm:block md:mt-0 mt-1">Mon compte</p>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="sm:hidden bi bi-person-fill" viewBox="0 0 16 16">
                                <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/>
                            </svg>
                        </div>
                        <div className="md:hidden bg-white rounded-full p-2 shadow-xl mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className=" bi bi-telephone-fill" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"/>
                            </svg>
                        </div>
                        <a className="text-gray-600 md:block hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-facebook" viewBox="0 0 16 16">
                                <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/>
                            </svg>
                        </a>
                        <div className="md:hidden w-7 h-7 relative cursor-pointer" onClick={() => setBurgerMenuOpen(!burgerMenuOpen)}>
                            <div className={`absolute h-1 w-7 bg-gray-500 rounded-sm transition-transform duration-300 ${ burgerMenuOpen ? 'rotate-45 top-3.5' : 'top-1'}`}></div>
                            <div className={`absolute h-1 w-7 bg-gray-500 rounded-sm transition-opacity duration-300 ${ burgerMenuOpen ? 'opacity-0' : 'top-3.5' }`}></div>
                            <div className={`absolute h-1 w-7 bg-gray-500 rounded-sm transition-transform duration-300 ${ burgerMenuOpen ? '-rotate-45 top-3.5' : 'top-6' }`}></div>
                        </div>
                    </nav>
                </div>
            </header>
            <div className="w-full flex flex-1 pt-20">
                <main className="flex-1 h-auto">
                    { !loggedIn ? (
                        <>
                        { accueilPage === 'accueil' && <Accueil user={user} /> }
                        { accueilPage === 'mon-compte' && <MonCompte user={user} onLogin={saveAuth} /> }
                        { accueilPage === 'inscription' && <Inscription user={user} /> }
                        </>
                    ) : (
                        <Dashboard user={user} onLogout={clearAuth} />
                    )}
                </main>
            </div>
            { !loggedIn && (<footer className="w-full h-80 bg-black shadow-lg  flex justify-center items-center flex-col gap-10 text-white z-30">
                <div className="flex gap-4 justify-center items-center text-sm text-gray-400">
                    <p>À propos</p>
                    <div className="bg-gray-600 h-3 w-[2px]"></div>
                    <p>Services</p>
                    <div className="bg-gray-600 h-3 w-[2px]"></div>
                    <p>FAQ</p>
                    <div className="bg-gray-600 h-3 w-[2px]"></div>
                    <p>Contact</p>
                    <div className="bg-gray-600 h-3 w-[2px]"></div>
                    <p>S'inscrire</p>
                </div>
                <img src="/src/assets/images/qr-fourchette-logo-footer.png" alt="QR & Fourchette Footer" className="w-40" />
                <div className="flex gap-4 justify-center items-center text-sm text-gray-400">
                    <p>@DEFACTO 2021</p>
                    <div className="bg-gray-600 h-3 w-[2px]"></div>
                    <p>Politique de confidentialité</p>
                    <div className="bg-gray-600 h-3 w-[2px]"></div>
                    <p>Plan du site</p>
                    <div className="bg-gray-600 h-3 w-[2px]"></div>
                    <p>Mentions légales</p>
                </div>
            </footer>)}
        </div>
    );
}