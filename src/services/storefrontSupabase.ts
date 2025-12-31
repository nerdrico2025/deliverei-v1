import { supabase } from './supabaseClient';

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
  promo_tag?: boolean;
  bestseller_tag?: boolean;
  new_tag?: boolean;
}

type ThemeSettings = { backgroundImage?: string; primaryColor: string; secondaryColor: string; accentColor?: string; updatedAt: number };

const FALLBACK_COMPANIES: Record<string, { id: string; nome: string; slug: string; subdominio?: string | null; ativo?: boolean }> = {
  'pizza-express': { id: '8b9919ea-c45b-4e4a-924d-ac4485b58706', nome: 'Pizza Express', slug: 'pizza-express', subdominio: 'pizza-express', ativo: true },
  'pizzaria-dumont': { id: 'b004cdd4-60bc-402b-9297-ab46255253fa', nome: 'Pizzaria Dumont', slug: 'pizzaria-dumont', subdominio: 'pizzaria-dumont', ativo: true },
  'burger-king': { id: 'b3c97e12-1f45-419e-b450-ed8dd9809b07', nome: 'Burger King', slug: 'burger-king', subdominio: 'burger-king', ativo: true },
};
function normalizeSlug(value: string): string {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function getEmpresaBySlug(slug: string): Promise<{ id: string; nome: string; slug: string; subdominio?: string | null; ativo?: boolean } | null> {
  const s = normalizeSlug(slug);
  // Tenta na tabela correta 'empresas' com campos conhecidos
  const tryCols = ['subdominio', 'slug'];
  for (const col of tryCols) {
    const { data, error } = await supabase.from('empresas').select('*').eq(col, s).limit(1).maybeSingle();
    if (!error && data) {
      const nome = (data as any).nome ?? s;
      const subdominio = (data as any).subdominio ?? null;
      const ativo = (data as any).ativo ?? true;
      const theSlug = (data as any).slug ?? s;
      return { id: data.id, nome, slug: theSlug, subdominio, ativo };
    }
  }
  // Fallback por nome semelhante
  const likeA = `%${s}%`;
  const likeB = `%${s.replace(/-/g, ' ')}%`;
  const a = await supabase.from('empresas').select('*').ilike('nome', likeA).limit(1).maybeSingle();
  if (!a.error && a.data) {
    const nome = (a.data as any).nome ?? s;
    const subdominio = (a.data as any).subdominio ?? null;
    const ativo = (a.data as any).ativo ?? true;
    const theSlug = (a.data as any).slug ?? s;
    return { id: a.data.id, nome, slug: theSlug, subdominio, ativo };
  }
  const b = await supabase.from('empresas').select('*').ilike('nome', likeB).limit(1).maybeSingle();
  if (!b.error && b.data) {
    const nome = (b.data as any).nome ?? s;
    const subdominio = (b.data as any).subdominio ?? null;
    const ativo = (b.data as any).ativo ?? true;
    const theSlug = (b.data as any).slug ?? s;
    return { id: b.data.id, nome, slug: theSlug, subdominio, ativo };
  }
  // Fallback baseado nos dados fornecidos (CSV)
  const fb = FALLBACK_COMPANIES[s];
  if (fb) return fb;
  return null;
}

function useDevProxy(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const host = window.location.origin || '';
    return host.includes('localhost');
  } catch {
    return false;
  }
}

export const storefrontSupabase = {
  async getLojaInfo(slug: string): Promise<{ id: string; nome: string; slug: string; subdominio?: string | null }> {
    if (useDevProxy()) {
      const res = await fetch(`/dev-storefront/info?slug=${encodeURIComponent(slug)}`);
      if (res.ok) {
        const empresa = await res.json();
        return empresa;
      }
      const fb = FALLBACK_COMPANIES[normalizeSlug(slug)];
      if (fb) return fb;
      throw new Error('Loja não encontrada');
    }
    // Netlify Functions fallback in non-local environments
    if ((import.meta as any)?.env?.VITE_USE_NETLIFY_FUNCTIONS === 'true') {
      const res = await fetch(`/.netlify/functions/storefront-info?slug=${encodeURIComponent(slug)}`);
      if (!res.ok) throw new Error('Loja não encontrada');
      return await res.json();
    }
    try {
      const empresa = (await getEmpresaBySlug(slug)) ?? FALLBACK_COMPANIES[normalizeSlug(slug)];
      if (!empresa) throw new Error('Loja não encontrada');
      return empresa;
    } catch (e) {
      try {
        const res = await fetch(`/.netlify/functions/storefront-info?slug=${encodeURIComponent(slug)}`);
        if (!res.ok) throw new Error('Loja não encontrada');
        return await res.json();
      } catch {
        throw e;
      }
    }
  },
  async getTheme(slug: string): Promise<{ settings: ThemeSettings | null }> {
    if (useDevProxy()) return { settings: null };
    if ((import.meta as any)?.env?.VITE_USE_NETLIFY_FUNCTIONS === 'true') {
      return { settings: null };
    }
    const empresa = (await getEmpresaBySlug(slug)) ?? FALLBACK_COMPANIES[normalizeSlug(slug)];
    if (!empresa) return { settings: null };
    const { data, error } = await supabase.from('empresas').select('vitrine_theme').eq('id', empresa.id).limit(1).maybeSingle();
    const settings = !error ? ((data as any)?.vitrine_theme || null) : null;
    return { settings };
  },
  async getProdutos(
    slug: string,
    params?: { page?: number; limit?: number; categoria?: string; search?: string }
  ): Promise<Produto[]> {
    if (useDevProxy()) {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.categoria) qs.set('categoria', String(params.categoria));
      if (params?.search) qs.set('search', String(params.search));
      qs.set('slug', slug);
      const res = await fetch(`/dev-storefront/produtos?${qs.toString()}`);
      if (!res.ok) return [];
      const list = await res.json();
      return (list || []).map((p: any) => ({
        id: p.id,
        nome: p.nome,
        descricao: p.descricao,
        preco: Number(p.preco ?? 0),
        imagemUrl: p.imagem ?? p.imagemUrl ?? undefined,
        categoria: p.categoria ?? undefined,
        disponivel: !!p.ativo,
        estoque: typeof p.estoque === 'number' ? p.estoque : undefined,
        empresaId: p.empresaId,
        promo_tag: !!p.promo_tag,
        bestseller_tag: !!p.bestseller_tag,
        new_tag: !!p.new_tag,
      }));
    }
    if ((import.meta as any)?.env?.VITE_USE_NETLIFY_FUNCTIONS === 'true') {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.categoria) qs.set('categoria', String(params.categoria));
      if (params?.search) qs.set('search', String(params.search));
      qs.set('slug', slug);
      const res = await fetch(`/.netlify/functions/storefront-produtos?${qs.toString()}`);
      if (!res.ok) return [];
      const list = await res.json();
      return (list || []);
    }
    try {
      const empresa = (await getEmpresaBySlug(slug)) ?? FALLBACK_COMPANIES[normalizeSlug(slug)];
      if (!empresa) throw new Error('Loja não encontrada');
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      // Tentativas robustas com variações de coluna e status
      const attempts = [
        () => supabase.from('produtos').select('*').eq('empresaId', empresa.id).eq('ativo', true).order('nome', { ascending: true }).range(from, to),
        () => supabase.from('produtos').select('*').eq('empresaId', empresa.id).order('nome', { ascending: true }).range(from, to),
        () => supabase.from('produtos').select('*').eq('empresa_id', empresa.id).eq('ativo', true).order('nome', { ascending: true }).range(from, to),
        () => supabase.from('produtos').select('*').eq('empresaid', empresa.id).eq('ativo', true).order('nome', { ascending: true }).range(from, to),
      ];
      let base: any[] = [];
      for (const fn of attempts) {
        const { data, error } = await fn();
        if (!error && Array.isArray(data) && data.length > 0) {
          base = data;
          break;
        }
      }
      if (base.length === 0) {
        const { data, error } = await supabase.from('produtos').select('*').eq('ativo', true).order('nome', { ascending: true }).limit(1000);
        if (!error && Array.isArray(data)) {
          base = data.filter((p: any) => {
            const eid = p?.empresaId ?? p?.empresa_id ?? p?.company_id;
            return String(eid || '') === String(empresa.id);
          });
        }
      }
      const filtered = base.filter((p: any) => {
        const cat = (p.categoria ?? p.category ?? '').toString();
        if (params?.categoria && cat !== params.categoria) return false;
        if (params?.search && params.search.trim().length > 0) {
          const s = params.search.trim().toLowerCase();
          const nome = (p.nome ?? p.name ?? '').toString().toLowerCase();
          const desc = (p.descricao ?? p.description ?? '').toString().toLowerCase();
          return nome.includes(s) || desc.includes(s);
        }
        return true;
      });
      return (filtered || []).map((p: any) => ({
        id: p.id,
        nome: p.nome ?? p.name,
        descricao: p.descricao ?? p.description,
        preco: Number((p.preco ?? p.price) ?? 0),
        imagemUrl: p.imagemUrl ?? p.imagem ?? p.image_url ?? p.image ?? undefined,
        categoria: p.categoria ?? p.category ?? undefined,
        disponivel: (p.ativo ?? p.active ?? true) ? true : false,
        estoque: typeof (p.estoque ?? p.stock) === 'number' ? (p.estoque ?? p.stock) : undefined,
        empresaId: p.empresaId ?? p.company_id ?? p.empresa_id,
        promo_tag: !!p.promo_tag,
        bestseller_tag: !!p.bestseller_tag,
        new_tag: !!p.new_tag,
      }));
    } catch (e) {
      try {
        const qs = new URLSearchParams();
        if (params?.page) qs.set('page', String(params.page));
        if (params?.limit) qs.set('limit', String(params.limit));
        if (params?.categoria) qs.set('categoria', String(params.categoria));
        if (params?.search) qs.set('search', String(params.search));
        qs.set('slug', slug);
        const res = await fetch(`/.netlify/functions/storefront-produtos?${qs.toString()}`);
        if (!res.ok) return [];
        const list = await res.json();
        return (list || []);
      } catch {
        throw e;
      }
    }
  },
  async getProduto(slug: string, id: string): Promise<Produto> {
    if (useDevProxy()) {
      const qs = new URLSearchParams();
      qs.set('slug', slug);
      qs.set('id', id);
      const res = await fetch(`/dev-storefront/produto?${qs.toString()}`);
      if (!res.ok) throw new Error('Produto não encontrado');
      const data = await res.json();
      return {
        id: data.id,
        nome: data.nome,
        descricao: data.descricao,
        preco: Number(data.preco ?? 0),
        imagemUrl: data.imagem ?? data.imagemUrl ?? undefined,
        categoria: data.categoria ?? undefined,
        disponivel: !!data.ativo,
        estoque: typeof data.estoque === 'number' ? data.estoque : undefined,
        empresaId: data.empresaId,
        promo_tag: !!data.promo_tag,
        bestseller_tag: !!data.bestseller_tag,
        new_tag: !!data.new_tag,
      };
    }
    const empresa = (await getEmpresaBySlug(slug)) ?? FALLBACK_COMPANIES[normalizeSlug(slug)];
    if (!empresa) throw new Error('Loja não encontrada');
    const tryOne = [
      () => supabase.from('produtos').select('*').eq('empresaId', empresa.id).eq('id', id).eq('ativo', true).limit(1).maybeSingle(),
      () => supabase.from('produtos').select('*').eq('empresaId', empresa.id).eq('id', id).limit(1).maybeSingle(),
      () => supabase.from('produtos').select('*').eq('empresa_id', empresa.id).eq('id', id).eq('ativo', true).limit(1).maybeSingle(),
    ];
    let data: any = null;
    for (const fn of tryOne) {
      const r = await fn();
      if (!r.error && r.data) { data = r.data; break; }
    }
    if (!data) throw new Error('Produto não encontrado');
    return {
      id: data.id,
      nome: data.nome ?? data.name,
      descricao: data.descricao ?? data.description,
      preco: Number((data.preco ?? data.price) ?? 0),
      imagemUrl: data.imagemUrl ?? data.imagem ?? data.image_url ?? data.image ?? undefined,
      categoria: data.categoria ?? data.category ?? undefined,
      disponivel: (data.ativo ?? data.active ?? true) ? true : false,
      estoque: typeof (data.estoque ?? data.stock) === 'number' ? (data.estoque ?? data.stock) : undefined,
      empresaId: data.empresaId ?? data.company_id ?? data.empresa_id,
      promo_tag: !!data.promo_tag,
      bestseller_tag: !!data.bestseller_tag,
      new_tag: !!data.new_tag,
    };
  },
  async getCategorias(slug: string): Promise<string[]> {
    if (useDevProxy()) {
      const res = await fetch(`/dev-storefront/categorias?slug=${encodeURIComponent(slug)}`);
      if (!res.ok) return [];
      const cats = await res.json();
      return Array.isArray(cats) ? cats : [];
    }
    if ((import.meta as any)?.env?.VITE_USE_NETLIFY_FUNCTIONS === 'true') {
      const res = await fetch(`/.netlify/functions/storefront-categorias?slug=${encodeURIComponent(slug)}`);
      if (!res.ok) return [];
      const cats = await res.json();
      return Array.isArray(cats) ? cats : [];
    }
    try {
      const empresa = (await getEmpresaBySlug(slug)) ?? FALLBACK_COMPANIES[normalizeSlug(slug)];
      if (!empresa) throw new Error('Loja não encontrada');
      const productsTable = 'produtos';
      const categoriesTable = 'categorias';
      let categoriasProdutos: any[] = [];
      {
        const attempts = [
          () => supabase.from(productsTable).select('categoria').eq('empresaId', empresa.id).eq('ativo', true).not('categoria', 'is', null),
          () => supabase.from(productsTable).select('categoria').eq('empresaId', empresa.id).not('categoria', 'is', null),
          () => supabase.from(productsTable).select('categoria').eq('empresa_id', empresa.id).eq('ativo', true).not('categoria', 'is', null),
        ];
        for (const fn of attempts) {
          const { data, error } = await fn();
          if (!error && Array.isArray(data) && data.length > 0) { categoriasProdutos = data; break; }
        }
      }
      let categoriasSalvas: any[] = [];
      {
        const attempts = [
          () => supabase.from(categoriesTable).select('nome').eq('empresaId', empresa.id),
          () => supabase.from(categoriesTable).select('nome').eq('empresa_id', empresa.id),
        ];
        for (const fn of attempts) {
          const { data, error } = await fn();
          if (!error && Array.isArray(data) && data.length > 0) { categoriasSalvas = data; break; }
        }
      }
      const set = new Set<string>();
      (categoriasProdutos || []).forEach((c: any) => {
        const n = c?.categoria ?? c?.category;
        if (n) set.add(String(n));
      });
      (categoriasSalvas || []).forEach((c: any) => {
        const n = c?.nome ?? c?.name;
        if (n) set.add(String(n));
      });
      return Array.from(set).sort((a, b) => a.localeCompare(b));
    } catch (e) {
      try {
        const res = await fetch(`/.netlify/functions/storefront-categorias?slug=${encodeURIComponent(slug)}`);
        if (!res.ok) return [];
        const cats = await res.json();
        return Array.isArray(cats) ? cats : [];
      } catch {
        throw e;
      }
    }
  },
};
