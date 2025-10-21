import axios from 'axios';

// Base URL do backend - usando variável de ambiente ou fallback
const baseURL = process.env.VITE_API_URL || 'http://localhost:3001/api';

// Criar instância do axios
const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
apiClient.interceptors.request.use(
  (config) => {
    // Adicionar token se existir
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Adicionar slug da empresa se existir
    const tenantSlug = localStorage.getItem('tenantSlug');
    if (tenantSlug) {
      config.headers['X-Tenant-Slug'] = tenantSlug;
    }

    return config;
  },
  (error) => {
    throw error;
  }
);

// Interceptor para tratar respostas
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se receber 401, redirecionar para login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tenantSlug');
      window.location.href = '/login';
    }
    
    throw error;
  }
);

export { apiClient };
export default apiClient;