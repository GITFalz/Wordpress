import { useState } from 'react';

export default function LoginForm({ onLogin }) {
    const [e, setEmail] = useState('');
    const [p, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const form = e.target;
        const emailElement = form.querySelector('input[type="email"]');
        const passwordElement = form.querySelector('input[type="password"]');
        const email = emailElement.value;
        const password = passwordElement.value;

        try {
            const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const data = await response.json();
            onLogin({ token: data.token, user: data.user, expirationDate: data.expirationDate });
        } catch (err) {
            setError(err.message);
            console.error('Login error:', err);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 space-y-4"
        >
            <h2 className="text-xl font-bold text-center mb-4">Login</h2>
            <div className="space-y-2">
                <input
                    type="email"
                    value={e}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                    type="password"
                    value={p}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {error && <p className="text-red-600 text-sm">{error}</p>}
            </div>
            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            >
                Log In
            </button>
        </form>
    );
}