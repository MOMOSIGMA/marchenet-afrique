import { Navigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, requiredRole }) {
  const { user, isVendor, loading } = useAuth();

  if (loading) return <div>Chargement...</div>;
  if (!user) return <Navigate to="/connexion" />;

  // Gestion des rôles
  if (requiredRole === 'vendor' && !isVendor) {
    return <Navigate to="/devenir-vendeur" />;
  }
  if (requiredRole === 'admin' && user.role !== 'admin') {
    return <Navigate to="/mon-profil" />;
  }

  return children;
}

export default ProtectedRoute;