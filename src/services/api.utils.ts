/**
 * API Utilities
 * 
 * Helper functions for API error handling and data transformation
 * 
 * @created Phase 2 - Centralized API utilities
 */

import { AxiosError } from 'axios';
import { ApiError } from './api.types';

/**
 * Extract error message from API error response
 * 
 * @param error - Axios error object
 * @returns User-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (!error) return 'Erro desconhecido';

  // Handle AxiosError
  if (isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    
    // Check for response error message
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    
    // Check for request timeout
    if (axiosError.code === 'ECONNABORTED') {
      return 'Tempo de requisição esgotado. Tente novamente.';
    }
    
    // Check for network errors
    if (axiosError.code === 'ERR_NETWORK' || axiosError.message?.includes('Network Error')) {
      return 'Erro de conexão. Verifique sua internet.';
    }
    
    // Check for status code errors
    if (axiosError.response?.status === 401) {
      return 'Não autorizado. Faça login novamente.';
    }
    if (axiosError.response?.status === 403) {
      return 'Acesso negado. Você não tem permissão.';
    }
    if (axiosError.response?.status === 404) {
      return 'Recurso não encontrado.';
    }
    if (axiosError.response?.status === 500) {
      return 'Erro interno do servidor. Tente novamente mais tarde.';
    }
    
    // Generic axios error
    return axiosError.message || 'Erro ao processar requisição';
  }

  // Handle Error object
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Fallback
  return 'Erro desconhecido ao processar requisição';
}

/**
 * Type guard to check if error is an AxiosError
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError === true;
}

/**
 * Log error in development mode
 * 
 * @param context - Context where error occurred
 * @param error - Error object
 */
export function logError(context: string, error: unknown): void {
  if ((import.meta as any)?.env?.DEV) {
    console.error(`[${context}]`, error);
  }
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  
  const axiosError = error as AxiosError;
  return (
    axiosError.code === 'ERR_NETWORK' ||
    axiosError.message?.includes('Network Error') ||
    axiosError.message?.includes('ERR_CONNECTION_REFUSED') ||
    axiosError.message?.includes('Failed to fetch')
  );
}

/**
 * Check if error is a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  
  const axiosError = error as AxiosError;
  return axiosError.code === 'ECONNABORTED';
}

/**
 * Build query string from params object
 * 
 * @param params - Parameters object
 * @returns Query string
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Sleep utility for retry logic
 * 
 * @param ms - Milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function resolveTenantSlug(): string | null {
  try {
    // 1) LocalStorage keys (prefer saved values)
    const fromStorage = (typeof window !== 'undefined')
      ? (
        window.localStorage.getItem('deliverei_tenant_slug') ||
        window.localStorage.getItem('deliverei_store_slug') ||
        window.localStorage.getItem('tenantSlug')
      )
      : null;
    if (fromStorage) return fromStorage;

    if (typeof window !== 'undefined') {
      // 2) URL path: /loja/:slug
      const path = window.location.pathname || '';
      const lojaMatch = path.match(/\/(?:loja)\/([^/]+)/);
      if (lojaMatch && lojaMatch[1]) return lojaMatch[1];

      // 3) Query params: ?slug=..., ?empresa=..., ?loja=...
      const params = new URLSearchParams(window.location.search || '');
      const qSlug = params.get('slug') || params.get('empresa') || params.get('loja');
      if (qSlug) return qSlug;

      // 4) Subdomain: <slug>.<domain>
      const host = window.location.hostname || '';
      const isLocal = /^(localhost|127\.0\.0\.1|0\.0\.0\.0)$/i.test(host);
      if (!isLocal) {
        const parts = host.split('.');
        if (parts.length >= 3) {
          const sub = parts[0];
          if (sub && sub.toLowerCase() !== 'www') {
            return sub;
          }
        }
      }
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export function persistTenantSlug(slug: string): void {
  try {
    if (!slug) return;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('deliverei_tenant_slug', slug);
      window.localStorage.setItem('deliverei_store_slug', slug);
      window.localStorage.setItem('tenantSlug', slug);
    }
  } catch (e) {
    // ignore
  }
}

// --- Domain helpers (custom domain redirection) ---
function getDomainRedirectPrefs(): { customDomain: string | null; redirectEnabled: boolean } {
  try {
    if (typeof window === 'undefined') return { customDomain: null, redirectEnabled: false };
    const cd = window.localStorage.getItem('deliverei_custom_domain');
    const reRaw = window.localStorage.getItem('deliverei_redirect_enabled');
    const redirectEnabled = reRaw === 'true' || reRaw === '1';
    const customDomain = cd && cd.trim() ? cd.trim().toLowerCase() : null;
    return { customDomain, redirectEnabled };
  } catch {
    return { customDomain: null, redirectEnabled: false };
  }
}

function toDomainUrl(domain: string): string {
  const d = String(domain || '').trim().toLowerCase();
  if (!d) return '';
  if (d.startsWith('http://') || d.startsWith('https://')) return d;
  return `https://${d}`;
}

export function getPublicOrigin(): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const isLocal = /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(origin);
  const envDomain = (import.meta as any)?.env?.VITE_PUBLIC_APP_DOMAIN || 'https://deliverei.com.br';
  return isLocal ? envDomain : origin;
}

export function buildStoreUrl(slug: string): string {
  const s = String(slug || '').trim() || 'minha-marmitaria';
  const { customDomain, redirectEnabled } = getDomainRedirectPrefs();
  if (customDomain && redirectEnabled) {
    // Quando redirecionamento está habilitado, prioriza domínio personalizado
    return toDomainUrl(customDomain);
  }
  return `${getPublicOrigin()}/loja/${s}`;
}
