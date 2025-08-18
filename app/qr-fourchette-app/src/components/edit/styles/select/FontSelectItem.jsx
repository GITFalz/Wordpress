export default function FontSelectItem({ font, setFont }) {
    return (
        <div className="font-select-item flex flex-row items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-gray-100 transition" onClick={() => setFont(font)}>
            <p className="text-sm text-gray-700 truncate">{font.name}</p>
        </div>
    );
}