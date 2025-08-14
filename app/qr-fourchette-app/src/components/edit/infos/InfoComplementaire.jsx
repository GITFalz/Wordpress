export default function InfoComplementaire({ user }) {   
    return (
        <div className="w-full edit-info info-info">
            <h3 className="text-xl font-semibold text-white bg-orange-400 p-5 rounded-t-xl">INFORMATIONS COMPLÉMENTAIRES</h3>
            <p className="pt-2 pl-5 text-xs flex gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-question-circle-fill" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.496 6.033h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247m2.325 6.443c.61 0 1.029-.394 1.029-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94 0 .533.425.927 1.01.927z"/>
                </svg>
                Message qui s'affiche en haut du menu</p>
            <p className="pl-11 text-xs">Message qui s'affiche en haut du menu</p>
            <div className="p-5">
                <p>Message haut de page</p>
                <textarea name="description" placeholder="Message haut de page" className="menu-description rounded-xl p-2 focus:outline-none focus:ring-2 bg-gray-200 h-32 w-full saveable-input" value="desc" onChange={(e) => onChange(id, 'description', e.target.value)}/>
                <p>Message pied de page</p>
                <textarea name="description" placeholder="Message pied de page" className="menu-description rounded-xl p-2 focus:outline-none focus:ring-2 bg-gray-200 h-32 w-full saveable-input" value="pied" onChange={(e) => onChange(id, 'description', e.target.value)}/>
            </div>
        </div>
    );
}