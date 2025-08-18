import { useState, useRef, useEffect } from 'react';
import LangueSelectList from './select/LangueSelectList';

export default function LangueItem({ user, langue, index, id, onChange, onAdd, onDelete, onMouseDown, onClickClose }) {
    const [lang, setLangue] = useState(langue);
    const [langueSelect, setLangueSelect] = useState(false);
    const itemRef = useRef(null);

    useEffect(() => {
        itemRef.current = document.querySelector(`.langue-item[data-id="${id}"]`);
    }, [id]);

    const handleLanguageSelector = (event) => {
        setLangueSelect(true);
    };

    const handleLangueChange = (newLangue, newCode) => {
        setLangueSelect(false);
        setLangue(newLangue);
        onChange(id, newLangue, newCode);
    };

    return (
        <div data-id={id??Date.now()} data-index={index} className="flex items-start px-4 py-3 cursor-pointer drag-item langue-item">
            <div className="flex flex-col items-center mr-4 select-none rounded-xl">
                <div className="cursor-move w-11 h-11 rounded-full bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center transition drag-handle" onMouseDown={(e) => onMouseDown(e, index, itemRef.current)}>
                    <p>{index}</p>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrows-move" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M7.646.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 1.707V5.5a.5.5 0 0 1-1 0V1.707L6.354 2.854a.5.5 0 1 1-.708-.708zM8 10a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708L7.5 14.293V10.5A.5.5 0 0 1 8 10M.146 8.354a.5.5 0 0 1 0-.708l2-2a.5.5 0 1 1 .708.708L1.707 7.5H5.5a.5.5 0 0 1 0 1H1.707l1.147 1.146a.5.5 0 0 1-.708.708zM10 8a.5.5 0 0 1 .5-.5h3.793l-1.147-1.146a.5.5 0 0 1 .708-.708l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L14.293 8.5H10.5A.5.5 0 0 1 10 8"/>
                    </svg>
                </div> 
            </div>

            <div className="flex flex-col flex-grow">
                <div className="flex items-start justify-between flex-col space-y-2 relative">
                    <p className="menu-name rounded-xl p-2 focus:outline-none focus:ring-2 bg-gray-200 h-11 w-full saveable-input" onClick={(e) => handleLanguageSelector(e)}>{lang}</p>
                    {langueSelect ? <LangueSelectList id={user.id} setCategorieLangue={handleLangueChange} onClickClose={onClickClose} parent={itemRef.current} setLangueSelect={setLangueSelect}/> : ''}
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