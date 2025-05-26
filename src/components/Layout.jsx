// src/components/Layout.jsx
import Header from './Header';
import { useAuth } from '../context/AuthContext'; // <-- Correction ici

function Layout({ children, toggleSidebar }) {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-gray-100">
      <Header toggleSidebar={toggleSidebar} isAuthenticated={isAuthenticated} />
      <main className="pt-20 px-4">
        {children}
      </main>
    </div>
  );
}

export default Layout;