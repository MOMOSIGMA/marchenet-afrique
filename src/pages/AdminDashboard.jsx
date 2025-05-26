import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getAuthToken } from '../utils/auth';

function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [totalMessages, setTotalMessages] = useState(0);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationTarget, setNotificationTarget] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentProductPage, setCurrentProductPage] = useState(1);
  const [currentMessagePage, setCurrentMessagePage] = useState(1);
  const [messageFilter, setMessageFilter] = useState('all');
  const productsPerPage = 10;
  const messagesPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Tableau de Bord Admin | MarchéNet Afrique';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Gestion des produits, vendeurs et notifications pour les administrateurs de MarchéNet Afrique.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Gestion des produits, vendeurs et notifications pour les administrateurs de MarchéNet Afrique.';
      document.head.appendChild(meta);
    }
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'admin, gestion, produits, vendeurs, notifications, MarchéNet Afrique');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = 'admin, gestion, produits, vendeurs, notifications, MarchéNet Afrique';
      document.head.appendChild(meta);
    }

    const fetchData = async () => {
      try {
        const token = await getAuthToken();
        if (!token) {
          navigate('/connexion');
          return;
        }

        const serverUrl = process.env.NODE_ENV === 'production' ? 'https://marchenet-server.onrender.com/api' : 'http://localhost:3001/api';
        const { data: userData } = await axios.get(`${serverUrl}/auth/check`, { headers: { Authorization: `Bearer ${token}` } });
        if (userData.role !== 'admin') {
          navigate('/');
          return;
        }

        const [productsData, vendorsData] = await Promise.all([
          axios.get(`${serverUrl}/products`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${serverUrl}/vendors`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setProducts(productsData.data || []);
        setVendors(vendorsData.data || []);

        await fetchMessages();
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Une erreur est survenue.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const fetchMessages = async () => {
    try {
      const token = await getAuthToken();
      const serverUrl = process.env.NODE_ENV === 'production' ? 'https://marchenet-server.onrender.com/api' : 'http://localhost:3001/api';
      const from = (currentMessagePage - 1) * messagesPerPage;
      const to = from + messagesPerPage - 1;

      let queryParams = `?from=${from}&to=${to}`;
      if (messageFilter !== 'all') queryParams += `&type=${messageFilter}`;

      const { data, headers } = await axios.get(`${serverUrl}/messages${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setContactMessages(data || []);
      setTotalMessages(parseInt(headers['x-total-count']) || 0);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Une erreur est survenue lors du chargement des messages.');
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchMessages();
    }
  }, [currentMessagePage, messageFilter]);

  const handleApproveProduct = async (productId) => {
    try {
      const token = await getAuthToken();
      const serverUrl = process.env.NODE_ENV === 'production' ? 'https://marchenet-server.onrender.com/api' : 'http://localhost:3001/api';
      await axios.patch(`${serverUrl}/products/${productId}/status`, { status: 'approved' }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.map(product =>
        product.id === productId ? { ...product, status: 'approved' } : product
      ));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleRejectProduct = async (productId) => {
    try {
      const token = await getAuthToken();
      const serverUrl = process.env.NODE_ENV === 'production' ? 'https://marchenet-server.onrender.com/api' : 'http://localhost:3001/api';
      await axios.patch(`${serverUrl}/products/${productId}/status`, { status: 'rejected' }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.map(product =>
        product.id === productId ? { ...product, status: 'rejected' } : product
      ));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const token = await getAuthToken();
      const serverUrl = process.env.NODE_ENV === 'production' ? 'https://marchenet-server.onrender.com/api' : 'http://localhost:3001/api';
      await axios.delete(`${serverUrl}/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter(product => product.id !== productId));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleSendNotification = async () => {
    try {
      const token = await getAuthToken();
      const serverUrl = process.env.NODE_ENV === 'production' ? 'https://marchenet-server.onrender.com/api' : 'http://localhost:3001/api';
      const { data: userData } = await axios.get(`${serverUrl}/auth/check`, { headers: { Authorization: `Bearer ${token}` } });
      const senderId = userData.user.id;

      await axios.post(`${serverUrl}/notifications`, {
        sender_id: senderId,
        receiver_id: notificationTarget === 'all' ? null : notificationTarget,
        message: notificationMessage,
        target: notificationTarget,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setSuccess('Notification envoyée avec succès !');
      setNotificationMessage('');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const getVendorProductCount = (vendorId) => {
    return products.filter(product => product.vendor_id === vendorId).length;
  };

  const packLimits = {
    'Pack Gratuit': 2,
    'Pack Basique': 10,
    'Pack Pro': 25,
    'Pack VIP': Infinity,
  };

  const truncateMessage = (message, length = 50) => {
    if (message.length <= length) return message;
    return message.substring(0, length) + '...';
  };

  const indexOfLastProduct = currentProductPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalProductPages = Math.ceil(products.length / productsPerPage);
  const totalMessagePages = Math.ceil(totalMessages / messagesPerPage);

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-gray-600 text-lg">Chargement...</p>
    </div>;
  }

  if (error) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
        <p>{error}</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-6 font-poppins">Tableau de Bord Admin</h2>

      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg mb-6">
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Gestion des produits */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 font-poppins border-b pb-2">Gérer les Produits</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendeur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentProducts.map(product => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.vendors?.shop_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{product.status || 'pending'}</td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleApproveProduct(product.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Approuver
                      </button>
                      <button
                        onClick={() => handleRejectProduct(product.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Rejeter
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setCurrentProductPage(prev => Math.max(prev - 1, 1))}
              disabled={currentProductPage === 1}
              className="px-3 py-1 bg-gray-300 rounded-l disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="px-4 py-1">{currentProductPage} / {totalProductPages}</span>
            <button
              onClick={() => setCurrentProductPage(prev => Math.min(prev + 1, totalProductPages))}
              disabled={currentProductPage === totalProductPages}
              className="px-3 py-1 bg-gray-300 rounded-r disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>

        {/* Gestion des quotas */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 font-poppins border-b pb-2">Quotas des Vendeurs</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendeur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pack</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de fin</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vendors.map(vendor => (
                  <tr key={vendor.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{vendor.shop_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{vendor.pack}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getVendorProductCount(vendor.auth_id)} / {packLimits[vendor.pack] === Infinity ? '∞' : packLimits[vendor.pack]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{vendor.subscription_end_date || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gestion des messages de contact */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold font-poppins border-b pb-2">Messages de Contact</h3>
            <select
              value={messageFilter}
              onChange={(e) => {
                setMessageFilter(e.target.value);
                setCurrentMessagePage(1);
              }}
              className="p-2 border rounded-lg"
            >
              <option value="all">Tous les messages</option>
              <option value="question">Questions</option>
              <option value="complaint">Plaintes</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contactMessages.map(message => (
                  <tr key={message.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {message.type === 'question' ? 'Question' : 'Plainte'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{message.name || 'Anonyme'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{message.email || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{message.phone_number || 'N/A'}</td>
                    <td className="px-6 py-4">
                      {truncateMessage(message.message)}
                      {message.message.length > 50 && (
                        <button
                          onClick={() => alert(message.message)}
                          className="text-blue-500 hover:underline ml-2"
                        >
                          Voir plus
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(message.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => setCurrentMessagePage(prev => Math.max(prev - 1, 1))}
              disabled={currentMessagePage === 1}
              className="px-3 py-1 bg-gray-300 rounded-l disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="px-4 py-1">{currentMessagePage} / {totalMessagePages}</span>
            <button
              onClick={() => setCurrentMessagePage(prev => Math.min(prev + 1, totalMessagePages))}
              disabled={currentMessagePage === totalMessagePages}
              className="px-3 py-1 bg-gray-300 rounded-r disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>

        {/* Envoi de notifications */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 font-poppins border-b pb-2">Envoyer une Notification</h3>
          <div className="space-y-4">
            <select
              value={notificationTarget}
              onChange={(e) => setNotificationTarget(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="all">Tous les utilisateurs</option>
              {vendors.map(vendor => (
                <option key={vendor.id} value={vendor.auth_id}>{vendor.shop_name} (Vendeur)</option>
              ))}
            </select>
            <textarea
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              placeholder="Votre message ici..."
              className="w-full p-2 border rounded-lg"
              rows="4"
            />
            <button
              onClick={handleSendNotification}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Envoyer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;