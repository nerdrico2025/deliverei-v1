/**
 * Services Index
 * 
 * Centralized export point for all API services
 * 
 * @created Phase 2 - Organized service exports
 */

// Export API client and utilities
export { default as apiClient, clearAuthData, redirectToLogin, STORAGE_KEYS, API_URL } from './apiClient';

// Export backend API services
export * from './backendApi';

// Export dashboard API
export * from './dashboardApi';

// Export mock API (legacy)
export * from './api';

// Export API types
export * from './api.types';

// Export API utilities
export * from './api.utils';
