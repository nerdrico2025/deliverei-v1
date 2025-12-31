import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

export const handler: Handler = async (event) => {
  try {
    const slug = String(event.queryStringParameters?.slug || '').trim();
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const supabaseAnon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !supabaseAnon) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Supabase env missing' }),
      };
    }
    const supabase = createClient(supabaseUrl, supabaseAnon);
    let row: any = null;
    if (slug) {
      const a = await supabase.from('empresas').select('*').eq('subdominio', slug).limit(1).maybeSingle();
      row = a.data || null;
      if (!row) {
        const b = await supabase.from('empresas').select('*').eq('slug', slug).limit(1).maybeSingle();
        row = b.data || null;
      }
    }
    if (!row) {
      return { statusCode: 404, body: JSON.stringify({ message: 'Loja não encontrada' }) };
    }
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: row.id, nome: row.nome, slug: row.slug, subdominio: row.subdominio }),
    };
  } catch (e: any) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal error' }) };
  }
};

