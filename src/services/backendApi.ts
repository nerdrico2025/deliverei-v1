
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
  avaliacaoMedia?: number;
  totalAvaliacoes?: number;
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

// FASE 3 - Novos tipos
export interface Cupom {
  id: string;
  codigo: string;
  tipo: 'PERCENTUAL' | 'VALOR_FIXO';
  valor: number;
  dataInicio: string;
  dataFim: string;
  usoMaximo?: number;
  usoAtual: number;
  ativo: boolean;
  empresaId: string;
}

export interface CupomCreateRequest {
  codigo: string;
  tipo: 'PERCENTUAL' | 'VALOR_FIXO';
  valor: number;
  dataInicio: string;
  dataFim: string;
  usoMaximo?: number;
}

export interface ValidarCupomResponse {
  valido: boolean;
  cupom?: Cupom;
  mensagem?: string;
}

export interface Avaliacao {
  id: string;
  nota: number;
  comentario?: string;
  produtoId: string;
  usuarioId: string;
  pedidoId: string;
  createdAt: string;
  produto?: {
    nome: string;
    imagemUrl?: string;
  };
  usuario?: {
    nome: string;
  };
}

export interface AvaliacaoCreateRequest {
  nota: number;
  comentario?: string;
  produtoId: string;
  pedidoId: string;
}

export interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'PEDIDO' | 'PROMOCAO' | 'SISTEMA';
  lida: boolean;
  createdAt: string;
  pedidoId?: string;
}

export interface Pedido {
  id: string;
  numero: string;
  status: 'PENDENTE' | 'CONFIRMADO' | 'EM_PREPARO' | 'SAIU_ENTREGA' | 'ENTREGUE' | 'CANCELADO';
  subtotal: number;
  desconto: number;
  total: number;
  formaPagamento: string;
  enderecoEntrega: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
  itens: {
    id: string;
    quantidade: number;
    precoUnitario: number;
    produto: {
      id: string;
      nome: string;
      imagemUrl?: string;
    };
  }[];
  usuario?: {
    nome: string;
    email: string;
  };
  cupom?: {
    codigo: string;
  };
}

export interface PedidosFiltros {
  status?: string;
  dataInicio?: string;
  dataFim?: string;
  clienteNome?: string;
  page?: number;
  limit?: number;
}

export interface DashboardEstatisticas {
  pedidosHoje: number;
  pedidosSemana: number;
  pedidosMes: number;
  vendasHoje: number;
  vendasSemana: number;
  vendasMes: number;
  ticketMedio: number;
  pedidosPorStatus: {
    status: string;
    quantidade: number;
  }[];
}

export interface VendasPeriodo {
  data: string;
  total: number;
  quantidade: number;
}

export interface ProdutoPopular {
  produtoId: string;
  nome: string;
  imagemUrl?: string;
  quantidadeVendida: number;
  totalVendas: number;
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

// FASE 3 - Cupons API
export const cuponsApi = {
  criar: async (data: CupomCreateRequest): Promise<Cupom> => {
    const response = await apiClient.post<Cupom>('/cupons', data);
    return response.data;
  },
  
  listar: async (): Promise<Cupom[]> => {
    const response = await apiClient.get<Cupom[]>('/cupons');
    return response.data;
  },
  
  buscar: async (id: string): Promise<Cupom> => {
    const response = await apiClient.get<Cupom>(`/cupons/${id}`);
    return response.data;
  },
  
  atualizar: async (id: string, data: Partial<CupomCreateRequest>): Promise<Cupom> => {
    const response = await apiClient.put<Cupom>(`/cupons/${id}`, data);
    return response.data;
  },
  
  deletar: async (id: string): Promise<void> => {
    await apiClient.delete(`/cupons/${id}`);
  },
  
  validar: async (codigo: string): Promise<ValidarCupomResponse> => {
    const response = await apiClient.post<ValidarCupomResponse>('/cupons/validar', { codigo });
    return response.data;
  },
};

// FASE 3 - Avaliações API
export const avaliacoesApi = {
  criar: async (data: AvaliacaoCreateRequest): Promise<Avaliacao> => {
    const response = await apiClient.post<Avaliacao>('/avaliacoes', data);
    return response.data;
  },
  
  listarPorProduto: async (produtoId: string): Promise<Avaliacao[]> => {
    const response = await apiClient.get<Avaliacao[]>(`/avaliacoes/produto/${produtoId}`);
    return response.data;
  },
  
  minhasAvaliacoes: async (): Promise<Avaliacao[]> => {
    const response = await apiClient.get<Avaliacao[]>('/avaliacoes/minhas');
    return response.data;
  },
  
  deletar: async (id: string): Promise<void> => {
    await apiClient.delete(`/avaliacoes/${id}`);
  },
};

// FASE 3 - Notificações API
export const notificacoesApi = {
  listar: async (): Promise<Notificacao[]> => {
    const response = await apiClient.get<Notificacao[]>('/notificacoes');
    return response.data;
  },
  
  naoLidas: async (): Promise<Notificacao[]> => {
    const response = await apiClient.get<Notificacao[]>('/notificacoes/nao-lidas');
    return response.data;
  },
  
  marcarLida: async (id: string): Promise<void> => {
    await apiClient.patch(`/notificacoes/${id}/lida`);
  },
  
  marcarTodasLidas: async (): Promise<void> => {
    await apiClient.patch('/notificacoes/marcar-todas-lidas');
  },
  
  deletar: async (id: string): Promise<void> => {
    await apiClient.delete(`/notificacoes/${id}`);
  },
};

// FASE 3 - Pedidos API
export const pedidosApi = {
  listar: async (filtros?: PedidosFiltros): Promise<{ pedidos: Pedido[]; total: number }> => {
    const response = await apiClient.get<{ pedidos: Pedido[]; total: number }>('/pedidos', { params: filtros });
    return response.data;
  },
  
  meusPedidos: async (): Promise<Pedido[]> => {
    const response = await apiClient.get<Pedido[]>('/pedidos/meus');
    return response.data;
  },
  
  buscar: async (id: string): Promise<Pedido> => {
    const response = await apiClient.get<Pedido>(`/pedidos/${id}`);
    return response.data;
  },
  
  atualizarStatus: async (id: string, status: string): Promise<Pedido> => {
    const response = await apiClient.patch<Pedido>(`/pedidos/${id}/status`, { status });
    return response.data;
  },
  
  cancelar: async (id: string): Promise<Pedido> => {
    const response = await apiClient.patch<Pedido>(`/pedidos/${id}/cancelar`);
    return response.data;
  },
};

// FASE 3 - Dashboard API
export const dashboardApi = {
  estatisticas: async (): Promise<DashboardEstatisticas> => {
    const response = await apiClient.get<DashboardEstatisticas>('/dashboard/estatisticas');
    return response.data;
  },
  
  vendas: async (periodo: 'dia' | 'semana' | 'mes'): Promise<VendasPeriodo[]> => {
    const response = await apiClient.get<VendasPeriodo[]>('/dashboard/vendas', { params: { periodo } });
    return response.data;
  },
  
  produtosPopulares: async (): Promise<ProdutoPopular[]> => {
    const response = await apiClient.get<ProdutoPopular[]>('/dashboard/produtos-populares');
    return response.data;
  },
};

export const backendApi = {
  auth: authApi,
  produtos: produtosApi,
  carrinho: carrinhoApi,
  cupons: cuponsApi,
  avaliacoes: avaliacoesApi,
  notificacoes: notificacoesApi,
  pedidos: pedidosApi,
  dashboard: dashboardApi,
};
