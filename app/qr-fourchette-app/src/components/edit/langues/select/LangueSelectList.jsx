import { useState, useEffect, useRef } from 'react';
import LangueSelectItem from './LangueSelectItem';

const TOKEN_KEY = 'auth_token'

export default function LangueSelectList({ id, setCategorieLangue, onClickClose, parent, setLangueSelect }) {
    const [langues, setLangues] = useState([]);
    const searchDebounce = useRef(null);
    const itemRef = useRef(null);

    useEffect(() => {
        itemRef.current = parent.querySelector('.langue-select');
        // have functions executed in next event tick
        setTimeout(() => {
            onClickClose(itemRef.current, () => setLangueSelect(false));
        }, 0);
    }, [parent]);

    const getLanguages = async (query) => {
        let url = `${import.meta.env.PUBLIC_API_BASE_URL}/api/langues/${id}`;
        if (query.length > 0) {
            url += `/${query}`;
        }
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
            }
        });
        const data = await response.json();
        setLangues(data.langues);
    };

    useEffect(() => {
        getLanguages('');
    }, []);

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        if (searchDebounce.current) {
            clearTimeout(searchDebounce.current);
        }
        searchDebounce.current = setTimeout(() => {
            getLanguages(query);
        }, 300);
    };

    return (
        <div className="langue-select absolute top-[100%] mt-2 left-0 w-full h-auto bg-white shadow-lg rounded border z-50">
            <input type="text" placeholder="Search..." className="p-2 w-full border-b" onChange={handleSearch} />
            <div className="overflow-y-auto w-full max-h-60">
                {langues.map((item, index) => (
                    <LangueSelectItem key={index} langue={item.langue} code={item.code} setCategorieLangue={setCategorieLangue} />
                ))}
            </div>
        </div>  
    );
}