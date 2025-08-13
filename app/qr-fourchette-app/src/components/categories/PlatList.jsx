import { useState } from "react";
import PlatItem from "./PlatItem.jsx";

export default function PlatList({ categorieId }) {
    const [plats, setPlats] = useState([]);

    function addPlat() {
        console.log("Adding new plat to category:", categorieId);
        const newPlat = {
            id: crypto.randomUUID(),
            index: plats.length + 1,
            name: "",
            description: "",
            prix: 0,
            traduisible: false,
            image: "",
            labels: [],
        };
        setPlats(prev => [...prev, newPlat]);
    }

    function removePlat(id) {
        setPlats(prev => prev.filter(plat => plat.id !== id));
    }

    return (
        <ul class="plat-list space-y-4 pb-5">
            {plats.map((plat) => (
                <PlatItem key={plat.id} {...plat} onRemovePlat={removePlat} />
            ))}
            <button
                id="add-menu-button"
                type="button"
                onClick={addPlat}
                class="ml-auto mt-6 flex items-center rounded-lg justify-center gap-3 px-4 py-3 bg-yellow-400 text-white font-semibold  focus:outline-none  transition relative"
            >
                <span
                class="w-8 h-8 rounded-full bg-yellow-400 text-white flex items-center justify-center flex-shrink-0"
                aria-hidden="true"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                    </svg>
                </span>

                <span class="relative z-10" onclick="addPlat()">Ajouter un plat</span>

                <span
                class="absolute left-0 right-0 top-1/2 border-t border-yellow-300 -z-10"
                ></span>
            </button>
        </ul>
    );
}