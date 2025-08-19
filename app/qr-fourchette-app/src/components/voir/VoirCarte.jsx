import { useRef, useState, useEffect } from 'react';

import CarteMenu from './elements/CarteMenu.jsx';
import { getValues } from '../../scripts/api/settings.js';

const TOKEN_KEY = 'auth_token';

export default function VoirCarte({ user }) {

    const [menus, setMenus] = useState([]);

    const [menuType, setMenuType] = useState("");
    
    const [typoCategorie, setTypoCategorie] = useState("");
    const [couleurCategorie, setCouleurCategorie] = useState("#000000");
    const [typoCategorieSelect, setTypoCategorieSelect] = useState(false);

    const [typoPlats, setTypoPlats] = useState("");
    const [couleurPlats, setCouleurPlats] = useState("#000000");
    const [typoPlatsSelect, setTypoPlatsSelect] = useState(false);

    const [couleurArrierePlan, setCouleurArrierePlan] = useState("#FFFFFF");
    const [couleurLiens, setCouleurLiens] = useState("#FFFFFF");

    useEffect(() => {
        if (!user) return;

        async function fetchMenu() {
            try {
                const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/api/carte/menu/${user.id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
                    },
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load menu');
                }
                setMenus(data.menus || []);
                console.log('Menus fetched:', data.menus);
            } catch (err) {
                console.error(err);
            }
        }

        async function fetchStyles() {
            const data = await getValues(user.id, 'stylesCarte', [
                {key: 'menuType', value: '' }, 
                'typoCategorie', 
                { key: 'couleurCategorie', value: '#000000' }, 
                'typoPlats', 
                { key: 'couleurPlats', value: '#000000' }, 
                { key: 'couleurArrierePlan', value: '#000000' }, 
                { key: 'couleurLiens', value: '#000000' }
            ]);

            if (data) {
                setMenuType(data.menuType.value);
                setTypoCategorie(data.typoCategorie.value);
                setCouleurCategorie(data.couleurCategorie.value);
                setTypoCategorieSelect(!!data.typoCategorie.value);
                setTypoPlats(data.typoPlats.value);
                setCouleurPlats(data.couleurPlats.value);
                setTypoPlatsSelect(!!data.typoPlats.value);
                setCouleurArrierePlan(data.couleurArrierePlan.value);
                setCouleurLiens(data.couleurLiens.value);
            }
        }

        fetchMenu();
        fetchStyles();

    }, [user]);

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Voir ma Carte</h2>
            <div className="space-y-10">
                {menus.map((menu, index) => (
                    <CarteMenu key={menu.id} {...menu} border={couleurArrierePlan} />
                ))}
            </div>
        </div>
    );
}
