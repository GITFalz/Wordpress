import { useRef, useState, useEffect } from 'react';
import Header from '../Header';
import Info from '../../utils/Info';
import { getValues, updateSettings } from '../../../scripts/api/settings';

const TOKEN_KEY = 'auth_token';

export default function InfoComplementaire({ user }) {   
    const timeoutRefs = useRef({});
    const [description, setDescription] = useState({});
    const [footer, setFooter] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            const data = await getValues(user.id, 'infosComplémentaire', ['description', 'footer']);
            setDescription({ id: data.description.id, value: data.description.value });
            setFooter({ id: data.footer.id, value: data.footer.value });
        };

        fetchData();
    }, [user.id]);

    const updateField = async (field) => {
        await updateSettings(user.id, field.id, field.value);
    };

    const onChange = (field, input, setter) => {
        const updatedField = { ...field, value: input };
        setter(updatedField);

        if (timeoutRefs.current[field.id]) {
            clearTimeout(timeoutRefs.current[field.id]);
        }

        timeoutRefs.current[field.id] = setTimeout(() => {
            updateField(updatedField);
        }, 500);
    };

    return (
        <Header header="INFORMATIONS COMPLÉMENTAIRES">
            <div className="p-5 pt-2">
                <Info lines={["Message qui s'affiche en haut du menu", "N'est pas obligatoire"]} />
                <textarea name="description" placeholder="Message haut de page" className="menu-description rounded-xl p-2 focus:outline-none focus:ring-2 bg-gray-200 h-32 w-full saveable-input" value={description.value} onChange={(e) => onChange(description, e.target.value, setDescription)}/>
            </div>
            <div className="border-b mx-5"></div>
            <div className="p-5">
                <p>Informations pied de page</p>
                <Info lines={["Message qui s'affiche en bas de la page du menu (maximum 25 lettres)", "N'est pas obligatoire"]} className="pt-2"/>
                <input maxLength={25} name="footer" placeholder="Message pied de page" className="menu-description rounded-xl p-2 focus:outline-none focus:ring-2 bg-gray-200 w-full saveable-input" value={footer.value} onChange={(e) => onChange(footer, e.target.value, setFooter)}/>
            </div>
        </Header>
    );
}