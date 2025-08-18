import { useState, useEffect, useRef } from 'react';
import CategorieItem from './CategorieItem';
import Header from '../Header';

const TOKEN_KEY = 'auth_token'

export default function CategorieList({ user, onMouseDown }) {
    const timeoutRefs = useRef([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [categorieItems, setCategorieItems] = useState([]);

    const list = useRef(null);
    useEffect(() => {
        list.current = document.getElementById('categorie-list');
    }, []);

    useEffect(() => {
        if (!user) return;

        async function fetchCategorie() {
            try {
                setLoading(true);
                const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/api/carte/categorie/${user.id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
                    },
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load categories');
                }
                setCategorieItems(data.categories || []);
            } catch (err) {
                console.error(err);
                setError(err.message || 'Error loading categories');
            } finally {
                setLoading(false);
            }
        }

        fetchCategorie();
    }, [user]);

    const updateField = async (categorieId, field, value) => {
        const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/api/carte/categorie/${user.id}/${categorieId}/${field}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            },
            body: JSON.stringify({ value }),
        });

        if (!response.ok) {
            throw new Error('Failed to update menu field');
        }
    };

    const updateCategorieNumbers = async (items) => {
        const updatedItems = items.map((item, i) => ({
            ...item,
            number: i + 1
        }));

        const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/api/carte/categorie/${user.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            },
            body: JSON.stringify(updatedItems),
        });

        if (!response.ok) {
            throw new Error('Failed to update categorie items');
        }

        setCategorieItems(updatedItems);
    }

    const handleAddCategorieItem = async (index) => {
        const newItem = {
            number: index,
            name: '',
            description: '',
            icon: '',
            traduisible: false,
        };

        const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/api/carte/categorie/${user.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            },
            body: JSON.stringify({ categorieData: newItem }),
        });

        if (!response.ok) {
            throw new Error('Failed to add categorie item');
        }

        const data = await response.json();
        const categorie = data.categorie;

        const newCategorieItems = [...categorieItems];
        newCategorieItems.splice(index, 0, categorie);

        if (index === newCategorieItems.length) {
            setCategorieItems(newCategorieItems);
        } else {
            updateCategorieNumbers(newCategorieItems);
        }
    };

    const handleDeleteCategorieItem = async (id) => {
        let categorie = categorieItems.find(item => item.id === id);
        let isCategorieAtEnd = categorie.number === categorieItems.length;

        const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/api/carte/categorie/${user.id}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete categorie item');
        }

        const newCategorieItems = categorieItems.filter(item => item.id !== id);

        if (isCategorieAtEnd) {
            setCategorieItems(newCategorieItems);
        } else {
            updateCategorieNumbers(newCategorieItems);
        }
    };

    const handleChange = (id, field, newValue) => {
        setCategorieItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, [field]: newValue } : item
            )
        );

        let key = id + "-" + field;
        if (timeoutRefs.current[key]) {
            clearTimeout(timeoutRefs.current[key]);
        }

        timeoutRefs.current[key] = setTimeout(() => {
            updateField(id, field, newValue);
        }, 500);
    };

    const handleDragStart = (draggedItem, placeholder) => {
        list.current.insertBefore(placeholder, draggedItem);
    }

    const handleDragUpdate = (draggedItem, e, setHoverIndex) => {
        let dragItems = list.current.querySelectorAll(`.categorie-item`);
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

                const siblings = Array.from(item.parentElement.querySelectorAll(`.categorie-item, .placeholder`));
                setHoverIndex(siblings.indexOf(placeholder));
            }
        });
    }

    const handleDragEnd = (draggedItem, currentIndex, hoverIndex) => {
        let placeholder = list.current.querySelector('.placeholder');
        list.current.insertBefore(draggedItem, placeholder);

        const updatedCategorieItems = [...categorieItems];
        const [movedItem] = updatedCategorieItems.splice(currentIndex, 1);
        updatedCategorieItems.splice(hoverIndex, 0, movedItem);
        updateCategorieNumbers(updatedCategorieItems);
    }

    const handleMouseDown = (e, index, item) => {
        onMouseDown(e, index, item, handleDragStart, handleDragUpdate, handleDragEnd);
    }

    return (
        <Header header="VOS PRODUITS">
            <p className="pt-2 pl-5 text-xs flex gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-question-circle-fill" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.496 6.033h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247m2.325 6.443c.61 0 1.029-.394 1.029-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94 0 .533.425.927 1.01.927z"/>
                </svg>
            Les catégories de plats présents sur votre carte.</p>
            <p className="pl-11 text-xs">Ex. Salade, viandes, poissons</p>
            <ul id="categorie-list" className="space-y-4 pb-5">
                {categorieItems.map((categorie) => (
                    <CategorieItem key={categorie.id} user={user} id={categorie.id} index={categorie.number} name={categorie.name} description={categorie.description} icon={categorie.icon} traduisible={categorie.traduisible} 
                        onChange={handleChange} 
                        onAdd={handleAddCategorieItem}
                        onDelete={handleDeleteCategorieItem}
                        onMouseDown={handleMouseDown} 
                        platOnMouseDown={onMouseDown}
                    />
                ))}

                <button id="add-menu-button" type="button" className="ml-auto mt-6 mr-5 flex items-center rounded-lg justify-center gap-3 px-4 py-3 bg-gray-900 text-white font-semibold  focus:outline-none  transition relative" onClick={() => handleAddCategorieItem(categorieItems.length + 1)}>
                    <span className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-plus-circle" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                        </svg>
                    </span>

                    <span className="relative z-10">Creer une catégorie</span>

                    <span className="absolute left-0 right-0 top-1/2 border-t border-orange-300 -z-10"></span>
                </button>
            </ul>
        </Header>
    );
}