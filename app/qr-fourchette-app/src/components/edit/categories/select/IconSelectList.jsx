import IconSelectItem from './IconSelectItem';

export default function IconSelectList({ icons, setCategorieIcon }) {
    return (
        <div className="icon-select absolute top-[100%] mt-2 left-0 w-full max-h-60 overflow-y-auto bg-white shadow-lg rounded border z-50">
            {icons.map((icon, index) => (
                <IconSelectItem key={index} icon={icon} setCategorieIcon={setCategorieIcon} />
            ))}
        </div>  
    );
}