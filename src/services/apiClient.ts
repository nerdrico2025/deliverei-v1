import axios from 'axios';

// Base URL do backend - usando variável de ambiente ou fallback
const baseURL = import.meta.env?.VITE_API_URL || 'http://localhost:3001/api';

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
    // Adicionar token se existir (prioriza backend real)
    let token = localStorage.getItem('deliverei_token') || null;
    if (!token) {
      const rawAuth = localStorage.getItem('deliverei_auth');
      if (rawAuth) {
        try {
          const parsed = JSON.parse(rawAuth);
          token = parsed?.token || null;
        } catch {}
      }
    }
    // Novo: usar token do cliente da vitrine, se existir
    if (!token) {
      const rawClient = localStorage.getItem('deliverei_client_auth');
      if (rawClient) {
        try {
          const parsed = JSON.parse(rawClient);
          token = parsed?.token || null;
        } catch {}
      }
    }
    if (!token) {
      token = localStorage.getItem('token');
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Adicionar slug da empresa se existir (compatível com chaves antigas e backend real)
    let tenantSlug =
      localStorage.getItem('deliverei_tenant_slug') ||
      localStorage.getItem('deliverei_store_slug') ||
      localStorage.getItem('tenantSlug');

    // Fallback: tentar derivar o slug da URL /loja/:slug
    if (!tenantSlug && typeof window !== 'undefined') {
      const match = window.location.pathname.match(/\/loja\/([^/]+)/);
      if (match && match[1]) {
        tenantSlug = match[1];
      }
    }

    if (tenantSlug) {
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

    // Se receber 401, tentar refresh de token antes de redirecionar
    if (error.response?.status === 401) {
      const hasRealToken = !!(localStorage.getItem('deliverei_token') || localStorage.getItem('token'));
      const isMockSession = !hasRealToken && (
        !!localStorage.getItem('deliverei_auth') || !!localStorage.getItem('deliverei_client_auth')
      );

      // Em sessão mock (admin ou cliente), não redirecionar para login: deixe a UI tratar o erro
      if (isMockSession) {
        return Promise.reject(error);
      }

      const refreshToken = localStorage.getItem('deliverei_refresh_token');

      // Evita loop infinito de retry
      if (hasRealToken && refreshToken && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          // Reutiliza uma única promessa de refresh quando em curso
          if (!isRefreshing) {
            isRefreshing = true;
            refreshPromise = axios.post(`${baseURL}/auth/refresh`, { refreshToken });
          }
          const refreshRes = await refreshPromise;
          const { accessToken, refreshToken: newRefreshToken } = refreshRes.data || {};

          // Atualiza tokens
          if (accessToken) {
            localStorage.setItem('deliverei_token', accessToken);
          }
          if (newRefreshToken) {
            localStorage.setItem('deliverei_refresh_token', newRefreshToken);
          }

          // Limpa estado de refresh
          isRefreshing = false;
          refreshPromise = null;

          // Reenvia a requisição original com novos headers
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${localStorage.getItem('deliverei_token') || ''}`;
          const tenantSlug =
            localStorage.getItem('deliverei_tenant_slug') ||
            localStorage.getItem('deliverei_store_slug') ||
            localStorage.getItem('tenantSlug');
          if (tenantSlug) {
            originalRequest.headers['X-Tenant-Slug'] = tenantSlug;
          }
          return apiClient(originalRequest);
        } catch (refreshErr) {
          // Refresh falhou: limpar e redirecionar para login
          isRefreshing = false;
          refreshPromise = null;
          localStorage.removeItem('token');
          localStorage.removeItem('deliverei_token');
          localStorage.removeItem('deliverei_refresh_token');
          localStorage.removeItem('deliverei_auth');
          localStorage.removeItem('deliverei_client_auth');
          localStorage.removeItem('deliverei_store_slug');
          localStorage.removeItem('deliverei_tenant_slug');
          window.location.href = '/login';
        }
      } else {
        // Sem refresh token ou não possui token real: efetua logout
        localStorage.removeItem('token');
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