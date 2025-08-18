import { useState, useRef, useEffect } from 'react';
import Header from '../Header';
import Info from '../../utils/Info';
import FontSelectList from './select/FontSelectList';

const TOKEN_KEY = 'auth_token';

export default function StylesCarte({ user, onMouseDown, onClickClose }) {
    const [showArdoise, setShowArdoise] = useState(false);
    const [showCouleurs, setShowCouleurs] = useState(false);

    const [typoCategorie, setTypoCategorie] = useState({});
    const [typoCategorieSelect, setTypoCategorieSelect] = useState(false);

    const [typoPlats, setTypoPlats] = useState({});
    const [typoPlatsSelect, setTypoPlatsSelect] = useState(false);
    
    const itemRef = useRef(null);

    useEffect(() => {
        itemRef.current = document.querySelector(`.typo-info`);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(
                `${import.meta.env.PUBLIC_API_BASE_URL}/api/settings/${user.id}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
                    }, 
                    body: JSON.stringify({ keys: ['typoCategorie', 'typoPlats'] })
                }
            );

            if (response.ok) {
                const data = await response.json();
                setTypoCategorie(data.settings.typoCategorie ? JSON.parse(data.settings.typoCategorie) : {});
                setTypoPlats(data.settings.typoPlats ? JSON.parse(data.settings.typoPlats) : {});
            } else {
                console.error('Failed to fetch settings:', response);
            }
        };

        fetchData();
    }, [user.id]);

    const updateField = async (field, value) => {
        const response = await fetch(
            `${import.meta.env.PUBLIC_API_BASE_URL}/api/settings/${user.id}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
                },
                body: JSON.stringify({ key: field, value }), // key + value
            }
        );

        if (!response.ok) {
            const errText = await response.text();
            console.error('Server response:', errText);
            throw new Error('Failed to update settings field');
        }
    };

    const handleSetTypoCategorie = (font) => {
        setTypoCategorie(font);
        setTypoCategorieSelect(false);
        updateField('typoCategorie', JSON.stringify(font));
    };

    const handleSetTypoPlats = (font) => {
        setTypoPlats(font);
        setTypoPlatsSelect(false);
        updateField('typoPlats', JSON.stringify(font));
    };

    return (
        <Header header="TYPOGRAPHIE & COULEURS">
            <div className="p-5 pt-2 relative w-full typo-info">
                <Info lines={["Configuration des typographies et des couleurs de votre carte"]}/>
                <div className="w-half">
                    <p className="mt-5">Type d'affichage des menus</p>
                    <Info lines={["Example menu ardoise (cliquez)"]} onClick={() => setShowArdoise(true)} className="pt-5"/>
                    <Info displayIcon={false} lines={["Exemple menu arrière plan de navigation (cliquez)"]} onClick={() => setShowCouleurs(true)} />
                    <div className="flex items-center mt-2">
                        <input type="radio" id="menu-ardoise" name="menu-type" className="mr-2" />
                        <label htmlFor="menu-ardoise" className="text-xs">Menu ardoise</label>
                        <input type="radio" id="menu-couleurs" name="menu-type" className="ml-5 mr-2" />
                        <label htmlFor="menu-couleurs" className="text-xs">Menu couleurs</label>
                    </div>
                    {showArdoise && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowArdoise(false)}>
                            <img 
                                src="/src/assets/images/qr-et-fourchette-exemple-menu-ardoise.jpg" 
                                alt="Exemple d'affichage" 
                                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            />
                        </div>
                    )}
                    {showCouleurs && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCouleurs(false)}>
                            <img 
                                src="/src/assets/images/qr-et-fourchette-exemple-menu-couleurs.jpg" 
                                alt="Exemple d'affichage" 
                                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            />
                        </div>
                    )}
                </div>
                <div className="w-full flex">
                    <div className="w-1/2 relative">
                        <p>Choix de la typographie -{'>'} catégories</p>
                        <Info lines={["Choix de la typographie sur google fonts pour les catégories de plats et le menu responsive"]} />
                        <p className="menu-name rounded-xl p-2 focus:outline-none focus:ring-2 bg-gray-200 h-11 w-full saveable-input" onClick={() => setTypoCategorieSelect(true)}>{typoCategorie.name}</p>
                        {typoCategorieSelect && <FontSelectList id={user.id} onClickClose={onClickClose} parent={itemRef.current} setFont={handleSetTypoCategorie} setFontSelect={setTypoCategorieSelect} />}
                    </div>
                    <div className="w-1/2">
                        <p>Couleur texte -{'>'} catégories</p>
                    </div>
                </div>
                <div className="w-full flex">
                    <div className="w-1/2">
                        <p>Choix de la typographie -{'>'} plats</p>
                        <Info lines={["Choix de la typographie sur google fonts pour les plats"]} />
                        <p className="menu-name rounded-xl p-2 focus:outline-none focus:ring-2 bg-gray-200 h-11 w-full saveable-input" onClick={() => setTypoPlatsSelect(true)}>{typoPlats.name}</p>
                        {typoPlatsSelect && <FontSelectList id={user.id} onClickClose={onClickClose} parent={itemRef.current} setFont={handleSetTypoPlats} setFontSelect={setTypoPlatsSelect} />}
                    </div>
                    <div className="w-1/2">
                        <p>Couleur texte -{'>'} plats</p>
                    </div>
                </div>
                <div className="w-full flex">
                    <div className="w-1/2">
                        <p>Couleur de l'arrière plan -{'>'} navigation</p>
                    </div>
                    <div className="w-1/2">
                        <p>Couleur liens -{'>'} navigation</p>
                    </div>
                </div>
            </div>
        </Header>
    );
}