import { useState, useRef } from "react";   
import MenuList from "./menu/MenuList";
import CategorieList from "./categories/CategorieList";
import InfoComplementaire from "./infos/InfoComplementaire";
import Logo from "./logo/Logo";
import StylesCarte from "./styles/StylesCarte";
import LanguesList from "./langues/LanguesList";

export default function EditCarte({ user, onClickClose }) {
    const [visibleList, setVisibleList] = useState(["menu"]);
    
    const draggedItem = useRef(null);
    const offset = useRef({ x: 0, y: 0 });
    const currentIndex = useRef(null);
    const hoverIndex = useRef(null);    
    const update = useRef(null);
    const callback = useRef(null);

    const getPlaceholder = (width, height) => {
        let placeholder = document.createElement('div');
        placeholder.style.width = `${width}px`;
        placeholder.style.height = `${height}px`;
        placeholder.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
        placeholder.classList.add('placeholder');
        return placeholder;
    }

    const handleMouseDown = (e, index, item, addDrag, updateDrag, callbackDrag) => {
        e.preventDefault();
        const rect = item.getBoundingClientRect();
        offset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        item.style.left = `${e.clientX - offset.current.x + window.scrollX}px`;
        item.style.top = `${e.clientY - offset.current.y + window.scrollY}px`;
        item.classList.add('bg-white');
        item.style.width = `${rect.width}px`;
        item.style.position = 'absolute';
        item.style.zIndex = 1000;
        item.style.pointerEvents = 'none';

        let placeholder = getPlaceholder(rect.width, rect.height);
        addDrag(item, placeholder);

        draggedItem.current = item;
        currentIndex.current = index;
        hoverIndex.current = index;
        update.current = updateDrag;
        callback.current = callbackDrag;

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleSetHoverIndex = (index) => { hoverIndex.current = index; };

    const handleMouseMove = (e) => {
        if (!draggedItem.current) return;

        update.current(draggedItem.current, e, handleSetHoverIndex);

        draggedItem.current.style.left = `${e.clientX - offset.current.x + window.scrollX}px`;
        draggedItem.current.style.top = `${e.clientY - offset.current.y + window.scrollY}px`;
    };

    const handleMouseUp = () => {
        if (!draggedItem) return;

        draggedItem.current.style.position = '';
        draggedItem.current.style.zIndex = '';
        draggedItem.current.style.pointerEvents = '';
        draggedItem.current.style.left = '';
        draggedItem.current.style.top = '';
        draggedItem.current.classList.remove('bg-white');
        draggedItem.current.style.width = '';

        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);

        let c = parseInt(currentIndex.current);
        let h = parseInt(hoverIndex.current);

        if (c !== h) {
            callback.current(draggedItem.current, c-1, h-(c<h?1:0));
        }

        let placeholder = document.querySelector('.placeholder');
        placeholder.remove();

        draggedItem.current = null;
        currentIndex.current = null;
        hoverIndex.current = null;
        update.current = null;
        callback.current = null;
    };

    return (
        <section className="w-full min-h-screen flex items-start justify-center py-12 px-4">
            <div className="w-full max-w-5xl space-y-10">
                <header className="text-center relative">
                    <h1 className="text-3xl font-bold text-black border-b-10 border-orange-400 inline-block">
                        Je remplis & personnalise ma carte
                    </h1>
                    <p className="text-gray-600">
                    </p>
                </header>
                <div className="grid grid-rows-1 md:grid-cols-2">
                    <div className="bg-white relative border-r-2 inline-block">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">
                                Je remplis ma carte
                            </h2>
                            <div className="grid grid-cols-1 gap-3">
                                <button className="button-menus w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition active:bg-orange-400 bg-gray-100 hover:bg-orange-300 hover:text-white" onClick={() => setVisibleList("menu")}>
                                    <div className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-newspaper" viewBox="0 0 16 16">
                                            <path d="M0 2.5A1.5 1.5 0 0 1 1.5 1h11A1.5 1.5 0 0 1 14 2.5v10.528c0 .3-.05.654-.238.972h.738a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 1 1 0v9a1.5 1.5 0 0 1-1.5 1.5H1.497A1.497 1.497 0 0 1 0 13.5zM12 14c.37 0 .654-.211.853-.441.092-.106.147-.279.147-.531V2.5a.5.5 0 0 0-.5-.5h-11a.5.5 0 0 0-.5.5v11c0 .278.223.5.497.5z"/>
                                            <path d="M2 3h10v2H2zm0 3h4v3H2zm0 4h4v1H2zm0 2h4v1H2zm5-6h2v1H7zm3 0h2v1h-2zM7 8h2v1H7zm3 0h2v1h-2zm-3 2h2v1H7zm3 0h2v1h-2zm-3 2h2v1H7zm3 0h2v1h-2z"/>
                                        </svg>
                                        <span className="font-medium">Menus à la carte</span>
                                    </div>
                                    <span className="font-bold" aria-hidden="true">
                                        <svg className="stroke-current" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                            viewBox="0 0 24 24" fill="none" strokeWidth="2"
                                            strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 18l6-6-6-6"/>
                                        </svg>
                                    </span>
                                </button>
                                <button className="button-categories w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition active:bg-orange-400 bg-gray-100 hover:bg-orange-300 hover:text-white" onClick={() => setVisibleList("categories")}>
                                    <div className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-card-checklist" viewBox="0 0 16 16">
                                            <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2z"/>
                                            <path d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0M7 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0"/>
                                        </svg>
                                        <span className="font-medium">Vos produits</span>
                                    </div>
                                    <span className=" font-bold" aria-hidden="true">
                                        <svg className="stroke-current" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                            viewBox="0 0 24 24" fill="none" strokeWidth="2"
                                            strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 18l6-6-6-6"/>
                                        </svg>
                                    </span>
                                </button>
                                <button className="button-infos w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition active:bg-orange-400 bg-gray-100 hover:bg-orange-300 hover:text-white" onClick={() => setVisibleList("infos")}>
                                    <div className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-info-circle-fill" viewBox="0 0 16 16">
                                            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2"/>
                                        </svg>
                                        <span className="font-medium">Infos complémentaires</span>
                                    </div>
                                    <span className=" font-bold" aria-hidden="true">
                                        <svg className="stroke-current" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                            viewBox="0 0 24 24" fill="none" strokeWidth="2"
                                            strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 18l6-6-6-6"/>
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xlrelative">
                        <div className="absolute left-0 top-0 h-full w-1 bg-orange-400 rounded-l-xl"></div>
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">
                                Je personnalise ma carte
                            </h2>
                            <div className="grid grid-cols-1 gap-3">
                                <button className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition active:bg-orange-400 bg-gray-100 hover:bg-orange-300 hover:text-white" onClick={() => setVisibleList("logo")}>
                                    <div className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-card-image" viewBox="0 0 16 16">
                                            <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
                                            <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2zm13 1a.5.5 0 0 1 .5.5v6l-3.775-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12v.54L1 12.5v-9a.5.5 0 0 1 .5-.5z"/>
                                        </svg>
                                        <span className="font-medium">Choix du logo</span>
                                    </div>
                                    <span className=" font-bold" aria-hidden="true">
                                        <svg className="stroke-current" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                            viewBox="0 0 24 24" fill="none" strokeWidth="2"
                                            strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 18l6-6-6-6"/>
                                        </svg>
                                    </span>
                                </button>
                                <button className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition active:bg-orange-400 bg-gray-100 hover:bg-orange-300 hover:text-white" onClick={() => setVisibleList("styles")}>
                                    <div className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-pen" viewBox="0 0 16 16">
                                            <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
                                        </svg>
                                        <span className="font-medium">Typographies & couleurs</span>
                                    </div>
                                    <span className="font-bold" aria-hidden="true">
                                        <svg className="stroke-current" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                            viewBox="0 0 24 24" fill="none" strokeWidth="2"
                                            strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 18l6-6-6-6"/>
                                        </svg>
                                    </span>
                                </button>
                                <button className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition active:bg-orange-400 bg-gray-100 hover:bg-orange-300 hover:text-white" onClick={() => setVisibleList("languages")}>
                                    <div className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-chat" viewBox="0 0 16 16">
                                            <path d="M2.678 11.894a1 1 0 0 1 .287.801 11 11 0 0 1-.398 2c1.395-.323 2.247-.697 2.634-.893a1 1 0 0 1 .71-.074A8 8 0 0 0 8 14c3.996 0 7-2.807 7-6s-3.004-6-7-6-7 2.808-7 6c0 1.468.617 2.83 1.678 3.894m-.493 3.905a22 22 0 0 1-.713.129c-.2.032-.352-.176-.273-.362a10 10 0 0 0 .244-.637l.003-.01c.248-.72.45-1.548.524-2.319C.743 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.52.263-1.639.742-3.468 1.105"/>
                                        </svg>
                                        <span className="font-medium">Choix des langues</span>
                                    </div>
                                    <span className="font-bold" aria-hidden="true">
                                        <span className=" font-bold" aria-hidden="true">
                                            <svg className="stroke-current" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                viewBox="0 0 24 24" fill="none" strokeWidth="2"
                                                strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M9 18l6-6-6-6"/>
                                            </svg>
                                        </span>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="edit-carte-content" className="rounded-t-xl bg-[#f6f3f0]">
                    <div className={visibleList === "menu" ? "block" : "hidden"}>
                        <MenuList user={user} onMouseDown={handleMouseDown}/>
                    </div>
                    <div className={visibleList === "categories" ? "block" : "hidden"}>
                        <CategorieList user={user} onMouseDown={handleMouseDown}/>
                    </div>
                    <div className={visibleList === "infos" ? "block" : "hidden"}>
                        <InfoComplementaire user={user} onMouseDown={handleMouseDown}/>
                    </div>
                    <div className={visibleList === "logo" ? "block" : "hidden"}>
                        <Logo user={user} onMouseDown={handleMouseDown}/>
                    </div>
                    <div className={visibleList === "styles" ? "block" : "hidden"}>
                        <StylesCarte user={user} onMouseDown={handleMouseDown} onClickClose={onClickClose}/>
                    </div>
                    <div className={visibleList === "languages" ? "block" : "hidden"}>
                        <LanguesList user={user} onMouseDown={handleMouseDown} onClickClose={onClickClose}/>
                    </div>
                </div>
            </div>
        </section>
    );
}