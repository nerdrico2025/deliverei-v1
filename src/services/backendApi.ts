
import apiClient from './apiClient';

export interface LoginRequest {
  email: string;
  senha: string;
  empresaSlug: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    tipo: 'ADMIN' | 'CLIENTE';
    empresaId?: string;
  };
  empresa?: {
    id: string;
    nome: string;
    slug: string;
  };
}

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagemUrl?: string;
  categoria?: string;
  disponivel: boolean;
  estoque?: number;
  empresaId: string;
}

export interface CarrinhoItem {
  id: string;
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
  produto: {
    nome: string;
    imagemUrl?: string;
  };
}

export interface Carrinho {
  id: string;
  itens: CarrinhoItem[];
  subtotal: number;
  total: number;
  desconto?: number;
}

export interface CheckoutRequest {
  enderecoEntrega: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  formaPagamento: 'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX';
  cupomDesconto?: string;
  observacoes?: string;
}

export interface CheckoutResponse {
  pedidoId: string;
  status: string;
  total: number;
  mensagem: string;
}

export interface Recomendacao {
  id: string;
  nome: string;
  preco: number;
  imagemUrl?: string;
  motivo: string;
}

// Auth API
export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },
  
  refresh: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};

// Produtos API
export const produtosApi = {
  listar: async (params?: { categoria?: string; disponivel?: boolean }): Promise<Produto[]> => {
    const response = await apiClient.get<Produto[]>('/produtos', { params });
    return response.data;
  },
};

// Carrinho API
export const carrinhoApi = {
  obter: async (): Promise<Carrinho> => {
    const response = await apiClient.get<Carrinho>('/carrinho');
    return response.data;
  },
  
  adicionarItem: async (produtoId: string, quantidade: number): Promise<Carrinho> => {
    const response = await apiClient.post<Carrinho>('/carrinho/itens', {
      produtoId,
      quantidade,
    });
    return response.data;
  },
  
  atualizarItem: async (itemId: string, quantidade: number): Promise<Carrinho> => {
    const response = await apiClient.patch<Carrinho>(`/carrinho/itens/${itemId}`, {
      quantidade,
    });
    return response.data;
  },
  
  removerItem: async (itemId: string): Promise<Carrinho> => {
    const response = await apiClient.delete<Carrinho>(`/carrinho/itens/${itemId}`);
    return response.data;
  },
  
  limpar: async (): Promise<void> => {
    await apiClient.delete('/carrinho');
  },
  
  checkout: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
    const response = await apiClient.post<CheckoutResponse>('/carrinho/checkout', data);
    return response.data;
  },
  
  obterRecomendacoes: async (): Promise<Recomendacao[]> => {
    const response = await apiClient.get<Recomendacao[]>('/carrinho/recomendacoes');
    return response.data;
  },
};

export const backendApi = {
  auth: authApi,
  produtos: produtosApi,
  carrinho: carrinhoApi,
};
