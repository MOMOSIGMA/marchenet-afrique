import { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/connexion');
          return;
        }

        const response = await api.get('/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (mounted) setNotifications(response.data || []);
      } catch (err) {
        if (mounted) setError(err.message || "Une erreur est survenue.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchNotifications();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleOpenNotification = async (notification) => {
    setSelectedMessage(notification.message);
    if (!notification.is_read) {
      try {
        await api.put(`/notifications/${notification.id}/read`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setNotifications(prevNotifications =>
          prevNotifications.map(notif =>
            notif.id === notification.id ? { ...notif, is_read: true } : notif
          )
        );
        window.dispatchEvent(new Event('notificationUpdated'));
      } catch (err) {
        console.error('Erreur lors de la mise à jour de la notification:', err);
      }
    }
  };

  const getSenderName = (notification) => {
    if (notification.is_admin) {
      return 'L’équipe MarchéNet Afrique';
    }
    return notification.vendors?.vendor_name || 'L’équipe MarchéNet Afrique';
  };

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
      <h2 className="text-2xl font-bold mb-4 font-poppins">Notifications</h2>
      {notifications.length === 0 ? (
        <p className="text-gray-600">Aucune notification pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow ${
                !notification.is_read
                  ? 'bg-white border-l-4 border-blue-500'
                  : 'bg-gray-50 opacity-75'
              }`}
            >
              <div className="flex justify-between items-center">
                <button
                  onClick={() => handleOpenNotification(notification)}
                  className="text-gray-800 hover:text-blue-600 text-left flex-1"
                >
                  {notification.message.length > 50 ? `${notification.message.substring(0, 50)}...` : notification.message}
                </button>
                {!notification.is_read && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Nouveau
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                De : {getSenderName(notification)} | {new Date(notification.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
      {selectedMessage && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Détails de la notification</h3>
            <p className="text-gray-800 mb-4">{selectedMessage}</p>
            <button
              onClick={() => setSelectedMessage(null)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;