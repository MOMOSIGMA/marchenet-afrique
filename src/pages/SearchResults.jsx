import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { useAuth } from '../context/AuthContext'; // <-- Correction ici

function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('query') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const [products, setProducts] = useState([]);
  const [favoriteProductIds, setFavoriteProductIds] = useState([]);
  const [cartProductIds, setCartProductIds] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 10;
  const { isAuthenticated, user } = useAuth();
  const [showScrollTop, setShowScrollTop] = useState(false);

  const countries = ['all', 'Sénégal', 'Mali', "Côte d'Ivoire", 'Guinée', 'Burkina Faso', 'Togo', 'Bénin', 'Cameroun'];

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/products', { // Supprime /api
        params: {
          search: query,
          page,
          limit: productsPerPage,
          country: selectedCountry !== 'all' ? selectedCountry : undefined,
        },
      });
      setProducts(response.data.data || []);
      setTotalPages(Math.ceil(response.data.total / productsPerPage) || 1);

      if (isAuthenticated && user) {
        const [favoritesRes, cartRes] = await Promise.all([
          api.get('/favorites/toggle', { // Supprime /api
            headers: { Authorization: `Bearer ${user.token}` },
            params: { productId: 'check' },
          }),
          api.get('/cart/toggle', { // Supprime /api
            headers: { Authorization: `Bearer ${user.token}` },
            params: { productId: 'check' },
          }),
        ]);
        setFavoriteProductIds(favoritesRes.data.isFavorite ? [1] : []);
        setCartProductIds(cartRes.data.isInCart ? [1] : []);
      }
    } catch (err) {
      console.error('Erreur fetchProducts:', err.response ? err.response.data : err.message);
      setError('Erreur lors de la recherche. Réessayez.');
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [query, selectedCountry, page, isAuthenticated]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFavoriteToggle = async (productId) => {
    if (!isAuthenticated || !user) {
      alert('Inscrivez-vous pour gérer vos favoris !');
      navigate('/inscription');
      return;
    }
    try {
      await api.post('/favorites/toggle', { productId }, { // Supprime /api
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setFavoriteProductIds(prev => 
        prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
      );
    } catch (err) {
      alert('Erreur mise à jour favoris.');
    }
  };

  const handleCartToggle = async (productId) => {
    if (!isAuthenticated || !user) {
      alert('Inscrivez-vous pour ajouter au panier !');
      navigate('/inscription');
      return;
    }
    try {
      await api.post('/cart/toggle', { productId, quantity: 1 }, { // Supprime /api
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setCartProductIds(prev => 
        prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
      );
    } catch (err) {
      alert('Erreur mise à jour panier.');
    }
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ query, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <SearchBar className="fixed top-16 left-0 right-0 z-20" />
      <div className="mt-28 px-4">
        <h1 className="text-2xl font-bold mb-4 font-poppins">Résultats pour : {query}</h1>
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2 font-poppins">Filtrer par pays</h2>
          <select onChange={(e) => setSelectedCountry(e.target.value)} value={selectedCountry} className="p-2 border rounded-lg">
            {countries.map((country) => <option key={country} value={country}>{country === 'all' ? 'Tous les pays' : country}</option>)}
          </select>
        </div>
        {loading ? <p className="text-center text-gray-600">Chargement...</p> : error ? (
          <div className="text-center text-red-500 p-4 bg-red-100 rounded-lg">
            <p>{error}</p>
            <button onClick={fetchProducts} className="mt-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">Réessayer</button>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">Nombre de produits : {products.length}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.length === 0 ? <p className="text-center text-gray-600">Aucun produit trouvé.</p> : products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favoriteProductIds.includes(product.id)}
                  isInCart={cartProductIds.includes(product.id)}
                  onFavoriteToggle={() => handleFavoriteToggle(product.id)}
                  onCartToggle={() => handleCartToggle(product.id)}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center space-x-2">
                <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="bg-orange-500 text-white px-4 py-2 rounded-lg disabled:bg-gray-300">Précédent</button>
                <span className="self-center">Page {page} sur {totalPages}</span>
                <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} className="bg-orange-500 text-white px-4 py-2 rounded-lg disabled:bg-gray-300">Suivant</button>
              </div>
            )}
          </div>
        )}
        {!loading && products.length > 0 && !isAuthenticated && (
          <p className="mt-4 text-center text-gray-600">
            Inscrivez-vous pour suivre vos favoris, ajouter au panier ! <a href="/inscription" className="text-orange-500 hover:underline">S’inscrire</a>
          </p>
        )}
      </div>
      <button
        onClick={scrollToTop}
        className={`fixed bottom-4 right-4 bg-orange-500 text-white p-3 rounded-full shadow-lg transition-all duration-300 ${showScrollTop ? 'opacity-100' : 'opacity-0 pointer-events-none'} hover:scale-110`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
      <footer className="bg-orange-500 text-white py-4 w-full mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><h2 className="text-base font-bold font-poppins mb-2">Liens utiles</h2><ul className="text-sm font-opensans space-y-1"><li><a href="/" className="hover:underline">Accueil</a></li><li><a href="/devenir-vendeur" className="hover:underline">Devenir Vendeur</a></li><li><a href="/contact" className="hover:underline">Contact</a></li></ul></div>
            <div><h2 className="text-base font-bold font-poppins mb-2">Contact</h2><p className="text-sm font-opensans">Email : <a href="mailto:support@marchenetafrique.com" className="hover:underline">support@marchenetafrique.com</a></p><p className="text-sm font-opensans">WhatsApp : <a href="https://wa.me/+221123456789" className="hover:underline">+221 123 456 789</a></p></div>
          </div>
          <div className="mt-4 text-center text-sm font-opensans">© {new Date().getFullYear()} MarchéNet Afrique. Tous droits réservés.</div>
        </div>
      </footer>
    </div>
  );
}

export default SearchResults;