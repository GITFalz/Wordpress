import { useRef, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import CartePlat from './CartePlat.jsx';

const TOKEN_KEY = 'auth_token';

export default function CarteCategorie({ userId, icon = null, id = null, name = null, description = null, title = '#000000', platCouleur = '#000000', typoCategorie = '', typoPlats = '' }) {
    
    const [plats, setPlats] = useState([]);

    useEffect(() => {
        async function fetchPlats() {
            try {
                const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/api/carte/categorie/plat/${userId}/${id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
                    },
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load categories');
                }
                setPlats(data.plats || []);
            } catch (err) {
                console.error(err);
            }
        }

        fetchPlats();
    }, []);

    return (
        <div id={name}>
            <div className="flex items-center gap-5 border-b-4 pb-4 mb-4" style={{ color: title }}>
                {icon !== '' && <Icon icon={icon} className="w-10 h-10" />}
                <h2 className="text-4xl" style={{ fontFamily: typoCategorie }}>{name}</h2>
            </div>

            {description && <p className="text-xl text-gray-500">{description}</p>}
            <div className="mt-5">
                {plats.map((plat, index) => (
                    <CartePlat key={plat.id} {...plat} className={index > 0 ? 'border-t pt-2' : ''} title={platCouleur} typoPlat={typoPlats} />
                ))}
            </div>
        </div>
    );
}