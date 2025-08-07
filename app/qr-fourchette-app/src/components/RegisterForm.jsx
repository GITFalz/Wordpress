import React, { useState } from 'react';

export default function RegisterForm({ onSwitchToLogin }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const baseUrl = import.meta.env.PUBLIC_API_BASE_URL ?? '';

        if (!username || !email || !password) {
            setError('Please fill in all fields.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${baseUrl}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                const message =
                data?.error?.[0]?.message || data?.error || 'Registration failed.';
                setError(message);
                setLoading(false);
                return;
            }

            onSwitchToLogin();

        } catch (err) {
            setError(err.message || 'Network error. Try again later.');
            setLoading(false);
        }
    }

    return (
        <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-md mx-auto p-6 bg-white rounded shadow"
        >
        <h2 className="text-2xl font-bold mb-4">Register</h2>

        {error && (
            <div className="text-red-600 bg-red-100 p-2 rounded">{error}</div>
        )}

        <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={loading}
            required
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            required
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            required
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <button
            type="submit"
            disabled={loading}
            className={`mt-4 px-4 py-2 rounded text-white ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
        >
            {loading ? 'Registering...' : 'Register'}
        </button>
        </form>
    );
}
