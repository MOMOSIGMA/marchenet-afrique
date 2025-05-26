import { useEffect, useState } from "react";
import { getFavorites, toggleFavorite } from "../api/favorites";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const response = await getFavorites();
        setFavorites(response.data || []);
      } catch (err) {
        setError(err.response?.data?.error || "Une erreur est survenue lors de la récupération des favoris.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
    return () => {};
  }, []);

  const handleToggleFavorite = async (productId) => {
    try {
      await toggleFavorite(productId);
      // Recharge la liste après modification
      const res = await getFavorites();
      setFavorites(res.data);
    } catch (err) {
      setError("Erreur lors de la suppression : " + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return <p className="text-center text-gray-600">Chargement...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 font-poppins">Mes favoris</h2>
      {favorites.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {favorites.map(product => (
            <div key={product.id} className="relative bg-white rounded-lg shadow">
              <img
                src={product.photo_urls && product.photo_urls[0]}
                className="rounded-t-lg w-full h-auto max-h-48 object-contain"
                alt={product.name}
              />
              <p className="font-opensans p-2">{product.name}</p>
              <p className="font-opensans p-2">{product.price} FCFA</p>
              <button
                onClick={() => handleToggleFavorite(product.id)}
                className="mt-2 px-2 py-1 bg-red-500 text-white rounded"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 font-opensans">Vous n'avez aucun favori.</p>
      )}
    </div>
  );
}

export default Favorites;