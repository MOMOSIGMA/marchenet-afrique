import axios from 'axios';

const base = import.meta.env.VITE_API_URL || 'https://marchenet-server.onrender.com';
const api = axios.create({
  baseURL: base.endsWith('/api') ? base : base + '/api',
  withCredentials: true,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;