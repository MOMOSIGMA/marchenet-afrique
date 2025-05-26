import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

function SearchBar({ className }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const synonyms = {
    'sac': ['sac à main', 'sacoche', 'sac à dos', 'poche'],
    'vêtement': ['robe', 'chemise', 'pantalon', 'tenue'],
    'alimentation': ['nourriture', 'épicerie', 'aliment'],
  };

  const getCachedSuggestions = (query) => {
    const cached = localStorage.getItem(`suggestions_${query}`);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return data;
      }
    }
    return null;
  };

  const setCachedSuggestions = (query, data) => {
    localStorage.setItem(`suggestions_${query}`, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  };

  useEffect(() => {
    let mounted = true;

    const fetchUserCountry = async () => {
      const token = localStorage.getItem('token');
      if (!token) return 'all';

      try {
        const response = await api.get('/profiles/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data?.country || 'all';
      } catch (err) {
        console.error('Erreur lors de la récupération du pays:', err);
        return 'all';
      }
    };

    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        if (mounted) {
          setSuggestions([]);
          setIsOpen(false);
        }
        return;
      }

      const cleanedQuery = searchQuery.toLowerCase().trim().replace(/à/g, 'a').replace(/é/g, 'e');
      let expandedQuery = [cleanedQuery];
      for (let key in synonyms) {
        if (synonyms[key].includes(cleanedQuery) || key === cleanedQuery) {
          expandedQuery = expandedQuery.concat(synonyms[key]);
          break;
        }
      }

      const cachedSuggestions = getCachedSuggestions(cleanedQuery);
      if (cachedSuggestions && mounted) {
        setSuggestions(cachedSuggestions);
        setIsOpen(true);
        return;
      }

      let userCountry = await fetchUserCountry();
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts && mounted) {
        try {
          const response = await api.get('/products/suggestions', {
            params: {
              query: expandedQuery.join(','),
              country: userCountry,
            },
          });

          const uniqueSuggestions = [...new Set(response.data?.map(item => item.name) || [])];
          const finalSuggestions = uniqueSuggestions.length > 0
            ? uniqueSuggestions
            : ['Aucun produit exact trouvé, essayez "vêtements" ou "alimentation"'];
          if (mounted) {
            setSuggestions(finalSuggestions);
            setCachedSuggestions(cleanedQuery, finalSuggestions);
            setIsOpen(true);
            setError(null);
          }
          break;
        } catch (err) {
          attempts++;
          if (attempts === maxAttempts && mounted) {
            setError('Impossible de charger les suggestions. Vérifiez votre connexion.');
            setSuggestions([]);
            setIsOpen(false);
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    };

    const timeoutId = setTimeout(() => {
      if (mounted) fetchSuggestions();
    }, 300);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleClick = (suggestion) => {
    navigate(`/search?query=${encodeURIComponent(suggestion)}`);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`w-full bg-white p-3 shadow h-16 ${className}`}>
      <div className="relative max-w-4xl mx-auto h-full flex items-center">
        <div className="flex items-center border border-gray-300 rounded-lg p-2 bg-white shadow-sm focus-within:ring-2 focus-within:ring-orange-500 w-full">
          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7 7 0 1114.65 5.65a7 7 0 012.3 11.3z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearch}
            placeholder="Rechercher un produit, un vendeur..."
            className="w-full outline-none text-gray-700 bg-transparent text-sm"
            aria-label="Rechercher un produit ou un vendeur"
          />
        </div>
        {isOpen && suggestions.length > 0 && (
          <div className="absolute z-30 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-w-4xl top-12">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleClick(suggestion)}
                className="p-2 hover:bg-gray-100 cursor-pointer text-gray-700 text-sm"
                role="option"
                aria-selected="false"
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && (
        <div className="text-red-500 text-center mt-2">
          {error}
        </div>
      )}
    </div>
  );
}

export default SearchBar;