import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import api from './api';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import BecomeVendor from './pages/BecomeVendor';
import Favorites from './pages/Favorites';
import Cart from './pages/Cart';
import TopProducts from './pages/TopProducts';
import MyShop from './pages/MyShop';
import AddProduct from './pages/AddProduct';
import Dashboard from './pages/Dashboard';
import HowToOpenShop from './pages/HowToOpenShop';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import ProductDetails from './pages/ProductDetails';
import Profile from './pages/Profile';
import ViewShops from './pages/ViewShops';
import Messages from './pages/Messages';
import ProtectedRoute from './components/ProtectedRoute';
import SearchResults from './pages/SearchResults';
import Shops from './pages/Shops';
import ShopDetails from './pages/ShopDetails';
import AdminDashboard from './pages/AdminDashboard';
import Notifications from './pages/Notifications';
import ManageSubscription from './pages/ManageSubscription';
import EditProduct from './pages/EditProduct';

function App() {
  // Get loading from AuthContext
  const { user, isVendor, loading: authLoading, login, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Rename this loading state to avoid conflict
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  const verifyAuth = async () => {
    setIsVerifying(true);
    try {
      const publicRoutes = [
        '/', '/connexion', '/inscription', '/faq', '/contact', '/details-produit', 
        '/voir-les-boutiques', '/boutiques', '/boutique', '/search', '/top-produits', 
        '/comment-ouvrir-une-boutique'
      ];
      
      const isPublicRoute = publicRoutes.some(route => 
        window.location.pathname === route || 
        window.location.pathname.startsWith(route + '/')
      );

      const res = await api.get("/auth/check"); // Maintenant api est défini
      if (res.data.user) {
        login(res.data.user.email, res.data.user.password);
        if (window.location.pathname === '/connexion') {
          navigate('/mon-profil', { replace: true });
        }
      } else if (!isPublicRoute) {
        navigate('/connexion', { replace: true });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    verifyAuth();
  }, []); // <--- dépendances vides pour éviter la boucle

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (authLoading) return <div className="text-center py-10">Chargement...</div>;

  return (
    <Layout toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/connexion" element={<Login />} />
        <Route path="/inscription" element={<Register />} />
        <Route path="/devenir-vendeur" element={<ProtectedRoute><BecomeVendor /></ProtectedRoute>} />
        <Route path="/mes-favoris" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
        <Route path="/panier" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/top-produits" element={<TopProducts />} />
        <Route path="/ma-boutique" element={<ProtectedRoute><MyShop /></ProtectedRoute>} />
        <Route path="/ajouter-produit" element={<ProtectedRoute requiredRole="vendor"><AddProduct /></ProtectedRoute>} />
        <Route path="/tableau-de-bord" element={<ProtectedRoute requiredRole="vendor"><Dashboard /></ProtectedRoute>} />
        <Route path="/comment-ouvrir-une-boutique" element={<HowToOpenShop />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/details-produit/:id" element={<ProductDetails />} />
        <Route path="/mon-profil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/voir-les-boutiques" element={<ViewShops />} />
        <Route path="/boutiques" element={<Shops />} />
        <Route path="/boutique/:auth_id" element={<ShopDetails />} />
        <Route path="/mes-messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/gérer-abonnement" element={<ProtectedRoute requiredRole="vendor"><ManageSubscription /></ProtectedRoute>} />
        <Route path="/modifier-produit/:id" element={<ProtectedRoute requiredRole="vendor"><EditProduct /></ProtectedRoute>} />
      </Routes>
    </Layout>
  );
}

function AppWrapper() {
  return (
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  );
}

export default AppWrapper;