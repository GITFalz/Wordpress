import Header from '../Header';

export default function Logo({ user }) {
    return (
        <Header header="CHOIX DU LOGO">
            <div className="flex items-center">
                <img src={user.logo} alt="Logo" className="h-12 w-12 rounded-full" />
                <span className="ml-3 text-lg font-semibold">{user.name}</span>
            </div>
        </Header>
    );
}