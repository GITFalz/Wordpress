import { useState, useEffect, useRef } from 'react';
import PlatItem from "./PlatItem.jsx";

const TOKEN_KEY = 'auth_token'

export default function PlatList({ user, categorieId, onMouseDown }) {
    const timeoutRefs = useRef([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [platItems, setPlatItems] = useState([]);

    const list = useRef(null);
    useEffect(() => {
        list.current = document.querySelector(`.categorie-item[data-id="${categorieId}"] .plat-list`); 
    }, []);

    useEffect(() => {
        if (!user) return;

        async function fetchPlats() {
            try {
                setLoading(true);
                const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/api/carte/categorie/plat/${user.id}/${categorieId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
                    },
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load plats');
                }
                setPlatItems(data.plats || []);
            } catch (err) {
                console.error(err);
                setError(err.message || 'Error loading plats');
            } finally {
                setLoading(false);
            }
        }

        fetchPlats();
    }, [user]);

    const updateField = async (platId, field, value, replacement = null) => {
        if (value === '' && replacement !== null) {
            value = replacement;
        }
        const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/api/carte/categorie/plat/${user.id}/${platId}/${field}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            },
            body: JSON.stringify({ value }),
        });

        if (!response.ok) {
            throw new Error('Failed to update plat field');
        }
    };

    const updatePlatNumbers = async (items) => {
        const updatedItems = items.map((item, i) => ({
            ...item,
            number: i + 1
        }));

        const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/api/carte/categorie/plat/${user.id}/${categorieId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            },
            body: JSON.stringify(updatedItems),
        });

        if (!response.ok) {
            throw new Error('Failed to update plat items');   
        }

        setPlatItems(updatedItems);
    }

    const handleAddPlatItem = async (index) => {
        const newItem = {
            number: index,
            name: '',
            description: '',
            image: '',
            traduisible: false,
            prix: 0
        };

        const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/api/carte/categorie/plat/${user.id}/${categorieId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            },
            body: JSON.stringify({ platData: newItem }),
        });

        if (!response.ok) {
            throw new Error('Failed to add plat item');
        }

        const data = await response.json();
        const plat = data.plat;

        const newPlatItems = [...platItems];
        newPlatItems.splice(index, 0, plat);

        if (index === newPlatItems.length) {
            setPlatItems(newPlatItems);
        } else {
            updatePlatNumbers(newPlatItems);
        }
    };

    const handleDeletePlatItem = async (id) => {
        let plat = platItems.find(item => item.id === id);
        let isPlatAtEnd = plat.number === platItems.length;

        const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/api/carte/categorie/plat/${user.id}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete plat item');
        }

        const newPlatItems = platItems.filter(item => item.id !== id);

        if (isPlatAtEnd) {
            setPlatItems(newPlatItems);
        } else {
            updatePlatNumbers(newPlatItems);
        }
    };

    const handleChange = (id, field, newValue, replacement = null) => {
        setPlatItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, [field]: newValue } : item
            )
        );

        let key = id + "-" + field;
        if (timeoutRefs.current[key]) {
            clearTimeout(timeoutRefs.current[key]);
        }

        timeoutRefs.current[key] = setTimeout(() => {
            updateField(id, field, newValue, replacement);
        }, 500);
    };

    const handleDragStart = (draggedItem, placeholder) => {
        list.current.insertBefore(placeholder, draggedItem);
    }

    const handleDragUpdate = (draggedItem, e, setHoverIndex) => {
        let dragItems = list.current.querySelectorAll(`.plat-item`);
        let placeholder = list.current.querySelector('.placeholder');

        dragItems.forEach(item => {
            if (item === draggedItem) return;
            let { top, bottom } = item.getBoundingClientRect();
            if (e.clientY > top && e.clientY < bottom) {
                placeholder.remove();

                if (e.clientY > (top + bottom) / 2) {
                    item.parentElement.insertBefore(placeholder, item.nextSibling);
                } else {
                    item.parentElement.insertBefore(placeholder, item);
                }

                const siblings = Array.from(item.parentElement.querySelectorAll(`.plat-item, .placeholder`));
                setHoverIndex(siblings.indexOf(placeholder));
            }
        });
    }

    const handleDragEnd = (draggedItem, currentIndex, hoverIndex) => {
        let placeholder = list.current.querySelector('.placeholder');
        list.current.insertBefore(draggedItem, placeholder);

        const updatedPlatItems = [...platItems];
        const [movedItem] = updatedPlatItems.splice(currentIndex, 1);
        updatedPlatItems.splice(hoverIndex, 0, movedItem);
        updatePlatNumbers(updatedPlatItems);
    }

    const handleMouseDown = (e, index, item) => {
        onMouseDown(e, index, item, handleDragStart, handleDragUpdate, handleDragEnd);
    }

    return (
        <ul className="plat-list space-y-4 pb-5">
            {platItems.map((plat) => (
                <PlatItem key={plat.id} user={user} id={plat.id} index={plat.number} name={plat.name} description={plat.description} image={plat.image} prix={plat.prix} traduisible={plat.traduisible} 
                    onChange={handleChange} 
                    onAdd={handleAddPlatItem}
                    onDelete={handleDeletePlatItem}
                    onMouseDown={handleMouseDown} 
                />
            ))}
            <button id="add-menu-button" type="button" onClick={() => handleAddPlatItem(platItems.length + 1)} className="ml-auto mt-6 flex items-center rounded-lg justify-center gap-3 px-4 py-3 bg-yellow-400 text-white font-semibold  focus:outline-none  transition relative">
                <span className="w-8 h-8 rounded-full bg-yellow-400 text-white flex items-center justify-center flex-shrink-0" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-plus-circle" viewBox="0 0 16 16">
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                    </svg>
                </span>

                <span className="relative z-10" >Ajouter un plat</span>

                <span className="absolute left-0 right-0 top-1/2 border-t border-yellow-300 -z-10"></span>
            </button>
        </ul>
    );
}