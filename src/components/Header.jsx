import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // <-- Correction ici

function Header({ toggleSidebar }) {
  const { isAuthenticated, notificationCount, error, checkAuthStatus } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearchClick = () => {
    navigate('/search');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow z-30 h-16">
      <div className="flex items-center justify-between p-2 h-full">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="text-gray-600 flex items-center justify-center h-10 w-10"
            aria-label="Ouvrir le menu latéral"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/" className="flex items-center">
            <img 
              src="/assets/logo-marchénet-afrique-site.png" 
              alt="MarchéNet Afrique Logo" 
              className="md:h-14 h-12 w-auto align-middle mt-1 transition-all duration-300"
            />
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          {isAuthenticated && (
            <Link to="/notifications" className="relative" aria-label="Voir les notifications">
              <svg className={`w-6 h-6 text-gray-600 ${notificationCount > 0 ? 'animate-shake' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationCount > 0 && (
                <span className="absolute top-[-4px] right-[-4px] w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </Link>
          )}
          <Link to="/panier" className="text-gray-600" aria-label="Voir le panier">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </Link>
          <button
            onClick={handleSearchClick}
            className="text-gray-600"
            aria-label="Ouvrir la recherche"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7 7 0 1114.65 5.65a7 7 0 012.3 11.3z" />
            </svg>
          </button>
          <Link
            to={isAuthenticated ? '/mon-profil' : '/connexion'}
            className={isAuthenticated ? "text-green-400" : "text-gray-600"}
            aria-label={isAuthenticated ? "Profil connecté" : "Se connecter"}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Link>
        </div>
      </div>
      {error && (
        <div className="bg-red-500 text-white text-center py-1 animate-fade">
          {error}
        </div>
      )}
      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: rotate(0deg); }
            20% { transform: rotate(5deg); }
            40% { transform: rotate(-5deg); }
            60% { transform: rotate(3deg); }
            80% { transform: rotate(-3deg); }
          }
          .animate-shake {
            animation: shake 2s infinite;
          }
          @keyframes fade {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          .animate-fade {
            animation: fade 0.5s ease-in-out;
          }
        `}
      </style>
    </header>
  );
}

export default Header;