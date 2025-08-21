import { useState, useRef, useEffect } from 'react';
import EditCarte from '../../edit/EditCarte';
import VoirCarte from '../../voir/VoirCarte';


function useBreakpoint(breakpoint = 1280) {
    const [isXL, setIsXL] = useState(window.innerWidth >= breakpoint);

    useEffect(() => {
        const handleResize = () => setIsXL(window.innerWidth >= breakpoint);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [breakpoint]);

    return isXL;
}

export default function Dashboard({ user, onLogout, onMouseClick }) {
    const [visibleList, setVisibleList] = useState("edit");
    const clickCallbacks = useRef([]);
    const [expandedSidebar, setExpandedSidebar] = useState(true);

    const handleOnClickClose = (element, callback) => {
        clickCallbacks.current.push({element, callback});
        return () => {
            clickCallbacks.current = clickCallbacks.current.filter(cb => cb.element !== element);
        };
    };

    const handleSetVisibleList = (section) => {
        setVisibleList(section);
        window.location.hash = section;
    }

    const handleHashChange = () => {
        const hash = window.location.hash.replace('#', '') || 'edit';
        const firstPart = hash.split('/')[0];
        setVisibleList(firstPart);
    };

    useEffect(() => {
        handleHashChange();
    }, []);

    useEffect(() => {
        const handleClick = (e) => {
            clickCallbacks.current.forEach((cb) => {
                if (!!cb.element && !cb.element.contains(e.target)) {
                    cb.callback();
                }
            });
            clickCallbacks.current = [];
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    const isXL = useBreakpoint();

    return (
        <section className="bg-white flex h-[100%]">
            <aside className={`${expandedSidebar && isXL ? 'w-64 p-6' : 'w-20 p-5'} z-40 duration-300 bg-gray-100 shadow-lg flex flex-col space-y-4 fixed h-full`}>
                <div className={`${expandedSidebar && isXL ? 'flex-row' : 'flex-col-reverse'} duration-300 flex text-gray-600 justify-between items-center`}>
                    <div className="flex gap-2 items-center" onClick={onLogout}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={`${expandedSidebar && isXL ? '' : 'mt-5'} duration-300 bi bi-box-arrow-left`} viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M6 12.5a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v2a.5.5 0 0 1-1 0v-2A1.5 1.5 0 0 1 6.5 2h8A1.5 1.5 0 0 1 16 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 5 12.5v-2a.5.5 0 0 1 1 0z"/>
                            <path fillRule="evenodd" d="M.146 8.354a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L1.707 7.5H10.5a.5.5 0 0 1 0 1H1.707l2.147 2.146a.5.5 0 0 1-.708.708z"/>
                        </svg>
                        <p className={`${expandedSidebar && isXL ? 'block' : 'hidden'} duration-300`}>Déconnexion</p>
                    </div>
                    <div className={`${expandedSidebar && isXL ? '' : 'rotate-180'} bg-white rounded-full p-2 cursor-pointer duration-300`} onClick={() => setExpandedSidebar(!expandedSidebar)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-double-left" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M8.354 1.646a.5.5 0 0 1 0 .708L2.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
                            <path fillRule="evenodd" d="M12.354 1.646a.5.5 0 0 1 0 .708L6.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"/>
                        </svg>
                    </div>
                </div>
                
                <button className={`${expandedSidebar && isXL ? 'px-4 py-2' : 'py-2 pl-[10px]' } h-10 text-left rounded-xl flex items-center gap-2 hover:bg-orange-400 transition hover:text-white font-medium ${visibleList !== "edit" ? 'bg-gray-200 text-gray-700' : 'bg-orange-400 text-white'}`} id="edit-carte" onClick={() => handleSetVisibleList("edit")}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 448 512"><path fill="currentColor" d="M64 32C28.7 32 0 60.7 0 96v320c0 35.3 28.7 64 64 64h320c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64zm261.8 107.7l14.4 14.4c15.6 15.6 15.6 40.9 0 56.6l-21.4 21.4l-71-71l21.4-21.4c15.6-15.6 40.9-15.6 56.6 0M119.9 289l105.2-105.2l71 71l-105.2 105.1c-4.1 4.1-9.2 7-14.9 8.4l-60.1 15c-5.5 1.4-11.2-.2-15.2-4.2s-5.6-9.7-4.2-15.2l15-60.1c1.4-5.6 4.3-10.8 8.4-14.9z"/></svg>
                    <p className={`${expandedSidebar && isXL ? '' : 'hidden'} whitespace-nowrap overflow-hidden text-ellipsis`}>ÉDITER MA CARTE</p>
                </button >
                <button className={`${expandedSidebar && isXL ? 'px-4 py-2' : 'py-2 pl-[7px]' } h-10 text-left rounded-xl flex items-center gap-2 hover:bg-orange-400 transition hover:text-white font-medium bg-gray-200`} id="voir-carte" onClick={() => window.open(`/new-page/?userId=${user.id}`, "_blank")}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M16 18H8v-2h8zm0-6H8v2h8zm2-9h-2v2h2v15H6V5h2V3H6a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-4 2V4a2 2 0 1 0-4 0v1a2 2 0 0 0-2 2v1h8V7a2 2 0 0 0-2-2"/></svg>
                    <p className={`${expandedSidebar && isXL ? '' : 'hidden'} whitespace-nowrap overflow-hidden text-ellipsis`}>VOIR MA CARTE</p>
                </button>
                <button className={`${expandedSidebar && isXL ? 'px-4 py-2' : 'py-2 pl-[7px]' } h-10 text-left rounded-xl flex items-center gap-2 hover:bg-orange-400 transition hover:text-white font-medium ${visibleList !== "qr-code" ? 'bg-gray-200 text-gray-700' : 'bg-orange-400 text-white'}`} id="qr-code" onClick={() => handleSetVisibleList("qr-code")}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11.12 6.96v2.595a1.57 1.57 0 0 1-.968 1.484a1.6 1.6 0 0 1-.612.123h-2.6a1.59 1.59 0 0 1-1.59-1.577V6.99a1.585 1.585 0 0 1 1.59-1.587h2.6a1.59 1.59 0 0 1 1.58 1.557m0 7.495v2.595a1.585 1.585 0 0 1-1.58 1.587h-2.6a1.59 1.59 0 0 1-1.59-1.587v-2.595a1.585 1.585 0 0 1 1.59-1.577h2.6a1.58 1.58 0 0 1 1.58 1.577m7.54-7.495v2.595a1.585 1.585 0 0 1-1.54 1.607h-2.59a1.59 1.59 0 0 1-1.59-1.577V6.99a1.585 1.585 0 0 1 1.59-1.587h2.59a1.59 1.59 0 0 1 1.54 1.557m0 7.515v2.595a1.585 1.585 0 0 1-1.54 1.587h-2.59a1.59 1.59 0 0 1-1.59-1.587v-2.595a1.586 1.586 0 0 1 1.59-1.577h2.59a1.59 1.59 0 0 1 1.54 1.577"/><path fill="currentColor" d="M21.25 9.695a.76.76 0 0 1-.75-.749V5.862a2.3 2.3 0 0 0-.68-1.686a2.35 2.35 0 0 0-1.65-.679h-3.05a.75.75 0 0 1-.75-.748a.75.75 0 0 1 .75-.749h3.08a3.86 3.86 0 0 1 2.68 1.178A3.8 3.8 0 0 1 22 5.882v3.084a.75.75 0 0 1-.75.729M18.17 22h-3.05a.75.75 0 0 1-.75-.748a.75.75 0 0 1 .75-.749h3.08a2.32 2.32 0 0 0 2.137-1.462a2.3 2.3 0 0 0 .163-.893v-3.054a.75.75 0 0 1 .75-.749a.75.75 0 0 1 .75.749v3.054a3.81 3.81 0 0 1-2.363 3.534c-.465.191-.964.29-1.467.288zm-9.25 0H5.84a3.85 3.85 0 0 1-2.722-1.13A3.83 3.83 0 0 1 2 18.149v-3.054a.75.75 0 0 1 .75-.749a.75.75 0 0 1 .75.749v3.054a2.334 2.334 0 0 0 2.34 2.325h3.08a.75.75 0 0 1 .75.749a.747.747 0 0 1-.75.748zM2.75 9.695A.76.76 0 0 1 2 8.946V5.862a3.8 3.8 0 0 1 1.12-2.684A3.86 3.86 0 0 1 5.83 2.06h3.08a.75.75 0 0 1 .75.749a.75.75 0 0 1-.75.748H5.83a2.333 2.333 0 0 0-2.34 2.325v3.084a.75.75 0 0 1-.74.729"/></svg>
                    <p className={`${expandedSidebar && isXL ? '' : 'hidden'} whitespace-nowrap overflow-hidden text-ellipsis`}>MON QR CODE</p>
                </button>
                <button className={`${expandedSidebar && isXL ? 'px-4 py-2' : 'py-2 pl-[7px]' } h-10 text-left rounded-xl flex items-center gap-2 hover:bg-orange-400 transition hover:text-white font-medium ${visibleList !== "mes-infos" ? 'bg-gray-200 text-gray-700' : 'bg-orange-400 text-white'}`} id="mes-infos" onClick={() => handleSetVisibleList("infos")}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="6" r="4" fill="currentColor"/><path fill="currentColor" d="M20 17.5c0 2.485 0 4.5-8 4.5s-8-2.015-8-4.5S7.582 13 12 13s8 2.015 8 4.5"/></svg>
                    <p className={`${expandedSidebar && isXL ? '' : 'hidden'} whitespace-nowrap overflow-hidden text-ellipsis`}>MES INFOS</p>
                </button>
                <button className={`${expandedSidebar && isXL ? 'px-4 py-2' : 'py-2 pl-[7px]' } h-10 text-left rounded-xl flex items-center gap-2 hover:bg-orange-400 transition hover:text-white font-medium ${visibleList !== "mon-abonnement" ? 'bg-gray-200 text-gray-700' : 'bg-orange-400 text-white'}`} id="mon-abonnement" onClick={() => handleSetVisibleList("abonnement")}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m5.825 21l1.625-7.025L2 9.25l7.2-.625L12 2l2.8 6.625l7.2.625l-5.45 4.725L18.175 21L12 17.275z"/></svg>
                    <p className={`${expandedSidebar && isXL ? '' : 'hidden'} whitespace-nowrap overflow-hidden text-ellipsis`}>MON ABONNEMENT</p>
                </button>
                <button className={`${expandedSidebar && isXL ? 'px-4 py-2' : 'py-2 pl-[7px]' } h-10 text-left rounded-xl flex items-center gap-2 hover:bg-orange-400 transition hover:text-white font-medium ${visibleList !== "mes-factures" ? 'bg-gray-200 text-gray-700' : 'bg-orange-400 text-white'}`} id="mes-factures" onClick={() => handleSetVisibleList("factures")}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.5 9h4m-4 5h4m-4-10h16m.036 13.036L21.5 20M20 13.5a5 5 0 1 0-10 0a5 5 0 0 0 10 0"/></svg>
                    <p className={`${expandedSidebar && isXL ? '' : 'hidden'} whitespace-nowrap overflow-hidden text-ellipsis`}>MES FACTURES</p>
                </button>
            </aside>

            <main className={`${expandedSidebar && isXL ? 'pl-64' : 'pl-24' } duration-300 transition flex-1 p-8 relative`}>
                <div id="dashboard-content" data-userid={`${user.id}`} className=" p-6 min-h-[400px]">
                    {visibleList === "edit" && ( <EditCarte user={user} onClickClose={handleOnClickClose} expandedSidebar={expandedSidebar} isXL={isXL} /> )}
                </div>
            </main>
        </section>
    );
}
