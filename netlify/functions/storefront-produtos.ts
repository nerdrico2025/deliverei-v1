type Handler = (event: any) => Promise<{ statusCode: number; headers?: Record<string, string>; body: string }>;
import { createClient } from '@supabase/supabase-js';

export const handler: Handler = async (event) => {
  try {
    const qs = event.queryStringParameters || {};
    const slug = String(qs.slug || '').trim();
    const page = Number(qs.page || '1');
    const limit = Number(qs.limit || '20');
    const categoria = qs.categoria ? String(qs.categoria) : undefined;
    const search = qs.search ? String(qs.search) : undefined;
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const supabaseAnon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !supabaseAnon) {
      return { statusCode: 500, body: JSON.stringify({ message: 'Supabase env missing' }) };
    }
    const supabase = createClient(supabaseUrl, supabaseAnon);
    const norm = slug
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const tEmp = ['empresas', 'companies'];
    let empresa: any = null;
    for (const t of tEmp) {
      const r1 = await supabase.from(t).select('*').eq('subdominio', norm).limit(1).maybeSingle();
      if (!r1.error && r1.data) { empresa = r1.data; break; }
      const r2 = await supabase.from(t).select('*').eq('slug', norm).limit(1).maybeSingle();
      if (!r2.error && r2.data) { empresa = r2.data; break; }
    }
    if (!empresa) {
      const FALLBACK: Record<string, { id: string }> = {
        'pizza-express': { id: '8b9919ea-c45b-4e4a-924d-ac4485b58706' },
        'pizzaria-dumont': { id: 'b004cdd4-60bc-402b-9297-ab46255253fa' },
        'burger-king': { id: 'b3c97e12-1f45-419e-b450-ed8dd9809b07' },
      };
      const fb = FALLBACK[norm];
      if (!fb) return { statusCode: 404, body: JSON.stringify([]) };
      empresa = { id: fb.id };
    }
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const tProd = ['produtos', 'products'];
    let base: any[] = [];
    for (const tp of tProd) {
      const attempts = [
        supabase.from(tp).select('*').eq('empresaId', empresa.id).eq('ativo', true).order('nome', { ascending: true }).range(from, to),
        supabase.from(tp).select('*').eq('empresa_id', empresa.id).eq('ativo', true).order('nome', { ascending: true }).range(from, to),
        supabase.from(tp).select('*').eq('empresaid', empresa.id).eq('ativo', true).order('nome', { ascending: true }).range(from, to),
        supabase.from(tp).select('*').eq('company_id', empresa.id).eq('active', true).order('name', { ascending: true }).range(from, to),
      ];
      if (categoria) {
        attempts.unshift(
          supabase.from(tp).select('*').eq('empresaId', empresa.id).eq('ativo', true).eq('categoria', categoria).order('nome', { ascending: true }).range(from, to)
        );
      }
      for (const q of attempts) {
        const { data, error } = await q;
        if (!error && Array.isArray(data) && data.length > 0) { base = data; break; }
      }
      if (base.length > 0) break;
    }
    if (search) {
      const s = search.trim().toLowerCase();
      base = base.filter((p: any) => {
        const nome = String(p?.nome || p?.name || '').toLowerCase();
        const desc = String(p?.descricao || p?.description || '').toLowerCase();
        return nome.includes(s) || desc.includes(s);
      });
    }
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(base),
    };
  } catch {
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal error' }) };
  }
};
