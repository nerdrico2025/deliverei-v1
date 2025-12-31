import type { Handler } from '@netlify/functions';
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
    const a = await supabase.from('empresas').select('*').eq('subdominio', slug).limit(1).maybeSingle();
    const empresa = a.data || null;
    if (!empresa) {
      return { statusCode: 404, body: JSON.stringify([]) };
    }
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    let q = supabase.from('produtos').select('*').eq('empresaId', empresa.id).eq('ativo', true).order('nome', { ascending: true }).range(from, to);
    if (categoria) q = q.eq('categoria', categoria);
    const { data } = await q;
    let base = Array.isArray(data) ? data : [];
    if (search) {
      const s = search.trim().toLowerCase();
      base = base.filter((p: any) => {
        const nome = String(p?.nome || '').toLowerCase();
        const desc = String(p?.descricao || '').toLowerCase();
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

