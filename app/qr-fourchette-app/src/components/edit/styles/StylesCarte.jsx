import { useState, useRef, useEffect } from 'react';
import Header from '../Header';
import Info from '../../utils/Info';
import FontSelectList from './select/FontSelectList';
import { getValues, updateSettings } from '../../../scripts/api/settings';
import { getFontById } from '../../../scripts/api/fonts';

export default function StylesCarte({ user, onMouseDown, onClickClose }) {
    const timeoutRefs = useRef({});

    const [showArdoise, setShowArdoise] = useState(false);
    const [showCouleurs, setShowCouleurs] = useState(false);

    const [menuType, setMenuType] = useState({ id: -1, value: 'ardoise'});

    const [typoCategorie, setTypoCategorie] = useState({ id: -1, value: ''});
    const [couleurCategorie, setCouleurCategorie] = useState({ id: -1, value: '#FFFFFF'});
    const [typoCategorieSelect, setTypoCategorieSelect] = useState(false);

    const [typoPlats, setTypoPlats] = useState({ id: -1, value: ''});
    const [couleurPlats, setCouleurPlats] = useState({ id: -1, value: '#FFFFFF'});
    const [typoPlatsSelect, setTypoPlatsSelect] = useState(false);

    const [couleurArrierePlan, setCouleurArrierePlan] = useState({ id: -1, value: '#FFFFFF'});
    const [couleurLiens, setCouleurLiens] = useState({ id: -1, value: '#FFFFFF'});

    const itemRef = useRef(null);

    const linkCategorie = useRef(null);
    const linkPlats = useRef(null);

    useEffect(() => {
        itemRef.current = document.querySelector(`.typo-info`);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getValues(user.id, 'stylesCarte', [
                {key: 'menuType', value: '' }, 
                'typoCategorie', 
                { key: 'couleurCategorie', value: '#000000' }, 
                'typoPlats', 
                { key: 'couleurPlats', value: '#000000' }, 
                { key: 'couleurArrierePlan', value: '#000000' }, 
                { key: 'couleurLiens', value: '#000000' }
            ]);

            const fontCategorieId = Number(data.typoCategorie.value);
            const fontPlatsId = Number(data.typoPlats.value);

            if (!isNaN(fontCategorieId) && fontCategorieId > 0) {
                const fontCategorie = await getFontById(user.id, fontCategorieId);
                setTypoCategorie({ id: data.typoCategorie.id, value: fontCategorie.name });
                linkCategorie.current = document.createElement('link');
                linkCategorie.current.rel = 'stylesheet';
                linkCategorie.current.href = fontCategorie.url;
                document.head.appendChild(linkCategorie.current);
            } else {
                setTypoCategorie({ id: data.typoCategorie.id, value: '' });
            }

            if (!isNaN(fontPlatsId) && fontPlatsId > 0) {
                const fontPlats = await getFontById(user.id, fontPlatsId);
                setTypoPlats({ id: data.typoPlats.id, value: fontPlats.name });
                linkPlats.current = document.createElement('link');
                linkPlats.current.rel = 'stylesheet';
                linkPlats.current.href = fontPlats.url;
                document.head.appendChild(linkPlats.current);
            } else {
                setTypoPlats({ id: data.typoPlats.id, value: '' });
            }
            
            setMenuType(data.menuType);
            setCouleurCategorie(data.couleurCategorie);
            setCouleurPlats(data.couleurPlats);
            setCouleurArrierePlan(data.couleurArrierePlan);
            setCouleurLiens(data.couleurLiens);
        };

        fetchData();
    }, [user.id]);

    const updateField = async (field) => {
        await updateSettings(user.id, field.id, field.value);
    };

    const onChange = (field, input, setter) => {
        const updatedField = { ...field, value: input };
        setter(updatedField);

        if (timeoutRefs.current[field.id]) {
            clearTimeout(timeoutRefs.current[field.id]);
        }

        timeoutRefs.current[field.id] = setTimeout(() => {
            updateField(updatedField);
        }, 500);
    };

    const handleSetMenuType = (type) => onChange(menuType, type, setMenuType);

    const handleSetTypoCategorie = (font) => {
        if (linkCategorie.current) {
            linkCategorie.current.remove();
        }

        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = font.url;
        document.head.appendChild(link);
        linkCategorie.current = link;

        updateField({ id: typoCategorie.id, value: `${font.id}` });
        setTypoCategorie({ id: typoCategorie.id, value: font.name });
        setTypoCategorieSelect(false);
    };
    const handleSetCouleurCategorie = (color) => onChange(couleurCategorie, color, setCouleurCategorie);  

    const handleSetTypoPlats = (font) => {
        if (linkPlats.current) {
            linkPlats.current.remove();
        }

        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = font.url;
        document.head.appendChild(link);
        linkPlats.current = link;

        updateField({ id: typoPlats.id, value: `${font.id}` });
        setTypoPlats({ id: typoPlats.id, value: font.name });
        setTypoPlatsSelect(false);
    };
    const handleSetCouleurPlats = (color) => onChange(couleurPlats, color, setCouleurPlats);

    const handleSetCouleurArrierePlan = (color) => onChange(couleurArrierePlan, color, setCouleurArrierePlan);
    const handleSetCouleurLiens = (color) => onChange(couleurLiens, color, setCouleurLiens);

    useEffect(() => {
        return () => {
            if (linkCategorie.current) {
                linkCategorie.current.remove();
            }
            if (linkPlats.current) {
                linkPlats.current.remove();
            }
        };
    }, []);

    return (
        <Header header="TYPOGRAPHIE & COULEURS">
            <div className="p-5 pt-2 relative w-full typo-info">
                <Info lines={["Configuration des typographies et des couleurs de votre carte"]}/>
                <div className="w-half">
                    <p className="mt-5">Type d'affichage des menus</p>
                    <Info lines={["Example menu ardoise (cliquez)"]} onClick={() => setShowArdoise(true)} className="pt-2 w-[210px]"/>
                    <Info displayIcon={false} lines={["Exemple menu arrière plan de navigation (cliquez)"]} onClick={() => setShowCouleurs(true)} className="w-[310px]"/>
                    <div className="flex items-center mt-2">
                        <input type="radio" id="menu-ardoise" name="menu-type" className="mr-2" checked={menuType.value === 'ardoise'} onChange={() => handleSetMenuType('ardoise')} />
                        <label htmlFor="menu-ardoise" className="text-xs">Menu couleur ardoise</label>
                        <input type="radio" id="menu-couleurs" name="menu-type" className="ml-5 mr-2" checked={menuType.value === 'couleurs'} onChange={() => handleSetMenuType('couleurs')} />
                        <label htmlFor="menu-couleurs" className="text-xs">Menu couleur de l'arrière plan de navigation</label>
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
                <div className="w-full flex gap-5 mt-5">
                    <div className="w-1/2 relative">
                        <p>Choix de la typographie -{'>'} catégories</p>
                        <Info lines={["Choix de la typographie sur google fonts pour les catégories de plats et le menu responsive"]} className="mt-2"/>
                        <p className="menu-name rounded-xl p-2 focus:outline-none focus:ring-2 bg-gray-200 h-11 w-full saveable-input mt-2" onClick={() => setTypoCategorieSelect(true)}>{typoCategorie.value}</p>
                        {typoCategorieSelect && <FontSelectList id={user.id} onClickClose={onClickClose} parent={itemRef.current} setFont={handleSetTypoCategorie} setFontSelect={setTypoCategorieSelect} />}
                        <p style={{ fontFamily: typoCategorie.value }}>Aperçu de la police d'écriture</p>
                    </div>
                    <div className="w-1/2">
                        <p>Couleur texte -{'>'} catégories</p>
                        <Info lines={["Couleur du texte des catégories de plats"]} className="mt-2" />
                        <div className="flex items-center h-[40px] mt-6">
                            <input type="color" className="rounded-l-xl h-full" value={couleurCategorie.value} onChange={(e) => handleSetCouleurCategorie(e.target.value)} />
                            <div className="rounded-r-xl bg-white h-full w-[50px] flex justify-center items-center border border-l-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-brush-fill" viewBox="0 0 16 16">
                                    <path d="M15.825.12a.5.5 0 0 1 .132.584c-1.53 3.43-4.743 8.17-7.095 10.64a6.1 6.1 0 0 1-2.373 1.534c-.018.227-.06.538-.16.868-.201.659-.667 1.479-1.708 1.74a8.1 8.1 0 0 1-3.078.132 4 4 0 0 1-.562-.135 1.4 1.4 0 0 1-.466-.247.7.7 0 0 1-.204-.288.62.62 0 0 1 .004-.443c.095-.245.316-.38.461-.452.394-.197.625-.453.867-.826.095-.144.184-.297.287-.472l.117-.198c.151-.255.326-.54.546-.848.528-.739 1.201-.925 1.746-.896q.19.012.348.048c.062-.172.142-.38.238-.608.261-.619.658-1.419 1.187-2.069 2.176-2.67 6.18-6.206 9.117-8.104a.5.5 0 0 1 .596.04"/>
                                </svg>
                            </div>
                            <input type="text" className="rounded-xl p-2 focus:outline-none focus:ring-2 bg-gray-200 h-full saveable-input w-[100px]" placeholder="#000000" value={couleurCategorie.value} onChange={(e) => handleSetCouleurCategorie(e.target.value)} />
                        </div>
                    </div>
                </div>
                <div className="w-full flex gap-5 mt-5">
                    <div className="w-1/2 relative">
                        <p>Choix de la typographie -{'>'} plats</p>
                        <Info lines={["Choix de la typographie sur google fonts pour les plats"]} className='mt-2'/>
                        <p className="menu-name rounded-xl p-2 focus:outline-none focus:ring-2 bg-gray-200 h-11 w-full saveable-input mt-2" onClick={() => setTypoPlatsSelect(true)}>{typoPlats.value}</p>
                        {typoPlatsSelect && <FontSelectList id={user.id} onClickClose={onClickClose} parent={itemRef.current} setFont={handleSetTypoPlats} setFontSelect={setTypoPlatsSelect} />}
                        <p style={{ fontFamily: typoPlats.value }}>Aperçu de la police d'écriture</p>
                    </div>
                    <div className="w-1/2">
                        <p>Couleur texte -{'>'} plats</p>
                        <Info lines={["Couleur du texte des plats"]} className="mt-2" />
                        <div className="flex items-center h-[40px] mt-2">
                            <input type="color" className="rounded-l-xl h-full" value={couleurPlats.value} onChange={(e) => handleSetCouleurPlats(e.target.value)} />
                            <div className="rounded-r-xl bg-white h-full w-[50px] flex justify-center items-center border border-l-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-brush-fill" viewBox="0 0 16 16">
                                    <path d="M15.825.12a.5.5 0 0 1 .132.584c-1.53 3.43-4.743 8.17-7.095 10.64a6.1 6.1 0 0 1-2.373 1.534c-.018.227-.06.538-.16.868-.201.659-.667 1.479-1.708 1.74a8.1 8.1 0 0 1-3.078.132 4 4 0 0 1-.562-.135 1.4 1.4 0 0 1-.466-.247.7.7 0 0 1-.204-.288.62.62 0 0 1 .004-.443c.095-.245.316-.38.461-.452.394-.197.625-.453.867-.826.095-.144.184-.297.287-.472l.117-.198c.151-.255.326-.54.546-.848.528-.739 1.201-.925 1.746-.896q.19.012.348.048c.062-.172.142-.38.238-.608.261-.619.658-1.419 1.187-2.069 2.176-2.67 6.18-6.206 9.117-8.104a.5.5 0 0 1 .596.04"/>
                                </svg>
                            </div>
                            <input type="text" className="rounded-xl p-2 focus:outline-none focus:ring-2 bg-gray-200 h-full saveable-input w-[100px]" placeholder="#000000" value={couleurPlats.value} onChange={(e) => handleSetCouleurPlats(e.target.value)} />
                        </div>
                    </div>
                </div>
                <div className="w-full flex gap-5 mt-5">
                    <div className="w-1/2">
                        <p>Couleur de l'arrière plan -{'>'} navigation</p>
                        <Info lines={["Couleur de l'arrière plan du menu déroulant pour la navigation des catégories de plats"]} className="mt-2" />
                        <div className="flex items-center h-[40px] mt-2">
                            <input type="color" className="rounded-l-xl h-full" value={couleurArrierePlan.value} onChange={(e) => handleSetCouleurArrierePlan(e.target.value)} />
                            <div className="rounded-r-xl bg-white h-full w-[50px] flex justify-center items-center border border-l-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-brush-fill" viewBox="0 0 16 16">
                                    <path d="M15.825.12a.5.5 0 0 1 .132.584c-1.53 3.43-4.743 8.17-7.095 10.64a6.1 6.1 0 0 1-2.373 1.534c-.018.227-.06.538-.16.868-.201.659-.667 1.479-1.708 1.74a8.1 8.1 0 0 1-3.078.132 4 4 0 0 1-.562-.135 1.4 1.4 0 0 1-.466-.247.7.7 0 0 1-.204-.288.62.62 0 0 1 .004-.443c.095-.245.316-.38.461-.452.394-.197.625-.453.867-.826.095-.144.184-.297.287-.472l.117-.198c.151-.255.326-.54.546-.848.528-.739 1.201-.925 1.746-.896q.19.012.348.048c.062-.172.142-.38.238-.608.261-.619.658-1.419 1.187-2.069 2.176-2.67 6.18-6.206 9.117-8.104a.5.5 0 0 1 .596.04"/>
                                </svg>
                            </div>
                            <input type="text" className="rounded-xl p-2 focus:outline-none focus:ring-2 bg-gray-200 h-full saveable-input w-[100px]" placeholder="#000000" value={couleurArrierePlan.value} onChange={(e) => handleSetCouleurArrierePlan(e.target.value)} />
                        </div>
                    </div>
                    <div className="w-1/2">
                        <p>Couleur liens -{'>'} navigation</p>
                        <Info lines={["Couleur des liens dans le menu déroulant pour la navigation des catégories de plats"]} className="mt-2" />
                        <div className="flex items-center h-[40px] mt-2">
                            <input type="color" className="rounded-l-xl h-full" value={couleurLiens.value} onChange={(e) => handleSetCouleurLiens(e.target.value)} />
                            <div className="rounded-r-xl bg-white h-full w-[50px] flex justify-center items-center border border-l-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-brush-fill" viewBox="0 0 16 16">
                                    <path d="M15.825.12a.5.5 0 0 1 .132.584c-1.53 3.43-4.743 8.17-7.095 10.64a6.1 6.1 0 0 1-2.373 1.534c-.018.227-.06.538-.16.868-.201.659-.667 1.479-1.708 1.74a8.1 8.1 0 0 1-3.078.132 4 4 0 0 1-.562-.135 1.4 1.4 0 0 1-.466-.247.7.7 0 0 1-.204-.288.62.62 0 0 1 .004-.443c.095-.245.316-.38.461-.452.394-.197.625-.453.867-.826.095-.144.184-.297.287-.472l.117-.198c.151-.255.326-.54.546-.848.528-.739 1.201-.925 1.746-.896q.19.012.348.048c.062-.172.142-.38.238-.608.261-.619.658-1.419 1.187-2.069 2.176-2.67 6.18-6.206 9.117-8.104a.5.5 0 0 1 .596.04"/>
                                </svg>
                            </div>
                            <input type="text" className="rounded-xl p-2 focus:outline-none focus:ring-2 bg-gray-200 h-full saveable-input w-[100px]" placeholder="#000000" value={couleurLiens.value} onChange={(e) => handleSetCouleurLiens(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>
        </Header>
    );
}