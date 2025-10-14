
import { useState, useCallback, useMemo } from 'react';

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

export interface UsePaginationReturn {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  reset: () => void;
}

/**
 * Custom hook para gerenciar paginação
 * 
 * @param initialPage - Página inicial (padrão: 1)
 * @param initialLimit - Limite de itens por página (padrão: 10)
 * @returns objeto com controles de paginação
 * 
 * @example
 * const pagination = usePagination(1, 10);
 * 
 * // Usar com API
 * const fetchData = async () => {
 *   const result = await api.list({ page: pagination.page, limit: pagination.limit });
 *   pagination.setTotal(result.total);
 * };
 */
export function usePagination(
  initialPage = 1,
  initialLimit = 10
): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => {
    return Math.ceil(total / limit) || 1;
  }, [total, limit]);

  const hasNextPage = useMemo(() => {
    return page < totalPages;
  }, [page, totalPages]);

  const hasPreviousPage = useMemo(() => {
    return page > 1;
  }, [page]);

  const goToPage = useCallback((newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setPage(prev => prev - 1);
    }
  }, [hasPreviousPage]);

  const reset = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
    setTotal(0);
  }, [initialPage, initialLimit]);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    setLimit,
    setTotal,
    reset,
  };
}

