export default function Accueil({ user }) {
    return (
        <div>
            <div className="bg-[#f1ede8] lg:h-[500px] h-[700px] w-full flex justify-center mt-20">
                <div className="flex max-w-[1100px] w-full relative p-5 mt-20 justify-center items-center flex-col">
                    <div className="w-full lg:block flex justify-center items-center pb-10 flex-col">
                        <h3 className="text-4xl font-bold lg:text-start text-center">Cartes et menus</h3>
                        <h3 className="text-4xl font-bold lg:text-start text-center">digitaux via QR code</h3>
                        <p className="text-sm pt-5 sm:w-[400px] text-center lg:text-start">
                            QR & Fourchette est LA solution sans contact pour tous les restaurateurs ! Une expérience client adaptée, ergonomique et claire pour accéder à la carte de votre restaurant.
                        </p>
                        <p className="bg-gradient-to-r from-orange-400 to-[#ffb500] text-white px-7 py-3 text-sm mt-5 rounded-full cursor-pointer transition-colors shadow-lg shadow-orange-200 flex items-center w-[210px]">2 MOIS D'ESSAI GRATUIT !</p>
                    </div>  
                    <img src="/src/assets/images/qr-fourchette-entete-image.png" alt="QR & Fourchette Screenshot" className="w-full max-w-[500px] object-contain mx-auto lg:absolute ml-auto right-10 bottom-[-50px]" />
                </div>
            </div>
            <div className=" h-[500px] w-full flex justify-center">
                <div className="flex max-w-[1100px] w-full relative p-5 pt-20 justify-center">
                    <div className="flex flex-col justify-center items-center w-[640px]">
                        <div className="md:text-2xl text-base font-semibold z-10 text-[#ff8601]">Simple et immédiat
                            <div className="border-t-8 border-gray-200 w-full mt-[-8px]"></div>
                        </div>
                        <div className="md:text-2xl text-base font-semibold z-10 text-[#ff8601]">Ne nécessite aucune application ou logiciel
                            <div className="border-t-8 border-gray-200 w-full mt-[-8px]"></div>
                        </div>
                        <p className="flex justify-center items-center text-center pt-8 text-gray-400">Cet outil, facile à prendre en main, propose une solution digitale qui vous permet en 3 clics de créer tout simplement le QR code de votre menu.</p>
                        <p className="flex justify-center items-center text-center pt-5 text-gray-400">Qui plus est, vous pouvez le mettre à jour en temps réel, celui-ci ne change pas. Et afin d’être le plus fonctionnel possible, une interface spécifique vous est dédiée. Vous hésitez encore ? Découvrez les points forts de cette solution.</p>
                    </div>
                </div>
            </div>
            <div className="w-full flex justify-center">
                <div className="flex max-w-[1100px] w-full relative p-5 mx-10 rounded-3xl justify-center bg-[#f1ede8]">
                    <div className="flex flex-col p-5 items-center w-full ">
                        <div className="md:text-2xl font-semibold z-10 ">Un menu digital c'est ...
                            <div className="border-t-8 border-[#ffba00;] w-full mt-[-8px]"></div>
                        </div>
                        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-4 mt-20 w-full">
                            <div className="flex flex-col items-center">
                                <img src="/src/assets/images/qr-fourchette-anti-covid.png" alt="QR & Fourchette Screenshot" className="w-24 mx-auto" />
                                <p className="text-center font-semibold">Anit COVID</p>
                                <p className="text-sm text-gray-500">Plus de menu = plus de risque !</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <img src="/src/assets/images/qr-fourchette-ecologique.png" alt="QR & Fourchette Screenshot" className="w-24 mx-auto" />
                                <p className="text-center font-semibold">Écologique</p>
                                <p className="text-sm text-gray-500 text-center w-60">Plus de menu = plus d'arbres sur la planète !</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <img src="/src/assets/images/qr-fourchette-social.png" alt="QR & Fourchette Screenshot" className="w-24 mx-auto" />
                                <p className="text-center font-semibold">Social</p>
                                <p className="text-sm text-gray-500 text-center w-60">Aucun menu à apporter & enlever des tables, c’est plus de temps à passer avec les clients !</p>
                            </div>
                            <div className="flex flex-col items-center pt-10">
                                <img src="/src/assets/images/qr-fourchette-internationnal.png" alt="QR & Fourchette Screenshot" className="w-24 mx-auto" />
                                <p className="text-center font-semibold">International</p>
                                <p className="text-sm text-gray-500 text-center w-60">Plus de langues = plus de touristes dans votre restaurant !</p>
                            </div>
                            <div className="flex flex-col items-center pt-10">
                                <img src="/src/assets/images/qr-fourchette-flexible.png" alt="QR & Fourchette Screenshot" className="w-24 mx-auto" />
                                <p className="text-center font-semibold">Flexible</p>
                                <p className="text-sm text-gray-500 text-center w-60">Un changement de prix ? Plus besoin de réimprimer = changement immédiat !</p>
                            </div>
                            <div className="flex flex-col items-center pt-10">
                                <img src="/src/assets/images/qr-fourchette-economique.png" alt="QR & Fourchette Screenshot" className="w-24 mx-auto" />
                                <p className="text-center font-semibold">Économique</p>
                                <p className="text-sm text-gray-500 text-center w-60">Plus d’impression = plus d’argent pour vous !</p>
                            </div>
                        </div>
                        <p className="bg-gradient-to-r from-orange-400 to-[#ffb500] text-white px-7 py-3 text-sm mt-14 mb-5 rounded-full cursor-pointer transition-colors shadow-lg shadow-orange-200 flex items-center w-[210px]">2 MOIS D'ESSAI GRATUIT !</p>
                    </div>
                </div>
            </div>
        </div>
    );
}