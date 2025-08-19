export default function CarteMenu({ name = null, description = null, entrees = null, plats = null, desserts = null, border = '#000000' }) {
    console.log('Rendering CarteMenu:', { name, description, entrees, plats, desserts, border });

    return (
        <div className="relative carte-menu flex flex-col items-center justify-center min-h-20 p-10 bg-gradient-to-bl from-black to-gray-500 shadow-lg rounded-lg text-white" style={{ borderWidth: '8px', borderColor: border,  borderStyle: 'solid', }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" className="bi bi-pin-angle-fill text-black absolute top-[-48px] ml-10" viewBox="0 0 16 16">
                <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a6 6 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707s.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a6 6 0 0 1 1.013.16l3.134-3.133a3 3 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146"/>
            </svg>
            <h2 className="text-xl font-bold">{name}</h2>
            {description && 
            <div className="bg-gray-600 w-[600px] opacity-80 flex items-center justify-center p-3 mt-2 mb-2">
                <p>{description}</p>
            </div>}
            {entrees && 
            <p>{entrees}</p>
            }
            {plats && 
                <>
                    {(entrees) && <div className="border-t-2 w-20 my-4"></div>}
                    <p>{plats}</p>
                </>
            }
            {desserts && 
                <>
                    {(plats || entrees) && <div className="border-t-2 w-20 my-4"></div>}
                    <p>{desserts}</p>
                </>
            }
        </div>
    );
}