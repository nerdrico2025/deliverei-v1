
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
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
          const { data } = await axios.post('http://localhost:3000/api/auth/refresh', {
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
