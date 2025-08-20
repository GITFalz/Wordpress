import { useState, useRef, useEffect } from 'react';
import IconSelectList from './select/IconSelectList';
import PlatList from './PlatList.jsx';

export default function CategorieItem({ user, name, description, icon, traduisible, index, id, onChange, onAdd, onDelete, onMouseDown, platOnMouseDown }) {
    const [expand, setExpand] = useState(false);
    const [iconName, setIconName] = useState(icon);
    const [iconImage, setIconImg] = useState(icon);
    const [iconSelect, setIconSelect] = useState(false);
    const [icons, setIcons] = useState([]);

    const iconImg = useRef(null);
    const iconInput = useRef(null);
    const iconDebounce = useRef(0);
    const itemRef = useRef(null);

    useEffect(() => {
        iconImg.current = document.querySelector(`.categorie-item[data-id="${id}"] .categorie-icon-img`);
        iconInput.current = document.querySelector(`.categorie-item[data-id="${id}"] .categorie-icon`);
    });

    useEffect(() => {
        itemRef.current = document.querySelector(`.categorie-item[data-id="${id}"]`);
    }, [id]);

    const searchIcons = async (query) => {
        const url = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=20`;
        const res = await fetch(url);
        const data = await res.json();
        return data.icons || [];
    }

    const searchAndDisplayIcons = async (input) => {
        let value = input.value;
        setIconName(value);
        if (value.length < 1) {
            setIcons([]);
            setIconSelect(false);
            return;
        }
        
        clearTimeout(iconDebounce.current);
        iconDebounce.current = setTimeout(async () => {
            let categorieItem = input.closest('.drag-item');
            if (categorieItem) {    
                const icons = await searchIcons(value);
                if (icons.length > 0) {
                    setIcons(icons);
                    if (!iconSelect) setIconSelect(true);
                } else {
                    setIconSelect(false);
                }
            }
        }, 300);
    }

    const setCategorieIcon = (icon) => {
        setIconName(icon);
        setIconImg(icon);
        setIconSelect(false);
        onChange(id, 'icon', icon);
    }

    const deleteCategorieIcon = () => {
        setIconName('');
        setIconImg('');
        setIconSelect(false);
        onChange(id, 'icon', '');
    }

    return (
        <div data-id={id} data-index={index} className="flex items-start px-4 py-3 cursor-pointer drag-item categorie-item">
            <div className="flex flex-col items-center mr-4 select-none rounded-xl">
                <div className="cursor-move w-11 h-11 rounded-full bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center transition drag-handle" onMouseDown={(e) => onMouseDown(e, index, itemRef.current)}>
                    <p>{index}</p>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrows-move" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M7.646.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 1.707V5.5a.5.5 0 0 1-1 0V1.707L6.354 2.854a.5.5 0 1 1-.708-.708zM8 10a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708L7.5 14.293V10.5A.5.5 0 0 1 8 10M.146 8.354a.5.5 0 0 1 0-.708l2-2a.5.5 0 1 1 .708.708L1.707 7.5H5.5a.5.5 0 0 1 0 1H1.707l1.147 1.146a.5.5 0 0 1-.708.708zM10 8a.5.5 0 0 1 .5-.5h3.793l-1.147-1.146a.5.5 0 0 1 .708-.708l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L14.293 8.5H10.5A.5.5 0 0 1 10 8"/>
                    </svg>
                </div>
                <button type="button" aria-label="Add" className={`${expand ? 'hidden' : ''} expand-categorie-item mt-2 w-8 h-8 rounded-full bg-orange-400 hover:bg-orange-300 text-white transition focus:outline-none focus:ring-2 focus:ring-orange-400 toggle-menu-button`} onClick={() => setExpand(true)}>
                    <div className="flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil-fill" viewBox="0 0 16 16">
                            <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
                        </svg>
                    </div>
                </button>
                <button type="button" aria-label="Add" className={`${expand ? '' : 'hidden'} collapse-categorie-item mt-2 w-8 h-8 rounded-full bg-orange-400 hover:bg-orange-300 text-white transition focus:outline-none focus:ring-2 focus:ring-orange-400 toggle-menu-button`} onClick={() => setExpand(false)}>
                    <div className="flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-double-up" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M7.646 2.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 3.707 2.354 9.354a.5.5 0 1 1-.708-.708z"/>
                            <path fillRule="evenodd" d="M7.646 6.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 7.707l-5.646 5.647a.5.5 0 0 1-.708-.708z"/>
                        </svg>
                    </div>
                </button>     
            </div>

            <div className="flex flex-col flex-grow">
                <div className="flex items-start justify-between flex-col space-y-2">
                    <div className="flex flex-row space-x-2 w-full">
                        <div className="w-full space-y-2 flex flex-col">
                            <p className={`${expand ? '' : 'hidden'}`}>Nom du menu</p>
                            <input type="text" name="name" placeholder="Menu name" className="categorie-name rounded-xl p-2 focus:outline-none focus:ring-2 bg-gray-200 h-11 w-full saveable-input" value={name} onChange={(e) => onChange(id, 'name', e.target.value)}/>
                        </div>
                        <div className={`${expand ? '' : 'hidden'} w-full space-y-2 flex flex-col`}>
                            <p className="">Icône de la catégorie</p>
                            <div className="flex flex-row justify-center items-center gap-5 pl-2 relative text-xs">
                                <div className="delete-icon bg-red-600 rounded-full text-white absolute left-0 top-0" onClick={deleteCategorieIcon}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-x" viewBox="0 0 16 16">
                                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                                    </svg>
                                </div>
                                <img src={iconName ? `https://api.iconify.design/${iconImage}.svg` : ''} alt="Aucune icône" className="categorie-icon-img w-8 h-8" />
                                <input type="text" name="icon" placeholder="Menu icon" className="categorie-icon rounded-xl p-2 focus:outline-none focus:ring-2 bg-gray-200 h-11 w-full" value={iconName} onChange={(e) => searchAndDisplayIcons(e.target)}/>
                                {iconSelect ? <IconSelectList setCategorieIcon={setCategorieIcon} parent={itemRef.current} /> : ''}
                            </div>
                        </div>
                    </div>
                    <div className={`${expand ? '' : 'hidden'} w-full`}>
                        <div className="flex flex-row space-x-2 w-full">
                            <div className="w-full space-y-2 flex flex-col">
                                <p>Description de la catégorie</p>
                                <textarea name="description" placeholder="Menu description" className="categorie-description rounded-xl p-2 focus:outline-none focus:ring-2 bg-gray-200 h-32 w-full saveable-input" value={description} onChange={(e) => onChange(id, 'description', e.target.value)}/>
                            </div>
                            <div className="w-full space-y-2 flex flex-col">
                                <p className="">Cette catégorie est-elle traduisible?</p>
                                <div className="flex items-center">
                                    <div className="flex items-center gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name={`traduisible${id}`} value="1" className="w-5 h-5 categorie-traduisible-oui categorie-traduisible saveable-input" checked={traduisible === true} onChange={(e) => onChange(id, 'traduisible', true)}/>
                                            Oui
                                        </label>

                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name={`traduisible${id}`} value="0" className="w-5 h-5 categorie-traduisible-non categorie-traduisible saveable-input" checked={traduisible !== true} onChange={(e) => onChange(id, 'traduisible', false)}/>
                                            Non
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex w-full pt-5">
                            <div className="w-full edit-info categorie-plats-info">
                                <h3 className="text-xl font-semibold text-white bg-yellow-400 p-5 rounded-t-xl">LES PLATS DE LA CATÉGORIE</h3>
                                <PlatList user={user} categorieId={id} onMouseDown={platOnMouseDown} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative mt-4 flex items-center justify-center">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-gray-300"></div>

                    <div className="flex space-x-4 z-10">
                        <button type="button" aria-label="Add submenu" className="w-8 h-8 rounded-full bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center transition focus:outline-none focus:ring-2 focus:ring-orange-400" onClick={() => onAdd(index)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus" viewBox="0 0 16 16">
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                            </svg>
                        </button>
                        <button type="button" aria-label="Delete menu" className="w-8 h-8 rounded-full bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center transition focus:outline-none focus:ring-2 focus:ring-red-400 delete-menu-button" onClick={() => onDelete(id)}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}