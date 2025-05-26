import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { logout } from '../utils/auth';
import { useAuth } from "../context/AuthContext";

function Sidebar({ isOpen, toggleSidebar }) {
  const { isAuthenticated, user, checkAuthStatus } = useAuth();
  const sidebarRef = useRef(null);

  // Détection du rôle et du statut vendeur
  const userRole = user?.role || 'user';
  const isVendor = userRole === 'vendor' || user?.isVendor;

  const userCountry = user?.country || '';

  const handleLogout = () => {
    logout(() => {
      checkAuthStatus(); // <-- Ajoute ceci pour forcer la mise à jour du contexte
      toggleSidebar();
    });
  };

  const handleChangeCountry = async () => {
    const newCountry = prompt('Entrez votre nouveau pays :');
    // Ici tu peux faire l'appel API pour changer le pays si besoin
    // Mais il faut aussi mettre à jour le contexte global si tu veux voir le changement partout
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isOpen) {
        toggleSidebar();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, toggleSidebar]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  return (
    <>
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 w-64 h-screen bg-white shadow-lg transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 z-50 overflow-y-auto max-h-screen`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold font-poppins">
            MarchéNet <span className="text-orange-500">Afrique</span>
          </h2>
          <button onClick={toggleSidebar}>
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col p-4 text-gray-700 gap-2 font-opensans">
          <Link to="/" onClick={toggleSidebar} className="flex items-center">
            {/* ...icône... */} Accueil
          </Link>
          {isAuthenticated && isVendor && (
            <>
              <Link to="/ajouter-produit" onClick={toggleSidebar} className="flex items-center">
                {/* ...icône... */} Ajouter un produit
              </Link>
              <Link to="/tableau-de-bord" onClick={toggleSidebar} className="flex items-center">
                {/* ...icône... */} Tableau de bord
              </Link>
              <Link to="/ma-boutique" onClick={toggleSidebar} className="flex items-center">
                {/* ...icône... */} Ma boutique
              </Link>
            </>
          )}
          {isAuthenticated && userRole === 'admin' && (
            <Link to="/admin" onClick={toggleSidebar} className="flex items-center">
              {/* ...icône... */} Administration
            </Link>
          )}
          <Link to="/mes-favoris" onClick={toggleSidebar} className="flex items-center">
            {/* ...icône... */} Mes favoris
          </Link>
          <Link to="/boutiques" onClick={toggleSidebar} className="flex items-center">
            {/* ...icône... */} Boutiques
          </Link>
          <Link to="/top-produits" onClick={toggleSidebar} className="flex items-center">
            {/* ...icône... */} Top Produits
          </Link>
          {!isVendor && (
            <Link to="/devenir-vendeur" onClick={toggleSidebar} className="flex items-center">
              {/* ...icône... */} Devenir Vendeur
            </Link>
          )}
          <Link to="/comment-ouvrir-une-boutique" onClick={toggleSidebar} className="flex items-center">
            {/* ...icône... */} Comment ouvrir une boutique
          </Link>
          <Link to="/faq" onClick={toggleSidebar} className="flex items-center">
            {/* ...icône... */} FAQ
          </Link>
          {!isAuthenticated && (
            <Link to="/connexion" onClick={toggleSidebar} className="flex items-center">
              {/* ...icône... */} Connexion
            </Link>
          )}
          {isAuthenticated && (
            <>
              <Link to="/mon-profil" onClick={toggleSidebar} className="flex items-center">
                {/* ...icône... */} Mon profil
              </Link>
              <button onClick={handleChangeCountry} className="flex items-center text-gray-700">
                {/* ...icône... */} Changer de pays {userCountry ? `(${userCountry})` : ''}
              </button>
              <Link to="/" onClick={handleLogout} className="flex items-center">
                {/* ...icône... */} Déconnexion
              </Link>
            </>
          )}
          <Link to="/contact" onClick={toggleSidebar} className="flex items-center">
            {/* ...icône... */} Nous contacter
          </Link>
        </nav>
      </div>
    </>
  );
}

export default Sidebar;