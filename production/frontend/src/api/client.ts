import axios from 'axios';
import toast from 'react-hot-toast';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 30000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('notium-auth');
      delete apiClient.defaults.headers.common['Authorization'];
      if (window.location.pathname !== '/login') {
        toast.error('Session expired, please sign in again');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
