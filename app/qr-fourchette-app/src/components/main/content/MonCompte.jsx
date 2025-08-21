import { useState } from 'react';

export default function MonCompte({ onLogin }) {

    const [e, setEmail] = useState('');
    const [p, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const form = e.target;
        const emailElement = form.querySelector('input[type="text"]');
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
        <div className="mt-20 pt-20 flex flex-col items-center justify-center">
            <div className="md:text-4xl font-semibold z-10 ">Connexion
                <div className="border-t-8 border-[#ffba00;] w-full mt-[-8px]"></div>
            </div>
            <form className="w-[300px] pt-10 flex flex-col items-center" onSubmit={handleSubmit}>
                <div className="w-full">
                    <div className="w-full">
                        <p>Identifiant ou email</p>
                        <input className="w-full bg-gray-200 rounded-2xl my-2 h-8 px-2" type="text" onChange={(e) => setEmail(e.target.value)} value={e} />
                    </div>
                    <div className="w-full">
                        <p>Mot de passe</p>
                        <input className="w-full bg-gray-200 rounded-2xl my-2 h-8 px-2" type="password" onChange={(e) => setPassword(e.target.value)} value={p} />
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" className="mr-2"/>
                        <p className="text-gray-400">Se souvenir de moi</p>
                    </div>
                </div>
                <div>
                    <button className="bg-gradient-to-r from-orange-400 to-[#ffb500] text-white rounded-3xl py-2 px-7 mt-5 pb-1" type="submit"><p>JE ME CONNECTE</p></button>
                </div>
                <p className="text-sm pt-5 text-gray-400">Mot de passe oublié ?</p>
            </form>
        </div>
    );
}