import { useState, useEffect } from 'react';
import api from '../api';
import ProductCard from '../components/ProductCard';

function TopProducts() {
  const [products, setProducts] = useState([]);
  const [favoriteProductIds, setFavoriteProductIds] = useState([]);
  const [cartProductIds, setCartProductIds] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [userCountry, setUserCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const countries = ['all', 'Sénégal', 'Mali', "Côte d'Ivoire", 'Guinée', 'Burkina Faso', 'Togo', 'Bénin', 'Cameroun'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const authResponse = await api.get('/auth/check', { headers: { Authorization: `Bearer ${token}` } });
        setIsAuthenticated(!!authResponse.data.user);

        if (authResponse.data.user && isInitialLoad) {
          const profileResponse = await api.get('/profiles/me', { headers: { Authorization: `Bearer ${token}` } });
          const country = profileResponse.data?.country || 'all';
          setUserCountry(country);
          setSelectedCountry(country);
          setIsInitialLoad(false);
        }

        const activeVendorsResponse = await api.get('/vendors/active', { headers: { Authorization: `Bearer ${token}` } });
        const activeVendorIds = activeVendorsResponse.data.map(vendor => vendor.auth_id);

        if (activeVendorIds.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        const productsResponse = await api.get('/products', {
          params: { vendorIds: activeVendorIds.join(','), isActive: true, stockStatus: 'disponible' },
          headers: { Authorization: `Bearer ${token}` },
        });
        const allProducts = productsResponse.data;

        const favoritesResponse = await api.get('/favorites', { headers: { Authorization: `Bearer ${token}` } });
        const favoriteCounts = favoritesResponse.data.reduce((acc, fav) => {
          acc[fav.product_id] = (acc[fav.product_id] || 0) + 1;
          return acc;
        }, {});

        const productsWithFavorites = allProducts.map(product => ({
          ...product,
          favorite_count: favoriteCounts[product.id] || 0,
        }));

        let topProducts = [];
        if (selectedCountry === 'all') {
          topProducts = productsWithFavorites
            .sort((a, b) => b.favorite_count - a.favorite_count)
            .slice(0, 5);
        } else {
          const countryProducts = productsWithFavorites.filter(product =>
            product.countries.includes(selectedCountry)
          );
          const sortedCountryProducts = countryProducts
            .sort((a, b) => b.favorite_count - a.favorite_count);
          topProducts = sortedCountryProducts.slice(0, 5);
          if (topProducts.length < 5) {
            const otherProducts = productsWithFavorites
              .filter(product => !product.countries.includes(selectedCountry))
              .sort((a, b) => b.favorite_count - a.favorite_count);
            const additionalProducts = otherProducts.slice(0, 5 - topProducts.length);
            topProducts = [...topProducts, ...additionalProducts];
          }
        }
        setProducts(topProducts);

        if (authResponse.data.user) {
          const [favoritesData, cartData] = await Promise.all([
            api.get('/favorites/mine', { headers: { Authorization: `Bearer ${token}` } }),
            api.get('/cart/mine', { headers: { Authorization: `Bearer ${token}` } }),
          ]);
          setFavoriteProductIds(favoritesData.data.map(fav => fav.product_id) || []);
          setCartProductIds(cartData.data.map(cart => cart.product_id) || []);
        }
      } catch (err) {
        setError('Erreur lors du chargement des produits : ' + err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCountry, isInitialLoad]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFavoriteToggle = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Inscrivez-vous pour gérer vos favoris !');
      return;
    }
    try {
      const response = await api.post('/favorites/toggle', { productId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFavoriteProductIds(response.data.isFavorite
        ? [...favoriteProductIds, productId]
        : favoriteProductIds.filter(id => id !== productId));
    } catch (err) {
      console.error('Erreur favoris:', err);
    }
  };

  const handleCartToggle = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Inscrivez-vous pour ajouter au panier !');
      return;
    }
    try {
      const response = await api.post('/cart/toggle', { productId, quantity: 1 }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartProductIds(response.data.isInCart
        ? [...cartProductIds, productId]
        : cartProductIds.filter(id => id !== productId));
    } catch (err) {
      console.error('Erreur panier:', err);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mt-20">
      <h2 className="text-2xl font-bold mb-4 font-poppins">Top Produits</h2>
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2 font-poppins">Filtrer par pays</h3>
        <select
          onChange={(e) => setSelectedCountry(e.target.value)}
          value={selectedCountry}
          className="p-2 border rounded-lg"
        >
          {countries.map((country) => (
            <option key={country} value={country}>
              {country === 'all' ? 'Tous les pays' : country}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <p className="text-center text-gray-600">Chargement...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div>
          <p className="text-gray-600 mb-2">Nombre de produits : {products.length}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.length === 0 ? (
              <p className="text-center text-gray-600">Aucun produit populaire trouvé.</p>
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
      )}
      {!loading && products.length > 0 && !isAuthenticated && (
        <p className="mt-4 text-center text-gray-600">
          Inscrivez-vous pour suivre vos favoris, ajouter au panier et profiter de toutes les fonctionnalités !{' '}
          <a href="/inscription" className="text-orange-500 hover:underline">S’inscrire maintenant</a>
        </p>
      )}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-4 right-4 bg-orange-500 text-white p-3 rounded-full shadow-lg transition-all duration-300 ${
          showScrollTop ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } hover:scale-110`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
      <footer className="bg-orange-500 text-white py-4 mt-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-base font-bold font-poppins mb-2">Liens utiles</h3>
              <ul className="text-sm font-opensans space-y-1">
                <li>
                  <a href="/" className="hover:underline">Accueil</a>
                </li>
                <li>
                  <a href="/devenir-vendeur" className="hover:underline">Devenir Vendeur</a>
                </li>
                <li>
                  <a href="/contact" className="hover:underline">Contact</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-base font-bold font-poppins mb-2">Contact</h3>
              <p className="text-sm font-opensans">
                Email :{' '}
                <a href="mailto:support@marchenetafrique.com" className="hover:underline">
                  support@marchenetafrique.com
                </a>
              </p>
              <p className="text-sm font-opensans">
                WhatsApp :{' '}
                <a href="https://wa.me/+221123456789" className="hover:underline">
                  +221 123 456 789
                </a>
              </p>
            </div>
          </div>
          <div className="mt-4 text-center text-sm font-opensans">
            © {new Date().getFullYear()} MarchéNet Afrique. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default TopProducts;