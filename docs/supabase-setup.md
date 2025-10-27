# Integração Supabase (DB + Edge Functions)

Este guia descreve como configurar Supabase para substituir/operar em paralelo ao backend atual no fluxo de cadastro de empresa.

## Visão geral
- Edge Function `cadastro-empresa` cria a empresa e o usuário admin via Admin API.
- Migração SQL cria as tabelas `empresas` e `usuarios` com RLS.
- Frontend alterna entre API atual (`/auth/cadastro-empresa`) e Edge Function via `VITE_USE_SUPABASE`.

## Pré-requisitos
- Conta no Supabase e projeto criado.
- Supabase CLI instalado (opcional para deploy local): https://supabase.com/docs/guides/cli

## Variáveis de ambiente
- No Supabase (projeto > Settings > Functions):
  - `SUPABASE_URL`: URL do projeto.
  - `SUPABASE_SERVICE_ROLE_KEY`: chave de serviço (mantida apenas no servidor; não exponha no frontend).
- No Frontend (`.env`):
  - `VITE_USE_SUPABASE=true`
  - `VITE_SUPABASE_URL=<https://YOUR_PROJECT_REF.supabase.co>`
  - `VITE_SUPABASE_ANON_KEY=<anon key>`
  - Mantenha `VITE_API_URL=http://localhost:3002/api` como fallback se desejar usar o backend atual.

## Migrações SQL
Arquivo: `supabase/migrations/0001_empresas_usuarios.sql`

Aplique via:
- Supabase Studio > SQL Editor > cole o conteúdo e execute.
- Ou via CLI (se estiver usando local dev env):
  - `supabase db push` (requer estrutura padrão do Supabase local).

## Deploy da Edge Function
Arquivo: `supabase/functions/cadastro-empresa/index.ts`

Estratégias de deploy:
- Supabase Studio > Functions > New Function > crie `cadastro-empresa` e cole o código.
- Ou via CLI:
  - `supabase functions deploy cadastro-empresa`
  - Garanta as env vars (`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`) configuradas no projeto.

## Teste da Função
- Endpoint público (via Supabase Functions): `https://<PROJECT_REF>.functions.supabase.co/cadastro-empresa`
- Envie POST com JSON:
```
{
  "nomeEmpresa": "Pizzaria do João",
  "slug": "pizzaria-do-joao",
  "endereco": "Rua X, 123",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "00000-000",
  "telefoneEmpresa": "(11) 99999-9999",
  "nomeAdmin": "João Silva",
  "emailAdmin": "joao@pizzaria.com",
  "senhaAdmin": "minhasenha",
  "telefoneAdmin": "(11) 88888-8888"
}
```
- Cabeçalhos: `Content-Type: application/json` e `Authorization: Bearer <ANON_KEY>` (se usar `supabase.functions.invoke`, já é incluído automaticamente).

## Frontend: alternância entre API e função
- Arquivo atualizado: `src/pages/public/CadastroEmpresa.tsx`
- Se `VITE_USE_SUPABASE=true`:
  - Invoca `supabase.functions.invoke('cadastro-empresa', { body: cadastroData })`.
- Caso contrário:
  - Usa `apiClient.post('/auth/cadastro-empresa', ...)` do backend existente.
- Em ambos os casos, o fluxo segue para a tela de login após sucesso.

## Políticas e segurança
- RLS habilitado em `empresas` e `usuarios`.
- Inserções de empresa/usuário são realizadas pela função com `SERVICE_ROLE_KEY` (bypassa RLS).
- O frontend usa apenas `ANON_KEY` e nunca acessa `SERVICE_ROLE_KEY`.

## Próximos passos
- Migrar demais endpoints críticos para Functions (ex.: login, recuperação de senha, etc.).
- Criar policies adicionais conforme necessidade de leitura/atualização.
- Implementar testes e2e para função de cadastro.