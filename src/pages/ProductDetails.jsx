// src/pages/ProductDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductById } from '../api/products';
import { useAuth } from '../context/AuthContext';

function ProductDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const productData = (await getProductById(id)).data;
        setProduct(productData);

        // Récupérer les informations du vendeur
        const vendorResponse = await api.get(`/vendors/${productData.vendor_id}`);
        setVendor(vendorResponse.data || { vendor_name: 'Inconnu', phone_number: 'N/A' });

        // Vérifier les favoris et le panier uniquement si l'utilisateur est connecté
        if (isAuthenticated) {
          const [favoriteResponse, cartResponse] = await Promise.all([
            api.get('/favorites/check', { params: { productId: id } }),
            api.get('/cart/check', { params: { productId: id } }),
          ]);
          setIsFavorite(!!favoriteResponse.data);
          setIsInCart(!!cartResponse.data);
        } else {
          setIsFavorite(false);
          setIsInCart(false);
        }
      } catch (err) {
        setError(err.message || 'Une erreur est survenue lors de la récupération du produit.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isAuthenticated]);

  const handleCarouselChange = (direction) => {
    const totalImages = product?.photo_urls?.length || 0;
    setCurrentImageIndex((currentImageIndex + direction + totalImages) % totalImages);
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      alert('Veuillez vous connecter pour ajouter aux favoris.');
      navigate('/connexion');
      return;
    }

    try {
      const response = await api.post('/favorites/toggle', { productId: id });
      setIsFavorite(response.data.isFavorite);
    } catch (err) {
      console.error('Erreur lors de la gestion des favoris:', err);
      setError('Erreur lors de la gestion des favoris.');
    }
  };

  const toggleCart = async () => {
    if (!isAuthenticated) {
      alert('Veuillez vous connecter pour ajouter au panier.');
      navigate('/connexion');
      return;
    }

    try {
      const response = await api.post('/cart/toggle', { productId: id, quantity: 1 });
      setIsInCart(response.data.isInCart);
    } catch (err) {
      console.error('Erreur lors de la gestion du panier:', err);
      setError('Erreur lors de la gestion du panier.');
    }
  };

  if (loading) return <p className="text-center text-gray-600 font-opensans">Chargement...</p>;
  if (error) return (
    <div>
      <h2 className="text-2xl font-bold mb-4 font-poppins">Erreur</h2>
      <p className="text-red-500 font-opensans">{error}</p>
      <Link to="/" className="bg-orange-500 text-white px-4 py-2 rounded-lg mt-4 font-opensans font-semibold inline-block">Retour</Link>
    </div>
  );
  if (!product) return null;

  const whatsappMessage = `Bonjour, je suis intéressé par le produit ${product.name} (${product.price} FCFA). Pouvez-vous me donner plus d'infos ?`;
  const whatsappUrl = `https://wa.me/${vendor?.phone_number || ''}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow">
      <Link to="/" className="text-gray-600 mb-4 inline-block">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </Link>
      <div className="relative w-full">
        <div className="relative">
          {product.photo_urls && product.photo_urls.length > 0 ? (
            product.photo_urls.map((photo, index) => (
              <div key={index} className={`relative ${index === currentImageIndex ? '' : 'hidden'}`}>
                <img
                  src={photo}
                  className="w-full rounded-lg h-auto max-h-96 object-contain"
                  alt={`${product.name} - Photo ${index + 1}`}
                  loading="lazy"
                />
                <span
                  className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold text-white ${
                    product.condition === 'neuf' ? 'bg-green-500' : 'bg-orange-500'
                  }`}
                >
                  {product.condition === 'neuf' ? 'NEUF' : 'OCCASION'}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-600 font-opensans">Aucune image disponible.</p>
          )}
        </div>
        {product.photo_urls && product.photo_urls.length > 1 && (
          <>
            <button onClick={() => handleCarouselChange(-1)} className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-r-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={() => handleCarouselChange(1)} className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-l-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
      <h2 className="text-2xl font-bold font-poppins mb-2 mt-4">{product.name}</h2>
      <p className="text-orange-500 text-lg font-opensans mb-2">{new Intl.NumberFormat('fr-FR').format(product.price)} FCFA</p>
      <p className="text-gray-600 font-opensans mb-2 line-clamp-3" style={{ maxHeight: '4.5em', overflow: 'hidden' }}>
        {product.description}
      </p>
      <p className="text-gray-600 font-opensans mb-2">Stock : {product.stock}</p>
      <p className="text-gray-600 font-opensans mb-2">Pays disponibles : {product.countries?.join(', ') || 'Non spécifié'}</p>
      <div className="flex flex-col gap-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 text-white px-4 py-2 rounded-lg font-opensans font-semibold flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 20.5c-4.687 0-8.5-3.813-8.5-8.5S7.313 3.5 12 3.5s8.5 3.813 8.5 8.5-3.813 8.5-8.5 8.5zm-3.5-6.5l2.5 1.5 2.5-1.5 2 2-4.5 2.5-4.5-2.5 2-2z" />
          </svg>
          WhatsApp
        </a>
        <button
          onClick={toggleFavorite}
          className={`px-4 py-2 rounded-lg font-opensans font-semibold flex items-center justify-center gap-2 ${isFavorite ? 'bg-red-500 text-white' : 'bg-gray-300'}`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        </button>
        <button
          onClick={toggleCart}
          className={`px-4 py-2 rounded-lg font-opensans font-semibold flex items-center justify-center gap-2 ${isInCart ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-0.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-0.16 0.28-0.25 0.61-0.25 0.96 0 1.1 0.9 2 2 2h10v-2H7.42c-0.14 0-0.25-0.11-0.25-0.25l0.03-0.12.9-1.63h7.45c0.75 0 1.41-0.41 1.75-1.03l3.58-6.49c0.08-0.14 0.12-0.31 0.12-0.48 0-0.55-0.45-1-1-1H5.21l-0.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s0.89 2 1.99 2 2-0.9 2-2-0.9-2-2-2z"/>
          </svg>
          {isInCart ? 'Retirer du panier' : 'Ajouter au panier'}
        </button>
      </div>
    </div>
  );
}

export default ProductDetails;