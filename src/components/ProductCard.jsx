import { Link } from 'react-router-dom';
import { useState } from 'react';

function ProductCard({ product, isFavorite, isInCart, onFavoriteToggle, onCartToggle, formattedPrice }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFavorite = async () => {
    setIsLoading(true);
    try {
      await onFavoriteToggle();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCart = async () => {
    setIsLoading(true);
    try {
      await onCartToggle();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative bg-white rounded-lg shadow">
      <Link to={`/details-produit/${product.id}`}>
        <img
          src={product.photo_urls && product.photo_urls[0] ? product.photo_urls[0] : 'https://via.placeholder.com/150'}
          className="rounded-t-lg w-full h-auto max-h-48 object-contain"
          alt={product.name}
          loading="lazy"
        />
      </Link>
      {product.discount && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          -{product.discount}%
        </span>
      )}
      {product.isNew && (
        <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          Nouveau
        </span>
      )}
      <button
        onClick={handleFavorite}
        disabled={isLoading}
        className={`absolute top-2 right-2 ${isLoading ? 'opacity-50' : ''}`}
      >
        <svg className={`w-6 h-6 ${isFavorite ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>
      <button
        onClick={handleCart}
        disabled={isLoading}
        className={`absolute top-10 right-2 ${isLoading ? 'opacity-50' : ''}`}
      >
        <svg className={`w-6 h-6 ${isInCart ? 'text-blue-500' : 'text-gray-400'} hover:text-blue-500`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-0.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-0.16 0.28-0.25 0.61-0.25 0.96 0 1.1 0.9 2 2 2h10v-2H7.42c-0.14 0-0.25-0.11-0.25-0.25l0.03-0.12.9-1.63h7.45c0.75 0 1.41-0.41 1.75-1.03l3.58-6.49c0.08-0.14 0.12-0.31 0.12-0.48 0-0.55-0.45-1-1-1H5.21l-0.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s0.89 2 1.99 2 2-0.9 2-2-0.9-2-2-2z"/>
        </svg>
      </button>
      <p className="font-opensans p-2">{product.name}</p>
      <p className="font-opensans p-2 text-orange-500">{formattedPrice}</p>
    </div>
  );
}

export default ProductCard;