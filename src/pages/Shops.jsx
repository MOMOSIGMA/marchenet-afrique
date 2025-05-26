import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api'; // Corrige l'importation

const normalizeString = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’\-\s]/g, '');
};

function Shops() {
  const [shops, setShops] = useState([]);
  const [allShops, setAllShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userCountry, setUserCountry] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const countries = ['all', 'Sénégal', 'Mali', "Côte d'Ivoire", 'Guinée', 'Burkina Faso', 'Togo', 'Bénin', 'Cameroun'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        let country = '';
        if (token) {
          const profileResponse = await api.get('/profiles/me', { headers: { Authorization: `Bearer ${token}` } });
          if (profileResponse.data?.country) {
            country = profileResponse.data.country;
            setUserCountry(country);
            setFilterCountry(country);
          }
        }

        const vendorsResponse = await api.get('/vendors'); // Supprime /api
        setAllShops(vendorsResponse.data || []);
        applyFilter(vendorsResponse.data, country);
      } catch (err) {
        setError(err.message || 'Erreur lors de la récupération des boutiques.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    document.title = `Nos Boutiques ${filterCountry && filterCountry !== 'all' ? ` - ${filterCountry}` : ''} | MarchéNet Afrique`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', `Découvrez les boutiques ${filterCountry && filterCountry !== 'all' ? `à ${filterCountry} ` : ''}sur MarchéNet Afrique, votre plateforme e-commerce africaine.`);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = `Découvrez les boutiques ${filterCountry && filterCountry !== 'all' ? `à ${filterCountry} ` : ''}sur MarchéNet Afrique, votre plateforme e-commerce africaine.`;
      document.head.appendChild(meta);
    }
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', `boutiques ${filterCountry && filterCountry !== 'all' ? filterCountry : 'afrique'}, e-commerce, vendre en ligne, MarchéNet Afrique`);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = `boutiques ${filterCountry && filterCountry !== 'all' ? filterCountry : 'afrique'}, e-commerce, vendre en ligne, MarchéNet Afrique`;
      document.head.appendChild(meta);
    }

    applyFilter(allShops, filterCountry);
  }, [filterCountry, allShops]);

  const applyFilter = (shopsData, country) => {
    let filteredShops = shopsData;
    if (country && country !== 'all') {
      const normalizedFilterCountry = normalizeString(country);
      filteredShops = shopsData.filter((shop) => {
        const normalizedShopCountry = normalizeString(shop.country || '');
        return normalizedShopCountry === normalizedFilterCountry;
      });
    }
    setShops(filteredShops);
  };

  if (loading) return <p className="text-center text-gray-600">Chargement...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h2 className="text-2xl font-bold mb-4 font-poppins">Nos Boutiques</h2>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-auto">
          <label className="block text-gray-700 font-opensans mb-2" htmlFor="filterCountry">
            Filtrer par pays
          </label>
          <select
            id="filterCountry"
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="w-full p-2 border rounded-lg font-opensans focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            {countries.map((country) => (
              <option key={country} value={country}>
                {country === 'all' ? 'Tous les pays' : country}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {shops.length === 0 ? (
          <p className="text-center text-gray-600">
            Aucune boutique trouvée{filterCountry && filterCountry !== 'all' ? ` dans ${filterCountry}` : ''}.
          </p>
        ) : (
          shops.map((shop) => (
            <div key={shop.auth_id} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
              <h3 className="text-lg font-semibold font-poppins">{shop.shop_name}</h3>
              <p className="text-gray-600 font-opensans">Tel: {shop.phone_number}</p>
              <p className="text-gray-600 font-opensans">Pays: {shop.country || 'Non spécifié'}</p>
              <Link
                to={`/boutique/${shop.auth_id}`}
                className="mt-2 bg-orange-500 text-white px-4 py-2 rounded-lg font-opensans font-semibold inline-block hover:bg-orange-600 transition"
              >
                Voir les produits
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Shops;