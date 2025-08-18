export default function Header({ header, children }) {
    return (
        <div className="w-full edit-info">
            <h3 className="text-xl font-semibold text-white bg-orange-400 p-5 rounded-t-xl">{header}</h3>
            <div>{children}</div>
        </div>
    );
}