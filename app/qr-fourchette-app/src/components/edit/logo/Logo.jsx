import { useState, useRef, useEffect } from 'react';
import Header from '../Header';
import Info from '../../utils/Info';
import { getValues, updateSettings } from '../../../scripts/api/settings';
import { uploadImage } from "../../../scripts/api/uploads";

export default function Logo({ user }) {
    const timeoutRefs = useRef({});
    
    const [logoType, setLogoType] = useState({ id: -1, value: 'texte'});
    const [couleurEntete, setCouleurEntete] = useState({ id: -1, value: '#FFFFFF'});
    const [logo, setLogo] = useState({ id: -1, value: '' });

    const itemRef = useRef(null);

    useEffect(() => {
        itemRef.current = document.querySelector(`.choix-info`);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getValues(user.id, 'choixLogo', [
                {key: 'logoType', value: 'texte' }, 
                { key: 'couleurEntete', value: '#FFFFFF' }, 
                { key: 'logo', value: '' }
            ]);

            setLogoType(data.logoType);
            setCouleurEntete(data.couleurEntete);
            setLogo(data.logo);
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

    const handleUploadImage = async (file) => {
        if (!file) return;

        try {
            const url = await uploadImage(file);
            const updatedLogo = { ...logo, value: url };
            setLogo(updatedLogo);
            updateField(updatedLogo);
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    }

    const handleRemoveImage = () => {
        const updatedLogo = { ...logo, value: '' };
        setLogo(updatedLogo);
        updateField(updatedLogo);
    }

    const handleSetLogoType = (type) => {
        let updatedLogoType = { id: logoType.id, value: type };
        handleSetLogo('');
        setLogoType(updatedLogoType);
        updateField(updatedLogoType);
    }

    const handleSetCouleurEntete = (color) => {
        let updatedCouleurEntete = { ...couleurEntete, value: color };
        setCouleurEntete(updatedCouleurEntete);
        updateField(updatedCouleurEntete);
    }

    const handleSetLogo = (l) => {
        let updatedLogo = {id: logo.id, value: l };
        setLogo(updatedLogo);
        updateField(updatedLogo);
    }

    return (
        <Header header="CHOIX DU LOGO">
            <div className="p-5 pt-2 relative w-full choix-info">
                <Info lines={["Configuration des typographies et des couleurs de votre carte"]}/>
                <div className="w-full flex flex-row">
                    <div className="w-full flex flex-col gap-5 mt-5">
                        <div className="w-full">
                            <p>Couleur de l'entête</p>
                            <Info lines={["Couleur du texte des plats"]} className="mt-2" />
                            <div className="flex items-center h-[40px] mt-2">
                                <input type="color" className="rounded-l-xl h-full" value={couleurEntete.value} onChange={(e) => handleSetCouleurEntete(e.target.value)} />
                                <div className="rounded-r-xl bg-white h-full w-[50px] flex justify-center items-center border border-l-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-brush-fill" viewBox="0 0 16 16">
                                        <path d="M15.825.12a.5.5 0 0 1 .132.584c-1.53 3.43-4.743 8.17-7.095 10.64a6.1 6.1 0 0 1-2.373 1.534c-.018.227-.06.538-.16.868-.201.659-.667 1.479-1.708 1.74a8.1 8.1 0 0 1-3.078.132 4 4 0 0 1-.562-.135 1.4 1.4 0 0 1-.466-.247.7.7 0 0 1-.204-.288.62.62 0 0 1 .004-.443c.095-.245.316-.38.461-.452.394-.197.625-.453.867-.826.095-.144.184-.297.287-.472l.117-.198c.151-.255.326-.54.546-.848.528-.739 1.201-.925 1.746-.896q.19.012.348.048c.062-.172.142-.38.238-.608.261-.619.658-1.419 1.187-2.069 2.176-2.67 6.18-6.206 9.117-8.104a.5.5 0 0 1 .596.04"/>
                                    </svg>
                                </div>
                                <input type="text" className="rounded-xl p-2 focus:outline-none focus:ring-2 bg-gray-200 h-full saveable-input w-[100px]" placeholder="#000000" value={couleurEntete.value} onChange={(e) => handleSetCouleurEntete(e.target.value)} />
                            </div>
                        </div>
                        <div className="w-full">
                            <p className="mt-5">Type de votre logo</p>
                            <Info lines={["Choisir le type de logo (image ou texte)"]}/>
                            <div className="flex items-center mt-2">
                                <input type="radio" id="menu-ardoise" name="choix-logo-type" className="mr-2" checked={logoType.value === 'texte'} onChange={() => handleSetLogoType('texte')} />
                                <label htmlFor="menu-ardoise" className="text-xs">Texte</label>
                                <input type="radio" id="menu-couleurs" name="choix-logo-type" className="ml-5 mr-2" checked={logoType.value === 'image'} onChange={() => handleSetLogoType('image')} />
                                <label htmlFor="menu-couleurs" className="text-xs">Image</label>
                            </div>
                        </div>
                    </div>
                    <div className="flex w-full">
                        <div className="w-1/2 space-y-2 flex flex-col mt-5">
                            <p>Image du plat</p>
                            <Info lines={["Image représentant le plat"]}/>
                            <div className="flex"> 
                                {logoType.value === 'image' ? (
                                    <>
                                        <div className={`${(logo.value !== '') ? 'hidden' : ''}`}> 
                                            <input type="file" accept="image/*" className="plat-image rounded-xl p-2 focus:outline-none focus:ring-2 bg-gray-200 h-11 saveable-input w-full" onChange={(e) => { handleUploadImage(e.target.files[0]) }}/> 
                                        </div> 
                                        <div className={`relative ${(logo.value !== '') ? '' : 'hidden'}`}> 
                                            <img src={logo.value} alt="Aucune image sélectionnée" className="w-full h-auto rounded-xl mt-2" /> 
                                            <div className="absolute top-0 right-0 p-1"> 
                                                <button className="bg-red-500 text-white rounded-full p-1" onClick={handleRemoveImage}> 
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"> 
                                                        <path fillRule="evenodd" d="M10 9a1 1 0 00-1 1v5a1 1 0 002 0v-5a1 1 0 00-1-1z" clipRule="evenodd" /> 
                                                        <path fillRule="evenodd" d="M4 5a1 1 0 011-1h10a1 1 0 011 1v1H4V5z" clipRule="evenodd" /> 
                                                        <path d="M4 7h12v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" /> 
                                                    </svg> 
                                                </button> 
                                            </div> 
                                        </div>
                                    </>
                                ) : (
                                    <input type="text" className="rounded-xl p-2 focus:outline-none focus:ring-2 bg-gray-200 h-11 saveable-input w-full" placeholder="Texte du logo" value={logo.value} onChange={(e) => handleSetLogo(e.target.value)} /> 
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Header>
    );
}