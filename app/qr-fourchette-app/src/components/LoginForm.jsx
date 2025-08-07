import React, { useState } from 'react';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email || !password) {
            setError('Please fill in all fields.');
            setLoading(false);
            return;
        }

        try {
            const baseUrl = import.meta.env.PUBLIC_API_BASE_URL ?? '';

            const res = await fetch(`${baseUrl}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const { message } = await res.json();
                setError(message || 'Login failed.');
                setLoading(false);
                return;
            }

            // Example: parse response JSON (e.g. token)
            const data = await res.json();
            console.log('Login successful:', data);

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/dashboard';

            setLoading(false);
        } catch (err) {
            setError(err.message || 'Network error. Try again later.');
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md mx-auto p-6 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-4">Login</h2>

            {error && (
            <div className="text-red-600 bg-red-100 p-2 rounded">{error}</div>
            )}

            <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
            required
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            required
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
            type="submit"
            disabled={loading}
            className={`mt-4 px-4 py-2 rounded text-white ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            >
            {loading ? 'Logging in...' : 'Log In'}
            </button>
        </form>
        );

}