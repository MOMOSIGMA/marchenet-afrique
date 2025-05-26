import { Link } from 'react-router-dom';

function HowToOpenShop() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 font-poppins text-orange-600">Comment ouvrir une boutique sur MarchéNet Afrique</h2>
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2 font-poppins">Étapes simples :</h3>
          <ol className="list-decimal pl-6 space-y-2 text-gray-700 font-opensans">
            <li>Inscrivez-vous sur notre plateforme avec un compte sécurisé.</li>
            <li>Demandez à devenir vendeur via la section 'Devenir Vendeur'.</li>
            <li>Recevez votre code unique pour activer votre boutique.</li>
            <li>Ajoutez vos produits avec photos et descriptions attrayantes.</li>
            <li>Lancez-vous et commencez à vendre à des milliers de clients !</li>
          </ol>
        </div>
        <div className="text-center">
          <Link
            to="/devenir-vendeur"
            className="inline-block px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition duration-300"
          >
            Devenir Vendeur Maintenant
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HowToOpenShop;