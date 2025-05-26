// src/pages/MyShop.jsx
import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { getAuthToken } from '../utils/auth';

function MyShop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();
        if (!token) {
          navigate('/connexion');
          return;
        }

        // Récupérer l'ID de l'utilisateur connecté
        const { data: userData } = await api.get('/auth/check');
        const userId = userData.user.id;

        // Utiliser l'ID dans la requête
        const response = await api.get(`/products?vendor_id=${userId}`);
        console.log('Réponse /products:', response.data);
        setProducts(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Erreur fetchProducts:', err.response?.status, err.response?.data || err.message);
        setError(err.response?.data?.error || "Une erreur est survenue lors de la récupération des produits.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [navigate]);

  if (loading) return <p className="text-center text-gray-600 font-opensans">Chargement...</p>;
  if (error) return <p className="text-center text-red-500 font-opensans">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-4 font-poppins">Ma boutique</h2>
      {products.length === 0 ? (
        <p className="text-gray-600 font-opensans">Aucun produit dans votre boutique.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map(product => (
            <div key={product.id} className="bg-white p-4 rounded-lg shadow">
              <p className="font-opensans">{product.name}</p>
              <p className="font-opensans">{product.price} FCFA</p>
              <p className="font-opensans">Statut : {product.stock_status || 'disponible'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyShop;