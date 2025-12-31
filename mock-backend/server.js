/*
 Mock Backend API for local testing
 Provides minimal endpoints to satisfy frontend flows: auth, produtos, pedidos,
 carrinho, dashboard, cupons, notificacoes. In-memory persistence for session.
*/

import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { promises as dns } from 'dns';
console.log('[mock-backend] booting server.js');

// Update: allow overriding port via environment variable
const PORT = parseInt(process.env.PORT || '3003', 10);
const ORIGINS = [
  'http://localhost:4173',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4174',
  'http://localhost:4175',
  'http://localhost:4176',
  'http://localhost:4177',
  'http://localhost:4178',
  'http://localhost:4179',
];

const app = express();
app.use(cors({ origin: ORIGINS, credentials: true }));
app.use(express.json());

// In-memory data
const empresas = [
  { id: 'emp_pizza', slug: 'pizza-express', nome: 'Pizza Express', customDomain: null, redirectEnabled: false },
  { id: 'emp_burger', slug: 'burger-king', nome: 'Burger King', customDomain: null, redirectEnabled: false },
];

const usuarios = {
  'admin@pizza-express.com': {
    id: 'u_admin_pizza', nome: 'Admin Pizza', email: 'admin@pizza-express.com', tipo: 'ADMIN', empresaId: 'emp_pizza', senha: 'pizza123',
  },
  'admin@burger-king.com': {
    id: 'u_admin_burger', nome: 'Admin Burger', email: 'admin@burger-king.com', tipo: 'ADMIN', empresaId: 'emp_burger', senha: 'burger123',
  },
  'admin@deliverei.com.br': {
    id: 'u_super_admin', nome: 'Super Admin', email: 'admin@deliverei.com.br', tipo: 'ADMIN', empresaId: 'emp_pizza', senha: 'admin123',
  },
  'cliente@exemplo.com': {
    id: 'u_cliente', nome: 'Cliente Exemplo', email: 'cliente@exemplo.com', tipo: 'CLIENTE', empresaId: 'emp_pizza', senha: 'cliente123',
  },
};

const produtosPorEmpresa = {
  emp_pizza: [
    { id: 'p_p_1', nome: 'Pizza Margherita', descricao: 'Clássica', preco: 39.9, disponivel: true, empresaId: 'emp_pizza', imagemUrl: '', categoria: 'Pizza', estoque: 10, promo_tag: false, bestseller_tag: true, new_tag: false },
    { id: 'p_p_2', nome: 'Pizza Calabresa', descricao: 'Calabresa, cebola', preco: 44.9, disponivel: true, empresaId: 'emp_pizza', imagemUrl: '', categoria: 'Pizza', estoque: 8, promo_tag: true, bestseller_tag: false, new_tag: true },
  ],
  emp_burger: [
    { id: 'p_b_1', nome: 'Cheeseburger', descricao: 'Queijo, carne', preco: 29.9, disponivel: true, empresaId: 'emp_burger', imagemUrl: '', categoria: 'Burger', estoque: 15, promo_tag: false, bestseller_tag: true, new_tag: false },
    { id: 'p_b_2', nome: 'Double Bacon', descricao: 'Duplo bacon', preco: 39.9, disponivel: true, empresaId: 'emp_burger', imagemUrl: '', categoria: 'Burger', estoque: 5, promo_tag: true, bestseller_tag: false, new_tag: false },
  ],
};

const pedidosPorEmpresa = {
  emp_pizza: [
    {
      id: 'ped_p_1', numero: 'PZ-1001', status: 'PENDENTE', total: 84.8, subtotal: 84.8, taxaEntrega: 0, desconto: 0,
      formaPagamento: 'PIX', enderecoEntrega: { rua: 'Rua A', numero: '100', bairro: 'Centro', cidade: 'SP', estado: 'SP', cep: '01000-000' },
      itens: [ { id: 'i1', produtoId: 'p_p_1', quantidade: 1, precoUnitario: 39.9, produto: { nome: 'Pizza Margherita' } }, { id: 'i2', produtoId: 'p_p_2', quantidade: 1, precoUnitario: 44.9, produto: { nome: 'Pizza Calabresa' } } ],
      criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString()
    },
  ],
  emp_burger: [],
};

const cuponsPorEmpresa = { emp_pizza: [], emp_burger: [] };
// In-memory theme settings per empresa
// Shape matches frontend expectations: { backgroundImage?, primaryColor, secondaryColor, accentColor?, updatedAt }
const themesByEmpresaId = new Map();

const tokens = new Map(); // token -> { userId, empresaId }
const refreshTokens = new Map(); // refreshToken -> { userId, empresaId }
const carrinhos = new Map(); // userId -> { id, itens: [], subtotal, total, desconto }

function getEmpresaBySlug(slug) {
  return empresas.find((e) => e.slug === slug);
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token || !tokens.has(token)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const session = tokens.get(token);
  req.user = { id: session.userId };
  req.empresaId = session.empresaId;
  next();
}

// Domain helpers
function sanitizeDomain(input) {
  return String(input || '').trim().toLowerCase();
}

function isValidDomain(domain) {
  const re = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;
  return re.test(domain);
}

function isDomainInUse(domain, ignoreEmpresaId = null) {
  const d = sanitizeDomain(domain);
  return empresas.some((e) => e.customDomain && sanitizeDomain(e.customDomain) === d && e.id !== ignoreEmpresaId);
}

// Health
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// API Pública da vitrine (por slug)
app.get('/api/public/:slug/info', (req, res) => {
  const { slug } = req.params;
  const empresa = getEmpresaBySlug(slug);
  if (!empresa) return res.status(404).json({ message: 'Loja não encontrada' });
  res.json({ id: empresa.id, nome: empresa.nome, slug: empresa.slug });
});

app.get('/api/public/:slug/produtos', (req, res) => {
  const { slug } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const categoria = (req.query.categoria || '').toString().toLowerCase();
  const search = (req.query.search || '').toString().toLowerCase();

  const empresa = getEmpresaBySlug(slug);
  if (!empresa) return res.status(404).json({ message: 'Loja não encontrada' });

  let list = (produtosPorEmpresa[empresa.id] || []).filter((p) => p.disponivel);
  if (categoria) list = list.filter((p) => (p.categoria || '').toLowerCase() === categoria);
  if (search) list = list.filter((p) => p.nome.toLowerCase().includes(search) || (p.descricao || '').toLowerCase().includes(search));

  const total = list.length;
  const start = Math.max(0, (page - 1) * limit);
  const end = Math.min(start + limit, total);
  const data = list.slice(start, end);

  res.json({ data, meta: { page, limit, total } });
});

app.get('/api/public/:slug/produtos/:id', (req, res) => {
  const { slug, id } = req.params;
  const empresa = getEmpresaBySlug(slug);
  if (!empresa) return res.status(404).json({ message: 'Loja não encontrada' });
  const list = produtosPorEmpresa[empresa.id] || [];
  const item = list.find((p) => p.id === id);
  if (!item) return res.status(404).json({ message: 'Produto não encontrado' });
  res.json(item);
});

app.get('/api/public/:slug/categorias', (req, res) => {
  const { slug } = req.params;
  const empresa = getEmpresaBySlug(slug);
  if (!empresa) return res.status(404).json({ message: 'Loja não encontrada' });
  const list = produtosPorEmpresa[empresa.id] || [];
  const categorias = Array.from(new Set(list.map((p) => p.categoria).filter(Boolean)));
  res.json(categorias);
});

// Public theme (storefront) by slug
app.get('/api/public/:slug/theme', (req, res) => {
  const { slug } = req.params;
  const empresa = getEmpresaBySlug(slug);
  if (!empresa) return res.status(404).json({ message: 'Loja não encontrada' });
  const settings = themesByEmpresaId.get(empresa.id) || null;
  res.set('Cache-Control', 'no-store');
  res.json({ settings });
});

// Auth
app.post('/api/auth/login', (req, res) => {
  const { email, senha } = req.body || {};
  const user = usuarios[email];
  if (!user || user.senha !== senha) {
    return res.status(401).json({ message: 'Credenciais inválidas' });
  }
  const empresa = empresas.find((e) => e.id === user.empresaId);
  if (!empresa) {
    return res.status(404).json({ message: 'Empresa não encontrada para o usuário' });
  }
  const token = uuidv4();
  const refreshToken = uuidv4();
  tokens.set(token, { userId: user.id, empresaId: empresa.id, createdAt: Date.now() });
  refreshTokens.set(refreshToken, { userId: user.id, empresaId: empresa.id, createdAt: Date.now() });
  res.json({
    accessToken: token,
    refreshToken,
    usuario: { id: user.id, nome: user.nome, email: user.email, tipo: user.tipo, empresaId: user.empresaId },
    empresa: { id: empresa.id, nome: empresa.nome, slug: empresa.slug, customDomain: empresa.customDomain || null },
  });
});

app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    return res.status(401).json({ message: 'Refresh token inválido' });
  }
  const session = refreshTokens.get(refreshToken);
  const newAccess = uuidv4();
  const newRefresh = uuidv4();
  tokens.set(newAccess, { userId: session.userId, empresaId: session.empresaId, createdAt: Date.now() });
  refreshTokens.delete(refreshToken);
  refreshTokens.set(newRefresh, { userId: session.userId, empresaId: session.empresaId, createdAt: Date.now() });
  res.json({ accessToken: newAccess, refreshToken: newRefresh });
});

app.post('/api/auth/logout', authMiddleware, (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (token) tokens.delete(token);
  res.json({ sucesso: true });
});

// Domínios personalizados - Admin
app.get('/api/admin/domain-availability', authMiddleware, (req, res) => {
  const domain = sanitizeDomain(req.query.domain || '');
  if (!domain) return res.status(400).json({ available: false, message: 'Domínio não informado' });
  if (!isValidDomain(domain)) return res.status(400).json({ available: false, message: 'Formato de domínio inválido' });
  const available = !isDomainInUse(domain, req.empresaId);
  res.json({ available });
});

app.get('/api/admin/store/domain', authMiddleware, (req, res) => {
  const empresa = empresas.find((e) => e.id === req.empresaId);
  if (!empresa) return res.status(404).json({ message: 'Empresa não encontrada' });
  res.json({ slug: empresa.slug, customDomain: empresa.customDomain || null, redirectEnabled: !!empresa.redirectEnabled });
});

app.post('/api/admin/store/domain', authMiddleware, (req, res) => {
  const { customDomain, redirectEnabled } = req.body || {};
  const empresa = empresas.find((e) => e.id === req.empresaId);
  if (!empresa) return res.status(404).json({ message: 'Empresa não encontrada' });
  const domain = sanitizeDomain(customDomain);
  if (!domain) return res.status(400).json({ message: 'Domínio não informado' });
  if (!isValidDomain(domain)) return res.status(400).json({ message: 'Formato de domínio inválido' });
  if (isDomainInUse(domain, req.empresaId)) {
    return res.status(409).json({ message: 'Domínio já está em uso por outra loja' });
  }
  empresa.customDomain = domain;
  if (typeof redirectEnabled === 'boolean') {
    empresa.redirectEnabled = !!redirectEnabled;
  }
  res.json({ sucesso: true, customDomain: domain, redirectEnabled: !!empresa.redirectEnabled });
});

app.get('/api/admin/domain-dns', authMiddleware, async (req, res) => {
  const domain = sanitizeDomain(req.query.domain || '');
  if (!domain) return res.status(400).json({ ok: false, message: 'Domínio não informado' });
  if (!isValidDomain(domain)) return res.status(400).json({ ok: false, message: 'Formato de domínio inválido' });
  const result = { A: [], CNAME: [] };
  try {
    try { result.CNAME = await dns.resolveCname(domain); } catch {}
    try { result.A = await dns.resolve4(domain); } catch {}
    const ok = (result.CNAME && result.CNAME.length > 0) || (result.A && result.A.length > 0);
    res.json({ ok, records: result });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Erro ao consultar DNS', error: String(err && err.message || err) });
  }
});

// Domains (REST) to match frontend domainApi
app.get('/api/domains/current', authMiddleware, (req, res) => {
  const empresa = empresas.find((e) => e.id === req.empresaId);
  if (!empresa) return res.status(404).json({ message: 'Empresa não encontrada' });
  res.json({ slug: empresa.slug, customDomain: empresa.customDomain || null, redirectEnabled: !!empresa.redirectEnabled });
});

app.get('/api/domains/check', authMiddleware, (req, res) => {
  const domain = sanitizeDomain(req.query.domain || '');
  if (!domain) return res.status(400).json({ available: false, message: 'Domínio não informado' });
  if (!isValidDomain(domain)) return res.status(400).json({ available: false, message: 'Formato de domínio inválido' });
  const available = !isDomainInUse(domain, req.empresaId);
  res.json({ available });
});

app.post('/api/domains/save', authMiddleware, (req, res) => {
  const { customDomain, redirectEnabled } = req.body || {};
  const empresa = empresas.find((e) => e.id === req.empresaId);
  if (!empresa) return res.status(404).json({ message: 'Empresa não encontrada' });
  const domain = sanitizeDomain(customDomain);
  if (!domain) return res.status(400).json({ message: 'Domínio não informado' });
  if (!isValidDomain(domain)) return res.status(400).json({ message: 'Formato de domínio inválido' });
  if (isDomainInUse(domain, req.empresaId)) {
    return res.status(409).json({ message: 'Domínio já está em uso por outra loja' });
  }
  empresa.customDomain = domain;
  if (typeof redirectEnabled === 'boolean') {
    empresa.redirectEnabled = !!redirectEnabled;
  }
  res.json({ sucesso: true, customDomain: domain, redirectEnabled: !!empresa.redirectEnabled });
});

app.get('/api/domains/dns-status', authMiddleware, async (req, res) => {
  const domain = sanitizeDomain(req.query.domain || '');
  if (!domain) return res.status(400).json({ ok: false, message: 'Domínio não informado' });
  if (!isValidDomain(domain)) return res.status(400).json({ ok: false, message: 'Formato de domínio inválido' });
  const result = { A: [], CNAME: [] };
  try {
    try { result.CNAME = await dns.resolveCname(domain); } catch {}
    try { result.A = await dns.resolve4(domain); } catch {}
    const ok = (result.CNAME && result.CNAME.length > 0) || (result.A && result.A.length > 0);
    res.json({ ok, records: result });
  } catch (err) {
    res.status(500).json({ ok: false, message: 'Erro ao consultar DNS', error: String(err && err.message || err) });
  }
});

// Produtos
app.get('/api/produtos', authMiddleware, (req, res) => {
  const list = produtosPorEmpresa[req.empresaId] || [];
  res.json(list);
});

app.get('/api/produtos/:id', authMiddleware, (req, res) => {
  const list = produtosPorEmpresa[req.empresaId] || [];
  const item = list.find((p) => p.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Produto não encontrado' });
  res.json(item);
});

app.post('/api/produtos', authMiddleware, (req, res) => {
  const { nome, descricao, preco, imagemUrl, categoria, estoque, promo_tag, bestseller_tag, new_tag } = req.body || {};
  if (!nome || typeof preco !== 'number') return res.status(400).json({ message: 'Dados inválidos' });
  const novo = {
    id: uuidv4(), nome, descricao: descricao || '', preco, disponivel: true, empresaId: req.empresaId,
    imagemUrl: imagemUrl || '', categoria: categoria || '', estoque: estoque || 0,
    promo_tag: !!promo_tag, bestseller_tag: !!bestseller_tag, new_tag: !!new_tag,
  };
  produtosPorEmpresa[req.empresaId] = produtosPorEmpresa[req.empresaId] || [];
  produtosPorEmpresa[req.empresaId].push(novo);
  res.json(novo);
});

app.patch('/api/produtos/:id', authMiddleware, (req, res) => {
  const list = produtosPorEmpresa[req.empresaId] || [];
  const item = list.find((p) => p.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Produto não encontrado' });
  const { nome, descricao, preco, imagemUrl, categoria, estoque, disponivel, promo_tag, bestseller_tag, new_tag } = req.body || {};
  if (nome !== undefined) item.nome = nome;
  if (descricao !== undefined) item.descricao = descricao;
  if (preco !== undefined) item.preco = preco;
  if (imagemUrl !== undefined) item.imagemUrl = imagemUrl;
  if (categoria !== undefined) item.categoria = categoria;
  if (estoque !== undefined) item.estoque = estoque;
  if (disponivel !== undefined) item.disponivel = !!disponivel;
  if (promo_tag !== undefined) item.promo_tag = !!promo_tag;
  if (bestseller_tag !== undefined) item.bestseller_tag = !!bestseller_tag;
  if (new_tag !== undefined) item.new_tag = !!new_tag;
  res.json(item);
});

app.delete('/api/produtos/:id', authMiddleware, (req, res) => {
  const list = produtosPorEmpresa[req.empresaId] || [];
  const idx = list.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Produto não encontrado' });
  const [removed] = list.splice(idx, 1);
  res.json(removed);
});

app.delete('/api/produtos/:id/hard', authMiddleware, (req, res) => {
  const list = produtosPorEmpresa[req.empresaId] || [];
  const idx = list.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Produto não encontrado' });
  list.splice(idx, 1);
  res.json({ sucesso: true });
});

// Carrinho
app.get('/api/carrinho', authMiddleware, (req, res) => {
  const userId = req.user.id;
  if (!carrinhos.has(userId)) carrinhos.set(userId, { id: uuidv4(), itens: [], subtotal: 0, total: 0, desconto: 0 });
  res.json(carrinhos.get(userId));
});

app.post('/api/carrinho/itens', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { produtoId, quantidade } = req.body || {};
  if (!produtoId || !quantidade) return res.status(400).json({ message: 'Dados inválidos' });
  const carrinho = carrinhos.get(userId) || { id: uuidv4(), itens: [], subtotal: 0, total: 0, desconto: 0 };
  const list = produtosPorEmpresa[req.empresaId] || [];
  const produto = list.find((p) => p.id === produtoId);
  if (!produto) return res.status(404).json({ message: 'Produto não encontrado' });
  const item = { id: uuidv4(), produtoId, quantidade, precoUnitario: produto.preco, produto: { nome: produto.nome, imagemUrl: produto.imagemUrl } };
  carrinho.itens.push(item);
  carrinho.subtotal += produto.preco * quantidade;
  carrinho.total = carrinho.subtotal - (carrinho.desconto || 0);
  carrinhos.set(userId, carrinho);
  res.json(carrinho);
});

app.put('/api/carrinho/itens/:itemId', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const { quantidade } = req.body || {};
  const carrinho = carrinhos.get(userId);
  if (!carrinho) return res.status(404).json({ message: 'Carrinho não encontrado' });
  const item = carrinho.itens.find((i) => i.id === req.params.itemId);
  if (!item) return res.status(404).json({ message: 'Item não encontrado' });
  item.quantidade = quantidade;
  carrinho.subtotal = carrinho.itens.reduce((sum, i) => sum + i.precoUnitario * i.quantidade, 0);
  carrinho.total = carrinho.subtotal - (carrinho.desconto || 0);
  carrinhos.set(userId, carrinho);
  res.json(carrinho);
});

app.delete('/api/carrinho/itens/:itemId', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const carrinho = carrinhos.get(userId);
  if (!carrinho) return res.status(404).json({ message: 'Carrinho não encontrado' });
  const idx = carrinho.itens.findIndex((i) => i.id === req.params.itemId);
  if (idx === -1) return res.status(404).json({ message: 'Item não encontrado' });
  carrinho.itens.splice(idx, 1);
  carrinho.subtotal = carrinho.itens.reduce((sum, i) => sum + i.precoUnitario * i.quantidade, 0);
  carrinho.total = carrinho.subtotal - (carrinho.desconto || 0);
  carrinhos.set(userId, carrinho);
  res.json(carrinho);
});

app.delete('/api/carrinho', authMiddleware, (req, res) => {
  const userId = req.user.id;
  carrinhos.set(userId, { id: uuidv4(), itens: [], subtotal: 0, total: 0, desconto: 0 });
  res.json(carrinhos.get(userId));
});

app.post('/api/carrinho/checkout', authMiddleware, (req, res) => {
  const userId = req.user.id;
  const carrinho = carrinhos.get(userId);
  if (!carrinho || carrinho.itens.length === 0) return res.status(400).json({ message: 'Carrinho vazio' });
  res.json({ pedidoId: uuidv4(), status: 'CONFIRMADO', total: carrinho.total, mensagem: 'Pedido criado com sucesso' });
});

// Admin Theme API for current company
app.get('/api/v1/theme', authMiddleware, (req, res) => {
  const empresa = empresas.find((e) => e.id === req.empresaId);
  if (!empresa) return res.status(404).json({ message: 'Empresa não encontrada' });
  const settings = themesByEmpresaId.get(empresa.id) || null;
  res.json({ settings });
});

app.put('/api/v1/theme', authMiddleware, (req, res) => {
  const empresa = empresas.find((e) => e.id === req.empresaId);
  if (!empresa) return res.status(404).json({ message: 'Empresa não encontrada' });

  const body = req.body || {};
  const primaryColor = String(body.primaryColor || '').trim();
  const secondaryColor = String(body.secondaryColor || '').trim();
  const accentColor = body.accentColor ? String(body.accentColor).trim() : undefined;
  const backgroundImage = body.backgroundImage ? String(body.backgroundImage) : undefined;
  const updatedAt = Date.now();

  if (!primaryColor || !secondaryColor) {
    return res.status(400).json({ message: 'Cores primária e secundária são obrigatórias' });
  }

  const settings = { backgroundImage, primaryColor, secondaryColor, accentColor, updatedAt };
  themesByEmpresaId.set(empresa.id, settings);
  res.json({ sucesso: true, settings });
});

// Pedidos
app.get('/api/pedidos', authMiddleware, (req, res) => {
  const list = pedidosPorEmpresa[req.empresaId] || [];
  res.json({ pedidos: list, total: list.length });
});

app.get('/api/pedidos/:id', authMiddleware, (req, res) => {
  const list = pedidosPorEmpresa[req.empresaId] || [];
  const pedido = list.find((p) => p.id === req.params.id);
  if (!pedido) return res.status(404).json({ message: 'Pedido não encontrado' });
  res.json(pedido);
});

app.put('/api/pedidos/:id/status', authMiddleware, (req, res) => {
  const list = pedidosPorEmpresa[req.empresaId] || [];
  const pedido = list.find((p) => p.id === req.params.id);
  if (!pedido) return res.status(404).json({ message: 'Pedido não encontrado' });
  pedido.status = req.body.status || pedido.status;
  res.json(pedido);
});

// Cupons
app.get('/api/cupons', authMiddleware, (req, res) => {
  const list = cuponsPorEmpresa[req.empresaId] || [];
  res.json(list);
});

app.post('/api/cupons', authMiddleware, (req, res) => {
  const { codigo, tipo, valor } = req.body || {};
  const list = cuponsPorEmpresa[req.empresaId] || [];
  const id = `cupom_${Date.now()}`;
  list.push({ id, codigo, tipo, valor, dataInicio: new Date().toISOString(), dataFim: new Date(Date.now()+86400000).toISOString(), usoMaximo: 100, usoAtual: 0, ativo: true, empresaId: req.empresaId, criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString() });
  cuponsPorEmpresa[req.empresaId] = list;
  res.json(list);
});

app.patch('/api/cupons/:id', authMiddleware, (req, res) => {
  const { valor } = req.body || {};
  const list = cuponsPorEmpresa[req.empresaId] || [];
  const item = list.find((c) => c.id === req.params.id);
  if (!item) return res.status(404).json({ message: 'Cupom não encontrado' });
  item.valor = valor;
  item.atualizadoEm = new Date().toISOString();
  res.json(item);
});

app.delete('/api/cupons/:id', authMiddleware, (req, res) => {
  const list = cuponsPorEmpresa[req.empresaId] || [];
  const idx = list.findIndex((c) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Cupom não encontrado' });
  list.splice(idx, 1);
  res.json({ sucesso: true });
});

// Dashboard
app.get('/api/dashboard/estatisticas', authMiddleware, (req, res) => {
  const produtos = produtosPorEmpresa[req.empresaId] || [];
  const pedidos = pedidosPorEmpresa[req.empresaId] || [];
  res.json({
    totalVendas: pedidos.reduce((acc, p) => acc + p.total, 0),
    totalPedidos: pedidos.length,
    ticketMedio: pedidos.length ? parseFloat((pedidos.reduce((acc, p) => acc + p.total, 0) / pedidos.length).toFixed(2)) : 0,
    produtosAtivos: produtos.length,
    pedidosPorStatus: [
      { status: 'PENDENTE', quantidade: pedidos.filter((p) => p.status === 'PENDENTE').length },
      { status: 'CONFIRMADO', quantidade: pedidos.filter((p) => p.status === 'CONFIRMADO').length },
      { status: 'EM_PREPARO', quantidade: pedidos.filter((p) => p.status === 'EM_PREPARO').length },
      { status: 'SAIU_ENTREGA', quantidade: pedidos.filter((p) => p.status === 'SAIU_ENTREGA').length },
      { status: 'ENTREGUE', quantidade: pedidos.filter((p) => p.status === 'ENTREGUE').length },
      { status: 'CANCELADO', quantidade: pedidos.filter((p) => p.status === 'CANCELADO').length },
    ],
  });
});

app.get('/api/dashboard/vendas', authMiddleware, (req, res) => {
  const pedidos = pedidosPorEmpresa[req.empresaId] || [];
  const porDia = {};
  pedidos.forEach((p) => {
    const d = new Date(p.criadoEm).toISOString().slice(0, 10);
    porDia[d] = (porDia[d] || 0) + p.total;
  });
  const pontos = Object.keys(porDia).sort().map((d) => ({ data: d, vendas: porDia[d], pedidos: pedidos.filter((p) => p.criadoEm.slice(0,10) === d).length }));
  res.json(pontos);
});

app.get('/api/dashboard/produtos-populares', authMiddleware, (req, res) => {
  const pedidos = pedidosPorEmpresa[req.empresaId] || [];
  const mapa = new Map();
  pedidos.forEach((p) => {
    p.itens.forEach((i) => {
      const key = i.produtoId;
      const curr = mapa.get(key) || { quantidadeVendida: 0, receita: 0 };
      curr.quantidadeVendida += i.quantidade;
      curr.receita += i.quantidade * i.precoUnitario;
      mapa.set(key, curr);
    });
  });
  const produtos = produtosPorEmpresa[req.empresaId] || [];
  const populares = produtos.map((p) => ({
    id: p.id,
    nome: p.nome,
    quantidadeVendida: (mapa.get(p.id) || { quantidadeVendida: 0 }).quantidadeVendida,
    receita: parseFloat(((mapa.get(p.id) || { receita: 0 }).receita).toFixed(2)),
  }));
  res.json(populares);
});

// Notificações
const notificacoes = new Map(); // userId -> array
app.get('/api/notificacoes', authMiddleware, (req, res) => {
  res.json({ notificacoes: notificacoes.get(req.user.id) || [], total: (notificacoes.get(req.user.id)||[]).length });
});
app.put('/api/notificacoes/marcar-todas-lidas', authMiddleware, (req, res) => {
  const arr = (notificacoes.get(req.user.id) || []).map((n) => ({ ...n, lida: true }));
  notificacoes.set(req.user.id, arr);
  res.json({ sucesso: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Mock backend running at http://localhost:${PORT}/api`);
});