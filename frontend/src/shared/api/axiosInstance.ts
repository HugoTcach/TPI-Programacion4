import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    const url = originalRequest.url;
    
    const isAuthRoute = url === '/auth/token' || url === '/auth/me';
    const isUnauthorized = error.response?.status === 401;
    const isAccountDisabled = error.response?.status === 400 && error.response?.data?.detail === 'Cuenta de usuario desactivada';

    if (!isAuthRoute && (isUnauthorized || isAccountDisabled)) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);
