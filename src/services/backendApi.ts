
import apiClient from './apiClient';
import { storefrontSupabase } from './storefrontSupabase';
const lsGet = <T,>(key: string): T | null => {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};
const lsSet = <T,>(key: string, val: T): void => {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(val));
    }
  } catch {}
};
const kInfo = (slug: string) => `storefront_info_${slug}`;
const kProdutos = (slug: string) => `storefront_produtos_${slug}`;
const kCategorias = (slug: string) => `storefront_categorias_${slug}`;

export interface LoginRequest {
  email: string;
  senha: string;
  empresaSlug?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    tipo: 'ADMIN' | 'CLIENTE' | 'SUPER_ADMIN' | 'ADMIN_EMPRESA';
    empresaId?: string;
    telefone?: string;
  };
  empresa?: {
    id: string;
    nome: string;
    slug: string;
    subdominio?: string;
    telefone?: string;
    endereco?: string;
    customDomain?: string | null;
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
  // Novas flags de tags
  promo_tag?: boolean;
  bestseller_tag?: boolean;
  new_tag?: boolean;
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
    const res = await apiClient.post('/auth/login', data);
    return res.data;
  },
  
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
  
  refreshToken: async (refreshToken: string): Promise<LoginResponse> => {
    const res = await apiClient.post('/auth/refresh', { refreshToken });
    return res.data;
  },
};

const produtosApi = {
  listar: async (): Promise<Produto[]> => {
    const res = await apiClient.get('/produtos');
    return res.data;
  },
  
  buscar: async (id: string): Promise<Produto> => {
    const res = await apiClient.get(`/produtos/${id}`);
    return res.data;
  },
  
  recomendacoes: async (produtoId: string): Promise<Recomendacao[]> => {
    const res = await apiClient.get(`/produtos/${produtoId}/recomendacoes`);
    return res.data;
  },
};

const carrinhoApi = {
  obter: async (): Promise<Carrinho> => {
    const res = await apiClient.get('/carrinho');
    return res.data;
  },
  
  adicionarItem: async (produtoId: string, quantidade: number): Promise<Carrinho> => {
    const res = await apiClient.post('/carrinho/itens', { produtoId, quantidade });
    return res.data;
  },
  
  atualizarItem: async (itemId: string, quantidade: number): Promise<Carrinho> => {
    const res = await apiClient.put(`/carrinho/itens/${itemId}`, { quantidade });
    return res.data;
  },
  
  removerItem: async (itemId: string): Promise<Carrinho> => {
    const res = await apiClient.delete(`/carrinho/itens/${itemId}`);
    return res.data;
  },
  
  limpar: async (): Promise<void> => {
    await apiClient.delete('/carrinho');
  },
  
  checkout: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
    const res = await apiClient.post('/carrinho/checkout', data);
    return res.data;
  },
};

const cuponsApi = {
  listar: async (): Promise<Cupom[]> => {
    const res = await apiClient.get('/cupons');
    return res.data;
  },
  
  criar: async (data: Omit<Cupom, 'id' | 'empresaId' | 'usoAtual' | 'criadoEm' | 'atualizadoEm'>): Promise<Cupom> => {
    const res = await apiClient.post('/cupons', data);
    return res.data;
  },
  
  atualizar: async (id: string, data: Partial<Cupom>): Promise<Cupom> => {
    const res = await apiClient.put(`/cupons/${id}`, data);
    return res.data;
  },
  
  remover: async (id: string): Promise<Cupom> => {
    const res = await apiClient.delete(`/cupons/${id}`);
    return res.data;
  },
};

const pedidosApi = {
  listar: async (params?: { status?: string; page?: number; limit?: number }): Promise<{ pedidos: Pedido[]; total: number }> => {
    const res = await apiClient.get('/pedidos', { params });
    return res.data;
  },
  
  buscar: async (id: string): Promise<Pedido> => {
    const res = await apiClient.get(`/pedidos/${id}`);
    return res.data;
  },
  
  atualizarStatus: async (id: string, status: string): Promise<Pedido> => {
    const res = await apiClient.put(`/pedidos/${id}/status`, { status });
    return res.data;
  },
  
  meusPedidos: async (): Promise<Pedido[]> => {
    const res = await apiClient.get('/meus-pedidos');
    return res.data;
  },
};

const dashboardApi = {
  estatisticas: async (): Promise<DashboardEstatisticas> => {
    const res = await apiClient.get('/dashboard/estatisticas');
    return res.data;
  },
  
  vendas: async (periodo: 'dia' | 'semana' | 'mes'): Promise<VendasPeriodo[]> => {
    const res = await apiClient.get(`/dashboard/vendas?periodo=${periodo}`);
    return res.data;
  },
  
  produtosPopulares: async (): Promise<ProdutoPopular[]> => {
    const res = await apiClient.get('/dashboard/produtos-populares');
    return res.data;
  },
};

const assinaturasApi = {
  listarPlanos: async (): Promise<PlanoAssinatura[]> => {
    const res = await apiClient.get('/planos');
    return res.data;
  },

  assinar: async (data: CheckoutAssinaturaRequest): Promise<CheckoutAssinaturaResponse> => {
    const res = await apiClient.post('/assinaturas/checkout', data);
    return res.data;
  },

  minhas: async (): Promise<Assinatura[]> => {
    const res = await apiClient.get('/assinaturas/minhas');
    return res.data;
  },
};

const pagamentosApi = {
  criar: async (data: CreatePagamentoRequest): Promise<Pagamento> => {
    const res = await apiClient.post('/pagamentos', data);
    return res.data;
  },

  obter: async (id: string): Promise<Pagamento> => {
    const res = await apiClient.get(`/pagamentos/${id}`);
    return res.data;
  },
  testarAsaas: async (token: string): Promise<{ ok: boolean; sample?: any }> => {
    const res = await apiClient.post('/pagamentos/asaas/testar', null, {
      headers: { 'X-Asaas-Token': token },
    });
    return res.data;
  },
};

const whatsappApi = {
  enviarMensagem: async (data: EnviarMensagemRequest): Promise<{ sucesso: boolean; mensagem: string }> => {
    const res = await apiClient.post('/whatsapp/enviar', data);
    return res.data;
  },

  configurar: async (data: ConfigurarWhatsAppRequest): Promise<{ sucesso: boolean; mensagem: string }> => {
    const res = await apiClient.post('/whatsapp/configurar', data);
    return res.data;
  },
};

const webhooksApi = {
  getLogs: async (params?: { origem?: string; processado?: boolean; limit?: number; offset?: number }): Promise<{ logs: WebhookLog[]; total: number }> => {
    const res = await apiClient.get('/webhooks/logs', { params });
    return res.data;
  },
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function withBackoff<T>(fn: () => Promise<T>, attempts = 4, baseMs = 800): Promise<T> {
  let lastErr: any;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < attempts - 1) {
        const wait = baseMs * Math.pow(2, i);
        await sleep(wait);
        continue;
      }
    }
  }
  throw lastErr;
}

const storefrontApi = {
  getLojaInfo: storefrontSupabase.getLojaInfo,
  getTheme: storefrontSupabase.getTheme,
  getProdutos: storefrontSupabase.getProdutos,
  getProduto: storefrontSupabase.getProduto,
  getCategorias: storefrontSupabase.getCategorias,
};

const categoriasApi = {
  listar: async (): Promise<string[]> => {
    const res = await apiClient.get('/v1/categorias');
    return res.data;
  },
  adicionar: async (nome: string): Promise<{ sucesso: boolean; mensagem?: string }> => {
    const res = await apiClient.post('/v1/categorias', { nome });
    return res.data;
  },
};

// Admin Theme API (persist theme for current company)
export interface StorefrontThemeSettingsPayload {
  backgroundImage?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  updatedAt: number;
}

const themeApi = {
  get: async (): Promise<{ settings: StorefrontThemeSettingsPayload | null }> => {
    const res = await apiClient.get('/v1/theme');
    return res.data;
  },
  update: async (settings: StorefrontThemeSettingsPayload): Promise<{ sucesso: boolean; settings: StorefrontThemeSettingsPayload; mensagem?: string }> => {
    const res = await apiClient.put('/v1/theme', settings);
    return res.data;
  },
};

export interface DomainInfo { slug: string; customDomain?: string | null; redirectEnabled?: boolean }
export interface DomainAvailability { available: boolean }

// Companies API (experimental): tenta obter detalhes da empresa incluindo telefone
export interface CompanyInfo { id: string; nome: string; slug: string; telefone?: string }
const companiesApi = {
  getBySlug: async (slug: string): Promise<CompanyInfo> => {
    const res = await apiClient.get(`/v1/companies/${slug}`);
    return res.data;
  },
};

const avaliacoesApi = {
  minhasAvaliacoes: async (): Promise<Avaliacao[]> => {
    const res = await apiClient.get('/avaliacoes/minhas');
    return res.data;
  },
  deletar: async (id: string): Promise<void> => {
    await apiClient.delete(`/avaliacoes/${id}`);
  },
};

const notificacoesApi = {
  listar: async (): Promise<Notificacao[]> => {
    const res = await apiClient.get('/notificacoes');
    return res.data;
  },
  marcarLida: async (_id: string): Promise<void> => {
    await apiClient.post('/notificacoes/marcar-lida', { id: _id });
  },
  marcarTodasLidas: async (): Promise<void> => {
    await apiClient.post('/notificacoes/marcar-todas-lidas');
  },
  deletar: async (_id: string): Promise<void> => {
    await apiClient.delete(`/notificacoes/${_id}`);
  },
};

const domainApi = {
  getCurrent: async (): Promise<DomainInfo> => {
    const res = await apiClient.get('/domains/current');
    return res.data;
  },
  checkAvailability: async (domain: string): Promise<DomainAvailability> => {
    const res = await apiClient.get('/domains/check', { params: { domain } });
    return res.data;
  },
  save: async (customDomain: string, redirectEnabled?: boolean): Promise<{ sucesso: boolean; customDomain: string; redirectEnabled?: boolean }> => {
    const res = await apiClient.post('/domains/save', { customDomain, redirectEnabled });
    return res.data;
  },
  dnsStatus: async (domain: string): Promise<{ ok: boolean; records: { A: string[]; CNAME: string[] } }> => {
    const res = await apiClient.get('/domains/dns-status', { params: { domain } });
    return res.data;
  },
};

const storageApi = {
  ensureBucket: async (name?: string): Promise<{ ok: boolean; bucket: string }> => {
    const res = await apiClient.post('/v1/storage/ensure-bucket', { name });
    return res.data;
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
  storefront: storefrontApi,
  theme: themeApi,
  companies: companiesApi,
  domain: domainApi,
  storage: storageApi,
  categorias: categoriasApi,
};

export { carrinhoApi, authApi, produtosApi, cuponsApi, avaliacoesApi, notificacoesApi, pedidosApi, dashboardApi, assinaturasApi, pagamentosApi, whatsappApi, webhooksApi, storefrontApi, themeApi, companiesApi, domainApi, categoriasApi, storageApi };
