import { Icon } from "@iconify/react";

export default function IconSelectItem({ icon, setCategorieIcon }) {
    return (
        <div className="icon-select-item flex flex-row items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-gray-100 transition" onClick={() => setCategorieIcon(icon)} data-icon={icon}>
            <Icon icon={icon} className="w-6 h-6" />
            <p className="text-sm text-gray-700 truncate">{icon}</p>
        </div>
    );
}