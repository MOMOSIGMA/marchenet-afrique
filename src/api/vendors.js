import api from './index';

// Infos vendeur connecté
export const getMyVendor = () => api.get('/vendors/me');

// Créer une boutique
export const createVendor = (data) => api.post('/vendors', data);

// Mettre à jour la boutique
export const updateVendor = (data) => api.put('/vendors/me', data);

// Récupérer une boutique par ID
export const getVendorById = (vendorId) => api.get(`/vendors/${vendorId}`);