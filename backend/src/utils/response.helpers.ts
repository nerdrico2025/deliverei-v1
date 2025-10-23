export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export function calculatePagination(
  totalItems: number,
  currentPage: number,
  itemsPerPage: number
): PaginationInfo {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}

export function paginatedResponse<T>(
  data: T[],
  pagination: PaginationInfo
): PaginatedResponse<T> {
  return {
    data,
    pagination,
  };
}