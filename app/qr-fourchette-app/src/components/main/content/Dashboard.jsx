import { useState } from 'react';
import EditCarte from '../../edit/EditCarte';

export default function Dashboard({ user, onLogout }) {
    const [visibleList, setVisibleList] = useState("edit");

    return (
        <div>
            <section className="min-h-screen bg-gray-50 flex">
                <aside className="w-64 bg-white shadow-lg p-6 flex flex-col space-y-4">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Bonjour, {user.username} 👋</h2>
                    
                    <button className="text-left px-4 py-2 rounded hover:bg-gray-100 transition text-gray-700 font-medium" id="edit-carte" onClick={() => setVisibleList("edit")}>ÉDITER MA CARTE</button>
                    <button className="text-left px-4 py-2 rounded hover:bg-gray-100 transition text-gray-700 font-medium" id="voir-carte" onClick={() => setVisibleList("carte")}>VOIR MA CARTE</button>
                    <button className="text-left px-4 py-2 rounded hover:bg-gray-100 transition text-gray-700 font-medium" id="qr-code" onClick={() => setVisibleList("qr-code")}>MON QR CODE</button>
                    <button className="text-left px-4 py-2 rounded hover:bg-gray-100 transition text-gray-700 font-medium" id="mes-infos" onClick={() => setVisibleList("infos")}>MES INFOS</button>
                    <button className="text-left px-4 py-2 rounded hover:bg-gray-100 transition text-gray-700 font-medium" id="mon-abonnement" onClick={() => setVisibleList("abonnement")}>MON ABONNEMENT</button>
                    <button className="text-left px-4 py-2 rounded hover:bg-gray-100 transition text-gray-700 font-medium" id="mes-factures" onClick={() => setVisibleList("factures")}>MES FACTURES</button>

                    <hr className="my-4" />

                    <button type="button" className="mt-auto bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition" onClick={onLogout}>Déconnexion</button>
                </aside>

                <main className="flex-1 p-8">
                    <div id="dashboard-content" data-userid={`${user.id}`} className="bg-white rounded shadow p-6 min-h-[400px]">
                        <div className={visibleList === "edit" ? "block" : "hidden"}>
                            <EditCarte user={user} />
                        </div>
                    </div>
                </main>
            </section>

            <div id="save-button" className="hidden fixed bottom-4 right-4 button-save text-white bg-green-600 rounded-lg flex-row justify-center items-center px-5 py-3 text-2xl hover:scale-110 ease-in-out duration-300 transition cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" className="bi bi-floppy-fill" viewBox="0 0 16 16">
                    <path d="M0 1.5A1.5 1.5 0 0 1 1.5 0H3v5.5A1.5 1.5 0 0 0 4.5 7h7A1.5 1.5 0 0 0 13 5.5V0h.086a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5H14v-5.5A1.5 1.5 0 0 0 12.5 9h-9A1.5 1.5 0 0 0 2 10.5V16h-.5A1.5 1.5 0 0 1 0 14.5z"/>
                    <path d="M3 16h10v-5.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5zm9-16H4v5.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5zM9 1h2v4H9z"/>
                </svg>
                <p className="ml-3 text-center">
                    Enregistrer
                </p>
            </div>
        </div>
    );
}
