// src/pages/Cart.jsx
import { useEffect, useState } from "react";
import { getCart, toggleCart, updateCartItem, removeCartItem } from "../api/cart";
import api from '../api';
import { Link } from 'react-router-dom';

function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContact, setShowContact] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isVendor, setIsVendor] = useState(false);

  const checkVendorStatus = async () => {
    try {
      const response = await api.get('/vendors/me');
      setIsVendor(!!response.data && response.data !== null);
    } catch {
      setIsVendor(false);
    }
  };

  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        const response = await api.get('/cart');
        setCart(response.data || []);
      } catch (err) {
        setError(err.response?.data?.error || "Une erreur est survenue lors de la récupération du panier.");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const response = await api.put(`/cart/${cartItemId}`, { quantity: newQuantity });
      setCart(cart.map(item =>
        item.id === cartItemId ? { ...item, quantity: response.data.quantity } : item
      ));
    } catch (err) {
      setError("Erreur lors de la mise à jour de la quantité : " + (err.response?.data?.error || err.message));
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await api.delete(`/cart/${cartItemId}`);
      setCart(cart.filter(item => item.id !== cartItemId));
      setConfirmDelete(null);
    } catch (err) {
      setError("Erreur lors de la suppression : " + (err.response?.data?.error || err.message));
    }
  };

  const totalPrice = cart.reduce((sum, item) => {
    return sum + (item.product.price * (item.quantity || 1));
  }, 0);

  if (loading) return <p className="text-center text-gray-600 font-opensans">Chargement...</p>;
  if (error) return <p className="text-center text-red-500 font-opensans">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-4 font-poppins">Mon panier</h2>
      {cart.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {cart.map(item => (
              <div key={item.id} className="relative bg-white rounded-lg shadow p-4">
                <img
                  src={item.product.photo_urls && item.product.photo_urls[0] ? item.product.photo_urls[0] : '/default-product.jpg'}
                  className="rounded-t-lg w-full h-auto max-h-48 object-contain"
                  alt={item.product.name}
                />
                <p className="font-opensans mt-2">{item.product.name}</p>
                <p className="font-opensans">{item.product.price} FCFA</p>
                <div className="flex items-center mt-2">
                  <button
                    onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                    className="px-2 py-1 bg-gray-200 rounded-l"
                    disabled={(item.quantity || 1) <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-1 bg-gray-100">{item.quantity || 1}</span>
                  <button
                    onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                    className="px-2 py-1 bg-gray-200 rounded-r"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => setShowContact(item.product.vendors)}
                  className="mt-2 px-4 py-2 bg-green-500 text-white rounded w-full"
                >
                  Contacter via WhatsApp
                </button>
                <button
                  onClick={() => setConfirmDelete(item.id)}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded w-full"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-white rounded-lg shadow">
            <p className="text-lg font-bold font-opensans">Total : {totalPrice} FCFA</p>
            <p className="text-sm text-gray-600 font-opensans">
              Contactez les vendeurs via WhatsApp pour finaliser vos achats.
            </p>
          </div>
        </>
      ) : (
        <div className="text-center">
          <p className="text-gray-600 font-opensans">Votre panier est vide.</p>
          <Link to="/" className="mt-2 inline-block px-4 py-2 bg-blue-500 text-white rounded font-opensans">
            Retourner à l'accueil
          </Link>
        </div>
      )}

      {showContact && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold font-poppins">Contacter {showContact.shop_name}</h3>
            <p className="mt-2 font-opensans">Vendeur : {showContact.vendor_name}</p>
            <p className="font-opensans">Téléphone : {showContact.phone_number}</p>
            <a
              href={`https://wa.me/${showContact.phone_number.replace(/\s+/g, '')}?text=Bonjour, je suis intéressé par un produit sur MarchéNet Afrique.`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded w-full text-center block"
            >
              Ouvrir WhatsApp
            </a>
            <button
              onClick={() => setShowContact(null)}
              className="mt-2 px-4 py-2 bg-gray-500 text-white rounded w-full"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold font-poppins">Confirmer la suppression</h3>
            <p className="mt-2 font-opensans">Voulez-vous vraiment retirer ce produit du panier ?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded"
              >
                Annuler
              </button>
              <button
                onClick={() => removeFromCart(confirmDelete)}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;