import api from './index';

// Modifiez le chemin si nécessaire selon votre API
export const getProducts = (params) => api.get('/products', { params });
// Ajoutez '/api' si votre backend l'attend

// Détail d'un produit
export const getProductById = (id) => api.get(`/products/${id}`);

// Ajouter un produit
export const addProduct = (formData) =>
  api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// Modifier un produit
export const updateProduct = (id, data) =>
  api.put(`/products/${id}`, data);

// Supprimer un produit
export const deleteProduct = (id) =>
  api.delete(`/products/${id}`);