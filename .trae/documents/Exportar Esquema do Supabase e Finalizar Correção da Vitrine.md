## Como Exportar o Esquema
- Via CLI (recomendado):
  - Instalar: `brew install supabase/tap/supabase` (macOS) ou `npx supabase@latest`.
  - Login: `supabase login` (abre o navegador para autenticar).
  - Linkar projeto: `supabase link --project-ref <REF_DO_PROJETO>`.
    - O `REF_DO_PROJETO` está em Settings → General (ex.: `wfdrirodxfcjlfopwggb`).
    - Quando pedir a senha do DB, pegue em Settings → Database → Connection string.
  - Exportar esquema:
    - Só esquema: `supabase db pull` (gera `supabase/schema.sql` com tabelas, índices, constraints).
    - Dump completo (schema + RLS + funções): `supabase db dump -f supabase/dump.sql`.
  - Exportar dados (CSV) que precisamos validar:
    - `empresas`: Studio → Table Editor → empresas → Export → CSV
    - `produtos`: Studio → Table Editor → produtos → Export → CSV

- Alternativa com `pg_dump`:
  - Connection string: Settings → Database → “URI” (porta padrão 6543).
  - Esquema somente: `pg_dump --no-owner --no-privileges --schema-only -f schema.sql <CONNSTR>`
  - Dados de tabelas-chave: `pg_dump --data-only --table=public.empresas --table=public.produtos -f data.sql <CONNSTR>`

- Verificação rápida sem exportar tudo:
  - Listar colunas: `psql <CONNSTR> -c "\d+ public.empresas"` e `psql <CONNSTR> -c "\d+ public.produtos"`.
  - Conferir RLS: Settings → Database → Policies (se tiver, exportar também).

## O Que Enviar
- `supabase/schema.sql` (ou `dump.sql`) para estrutura completa.
- CSV das tabelas:
  - `empresas` com campos: `id, nome, ativo, slug, subdominio, vitrine_theme/vitrineTheme`.
  - `produtos` com campos: `id, nome, descricao, preco, imagem|imagemUrl, ativo, empresaId, estoque, categoria, promo_tag, bestseller_tag, new_tag, createdAt, updatedAt, preco_riscado`.
- Se existir `categorias`: CSV com `nome, empresaId`.

## Após receber o esquema (Plano de Correção)
- Fixar mapeamento exato das tabelas/colunas (remover fallbacks dinâmicos):
  - `empresas`: usar `slug`/`subdominio` definitivos.
  - `produtos`: usar `empresaId` e `ativo` exatos.
  - `imagem` vs `imagemUrl`: padronizar.
- Implementar um repositório Supabase tipado (`supabaseStoreRepo.ts`) com queries consistentes e testes simples.
- Ajustar `storefrontSupabase` para usar somente nomes finais e paginação correta.
- Adicionar logs de diagnóstico quando o resultado vier 0 (para futuras análises).
- Validar local: vitrine mostra produtos e categorias; busca/categoria funcionam.
- Publicar o frontend com as envs `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` e revalidar em produção.

Confirma que devo avançar com este plano assim que você me enviar o `schema.sql`/`dump.sql` e os CSVs?