import api from './index';

// Récupérer les favoris
export const getFavorites = () => api.get('/favorites');

// Ajouter/retirer un favori
export const toggleFavorite = (productId) =>
  api.post('/favorites/toggle', { productId });