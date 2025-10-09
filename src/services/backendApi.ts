
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
  criadoEm: string;
  atualizadoEm: string;
}

export interface Avaliacao {
  id: string;
  nota: number;
  comentario?: string;
  produtoId: string;
  clienteId: string;
  pedidoId: string;
  produto: {
    nome: string;
    imagemUrl?: string;
  };
  cliente: {
    nome: string;
  };
  criadoEm: string;
}

export interface Notificacao {
  id: string;
  tipo: 'PEDIDO' | 'PROMOCAO' | 'SISTEMA';
  titulo: string;
  mensagem: string;
  lida: boolean;
  criadoEm: string;
}

export interface Pedido {
  id: string;
  numero: string;
  status: 'PENDENTE' | 'CONFIRMADO' | 'EM_PREPARO' | 'SAIU_ENTREGA' | 'ENTREGUE' | 'CANCELADO';
  total: number;
  subtotal: number;
  taxaEntrega: number;
  desconto: number;
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
  itens: Array<{
    id: string;
    produtoId: string;
    quantidade: number;
    precoUnitario: number;
    produto: {
      nome: string;
      imagemUrl?: string;
    };
  }>;
  cliente: {
    id: string;
    nome: string;
    email: string;
    telefone?: string;
  };
  criadoEm: string;
  atualizadoEm: string;
}

export interface PedidosFiltros {
  status?: string;
  limit?: number;
  offset?: number;
  page?: number;
}

export interface CupomCreateRequest {
  codigo: string;
  tipo: 'PERCENTUAL' | 'VALOR_FIXO';
  valor: number;
  dataInicio: string;
  dataFim: string;
  usoMaximo?: number;
  ativo: boolean;
}

export interface DashboardEstatisticas {
  totalVendas: number;
  totalPedidos: number;
  ticketMedio: number;
  produtosAtivos: number;
  pedidosPorStatus: Array<{
    status: string;
    quantidade: number;
  }>;
}

export interface VendasPeriodo {
  data: string;
  vendas: number;
  pedidos: number;
}

export interface ProdutoPopular {
  id: string;
  nome: string;
  quantidadeVendida: number;
  receita: number;
}

// FASE 4 - Novos tipos para Assinaturas
export interface PlanoAssinatura {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  intervalo: 'MENSAL' | 'ANUAL';
  limitePedidos: number;
  limiteProdutos: number;
  features: string[];
  ativo: boolean;
  stripePriceId?: string;
}

export interface Assinatura {
  id: string;
  empresaId: string;
  planoId: string;
  status: 'ATIVA' | 'CANCELADA' | 'SUSPENSA' | 'TRIAL';
  dataInicio: string;
  dataFim?: string;
  proximaCobranca?: string;
  valorMensal: number;
  plano: PlanoAssinatura;
  usoPedidos: number;
  usoProdutos: number;
  stripeSubscriptionId?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CheckoutAssinaturaRequest {
  planoId: string;
  metodoPagamento: 'CARTAO' | 'BOLETO';
}

export interface CheckoutAssinaturaResponse {
  sessionId: string;
  url: string;
}

export interface HistoricoPagamentoAssinatura {
  id: string;
  valor: number;
  status: 'PENDENTE' | 'APROVADO' | 'RECUSADO' | 'CANCELADO';
  metodoPagamento: string;
  dataPagamento: string;
  faturaUrl?: string;
}

// FASE 4 - Novos tipos para Pagamentos
export interface Pagamento {
  id: string;
  empresaId: string;
  pedidoId?: string;
  assinaturaId?: string;
  tipo: 'ASSINATURA' | 'PEDIDO';
  valor: number;
  status: 'PENDENTE' | 'APROVADO' | 'RECUSADO' | 'CANCELADO';
  metodoPagamento: 'PIX' | 'CARTAO' | 'BOLETO';
  pixQrCode?: string;
  pixCopiaECola?: string;
  pixExpiraEm?: string;
  boletoUrl?: string;
  boletoCodigoBarras?: string;
  boletoVencimento?: string;
  stripePaymentIntentId?: string;
  asaasPaymentId?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CreatePagamentoRequest {
  pedidoId?: string;
  assinaturaId?: string;
  tipo: 'ASSINATURA' | 'PEDIDO';
  valor: number;
  metodoPagamento: 'PIX' | 'CARTAO' | 'BOLETO';
}

// FASE 4 - Novos tipos para WhatsApp
export interface MensagemWhatsApp {
  id: string;
  empresaId: string;
  pedidoId?: string;
  clienteId?: string;
  telefone: string;
  mensagem: string;
  tipo: 'ENVIADA' | 'RECEBIDA';
  status: 'PENDENTE' | 'ENVIADA' | 'ENTREGUE' | 'LIDA' | 'ERRO';
  erro?: string;
  criadoEm: string;
}

export interface EnviarMensagemRequest {
  telefone: string;
  mensagem: string;
  pedidoId?: string;
}

export interface ConfigurarWhatsAppRequest {
  numeroWhatsApp: string;
  tokenApi: string;
}

// FASE 4 - Novos tipos para Webhooks
export interface WebhookLog {
  id: string;
  empresaId: string;
  origem: 'STRIPE' | 'ASAAS';
  evento: string;
  payload: any;
  processado: boolean;
  erro?: string;
  criadoEm: string;
}

const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
  },
  
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
  
  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/refresh', { refreshToken });
    return response.data;
  },
};

const produtosApi = {
  listar: async (): Promise<Produto[]> => {
    const response = await apiClient.get<Produto[]>('/produtos');
    return response.data;
  },
  
  buscar: async (id: string): Promise<Produto> => {
    const response = await apiClient.get<Produto>(`/produtos/${id}`);
    return response.data;
  },
  
  recomendacoes: async (produtoId: string): Promise<Recomendacao[]> => {
    const response = await apiClient.get<Recomendacao[]>(`/produtos/${produtoId}/recomendacoes`);
    return response.data;
  },
};

const carrinhoApi = {
  obter: async (): Promise<Carrinho> => {
    const response = await apiClient.get<Carrinho>('/carrinho');
    return response.data;
  },
  
  adicionarItem: async (produtoId: string, quantidade: number): Promise<Carrinho> => {
    const response = await apiClient.post<Carrinho>('/carrinho/itens', { produtoId, quantidade });
    return response.data;
  },
  
  atualizarItem: async (itemId: string, quantidade: number): Promise<Carrinho> => {
    const response = await apiClient.put<Carrinho>(`/carrinho/itens/${itemId}`, { quantidade });
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
};

const cuponsApi = {
  listar: async (): Promise<Cupom[]> => {
    const response = await apiClient.get<Cupom[]>('/cupons');
    return response.data;
  },
  
  criar: async (data: Omit<Cupom, 'id' | 'empresaId' | 'usoAtual' | 'criadoEm' | 'atualizadoEm'>): Promise<Cupom> => {
    const response = await apiClient.post<Cupom>('/cupons', data);
    return response.data;
  },
  
  atualizar: async (id: string, data: Partial<Cupom>): Promise<Cupom> => {
    const response = await apiClient.put<Cupom>(`/cupons/${id}`, data);
    return response.data;
  },
  
  deletar: async (id: string): Promise<void> => {
    await apiClient.delete(`/cupons/${id}`);
  },
  
  validar: async (codigo: string): Promise<{ valido: boolean; cupom?: Cupom; erro?: string }> => {
    const response = await apiClient.post<{ valido: boolean; cupom?: Cupom; erro?: string }>('/cupons/validar', { codigo });
    return response.data;
  },
};

const avaliacoesApi = {
  listar: async (produtoId?: string): Promise<Avaliacao[]> => {
    const url = produtoId ? `/avaliacoes?produtoId=${produtoId}` : '/avaliacoes';
    const response = await apiClient.get<Avaliacao[]>(url);
    return response.data;
  },
  
  criar: async (data: { produtoId: string; pedidoId: string; nota: number; comentario?: string }): Promise<Avaliacao> => {
    const response = await apiClient.post<Avaliacao>('/avaliacoes', data);
    return response.data;
  },
  
  minhas: async (): Promise<Avaliacao[]> => {
    const response = await apiClient.get<Avaliacao[]>('/avaliacoes/minhas');
    return response.data;
  },
};

const notificacoesApi = {
  listar: async (): Promise<Notificacao[]> => {
    const response = await apiClient.get<Notificacao[]>('/notificacoes');
    return response.data;
  },
  
  marcarComoLida: async (id: string): Promise<void> => {
    await apiClient.put(`/notificacoes/${id}/lida`);
  },
  
  marcarTodasComoLidas: async (): Promise<void> => {
    await apiClient.put('/notificacoes/marcar-todas-lidas');
  },
};

const pedidosApi = {
  listar: async (params?: { status?: string; limit?: number; offset?: number }): Promise<{ pedidos: Pedido[]; total: number }> => {
    const response = await apiClient.get<{ pedidos: Pedido[]; total: number }>('/pedidos', { params });
    return response.data;
  },
  
  buscar: async (id: string): Promise<Pedido> => {
    const response = await apiClient.get<Pedido>(`/pedidos/${id}`);
    return response.data;
  },
  
  atualizarStatus: async (id: string, status: string): Promise<Pedido> => {
    const response = await apiClient.put<Pedido>(`/pedidos/${id}/status`, { status });
    return response.data;
  },
  
  meusPedidos: async (): Promise<Pedido[]> => {
    const response = await apiClient.get<Pedido[]>('/pedidos/meus');
    return response.data;
  },
};

const dashboardApi = {
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

// FASE 4 - API de Assinaturas
const assinaturasApi = {
  getPlanos: async (): Promise<PlanoAssinatura[]> => {
    const response = await apiClient.get<PlanoAssinatura[]>('/assinaturas/planos');
    return response.data;
  },
  
  createCheckout: async (data: CheckoutAssinaturaRequest): Promise<CheckoutAssinaturaResponse> => {
    const response = await apiClient.post<CheckoutAssinaturaResponse>('/assinaturas/checkout', data);
    return response.data;
  },
  
  getMinha: async (): Promise<Assinatura> => {
    const response = await apiClient.get<Assinatura>('/assinaturas/minha');
    return response.data;
  },
  
  cancelar: async (): Promise<Assinatura> => {
    const response = await apiClient.post<Assinatura>('/assinaturas/cancelar');
    return response.data;
  },
  
  reativar: async (): Promise<Assinatura> => {
    const response = await apiClient.post<Assinatura>('/assinaturas/reativar');
    return response.data;
  },
  
  getHistorico: async (): Promise<HistoricoPagamentoAssinatura[]> => {
    const response = await apiClient.get<HistoricoPagamentoAssinatura[]>('/assinaturas/historico-pagamentos');
    return response.data;
  },
};

// FASE 4 - API de Pagamentos
const pagamentosApi = {
  criar: async (data: CreatePagamentoRequest): Promise<Pagamento> => {
    const response = await apiClient.post<Pagamento>('/pagamentos', data);
    return response.data;
  },
  
  buscar: async (id: string): Promise<Pagamento> => {
    const response = await apiClient.get<Pagamento>(`/pagamentos/${id}`);
    return response.data;
  },
  
  porPedido: async (pedidoId: string): Promise<Pagamento[]> => {
    const response = await apiClient.get<Pagamento[]>(`/pagamentos/pedido/${pedidoId}`);
    return response.data;
  },
  
  listar: async (params?: { tipo?: string; status?: string; limit?: number; offset?: number }): Promise<{ pagamentos: Pagamento[]; total: number }> => {
    const response = await apiClient.get<{ pagamentos: Pagamento[]; total: number }>('/pagamentos', { params });
    return response.data;
  },
  
  cancelar: async (id: string): Promise<Pagamento> => {
    const response = await apiClient.post<Pagamento>(`/pagamentos/${id}/cancelar`);
    return response.data;
  },
};

// FASE 4 - API de WhatsApp
const whatsappApi = {
  enviarMensagem: async (data: EnviarMensagemRequest): Promise<MensagemWhatsApp> => {
    const response = await apiClient.post<MensagemWhatsApp>('/whatsapp/enviar', data);
    return response.data;
  },
  
  getMensagens: async (params?: { limit?: number; offset?: number }): Promise<{ mensagens: MensagemWhatsApp[]; total: number }> => {
    const response = await apiClient.get<{ mensagens: MensagemWhatsApp[]; total: number }>('/whatsapp/mensagens', { params });
    return response.data;
  },
  
  porPedido: async (pedidoId: string): Promise<MensagemWhatsApp[]> => {
    const response = await apiClient.get<MensagemWhatsApp[]>(`/whatsapp/pedido/${pedidoId}`);
    return response.data;
  },
  
  configurar: async (data: ConfigurarWhatsAppRequest): Promise<{ sucesso: boolean; mensagem: string }> => {
    const response = await apiClient.post<{ sucesso: boolean; mensagem: string }>('/whatsapp/configurar', data);
    return response.data;
  },
};

// FASE 4 - API de Webhooks
const webhooksApi = {
  getLogs: async (params?: { origem?: string; processado?: boolean; limit?: number; offset?: number }): Promise<{ logs: WebhookLog[]; total: number }> => {
    const response = await apiClient.get<{ logs: WebhookLog[]; total: number }>('/webhooks/logs', { params });
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
  assinaturas: assinaturasApi,
  pagamentos: pagamentosApi,
  whatsapp: whatsappApi,
  webhooks: webhooksApi,
};

// Export individual APIs for direct imports
export { carrinhoApi, authApi, produtosApi, cuponsApi, avaliacoesApi, notificacoesApi, pedidosApi, dashboardApi, assinaturasApi, pagamentosApi, whatsappApi, webhooksApi };
