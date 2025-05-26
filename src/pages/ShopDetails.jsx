// src/pages/ShopDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import { getAuthToken } from '../utils/auth';

function ShopDetails() {
  const { auth_id } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favoriteProductIds, setFavoriteProductIds] = useState([]);
  const [cartProductIds, setCartProductIds] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();
        const shopResponse = await api.get(`/vendors/${auth_id}`, {
          params: { activeOnly: true },
        });
        setShop(shopResponse.data);

        const productsResponse = await api.get('/products', {
          params: { vendorId: auth_id, isActive: true, limit: 10 },
        });
        console.log('Réponse /products:', productsResponse.data); // Log pour déboguer
        setProducts(productsResponse.data.data || []);

        if (token) {
          const [favoritesData, cartData] = await Promise.all([
            api.get('/favorites/mine'),
            api.get('/cart/mine'),
          ]);
          setFavoriteProductIds(favoritesData.data.map(fav => fav.product_id) || []);
          setCartProductIds(cartData.data.map(cart => cart.product_id) || []);
        }
      } catch (err) {
        console.error('Erreur récupération données:', err.response?.status, err.response?.data || err.message);
        setError(err.response?.status === 401 ? 'Vous devez être connecté pour voir cette boutique.' : err.message || 'Erreur lors de la récupération des données.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [auth_id]);

  useEffect(() => {
    document.title = `${shop?.shop_name || 'Boutique'} | MarchéNet Afrique`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', `Découvrez les produits de ${shop?.shop_name || 'cette boutique'} sur MarchéNet Afrique.`);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = `Découvrez les produits de ${shop?.shop_name || 'cette boutique'} sur MarchéNet Afrique.`;
      document.head.appendChild(meta);
    }
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', `boutique ${shop?.shop_name || ''}, ${shop?.vendor_name || ''}, produits, e-commerce, MarchéNet Afrique`);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = `boutique ${shop?.shop_name || ''}, ${shop?.vendor_name || ''}, produits, e-commerce, MarchéNet Afrique`;
      document.head.appendChild(meta);
    }
  }, [shop]);

  const handleFavoriteToggle = async (productId) => {
    const token = getAuthToken();
    if (!token) {
      alert('Inscrivez-vous pour gérer vos favoris !');
      navigate('/connexion');
      return;
    }
    try {
      const response = await api.post('/favorites/toggle', { productId });
      setFavoriteProductIds(response.data.isFavorite
        ? [...favoriteProductIds, productId]
        : favoriteProductIds.filter(id => id !== productId));
    } catch (err) {
      console.error('Erreur favoris:', err.response?.status, err.response?.data || err.message);
    }
  };

  const handleCartToggle = async (productId) => {
    const token = getAuthToken();
    if (!token) {
      alert('Inscrivez-vous pour ajouter au panier !');
      navigate('/connexion');
      return;
    }
    try {
      const response = await api.post('/cart/toggle', { productId, quantity: 1 });
      setCartProductIds(response.data.isInCart
        ? [...cartProductIds, productId]
        : cartProductIds.filter(id => id !== productId));
    } catch (err) {
      console.error('Erreur panier:', err.response?.status, err.response?.data || err.message);
    }
  };

  if (loading) return <p className="text-center text-gray-600">Chargement...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!shop) return <p className="text-center text-gray-600">Boutique non trouvée ou désactivée.</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Link to="/" className="text-gray-600 mb-4 inline-block">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </Link>
      <h2 className="text-2xl font-bold mb-4 font-poppins">{shop.shop_name}</h2>
      <p className="text-gray-600 font-opensans">Vendeur: {shop.vendor_name}</p>
      <p className="text-gray-600 font-opensans">Tel: {shop.phone_number}</p>
      <div className="mt-6">
        <h3 className="text-lg font-semibold font-poppins mb-4">Produits</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.length === 0 ? (
            <p className="text-center text-gray-600">Aucun produit disponible.</p>
          ) : (
            products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={favoriteProductIds.includes(product.id)}
                isInCart={cartProductIds.includes(product.id)}
                onFavoriteToggle={() => handleFavoriteToggle(product.id)}
                onCartToggle={() => handleCartToggle(product.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ShopDetails;