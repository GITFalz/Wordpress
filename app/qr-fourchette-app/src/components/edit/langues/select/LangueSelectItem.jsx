export default function LangueSelectItem({ langue, code, setCategorieLangue }) {
    return (
        <div className="langue-select-item flex flex-row items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-gray-100 transition" onClick={() => setCategorieLangue(langue, code)}>
            <p className="text-sm text-gray-700 truncate">{langue}</p>
        </div>
    );
}