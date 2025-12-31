type Handler = (event: any) => Promise<{ statusCode: number; headers?: Record<string, string>; body: string }>;
import { createClient } from '@supabase/supabase-js';

export const handler: Handler = async (event) => {
  try {
    const slugRaw = String(event.queryStringParameters?.slug || '').trim();
    const slug = slugRaw
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const supabaseAnon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    if (!supabaseUrl || !supabaseAnon) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Supabase env missing' }),
      };
    }
    const supabase = createClient(supabaseUrl, supabaseAnon);
    const tables = ['empresas', 'companies'];
    const columns = ['subdominio', 'subdomain', 'slug'];
    let row: any = null;
    for (const t of tables) {
      for (const c of columns) {
        const r = await supabase.from(t).select('*').eq(c, slug).limit(1).maybeSingle();
        if (!r.error && r.data) {
          row = r.data;
          break;
        }
      }
      if (row) break;
      const likeA = `%${slug}%`;
      const likeB = `%${slug.replace(/-/g, ' ')}%`;
      const rA = await supabase.from(t).select('*').ilike('nome', likeA).limit(1).maybeSingle();
      if (!rA.error && rA.data) {
        row = rA.data;
        break;
      }
      const rB = await supabase.from(t).select('*').ilike('name', likeB).limit(1).maybeSingle();
      if (!rB.error && rB.data) {
        row = rB.data;
        break;
      }
    }
    if (!row) {
      return { statusCode: 404, body: JSON.stringify({ message: 'Loja não encontrada' }) };
    }
    const nome = row.nome ?? row.name ?? slugRaw;
    const subdominio = row.subdominio ?? row.subdomain ?? slug;
    const theSlug = row.slug ?? slug;
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: row.id, nome, slug: theSlug, subdominio }),
    };
  } catch (e: any) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal error' }) };
  }
};
