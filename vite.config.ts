import { defineConfig } from 'vite';

export default defineConfig({
  server: { host: true, port: 5173 },
  plugins: [
    {
      name: 'dev-supabase-proxy',
      configureServer(server) {
        const enable = process.env.VITE_SUPABASE_DEV_PROXY === 'true';
        const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
        const supabaseAnon = process.env.VITE_SUPABASE_ANON_KEY || '';
        let supabase: any = null;
        if (enable && supabaseUrl && supabaseAnon) {
          const { createClient } = require('@supabase/supabase-js');
          supabase = createClient(supabaseUrl, supabaseAnon);
        }
        server.middlewares.use(async (req, res, next) => {
          try {
            if (!enable || !supabase) return next();
            const u = new URL(req.url || '', 'http://localhost');
            if (u.pathname === '/dev-storefront/info') {
              const slug = String(u.searchParams.get('slug') || '').trim();
              let row = null;
              if (slug) {
                const a = await supabase.from('empresas').select('*').eq('subdominio', slug).limit(1).maybeSingle();
                row = a.data || null;
                if (!row) {
                  const b = await supabase.from('empresas').select('*').eq('slug', slug).limit(1).maybeSingle();
                  row = b.data || null;
                }
              }
              if (!row) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Loja não encontrada' }));
                return;
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ id: row.id, nome: row.nome, slug: row.slug, subdominio: row.subdominio }));
              return;
            }
            if (u.pathname === '/dev-storefront/produtos') {
              const slug = String(u.searchParams.get('slug') || '').trim();
              const page = Number(u.searchParams.get('page') || '1');
              const limit = Number(u.searchParams.get('limit') || '20');
              const categoria = u.searchParams.get('categoria');
              const search = u.searchParams.get('search');
              const a = await supabase.from('empresas').select('*').eq('subdominio', slug).limit(1).maybeSingle();
              const empresa = a.data || null;
              if (!empresa) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify([]));
                return;
              }
              const from = (page - 1) * limit;
              const to = from + limit - 1;
              let q = supabase.from('produtos').select('*').eq('empresaId', empresa.id).eq('ativo', true).order('nome', { ascending: true }).range(from, to);
              const term = String(search || '').trim();
              if (categoria) q = q.eq('categoria', categoria);
              const { data } = await q;
              let base = Array.isArray(data) ? data : [];
              if (term) {
                const s = term.toLowerCase();
                base = base.filter((p: any) => {
                  const nome = String(p?.nome || '').toLowerCase();
                  const desc = String(p?.descricao || '').toLowerCase();
                  return nome.includes(s) || desc.includes(s);
                });
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(base));
              return;
            }
            if (u.pathname === '/dev-storefront/categorias') {
              const slug = String(u.searchParams.get('slug') || '').trim();
              const a = await supabase.from('empresas').select('*').eq('subdominio', slug).limit(1).maybeSingle();
              const empresa = a.data || null;
              if (!empresa) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify([]));
                return;
              }
              const { data: catProd } = await supabase.from('produtos').select('categoria').eq('empresaId', empresa.id).eq('ativo', true).not('categoria', 'is', null);
              const { data: catTable } = await supabase.from('categorias').select('nome').eq('empresaId', empresa.id);
              const set = new Set<string>();
              (Array.isArray(catProd) ? catProd : []).forEach((c: any) => c?.categoria && set.add(String(c.categoria)));
              (Array.isArray(catTable) ? catTable : []).forEach((c: any) => c?.nome && set.add(String(c.nome)));
              const out = Array.from(set).sort((a, b) => a.localeCompare(b));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(out));
              return;
            }
            if (u.pathname === '/dev-storefront/produto') {
              const slug = String(u.searchParams.get('slug') || '').trim();
              const id = String(u.searchParams.get('id') || '').trim();
              if (!slug || !id) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Parâmetros ausentes' }));
                return;
              }
              const a = await supabase.from('empresas').select('*').eq('subdominio', slug).limit(1).maybeSingle();
              const empresa = a.data || null;
              if (!empresa) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Loja não encontrada' }));
                return;
              }
              const r = await supabase.from('produtos').select('*').eq('empresaId', empresa.id).eq('id', id).eq('ativo', true).limit(1).maybeSingle();
              const prod = r.data || null;
              if (!prod) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ message: 'Produto não encontrado' }));
                return;
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(prod));
              return;
            }
            return next();
          } catch (e) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ message: 'Proxy error' }));
          }
        });
      },
    },
  ],
});
