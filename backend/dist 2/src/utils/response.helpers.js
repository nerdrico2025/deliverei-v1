"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePagination = calculatePagination;
exports.paginatedResponse = paginatedResponse;
function calculatePagination(totalItems, currentPage, itemsPerPage) {
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
function paginatedResponse(data, pagination) {
    return {
        data,
        pagination,
    };
}
//# sourceMappingURL=response.helpers.js.map