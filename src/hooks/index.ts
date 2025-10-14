
/**
 * Custom Hooks
 * 
 * Hooks reutilizáveis para simplificar lógica comum em componentes
 */

export { useCart } from './useCart';
export type { CartItem } from './useCart';

export { useApi, useApiEffect } from './useApi';

export { usePagination } from './usePagination';
export type { PaginationState, UsePaginationReturn } from './usePagination';

export { useDebounce, useDebouncedCallback } from './useDebounce';

export { useForm } from './useForm';
export type { FormErrors, ValidatorFn, UseFormOptions, UseFormReturn } from './useForm';

