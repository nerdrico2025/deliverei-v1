/**
 * Helpers para padronizar respostas da API
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Criar resposta de sucesso
 */
export function successResponse<T>(
  data: T,
  message?: string,
): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}

/**
 * Criar resposta paginada
 */
export function paginatedResponse<T>(
  data: T[],
  meta: PaginationMeta,
): ApiResponse<PaginatedResponse<T>> {
  return {
    success: true,
    data: {
      data,
      meta,
    },
  };
}

/**
 * Criar resposta de erro
 */
export function errorResponse(
  error: string,
  statusCode: number = 400,
): ApiResponse {
  return {
    success: false,
    error,
  };
}

/**
 * Calcular metadados de paginação
 */
export function calculatePagination(
  total: number,
  page: number = 1,
  limit: number = 10,
): PaginationMeta {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
