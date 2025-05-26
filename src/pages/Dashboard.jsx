// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import packs from '../utils/packs';
import { getAuthToken } from '../utils/auth';

function Dashboard() {
  const [vendorData, setVendorData] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const token = await getAuthToken();
        console.log('Token récupéré:', token); // Log pour déboguer
        if (!token) {
          setError("Veuillez vous connecter pour accéder à cette page.");
          navigate('/connexion');
          return;
        }

        const { data: userData } = await api.get('/auth/check');
        console.log('Réponse /auth/check:', userData); // Log pour déboguer
        const userId = userData.user.id;

        const [vendorResponse, productResponse] = await Promise.all([
          api.get('/vendors'),
          api.get(`/products?vendor_id=${userId}`),
        ]);

        const vendorList = vendorResponse.data;
        if (!vendorList || vendorList.length === 0) {
          navigate('/devenir-vendeur');
          return;
        }

        const vendor = vendorList.find(v => v.is_store_active) || vendorList[0];
        setVendorData(vendor);

        const productsData = Array.isArray(productResponse.data) ? productResponse.data : [];
        setProducts(productsData);
        console.log('Produits reçus:', productsData);
      } catch (err) {
        console.error('Erreur dans fetchVendorData:', err.response?.status, err.response?.data || err.message);
        setError(
          err.response?.data?.error || 
          err.message === 'Network Error' ? "Erreur réseau : impossible de se connecter au serveur." : 
          "Erreur lors de la vérification de l'authentification."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [navigate]);

  const handleDeleteProduct = async (productId) => {
    try {
      await api.delete(`/products/${productId}`);
      setProducts(products.filter(product => product.id !== productId));
      setSuccess("Produit supprimé avec succès !");
    } catch (err) {
      console.error('Erreur handleDeleteProduct:', err.response?.status, err.response?.data || err.message);
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleMarkAsOutOfStock = async (productId, currentStatus) => {
    const newStatus = currentStatus === 'disponible' ? 'epuise' : 'disponible';
    try {
      await api.patch(`/products/${productId}`, { stock_status: newStatus });
      setProducts(products.map(product =>
        product.id === productId ? { ...product, stock_status: newStatus } : product
      ));
      setSuccess(`Produit marqué comme ${newStatus === 'disponible' ? 'disponible' : 'épuisé'} !`);
    } catch (err) {
      console.error('Erreur handleMarkAsOutOfStock:', err.response?.status, err.response?.data || err.message);
      setError(err.response?.data?.error || err.message);
    }
  };

  if (loading) return <div className="flex items-center justify-center"><p className="text-gray-600 text-lg">Chargement...</p></div>;
  if (error) return <div className="flex items-center justify-center"><div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg"><p>{error}</p></div></div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 font-poppins">Tableau de bord (Vendeur)</h2>
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-4">
          <span>{success}</span>
        </div>
      )}
      {!vendorData.is_store_active && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-4">
          <span>Votre boutique est désactivée. Vous pouvez voir vos produits et stats, mais vous ne pouvez pas ajouter, modifier ou supprimer des produits. <button onClick={() => navigate('/devenir-vendeur')} className="text-blue-600 hover:underline">Renouveler mon abonnement</button></span>
        </div>
      )}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-2 font-poppins">Statistiques</h3>
        <ul className="list-disc pl-5 font-opensans">
          <li>Nom de la boutique : {vendorData?.shop_name || 'Non défini'}</li>
          <li>Produits ajoutés : {products.length}</li>
          <li>
            Pack actuel : {vendorData?.current_plan || 'Aucun pack'} | Fin :{' '}
            {vendorData?.subscription_end_date
              ? new Date(vendorData.subscription_end_date).toLocaleDateString()
              : 'N/A'}
          </li>
          <li>Quota utilisé : {vendorData?.quota_used || 0} / {vendorData?.quota_limit || packs.find(p => p.name === vendorData?.current_plan)?.quota || 'Non défini'}</li>
        </ul>
        <div className="mt-4 flex space-x-4">
          <button
            onClick={() => navigate('/ajouter-produit')}
            disabled={!vendorData.is_store_active}
            className={`px-4 py-2 text-white rounded-lg ${vendorData.is_store_active ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            Ajouter un produit
          </button>
          <button
            onClick={() => navigate('/gérer-abonnement')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Gérer mon abonnement
          </button>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2 font-poppins">Mes produits</h3>
        {products.length === 0 ? (
          <p className="text-gray-600">Aucun produit ajouté pour le moment.</p>
        ) : (
          Array.isArray(products) && products.map(product => (
            <div key={product.id} className="bg-gray-50 p-4 rounded-lg shadow">
              <p><strong>Produit :</strong> {product.name}</p>
              <p><strong>Prix :</strong> {product.price} FCFA</p>
              <p><strong>Stock :</strong> {product.stock}</p>
              <p><strong>Statut :</strong> {product.stock_status || 'disponible'}</p>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => navigate(`/modifier-produit/${product.id}`)}
                  disabled={!vendorData.is_store_active}
                  className={`${vendorData.is_store_active ? 'text-blue-600 hover:text-blue-800' : 'text-gray-400 cursor-not-allowed'}`}
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  disabled={!vendorData.is_store_active}
                  className={`${vendorData.is_store_active ? 'text-red-600 hover:text-red-800' : 'text-gray-400 cursor-not-allowed'}`}
                >
                  Supprimer
                </button>
                <button
                  onClick={() => handleMarkAsOutOfStock(product.id, product.stock_status || 'disponible')}
                  disabled={!vendorData.is_store_active}
                  className={`${vendorData.is_store_active ? 'text-gray-600 hover:text-gray-800' : 'text-gray-400 cursor-not-allowed'}`}
                >
                  {product.stock_status === 'epuise' ? 'Marquer disponible' : 'Marquer épuisé'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;