import axios from 'axios';
import { resolveTenantSlug, persistTenantSlug } from './api.utils';

// Base URL do backend - usando variável de ambiente ou fallback
const baseEnvURL = import.meta.env?.VITE_API_URL || 'http://localhost:3002/api';
let baseURL = baseEnvURL;

// Guard de desenvolvimento: evitar baseURL indevida em :3001
if (typeof baseEnvURL === 'string' && baseEnvURL.includes(':3001') && (import.meta as any)?.env?.DEV) {
  console.warn('[apiClient] VITE_API_URL aponta para :3001; aplicando fallback para http://localhost:3002/api');
  baseURL = 'http://localhost:3002/api';
}

// Flag de ambiente
const isDev = Boolean((import.meta as any)?.env?.DEV);

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
    const url = config?.url || '';

    // Utilizar apenas token real do backend
    const token = localStorage.getItem('deliverei_token') || '';
    if (token && !url.includes('/auth/login') && !url.includes('/auth/refresh')) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Adicionar slug da empresa (evitar em rotas de autenticação)
    const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/signup') || url.includes('/auth/refresh') || url.includes('/auth/logout') || url.includes('/auth/cadastro-empresa');
    const tenantSlug = resolveTenantSlug();
    if (tenantSlug && !isAuthRoute) {
      persistTenantSlug(tenantSlug);
      config.headers['X-Tenant-Slug'] = tenantSlug;
    }

    return config;
  },
  (error) => {
    throw error;
  }
);

// Flag para evitar múltiplos refresh concorrentes
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

// Interceptor para tratar respostas
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest: any = error.config || {};

    const url = originalRequest?.url || '';
    if (url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/logout')) {
      return Promise.reject(error);
    }

    // Se receber 401, tratar conforme ambiente
    if (error.response?.status === 401) {
      // Em desenvolvimento, não forçar logout automático para evitar bounce
      if (isDev) {
        return Promise.reject(error);
      }

      const hasRealToken = !!localStorage.getItem('deliverei_token');
      const refreshToken = localStorage.getItem('deliverei_refresh_token');

      if (hasRealToken && refreshToken && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          if (!isRefreshing) {
            isRefreshing = true;
            refreshPromise = axios.post(`${baseURL}/auth/refresh`, { refreshToken });
          }
          const refreshRes = await refreshPromise;
          const { accessToken, refreshToken: newRefreshToken } = refreshRes.data || {};

          if (accessToken) {
            localStorage.setItem('deliverei_token', accessToken);
          }
          if (newRefreshToken) {
            localStorage.setItem('deliverei_refresh_token', newRefreshToken);
          }

          isRefreshing = false;
          refreshPromise = null;

          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${localStorage.getItem('deliverei_token') || ''}`;
          const tenantSlug = resolveTenantSlug();
          if (tenantSlug) {
            originalRequest.headers['X-Tenant-Slug'] = tenantSlug;
          }
          return apiClient(originalRequest);
        } catch (refreshErr) {
          isRefreshing = false;
          refreshPromise = null;
          localStorage.removeItem('deliverei_token');
          localStorage.removeItem('deliverei_refresh_token');
          localStorage.removeItem('deliverei_auth');
          localStorage.removeItem('deliverei_client_auth');
          localStorage.removeItem('deliverei_store_slug');
          localStorage.removeItem('deliverei_tenant_slug');
          window.location.href = '/login';
        }
      } else {
        // Sem token real, forçar logout
        localStorage.removeItem('deliverei_token');
        localStorage.removeItem('deliverei_refresh_token');
        localStorage.removeItem('deliverei_auth');
        localStorage.removeItem('deliverei_client_auth');
        localStorage.removeItem('deliverei_store_slug');
        localStorage.removeItem('deliverei_tenant_slug');
        window.location.href = '/login';
      }
    }

    throw error;
  }
);

export { apiClient };
export default apiClient;