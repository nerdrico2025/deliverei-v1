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
  if (process.env.NODE_ENV === 'development') {
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
