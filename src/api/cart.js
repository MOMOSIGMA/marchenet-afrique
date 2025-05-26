import api from './index';

// Récupérer le panier
export const getCart = () => api.get('/cart');

// Ajouter/retirer un produit du panier
export const toggleCart = (productId, quantity = 1) =>
  api.post('/cart/toggle', { productId, quantity });

// Modifier la quantité d'un produit
export const updateCartItem = (cartItemId, quantity) =>
  api.put(`/cart/${cartItemId}`, { quantity });

// Supprimer un produit du panier
export const removeCartItem = (cartItemId) =>
  api.delete(`/cart/${cartItemId}`);