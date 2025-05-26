import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import packs from '../utils/packs';
import { logout } from '../utils/auth';
import { useAuth } from '../context/AuthContext'; // <-- Correction ici

function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState('account');
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated === false) {
      navigate('/connexion');
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated === null || !user) return <div className="text-center py-10">Chargement...</div>;

  const isVendor = user.isVendor;
  const vendorData = user.vendorData;
  const isStoreActive = vendorData?.is_store_active;

  const handleSignOut = () => {
    logout(() => navigate('/connexion'));
  };

  return (
    <div className="min-h-screen bg-gray-100 font-opensans">
      <div className="bg-orange-500 text-white p-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold">
            Bonjour, {user?.first_name || user?.user_metadata?.full_name?.split(' ')[0] || 'Utilisateur'}
          </h2>
          <p className="text-sm">{user?.email}</p>
        </div>
        <div className="flex items-center space-x-2">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-md font-semibold border-b pb-2 mb-2">VOTRE COMPTE MARCHÉNET</h3>
          <ul className="space-y-2">
            <li className="flex items-center">
              {/* ...icône... */}
              <button
                onClick={() => setActiveSection('account')}
                className={`text-gray-700 hover:text-orange-500 ${activeSection === 'account' ? 'font-bold text-orange-500' : ''}`}
              >
                Mes informations
              </button>
            </li>
            <li className="flex items-center">
              {/* ...icône... */}
              <Link to="/mes-commandes" className="text-gray-700 hover:text-orange-500">Mes commandes</Link>
            </li>
            <li className="flex items-center">
              {/* ...icône... */}
              <Link to="/mes-favoris" className="text-gray-700 hover:text-orange-500">Mes favoris</Link>
            </li>
            {isVendor && isStoreActive && (
              <>
                <li className="flex items-center">
                  {/* ...icône... */}
                  <Link to="/tableau-de-bord" className="text-gray-700 hover:text-orange-500">Ma boutique</Link>
                </li>
                <li className="flex items-center">
                  {/* ...icône... */}
                  <Link to="/ajouter-produit" className="text-gray-700 hover:text-orange-500">Ajouter produit</Link>
                </li>
              </>
            )}
            <li className="flex items-center">
              {/* ...icône... */}
              <Link to="/panier" className="text-gray-700 hover:text-orange-500">Mon panier</Link>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          {activeSection === 'account' && (
            <div>
              <h2 className="text-md font-semibold border-b pb-2 mb-2">MES INFORMATIONS</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600">Nom complet</label>
                  <p className="text-gray-800">
                    {user?.first_name && user?.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user?.user_metadata?.full_name || 'Non défini'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Email</label>
                  <p className="text-gray-800">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Téléphone</label>
                  <p className="text-gray-800">{user?.phone_number || user?.user_metadata?.phone || 'Non défini'}</p>
                </div>
                {isVendor && (
                  <div>
                    <label className="block text-sm text-gray-600">Statut de la boutique</label>
                    <p className="text-gray-800">
                      {isStoreActive ? 'Active' : 'Non active'} | Pack : {vendorData?.current_plan || 'Aucun'} | Fin:{' '}
                      {vendorData?.subscription_end_date
                        ? new Date(vendorData.subscription_end_date).toLocaleDateString()
                        : 'N/A'} | Quota : {vendorData?.quota_limit || packs.find(p => p.name === vendorData?.current_plan)?.quota || 'Non défini'}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => navigate('/mon-profil/edit')}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Modifier
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-md font-semibold border-b pb-2 mb-2">PARAMÈTRES DU COMPTE</h3>
          <ul className="space-y-2">
            {!isVendor && (
              <li className="flex items-center">
                {/* ...icône... */}
                <Link to="/devenir-vendeur" className="text-gray-700 hover:text-orange-500">Devenir vendeur</Link>
              </li>
            )}
            {isVendor && !isStoreActive && (
              <li className="flex items-center">
                {/* ...icône... */}
                <Link to="/devenir-vendeur" className="text-gray-700 hover:text-orange-500">Renouveler mon abonnement</Link>
              </li>
            )}
            <li className="flex items-center">
              {/* ...icône... */}
              <button onClick={handleSignOut} className="text-orange-500 hover:text-orange-600">
                Déconnexion
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Profile;