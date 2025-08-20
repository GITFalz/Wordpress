import { useRef, useEffect, useState } from 'react';
import IconSelectItem from './IconSelectItem';

export default function IconSelectList({ setCategorieIcon, parent }) {
    const [icons, setIcons] = useState([]);
    const searchDebounce = useRef(null);
    const itemRef = useRef(null);

    useEffect(() => {
        itemRef.current = parent.querySelector('.icon-select');
        // have functions executed in next event tick
        setTimeout(() => {
            onClickClose(itemRef.current, () => setFontSelect(false));
        }, 0);
    }, [parent]);

    const searchIcons = async (query) => {
        const url = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=20`;
        const res = await fetch(url);
        const data = await res.json();
        return data.icons || [];
    }

    useEffect(() => {
        searchIcons('');
    }, []);

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        if (searchDebounce.current) {
            clearTimeout(searchDebounce.current);
        }
        searchDebounce.current = setTimeout(async () => {
            const iconList = await searchIcons(query);
            setIcons(iconList);
        }, 300);
    };

    return (
        <div className="icon-select absolute top-[100%] mt-2 left-0 w-full max-h-60 overflow-y-auto bg-white shadow-lg rounded border z-50">
            <input type="text" placeholder="Search..." className="p-2 w-full border-b" onChange={handleSearch} />
            <div className="overflow-y-auto w-full max-h-60">   
                {icons.map((icon, index) => (
                    <IconSelectItem key={index} icon={icon} setCategorieIcon={setCategorieIcon} />
                ))}
            </div>
        </div>  
    );
}