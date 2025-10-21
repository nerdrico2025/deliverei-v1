import { apiClient } from './apiClient';

export interface Product {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  imagem?: string;
  ativo: boolean;
  estoque: number;
  categoria?: string;
  empresaId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  nome: string;
  descricao?: string;
  preco: number;
  imagem?: string;
  ativo?: boolean;
  estoque?: number;
  categoria?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Fetch all products with pagination and filters
 */
export const getProducts = async (params?: {
  page?: number;
  limit?: number;
  categoria?: string;
  search?: string;
  ativo?: boolean;
}): Promise<PaginatedResponse<Product>> => {
  const response = await apiClient.get<PaginatedResponse<Product>>('/produtos', {
    params,
  });
  return response.data;
};

/**
 * Fetch a single product by ID
 */
export const getProduct = async (id: string): Promise<Product> => {
  const response = await apiClient.get<Product>(`/produtos/${id}`);
  return response.data;
};

/**
 * Create a new product
 */
export const createProduct = async (data: CreateProductDto): Promise<Product> => {
  const response = await apiClient.post<Product>('/produtos', data);
  return response.data;
};

/**
 * Update an existing product
 */
export const updateProduct = async (
  id: string,
  data: UpdateProductDto
): Promise<Product> => {
  const response = await apiClient.patch<Product>(`/produtos/${id}`, data);
  return response.data;
};

/**
 * Delete a product (soft delete - marks as inactive)
 */
export const deleteProduct = async (id: string): Promise<void> => {
  await apiClient.delete(`/produtos/${id}`);
};

/**
 * Hard delete a product (permanent deletion)
 */
export const hardDeleteProduct = async (id: string): Promise<void> => {
  await apiClient.delete(`/produtos/${id}/hard`);
};