import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function App() {
  const [user, setUser] = useState(null); // null = logged out
  const [showLogin, setShowLogin] = useState(true);

  const logout = () => setUser(null);

  return (
    <>
        <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
            <span style={{ marginRight: '1rem' }}>MyApp</span>
            {!user ? (
            <>
                <button
                onClick={() => setShowLogin(true)}
                style={{ marginRight: '1rem' }}
                disabled={showLogin}
                >
                Login
                </button>
                <button onClick={() => setShowLogin(false)} disabled={!showLogin}>
                Sign Up
                </button>
            </>
            ) : (
            <>
                <span style={{ marginRight: '1rem' }}>Welcome, {user.username}!</span>
                <button onClick={logout}>Logout</button>
            </>
            )}
        </nav>

        <main style={{ padding: '1rem' }}>
            {!user ? (
            showLogin ? (
                <LoginForm
                onLogin={userData => setUser(userData)}
                switchToRegister={() => setShowLogin(false)}
                />
            ) : (
                <RegisterForm
                onSignup={userData => setUser(userData)}
                switchToLogin={() => setShowLogin(true)}
                />
            )
            ) : (
            <p>Here is your dashboard and exclusive content.</p>
            )}
        </main>
        </>
    );
}
