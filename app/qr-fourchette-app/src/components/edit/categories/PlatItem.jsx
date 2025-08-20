import { useRef, useState, useEffect } from "react";
import Info from "../../utils/Info";
import { uploadImage } from "../../../scripts/api/uploads";

const TOKEN_KEY = 'auth_token';

export default function PlatItem({ user, name, description, image, prix, traduisible, lables, index, id, onChange, onAdd, onDelete, onMouseDown }) {
    const [expand, setExpand] = useState(false);
    const itemRef = useRef(null);
    const [labels, setLabels] = useState([]);

    useEffect(() => {
        itemRef.current = document.querySelector(`.plat-item[data-id="${id}"]`);

        const response = fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/api/carte/categorie/plat/labels/${user.id}/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
            }
        });
        response.then(res => res.json()).then(data => {
            if (data.labels) {
                // array with only label id "label.label_id"
                setLabels(data.labels.map(label => label.label_id));
            }
        });
        
    }, [id]);

    const handleUploadImage = async (file) => {
        if (!file) return;

        try {
            const url = await uploadImage(file);
            onChange(id, 'image', url);
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    }

    const onLabelClick = async (labelId) => {
        const isSelected = labels.includes(labelId);
        if (isSelected) {
            handleRemoveLabel(labelId);
        } else {
            handleAddLabel(labelId);
        }
    }

    const handleAddLabel = async (labelId) => {
        const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/api/carte/categorie/plat/label/${user.id}/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
            },
            body: JSON.stringify({ labelId })
        });

        if (response.ok) {
            const data = await response.json();
            setLabels(prevLabels => [...prevLabels, labelId]);
        } else {
            console.error('Error adding label:', response.statusText);
        }
    }

    const handleRemoveLabel = async (labelId) => {
        const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/api/carte/categorie/plat/label/${user.id}/${id}/${labelId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            setLabels(prevLabels => prevLabels.filter(label => label !== labelId));
        } else {
            console.error('Error removing label:', response.statusText);
        }
    }

    const handleRemoveImage = () => {
        onChange(id, 'image', '');
    }

    return (
        <div data-id={id} data-index={index} data-type="plat" className="flex items-start px-4 py-3 cursor-pointer drag-item plat-item">
            <div className="flex flex-col items-center mr-4 select-none rounded-xl">
                <div className="cursor-move w-11 h-11 rounded-full bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center transition drag-handle" onMouseDown={(e) => onMouseDown(e, index, itemRef.current)}>
                <p>{index}</p>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrows-move" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M7.646.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 1.707V5.5a.5.5 0 0 1-1 0V1.707L6.354 2.854a.5.5 0 1 1-.708-.708zM8 10a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708L7.5 14.293V10.5A.5.5 0 0 1 8 10M.146 8.354a.5.5 0 0 1 0-.708l2-2a.5.5 0 1 1 .708.708L1.707 7.5H5.5a.5.5 0 0 1 0 1H1.707l1.147 1.146a.5.5 0 0 1-.708.708zM10 8a.5.5 0 0 1 .5-.5h3.793l-1.147-1.146a.5.5 0 0 1 .708-.708l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L14.293 8.5H10.5A.5.5 0 0 1 10 8"/>
                    </svg>
                </div>
                <button type="button" aria-label="Add" className={`${expand ? 'hidden' : ''} expand-categorie-item mt-2 w-8 h-8 rounded-full bg-yellow-400 hover:bg-yellow-300 text-white transition focus:outline-none focus:ring-2 focus:ring-yellow-400 toggle-menu-button`} onClick={() => setExpand(true)}>
                    <div className="flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-fill" viewBox="0 0 16 16">
                            <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
                        </svg>
                    </div>
                </button>
                <button type="button" aria-label="Add" className={`${expand ? '' : 'hidden'} collapse-categorie-item mt-2 w-8 h-8 rounded-full bg-yellow-400 hover:bg-yellow-300 text-white transition focus:outline-none focus:ring-2 focus:ring-yellow-400 toggle-menu-button`} onClick={() => setExpand(false)}>
                    <div className="flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-double-up" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M7.646 2.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 3.707 2.354 9.354a.5.5 0 1 1-.708-.708z"/>
                            <path fillRule="evenodd" d="M7.646 6.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 7.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"/>
                        </svg>
                    </div>
                </button>     
            </div>

            {/* Right side: name and action buttons */}
            <div className="flex flex-col flex-grow">
                <div className="flex items-start justify-between flex-col space-y-2">
                    <div className="flex flex-row space-x-2 w-full">
                        <div className="w-full space-y-2 flex flex-col">
                            <p className={expand ? '' : 'hidden'}>Nom du plat</p>
                            <input type="text" name="name" placeholder="Menu name" className="plat-name rounded-xl p-2 focus:outline-none focus:ring-2 bg-gray-200 h-11 w-full saveable-input" value={name} onChange={(e) => onChange(id, 'name', e.target.value)}/>
                        </div>
                        <div className={`w-full space-y-2 flex flex-col ${expand ? '' : 'hidden'}`}>
                            <p className="">Prix du plat €</p>
                            <input type="number" name="prix" placeholder="Plat prix" className="plat-prix rounded-xl p-2 focus:outline-none focus:ring-2 bg-gray-200 h-11 w-full" value={prix} onChange={(e) => onChange(id, 'prix', e.target.value, 0)}/>
                        </div>
                    </div>
                    <div className={`w-full ${expand ? '' : 'hidden'}`}>
                        <div className="flex flex-row space-x-2 w-full">
                            <div className="w-full space-y-2 flex flex-col">
                                <p>Description du plat / ingrédients</p>
                                <textarea name="description" placeholder="Menu description" className="plat-description rounded-xl p-2 focus:outline-none focus:ring-2 bg-gray-200 h-32 w-full saveable-input" value={description} onChange={(e) => onChange(id, 'description', e.target.value)}/>
                            </div>
                            <div className="w-full space-y-2 flex flex-col">
                                <p className="">Ce plat est-il traduisible?</p>
                                <Info lines={["Décide si le nom du plat est traduisible automatiquement ou non."]}/>
                                <div className="flex items-center">
                                    <div className="flex items-center gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name={`traduisible${id}`} value="1" className="w-5 h-5 plat-traduisible-oui categorie-traduisible saveable-input accent-yellow-400" checked={traduisible === true} onChange={() => onChange(id, 'traduisible', true)}/>
                                            Oui
                                        </label>

                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name={`traduisible${id}`} value="0" className="w-5 h-5 plat-traduisible-non categorie-traduisible saveable-input accent-yellow-400" checked={traduisible !== true} onChange={() => onChange(id, 'traduisible', false)}/>
                                            Non
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={`flex flex-row space-x-2 w-full ${expand ? '' : 'hidden'}`}>
                        <div className="w-1/2 space-y-2 flex flex-col">
                            <p>Image du plat</p>
                            <Info lines={["Image représentant le plat"]}/>
                            <div className="flex">
                                <div className={`${(image && image !== '') ? 'hidden' : ''}`}>
                                    <input type="file" accept="image/*" className="plat-image rounded-xl p-2 focus:outline-none focus:ring-2 bg-gray-200 h-11 saveable-input w-full" onChange={(e) => { handleUploadImage(e.target.files[0]) }}/>
                                </div>
                                <div className={`relative ${(image && image !== '') ? '' : 'hidden'}`}>
                                    <img src={image === '' ? '/' : image} alt="Aucune image sélectionnée" className="w-full h-auto rounded-xl mt-2" />
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
                            </div>    
                        </div>
                        <div className={`w-full space-y-2 flex flex-col ${expand ? '' : 'hidden'}`}>
                            <p className="">Labels sur le plat</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className={`flex flex-col items-center space-y-2 rounded-lg ${labels.includes(1) ? 'bg-gray-200' : 'bg-gray-100'} p-3 pb-5 hover:bg-gray-300 cursor-pointer`} onClick={() => onLabelClick(1)}>
                                    <p className="text-sm">Fait maison</p>
                                    <img src="/src/assets/images/picto-fait-maison.png" alt="Fait Maison" className="w-10 h-10"/>
                                </div>
                                <div className={`flex flex-col items-center space-y-2 rounded-lg ${labels.includes(2) ? 'bg-gray-200' : 'bg-gray-100'} p-3 pb-5 hover:bg-gray-300 cursor-pointer`} onClick={() => onLabelClick(2)}>
                                    <p className="text-sm">AB Bio</p>
                                    <img src="/src/assets/images/picto-ab-bio.png" alt="AB Bio" className="w-10 h-10"/>
                                </div>
                                <div className={`flex flex-col items-center space-y-2 rounded-lg ${labels.includes(3) ? 'bg-gray-200' : 'bg-gray-100'} p-3 pb-5 hover:bg-gray-300 cursor-pointer`} onClick={() => onLabelClick(3)}>
                                    <p className="text-sm">Vegan</p>
                                    <img src="/src/assets/images/picto-vegan.png" alt="Vegan" className="w-10 h-10"/>
                                </div>
                                <div className={`flex flex-col items-center space-y-2 rounded-lg ${labels.includes(4) ? 'bg-gray-200' : 'bg-gray-100'} p-3 hover:bg-gray-300 cursor-pointer`} onClick={() => onLabelClick(4)}>
                                    <p className="text-sm">Veggie</p>
                                    <img src="/src/assets/images/picto-veggie.png" alt="Veggie" className="w-10 h-10"/>
                                </div>
                                <div className={`flex flex-col items-center space-y-2 rounded-lg ${labels.includes(5) ? 'bg-gray-200' : 'bg-gray-100'} p-3 pb-5 hover:bg-gray-300 cursor-pointer`} onClick={() => onLabelClick(5)}>
                                    <p className="text-sm">Végétarien</p>
                                    <img src="/src/assets/images/picto-vegetarien.png" alt="Végétarien" className="w-10 h-10"/>
                                </div>
                                <div className={`flex flex-col items-center space-y-2 rounded-lg ${labels.includes(6) ? 'bg-gray-200' : 'bg-gray-100'} p-3 hover:bg-gray-300 cursor-pointer`} onClick={() => onLabelClick(6)}>
                                    <p className="text-sm">Sans gluten</p>
                                    <img src="/src/assets/images/picto-sans-gluten.png" alt="Sans gluten" className="w-10 h-10"/>
                                </div>
                                <div className={`flex flex-col items-center space-y-2 rounded-lg ${labels.includes(7) ? 'bg-gray-200' : 'bg-gray-100'} p-3 hover:bg-gray-300 cursor-pointer`} onClick={() => onLabelClick(7)}>
                                    <p className="text-sm">Sans lactose</p>
                                    <img src="/src/assets/images/picto-sans-lactose.png" alt="Sans lactose" className="w-10 h-10"/>
                                </div>
                                <div className={`flex flex-col items-center space-y-2 rounded-lg ${labels.includes(8) ? 'bg-gray-200' : 'bg-gray-100'} p-3 hover:bg-gray-300 cursor-pointer`} onClick={() => onLabelClick(8)}>
                                    <p className="text-sm">Casher</p>
                                    <img src="/src/assets/images/picto-casher.png" alt="Casher" className="w-10 h-10"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative mt-4 flex items-center justify-center">
                    {/* The horizontal gray bar behind the buttons */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-gray-300"></div>
                    <div className="flex space-x-4 z-10">
                        <button onClick={() => onAdd(index)} type="button" aria-label="Add submenu" className="w-8 h-8 rounded-full bg-yellow-400 hover:bg-yellow-300 text-white flex items-center justify-center transition focus:outline-none focus:ring-2 focus:ring-yellow-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus" viewBox="0 0 16 16">
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                            </svg>
                        </button>
                        <button onClick={() => onDelete(id)} type="button" aria-label="Delete menu" className="w-8 h-8 rounded-full bg-yellow-400 hover:bg-yellow-300 text-white flex items-center justify-center transition focus:outline-none focus:ring-2 focus:ring-red-400 delete-menu-button">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24"stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}