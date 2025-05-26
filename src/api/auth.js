import api from './index';

// Authentification
export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const register = (formData) =>
  api.post('/auth/register', formData);

export const logout = () =>
  api.post('/auth/logout');

export const checkAuth = () =>
  api.get('/auth/check');