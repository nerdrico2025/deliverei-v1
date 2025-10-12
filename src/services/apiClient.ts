
import axios from 'axios';

// Usar variável de ambiente VITE_API_URL, com fallback para a URL do Render
const API_URL = import.meta.env.VITE_API_URL || 'https://deliverei-backend.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token e tenant slug
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('deliverei_token');
  const tenantSlug = localStorage.getItem('deliverei_tenant_slug');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (tenantSlug) {
    config.headers['x-tenant-slug'] = tenantSlug;
  }
  
  return config;
});

// Interceptor para refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('deliverei_refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken
          });
          
          localStorage.setItem('deliverei_token', data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          
          return apiClient.request(originalRequest);
        } catch (refreshError) {
          // Logout
          localStorage.removeItem('deliverei_token');
          localStorage.removeItem('deliverei_refresh_token');
          localStorage.removeItem('deliverei_tenant_slug');
          localStorage.removeItem('deliverei_auth');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
