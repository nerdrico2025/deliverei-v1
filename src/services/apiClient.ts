/**
 * API Client
 * 
 * Axios instance with interceptors for authentication and error handling
 * 
 * @refactored Phase 2 - Improved interceptors and error handling
 */

import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

// Base API URL from environment variables with fallback
const API_URL = import.meta.env.VITE_API_URL || 'https://deliverei-backend.onrender.com/api';

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'deliverei_token',
  REFRESH_TOKEN: 'deliverei_refresh_token',
  TENANT_SLUG: 'deliverei_tenant_slug',
  AUTH: 'deliverei_auth',
} as const;

/**
 * Create axios instance with default configuration
 */
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * 
 * Adds authentication token and tenant slug to all requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const tenantSlug = localStorage.getItem(STORAGE_KEYS.TENANT_SLUG);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (tenantSlug) {
      config.headers['x-tenant-slug'] = tenantSlug;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * 
 * Handles token refresh and error responses
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          // Update stored token
          localStorage.setItem(STORAGE_KEYS.TOKEN, data.accessToken);

          // Update request header
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          }

          // Retry original request
          return apiClient.request(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clear auth and redirect to login
          clearAuthData();
          redirectToLogin();
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token - clear auth and redirect
        clearAuthData();
        redirectToLogin();
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

/**
 * Clear authentication data from localStorage
 */
function clearAuthData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

/**
 * Redirect to login page
 */
function redirectToLogin(): void {
  // Only redirect if not already on login page
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
}

/**
 * Export API client instance
 */
export default apiClient;

/**
 * Export utility functions for external use
 */
export { clearAuthData, redirectToLogin, STORAGE_KEYS, API_URL };
