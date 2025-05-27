import axios from 'axios';

const serverUrl = import.meta.env.VITE_API_URL || 'https://marchenet-server.onrender.com';

const api = axios.create({
  baseURL: `${serverUrl}/api`,
  withCredentials: false, // <-- doit être false si tu utilises Authorization
  timeout: 10000, // Timeout de 10s pour éviter les blocages
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export default api;