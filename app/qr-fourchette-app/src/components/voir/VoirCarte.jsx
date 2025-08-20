import { useRef, useState, useEffect } from 'react';
import { getValues } from '../../scripts/api/settings.js';
import { getFontById } from '../../scripts/api/fonts.js';
import { Icon } from '@iconify/react';
import CarteMenu from './elements/CarteMenu.jsx';
import CarteCategorie from './elements/CarteCategorie.jsx';


const TOKEN_KEY = 'auth_token';

export default function VoirCarte() {

    const [userId, setUserId] = useState(null);

    const [menus, setMenus] = useState([]);
    const [categories, setCategories] = useState([]);

    const [logoType, setLogoType] = useState("");
    const [couleurEntete, setCouleurEntete] = useState("#000000");
    const [logo, setLogo] = useState("");

    const [menuType, setMenuType] = useState("");
    
    const [typoCategorie, setTypoCategorie] = useState("");
    const [couleurCategorie, setCouleurCategorie] = useState("#000000");

    const [typoPlats, setTypoPlats] = useState("");
    const [couleurPlats, setCouleurPlats] = useState("#000000");

    const [couleurArrierePlan, setCouleurArrierePlan] = useState("#FFFFFF");
    const [couleurLiens, setCouleurLiens] = useState("#FFFFFF");

    const [description, setDescription] = useState("");
    const [footer, setFooter] = useState("");

    const [navItems, setNavItems] = useState([]);
    const [activeNavItem, setActiveNavItem] = useState("");

    useEffect(() => {
        const id = new URLSearchParams(window.location.search).get('userId');
        setUserId(id);
    }, []); 

    useEffect(() => {
        if (!userId) return;

        async function fetchData() {
            const data = await getValues(userId, 'choixLogo', ['logoType', 'couleurEntete', 'logo']);

            setLogoType(data.logoType.value);
            setCouleurEntete(data.couleurEntete.value);
            setLogo(data.logo.value);
        };

        async function fetchStyles() {
            const data = await getValues(userId, 'stylesCarte', ['menuType', 'typoCategorie', 'couleurCategorie', 'typoPlats', 'couleurPlats', 'couleurArrierePlan', 'couleurLiens']);

            if (data) {
                setMenuType(data.menuType.value);
                setCouleurCategorie(data.couleurCategorie.value);
                setCouleurPlats(data.couleurPlats.value);
                setCouleurArrierePlan(data.couleurArrierePlan.value);
                setCouleurLiens(data.couleurLiens.value);

                const fontCategorie = await getFontById(userId, data.typoCategorie.value);
                const fontPlats = await getFontById(userId, data.typoPlats.value); 

                setTypoCategorie(fontCategorie.name);
                setTypoPlats(fontPlats.name);

                const head = document.head;
                const existingLink = head.querySelector(`link[data-font="${fontCategorie.name}"]`);
                if (!existingLink) {
                    const link = document.createElement('link');
                    link.href = `https://fonts.googleapis.com/css2?family=${fontCategorie.name}:wght@400;700&display=swap`;
                    link.rel = 'stylesheet';
                    link.setAttribute('data-font', fontCategorie.name);
                    head.appendChild(link);
                }

                const existingLinkPlats = head.querySelector(`link[data-font="${fontPlats.name}"]`);
                if (!existingLinkPlats) {
                    const link = document.createElement('link');
                    link.href = `https://fonts.googleapis.com/css2?family=${fontPlats.name}:wght@400;700&display=swap`;
                    link.rel = 'stylesheet';
                    link.setAttribute('data-font', fontPlats.name);
                    head.appendChild(link);
                }
            }
        }

        async function fetchMenu() {
            try {
                const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/api/carte/menu/${userId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
                    },
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load menu');
                }
                setMenus(data.menus || []);
            } catch (err) {
                console.error(err);
            }
        }

        async function fetchCategories() {
            try {
                const response = await fetch(`${import.meta.env.PUBLIC_API_BASE_URL}/api/carte/categorie/${userId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`,
                    },
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load categories');
                }
                setCategories(data.categories || []);
                setNavItems([{icon: "ion:clipboard-outline", label: "Nos menus"}, ...data.categories.map(cat => ({icon: cat.icon, label: cat.name}))]);
            } catch (err) {
                console.error(err);
            }
        }

        async function fetchInfos() {
            try {
                const data = await getValues(userId, 'infosComplémentaire', ['description', 'footer']);
                setDescription(data.description.value);
                setFooter(data.footer.value);
            } catch (err) {
                console.error(err);
            }
        }
        
        fetchData();
        fetchStyles();
        fetchMenu();
        fetchCategories();
        fetchInfos();

    }, [userId]);



    // Fixed scroll system where the active navbar item moves to the left
    const handleScroll = () => {
        const scrollPosition = window.scrollY;
        const middleOfScreen = window.innerHeight / 2;
        
        navItems.forEach((item) => {
            const element = document.getElementById(item.label);
            if (!element) return;
            
            const rect = element.getBoundingClientRect();
            
            if (rect.top < middleOfScreen && rect.bottom > middleOfScreen) {
                if (activeNavItem !== item.label) {
                    const navbar = document.querySelector('.navbar');
                    const section = document.querySelector(`li[data-section="${item.label}"]`);
                    
                    if (navbar && section) {
                        navbar.scrollTo({
                            left: section.offsetLeft - 30,
                            behavior: 'smooth'
                        });
                        setActiveNavItem(item.label);
                    }
                }
            }
        });
    };

    // Add this function to handle navbar clicks
    const handleNavClick = (e, label) => {
        e.preventDefault();
        
        const element = document.getElementById(label);
        if (!element) {
            console.log(`Element with id "${label}" not found`);
            return;
        }
        
        let offsetTop = 0;
        let currentElement = element;
        
        while (currentElement) {
            offsetTop += currentElement.offsetTop;
            currentElement = currentElement.offsetParent;
        }
        
        const targetPosition = offsetTop - (window.innerHeight / 2) + 100;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        setActiveNavItem(label);
        setTimeout(() => {
            const navbar = document.querySelector('.navbar');
            const section = document.querySelector(`li[data-section="${label}"]`);
            
            if (navbar && section) {
                navbar.scrollTo({
                    left: section.offsetLeft,
                    behavior: 'smooth'
                });
            }
        }, 100);
    };


    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [navItems, activeNavItem]); // Added activeNavItem to dependencies



    if (!userId) return (
        <div>Loading...</div>
    );

    return (
        <div>
            <div className="w-full fixed z-10 top-0">
                <div style={{ backgroundColor: couleurEntete }} className="">
                    {logoType === 'image' ? <img className="h-20" src={logo === '' ? '/' : logo} alt="Logo" /> : <span>{logo}</span>}
                </div>
                <nav className=" flex justify-between items-center p-4  " style={{ backgroundColor: couleurArrierePlan, color: couleurLiens }}>
                    <ul className=" overflow-hidden flex space-x-4 whitespace-nowrap w-[calc(100%-10px)] navbar">
                        {navItems.map((item, index) => (
                            <li key={index} data-section={item.label}>
                                <a 
                                    href={`#${item.label}`} 
                                    onClick={(e) => handleNavClick(e, item.label)}
                                    className={`hover:underline flex items-center pb-1 transition-all duration-300 ${
                                        activeNavItem === item.label 
                                            ? 'border-b-2 border-current' 
                                            : 'border-b-2 border-transparent'
                                    }`}
                                >
                                    <Icon icon={item.icon} className="inline-block mr-1 h-[20px] w-[20px]" />
                                    <p>{item.label}</p>
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            <div className="flex justify-center mb-5 mt-20">
                <p className="text-xl pt-20">{description}</p>
            </div>
            <div className="p-20">
                <div className="space-y-10" id="Nos menus">
                    {menus.map((menu, index) => (
                        <CarteMenu key={menu.id} {...menu} border={couleurArrierePlan} />
                    ))}
                </div>
                <div className="space-y-10 mt-10">
                    {categories.map((category, index) => (
                        <CarteCategorie key={category.id} userId={userId} {...category} title={couleurCategorie} platCouleur={couleurPlats} typoCategorie={typoCategorie} typoPlats={typoPlats} />
                    ))}
                </div>
            </div>
            <div className="h-20 w-full mt-10 flex justify-center pt-2" style={{ backgroundColor: couleurArrierePlan, color: couleurLiens }}>
                <p>{footer}</p>
            </div>
        </div>
    );
}
