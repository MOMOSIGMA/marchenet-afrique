// src/pages/Home.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../api/products';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { user, isVendor } = useAuth();
  const [products, setProducts] = useState([]);
  const [favoriteProductIds, setFavoriteProductIds] = useState([]);
  const [cartProductIds, setCartProductIds] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(12);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();
  const initialRender = useRef(true);

  const categories = [
    'all',
    ...[
      'Accessoires de mode',
      'Agriculture et élevage',
      'Alimentation et boissons',
      'Ameublement et décoration',
      'Art et artisanat',
      'Articles pour bébés',
      'Automobile et motos',
      'Beauté et cosmétiques',
      'Bijoux et montres',
      'Bureautique et papeterie',
      'Chaussures',
      'Éducation et formation',
      'Électroménager',
      'Électronique',
      'Énergie et solaire',
      'Équipements industriels',
      'Équipements médicaux',
      'Instruments de musique',
      'Jardinage et plantes',
      'Jeux et jouets',
      'Livres et magazines',
      'Maison et cuisine',
      'Matériaux de construction',
      'Mode enfant',
      'Mode femme',
      'Mode homme',
      'Prêt-à-porter',
      'Produits culturels',
      'Santé et bien-être',
      'Services et prestations',
      'Sport et loisirs',
      'Téléphones',
      'Téléphonie et accessoires',
      'Textiles et tissus',
      'Voyage et bagages',
    ].sort(),
  ];
  const countries = ['all', 'Sénégal', 'Mali', "Côte d'Ivoire", 'Guinée', 'Burkina Faso', 'Togo', 'Bénin', 'Cameroun'];
  const priceRanges = ['all', '0-5000', '5000-10000', '10000-20000', '20000+'];
  const conditions = ['all', 'neuf', 'occasion'];

  useEffect(() => {
    document.title = "MarchéNet Afrique - Achetez et Vendez en Toute Simplicité";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Découvrez MarchéNet Afrique, la plateforme e-commerce pour acheter et vendre des produits locaux en Afrique.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Découvrez MarchéNet Afrique, la plateforme e-commerce pour acheter et vendre des produits locaux en Afrique.';
      document.head.appendChild(meta);
    }
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'e-commerce Afrique, acheter local, vendre en ligne, MarchéNet Afrique, produits africains');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = 'e-commerce Afrique, acheter local, vendre en ligne, MarchéNet Afrique, produits africains';
      document.head.appendChild(meta);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {
          limit,
          page: 1,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          country: selectedCountry !== 'all' ? selectedCountry : undefined,
          priceMin: selectedPriceRange !== 'all' ? Number(selectedPriceRange.split('-')[0]) : undefined,
          priceMax: selectedPriceRange !== 'all' && selectedPriceRange !== '20000+' ? Number(selectedPriceRange.split('-')[1]) : undefined,
          condition: selectedCondition !== 'all' ? selectedCondition : undefined,
        };
        const response = await getProducts(params);
        setProducts(response.data.data || []);
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, selectedCountry, selectedPriceRange, selectedCondition, limit]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const [favoritesRes, cartRes] = await Promise.all([
            api.get('/favorites/mine'), // Récupérer tous les favoris
            api.get('/cart/mine'), // Récupérer tous les articles du panier
          ]);
          setFavoriteProductIds(favoritesRes.data.map(fav => fav.product_id) || []);
          setCartProductIds(cartRes.data.map(cart => cart.product_id) || []);
        } catch (err) {
          console.error('Erreur récupération favoris/panier:', err.response?.status, '-', err.response?.data || err.message);
        }
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFavoriteToggle = async (productId) => {
    if (!user) {
      alert('Inscrivez-vous pour gérer vos favoris !');
      navigate('/connexion');
      return;
    }
    try {
      const response = await api.post('/favorites/toggle', { productId });
      setFavoriteProductIds(prev =>
        response.data.isFavorite ? [...prev, productId] : prev.filter(id => id !== productId)
      );
    } catch (err) {
      console.error('Erreur toggle favoris:', err.response?.status, '-', err.response?.data || err.message);
    }
  };

  const handleCartToggle = async (productId) => {
    if (!user) {
      alert('Inscrivez-vous pour ajouter au panier !');
      navigate('/connexion');
      return;
    }
    try {
      const response = await api.post('/cart/toggle', { productId, quantity: 1 });
      setCartProductIds(prev =>
        response.data.isInCart ? [...prev, productId] : prev.filter(id => id !== productId)
      );
    } catch (err) {
      console.error('Erreur toggle panier:', err.response?.status, '-', err.response?.data || err.message);
    }
  };

  const handleLoadMore = () => setLimit(prev => prev + 12);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesCountry = selectedCountry === 'all' || (Array.isArray(product.countries) && product.countries.includes(selectedCountry));
    const matchesPrice = selectedPriceRange === 'all' ||
      (selectedPriceRange === '0-5000' && product.price <= 5000) ||
      (selectedPriceRange === '5000-10000' && product.price > 5000 && product.price <= 10000) ||
      (selectedPriceRange === '10000-20000' && product.price > 10000 && product.price <= 20000) ||
      (selectedPriceRange === '20000+' && product.price > 20000);
    const matchesCondition = selectedCondition === 'all' || product.condition === selectedCondition;
    return matchesCategory && matchesCountry && matchesPrice && matchesCondition;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <SearchBar className="fixed top-16 left-0 right-0 z-20" />
      <div className="mt-28 px-4">
        <div className="mb-6">
          <div className="bg-orange-500 text-white p-4 rounded-lg text-center">
            <h2 className="text-xl font-bold font-poppins">Devenez vendeur sur MarchéNet Afrique !</h2>
            <p className="text-sm font-opensans">Commencez à vendre vos produits dès aujourd'hui auprès de milliers de clients à travers l'Afrique.</p>
          </div>
        </div>
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2 font-poppins">Filtres</h2>
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              <select
                onChange={(e) => setSelectedCategory(e.target.value)}
                value={selectedCategory}
                className="p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 min-w-[150px]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat === 'all' ? 'Toutes catégories' : cat}</option>
                ))}
              </select>
              <select
                onChange={(e) => setSelectedCountry(e.target.value)}
                value={selectedCountry}
                className="p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 min-w-[150px]"
              >
                {countries.map((country) => (
                  <option key={country} value={country}>{country === 'all' ? 'Tous les pays' : country}</option>
                ))}
              </select>
              <select
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                value={selectedPriceRange}
                className="p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 min-w-[150px]"
              >
                {priceRanges.map((range) => (
                  <option key={range} value={range}>{range === 'all' ? 'Tous les prix' : `${range} FCFA`}</option>
                ))}
              </select>
              <select
                onChange={(e) => setSelectedCondition(e.target.value)}
                value={selectedCondition}
                className="p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 min-w-[150px]"
              >
                {conditions.map((condition) => (
                  <option key={condition} value={condition}>{condition === 'all' ? 'Tous les états' : condition === 'neuf' ? 'Neuf' : 'Occasion'}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-4 font-poppins">Nos Produits</h2>
        {loading ? (
          <p className="text-center text-gray-600">Chargement...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">Nombre de produits : {filteredProducts.length}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredProducts.length === 0 ? (
                <p className="text-center text-gray-600">Aucun produit disponible trouvé.</p>
              ) : (
                filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isFavorite={favoriteProductIds.includes(product.id)}
                    isInCart={cartProductIds.includes(product.id)}
                    onFavoriteToggle={() => handleFavoriteToggle(product.id)}
                    onCartToggle={() => handleCartToggle(product.id)}
                    formattedPrice={new Intl.NumberFormat('fr-FR').format(product.price) + ' FCFA'}
                  />
                ))
              )}
            </div>
            {products.length >= limit && filteredProducts.length > 0 && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleLoadMore}
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
                >
                  Voir plus
                </button>
              </div>
            )}
          </div>
        )}
        {!loading && filteredProducts.length > 0 && !user && (
          <p className="mt-4 text-center text-gray-600">
            Inscrivez-vous pour suivre vos favoris, ajouter au panier et profiter de toutes les fonctionnalités !{' '}
            <a href="/connexion" className="text-orange-500 hover:underline">S’inscrire maintenant</a>
          </p>
        )}
      </div>
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
                <li><a href="/" className="hover:underline">Accueil</a></li>
                <li><a href="/devenir-vendeur" className="hover:underline">Devenir Vendeur</a></li>
                <li><a href="/contact" className="hover:underline">Contact</a></li>
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

export default Home;