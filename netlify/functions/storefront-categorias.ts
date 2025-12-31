type Handler = (event: any) => Promise<{ statusCode: number; headers?: Record<string, string>; body: string }>;
import { createClient } from '@supabase/supabase-js';

export const handler: Handler = async (event) => {
  try {
    const slug = String(event.queryStringParameters?.slug || '').trim();
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
    const tProd = ['produtos', 'products'];
    const tCat = ['categorias', 'categories'];
    let catProd: any[] = [];
    for (const tp of tProd) {
      const r = await supabase.from(tp).select('categoria,category').eq('empresaId', empresa.id).eq('ativo', true).not('categoria', 'is', null);
      if (!r.error && Array.isArray(r.data) && r.data.length > 0) { catProd = r.data as any[]; break; }
      const r2 = await supabase.from(tp).select('categoria,category').eq('company_id', empresa.id).eq('active', true).not('category', 'is', null);
      if (!r2.error && Array.isArray(r2.data) && r2.data.length > 0) { catProd = r2.data as any[]; break; }
    }
    let catTable: any[] = [];
    for (const tc of tCat) {
      const r = await supabase.from(tc).select('nome,name').eq('empresaId', empresa.id);
      if (!r.error && Array.isArray(r.data) && r.data.length > 0) { catTable = r.data as any[]; break; }
      const r2 = await supabase.from(tc).select('nome,name').eq('empresaid', empresa.id);
      if (!r2.error && Array.isArray(r2.data) && r2.data.length > 0) { catTable = r2.data as any[]; break; }
      const r3 = await supabase.from(tc).select('nome,name').eq('company_id', empresa.id);
      if (!r3.error && Array.isArray(r3.data) && r3.data.length > 0) { catTable = r3.data as any[]; break; }
    }
    const set = new Set<string>();
    (Array.isArray(catProd) ? catProd : []).forEach((c: any) => {
      const n = c?.categoria ?? c?.category;
      if (n) set.add(String(n));
    });
    (Array.isArray(catTable) ? catTable : []).forEach((c: any) => {
      const n = c?.nome ?? c?.name;
      if (n) set.add(String(n));
    });
    const out = Array.from(set).sort((a, b) => a.localeCompare(b));
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(out),
    };
  } catch {
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal error' }) };
  }
};
