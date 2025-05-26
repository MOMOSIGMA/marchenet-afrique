import api from '../api';

export const getAuthToken = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.warn('Aucun token d\'authentification trouvé.');
    delete api.defaults.headers.common['Authorization'];
    return null;
  }
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  return token;
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('authToken');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    setAuthToken(response.data.token); // Use setAuthToken instead of direct localStorage
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erreur de connexion');
  }
};

export const logout = (navigate) => {
  setAuthToken(null);
  navigate('/connexion');
};