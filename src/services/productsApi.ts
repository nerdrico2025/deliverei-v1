import { apiClient } from './apiClient';
import { resolveTenantSlug, persistTenantSlug } from './api.utils';

export interface Product {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  preco_riscado?: number;
  imagem?: string;
  ativo: boolean;
  estoque: number;
  categoria?: string;
  empresaId: string;
  createdAt: string;
  updatedAt: string;
  // Flags de destaque
  promo_tag?: boolean;
  bestseller_tag?: boolean;
  new_tag?: boolean;
}

export interface CreateProductDto {
  nome: string;
  descricao?: string;
  preco: number;
  preco_riscado?: number;
  imagem?: string;
  ativo?: boolean;
  estoque?: number;
  categoria?: string;
  // Flags de destaque
  promo_tag?: boolean;
  bestseller_tag?: boolean;
  new_tag?: boolean;
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
  // Helper para normalizar itens para Product
  const normalize = (p: any): Product => ({
    id: p.id,
    nome: p.nome,
    descricao: p.descricao,
    preco: Number(p.preco ?? 0),
    preco_riscado: p.preco_riscado !== undefined && p.preco_riscado !== null ? Number(p.preco_riscado) : undefined,
    imagem: p.imagem ?? p.imagemUrl,
    ativo: typeof p.ativo === 'boolean' ? p.ativo : !!p.disponivel,
    estoque: typeof p.estoque === 'number' ? p.estoque : 0,
    categoria: p.categoria,
    empresaId: p.empresaId,
    createdAt: p.criadoEm || p.createdAt || new Date().toISOString(),
    updatedAt: p.atualizadoEm || p.updatedAt || new Date().toISOString(),
    promo_tag: !!p.promo_tag,
    bestseller_tag: !!p.bestseller_tag,
    new_tag: !!p.new_tag,
  });

  try {
    const response = await apiClient.get('/produtos', { params });
    const payload = response.data;

    // Caso mock-backend retorne array simples
    if (Array.isArray(payload)) {
      const normalized = payload.map(normalize);
      return {
        data: normalized,
        meta: {
          total: normalized.length,
          page: params?.page ?? 1,
          limit: params?.limit ?? normalized.length,
          totalPages: 1,
        },
      };
    }

    // Caso backend real retorne PaginatedResponse
    if (payload && Array.isArray(payload.data)) {
      return {
        data: payload.data.map(normalize),
        meta: payload.meta ?? {
          total: payload.total ?? payload.data.length,
          page: params?.page ?? 1,
          limit: params?.limit ?? payload.data.length,
          totalPages: Math.ceil((payload.total ?? payload.data.length) / (params?.limit ?? payload.data.length)),
        },
      };
    }

    // Fallback: payload único ou formato inesperado
    const normalized = Array.isArray(payload) ? payload.map(normalize) : [normalize(payload)];
    return {
      data: normalized,
      meta: {
        total: normalized.length,
        page: params?.page ?? 1,
        limit: params?.limit ?? normalized.length,
        totalPages: 1,
      },
    };
  } catch (error) {
    throw error;
  }
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