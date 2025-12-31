import type { Handler } from '@netlify/functions';
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
    const a = await supabase.from('empresas').select('*').eq('subdominio', slug).limit(1).maybeSingle();
    const empresa = a.data || null;
    if (!empresa) {
      return { statusCode: 404, body: JSON.stringify([]) };
    }
    const { data: catProd } = await supabase.from('produtos').select('categoria').eq('empresaId', empresa.id).eq('ativo', true).not('categoria', 'is', null);
    const { data: catTable } = await supabase.from('categorias').select('nome').eq('empresaId', empresa.id);
    const set = new Set<string>();
    (Array.isArray(catProd) ? catProd : []).forEach((c: any) => c?.categoria && set.add(String(c.categoria)));
    (Array.isArray(catTable) ? catTable : []).forEach((c: any) => c?.nome && set.add(String(c.nome)));
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

