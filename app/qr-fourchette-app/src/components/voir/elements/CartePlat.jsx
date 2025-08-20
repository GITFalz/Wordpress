export default function CartePlat({ name = null, description = null, prix = null, className = '', title = '#000000', typoPlat = '' }) {
    return (
        <div className={`flex items-start pb-2 flex-row justify-between ${className}`}>
            <div className="flex flex-col">
                <h2 className="text-xl" style={{ color: title, fontFamily: typoPlat }}>{name}</h2>
                {description && <p className="self-start text-gray-400">{description}</p>}
            </div>
            {prix && <p className="font-bold text-lg" >{parseFloat(prix).toFixed(2)} €</p>}
        </div>
    );
}
