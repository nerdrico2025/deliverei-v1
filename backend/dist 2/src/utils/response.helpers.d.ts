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
export declare function calculatePagination(totalItems: number, currentPage: number, itemsPerPage: number): PaginationInfo;
export declare function paginatedResponse<T>(data: T[], pagination: PaginationInfo): PaginatedResponse<T>;
