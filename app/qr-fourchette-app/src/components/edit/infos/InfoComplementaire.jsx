import { useRef, useState, useEffect } from 'react';
import Header from '../Header';
import Info from '../../utils/Info';

const TOKEN_KEY = 'auth_token';

export default function InfoComplementaire({ user }) {   
    const timeoutRefs = useRef({});
    const [description, setDescription] = useState("");
    const [footer, setFooter] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(
                `${import.meta.env.PUBLIC_API_BASE_URL}/api/settings/${user.id}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
                    }, 
                    body: JSON.stringify({ keys: ['description', 'footer'] })
                }
            );

            if (response.ok) {
                const data = await response.json();
                setDescription(data.settings.description || "");
                setFooter(data.settings.footer || "");
            } else {
                // display error message
                console.error('Failed to fetch settings:', response);
            }
        };

        fetchData();
    }, [user.id]);

    const updateField = async (field, value) => {
        const response = await fetch(
            `${import.meta.env.PUBLIC_API_BASE_URL}/api/settings/${user.id}/${field}/${value}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to update settings field');
        }
    };

    const onChange = (field, value, setter) => {
        setter(value);

        if (timeoutRefs.current[field]) {
            clearTimeout(timeoutRefs.current[field]);
        }

        timeoutRefs.current[field] = setTimeout(() => {
            updateField(field, value);
        }, 500);
    };

    return (
        <Header header="INFORMATIONS COMPLÉMENTAIRES">
            <div className="p-5 pt-2">
                <Info lines={["Message qui s'affiche en haut du menu", "N'est pas obligatoire"]} />
                <textarea name="description" placeholder="Message haut de page" className="menu-description rounded-xl p-2 focus:outline-none focus:ring-2 bg-gray-200 h-32 w-full saveable-input" value={description} onChange={(e) => onChange('description', e.target.value, setDescription)}/>
            </div>
            <div className="border-b mx-5"></div>
            <div className="p-5">
                <p>Informations pied de page</p>
                <Info lines={["Message qui s'affiche en bas de la page du menu (maximum 25 lettres)", "N'est pas obligatoire"]} className="pt-2"/>
                <input maxLength={25} name="footer" placeholder="Message pied de page" className="menu-description rounded-xl p-2 focus:outline-none focus:ring-2 bg-gray-200 w-full saveable-input"/>
            </div>
        </Header>
    );
}