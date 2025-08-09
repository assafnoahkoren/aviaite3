import axios from 'axios';

const baseURL = import.meta.env.VITE_SERVER_URL;

export const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token is invalid (401), redirect to login
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);


