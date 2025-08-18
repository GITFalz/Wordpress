import { useRef, useEffect, useState } from 'react';
import LangueItem from './LangueItem';
import Header from '../Header';

const TOKEN_KEY = 'auth_token'

export default function LanguesList({ user, onMouseDown, onClickClose }) {
    const timeoutRefs = useRef([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [langueItems, setLangueItems] = useState([]);

    const list = useRef(null);
    useEffect(() => {
        list.current = document.getElementById('langue-list');
    }, []);

    useEffect(() => {
        if (!user) return;

        async function fetchLangues() {
            try {
                setLoading(true);
                const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/api/carte/langues/${user.id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
                    },
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load langue');
                }
                setLangueItems(data.langues || []);
            } catch (err) {
                console.error(err);
                setError(err.message || 'Error loading langue');
            } finally {
                setLoading(false);
            }
        }

        fetchLangues();
    }, [user]);

    const updateLangue = async (langueId, langue, code) => {
        const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/api/carte/langues/${user.id}/${langueId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            },
            body: JSON.stringify({ langue, code }),
        });

        if (!response.ok) {
            throw new Error('Failed to update langue');
        }
    };

    const updateLangueNumbers = async (items) => {
        const updatedItems = items.map((item, i) => ({
            ...item,
            number: i + 1
        }));

        const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/api/carte/langues/${user.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            },
            body: JSON.stringify(updatedItems),
        });

        if (!response.ok) {
            throw new Error('Failed to update langue items');
        }

        setLangueItems(updatedItems);
    }

    const handleAddLangueItem = async (index) => {
        if (langueItems.length >= 6) {
            return;
        }

        const newItem = {
            number: index,
            langue: 'Français',
            code: 'fr'
        };

        const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/api/carte/langues/${user.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            },
            body: JSON.stringify({ langueData: newItem }),
        });

        if (!response.ok) {
            throw new Error('Failed to add langue item');
        }

        const data = await response.json();
        const langue = data.langue;

        const newLangueItems = [...langueItems];
        newLangueItems.splice(index, 0, langue);

        if (index === newLangueItems.length) {
            setLangueItems(newLangueItems);
        } else {
            updateLangueNumbers(newLangueItems);
        }
    };

    const handleDeleteLangueItem = async (id) => {
        let langue = langueItems.find(item => item.id === id);
        let isLangueAtEnd = langue.number === langueItems.length;

        const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/api/carte/langues/${user.id}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete langue item');
        }

        const newLangueItems = langueItems.filter(item => item.id !== id);

        if (isLangueAtEnd) {
            setLangueItems(newLangueItems);
        } else {
            updateLangueNumbers(newLangueItems);
        }
    };

    const handleChange = (id, newValue, newCode) => {
        setLangueItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, langue: newValue, code: newCode } : item
            )
        );

        if (timeoutRefs.current[id]) {
            clearTimeout(timeoutRefs.current[id]);
        }

        timeoutRefs.current[id] = setTimeout(() => {
            updateLangue(id, newValue, newCode);
        }, 500);
    };

    const handleDragStart = (draggedItem, placeholder) => {
        list.current.insertBefore(placeholder, draggedItem);
    }

    const handleDragUpdate = (draggedItem, e, setHoverIndex) => {
        let dragItems = list.current.querySelectorAll(`.langue-item`);
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

                const siblings = Array.from(item.parentElement.querySelectorAll(`.langue-item, .placeholder`));
                setHoverIndex(siblings.indexOf(placeholder));
            }
        });
    }

    const handleDragEnd = (draggedItem, currentIndex, hoverIndex) => {
        let placeholder = list.current.querySelector('.placeholder');
        list.current.insertBefore(draggedItem, placeholder);

        const updatedLangueItems = [...langueItems];
        const [movedItem] = updatedLangueItems.splice(currentIndex, 1);
        updatedLangueItems.splice(hoverIndex, 0, movedItem);
        updateLangueNumbers(updatedLangueItems);
    }

    const handleMouseDown = (e, index, item) => {
        onMouseDown(e, index, item, handleDragStart, handleDragUpdate, handleDragEnd);
    }

    return (
        <Header header="CHOIX DES LANGUES">
            <p className="pt-2 pl-5 text-xs flex gap-2 pb-5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-question-circle-fill" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.496 6.033h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247m2.325 6.443c.61 0 1.029-.394 1.029-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94 0 .533.425.927 1.01.927z"/>
                </svg>
                Configuration des langues pour la traduction automatique</p>
            <p className="pt-2 pl-5 text-xs flex gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-question-circle-fill" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.496 6.033h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247m2.325 6.443c.61 0 1.029-.394 1.029-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94 0 .533.425.927 1.01.927z"/>
                </svg>
                Langue par défaut : Français</p>
            <p className="pl-11 text-xs">6 langues maximum à choisir parmi la liste</p>
            <ul id="langue-list" className="space-y-4 pb-5">
                {langueItems.map((item, index) => (
                    <LangueItem 
                        key={item.id} user={user} {...item} index={item.number} id={item.id} 
                        onChange={handleChange}
                        onAdd={handleAddLangueItem} 
                        onDelete={handleDeleteLangueItem} 
                        onMouseDown={handleMouseDown}
                        onClickClose={onClickClose}
                    />
                ))}
                <button id="add-menu-button" type="button" className="ml-auto mt-6 mr-5 flex items-center rounded-lg justify-center gap-3 px-4 py-3 bg-gray-900 text-white font-semibold  focus:outline-none  transition relative" onClick={() => handleAddLangueItem(langueItems.length + 1)}>
                    <span className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-plus-circle" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                        </svg>
                    </span>

                    <span className="relative z-10">Ajouter un menu</span>

                    <span className="absolute left-0 right-0 top-1/2 border-t border-orange-300 -z-10"></span>
                </button>
            </ul>
        </Header>
    );
}
