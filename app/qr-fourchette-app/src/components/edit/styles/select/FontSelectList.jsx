import { useState, useEffect, useRef } from 'react';
import FontSelectItem from './FontSelectItem';

const TOKEN_KEY = 'auth_token'

export default function FontSelectList({ id, setFont, onClickClose, parent, setFontSelect }) {
    const [fonts, setFonts] = useState([]);
    const searchDebounce = useRef(null);
    const itemRef = useRef(null);

    useEffect(() => {
        itemRef.current = parent.querySelector('.font-select');
        // have functions executed in next event tick
        setTimeout(() => {
            onClickClose(itemRef.current, () => setFontSelect(false));
        }, 0);
    }, [parent]);

    const getFonts = async (query) => {
        let url = `${import.meta.env.PUBLIC_API_BASE_URL}/api/fonts/${id}`;
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
        setFonts(data);
    };

    useEffect(() => {
        getFonts('');
    }, []);

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        if (searchDebounce.current) {
            clearTimeout(searchDebounce.current);
        }
        searchDebounce.current = setTimeout(() => {
            getFonts(query);
        }, 300);
    };

    return (
        <div className="font-select absolute top-[100%] mt-2 left-0 w-full h-auto bg-white shadow-lg rounded border z-50">
            <input type="text" placeholder="Search..." className="p-2 w-full border-b" onChange={handleSearch} />
            <div className="overflow-y-auto w-full max-h-60">
                {fonts.map((item, index) => (
                    <FontSelectItem key={index} font={item} setFont={setFont} />
                ))}
            </div>
        </div>  
    );
}