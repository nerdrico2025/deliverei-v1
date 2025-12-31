## Visão Geral
- Backend usa NestJS + Prisma com PostgreSQL hospedado no Supabase.
- Inicialização e CORS estão configurados em `backend/src/main.ts` (startup, prefixo `/api`, filtros globais, CORS) — backend/src/main.ts:8-121.
- Conexão com banco é gerida por `PrismaService` e marcada via `connected` — backend/src/database/prisma.service.ts:8-13,44-51.

## Constatações
- Rotas públicas e health estão OK (há evidência em `test-results`) — backend/test-results/test_health.json:1.
- Autenticação retorna 401 em `login` e `signup` (capturado nos testes) — backend/test-results/test_login_super.json:1, backend/test-results/test_signup.json:1.
- Endpoints de auth são públicos (`@Public`) e não usam guard explícito — backend/src/modules/auth/auth.controller.ts:10-22.
- Validação de credenciais (e retorno de 401) acontece em `AuthService.validateUser` — backend/src/modules/auth/auth.service.ts:32-78.
- Hash da senha no seed usa `bcrypt` e a verificação usa `bcryptjs`; em geral compatíveis, mas é um ponto de atenção — backend/prisma/seed.ts:44-55 e backend/src/modules/auth/auth.service.ts:70-74.
- `PrismaService` faz sanity-check do `DATABASE_URL` e pode logar warning se não bater com o projeto do Supabase — backend/src/database/prisma.service.ts:26-43.

## Hipóteses de Falha
- Credenciais não conferem (usuário não encontrado ou hash não bate) apesar de seed informar `admin@deliverei.com.br / admin123`.
- `JWT_SECRET` ausente gera erro no `JwtService.sign`; tipicamente 500, mas vamos validar a presença — backend/src/modules/auth/auth.module.ts:15-21.
- Banco conectado a instância sem seed (ou seed não aplicado no Supabase usado pelo servidor).
- Divergência de libs de bcrypt entre criação e verificação.

## Plano de Diagnóstico
1. Verificar variáveis `.env` do backend:
   - `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN` — backend/.env.example:7-14,33-35.
2. Checar conexão ativa do Prisma no boot pelos logs: “Prisma conectado” — backend/src/database/prisma.service.ts:45-51 e “🚀 Backend iniciado …” — backend/src/main.ts:119-121.
3. Confirmar presença dos usuários do seed na base atual (mesma `DATABASE_URL` do servidor):
   - Usar scripts `scripts/check_users.js` e `check_tables.js` para listar usuários/tabelas.
4. Testar `POST /api/auth/login` e `POST /api/auth/signup` com bodies válidos:
   - Incluir `Content-Type: application/json` e payloads dos DTOs — backend/src/modules/auth/dto/login.dto.ts:3-11, backend/src/modules/auth/dto/signup.dto.ts:3-25.
5. Validar `JWT_SECRET` lendo configuração do módulo JWT — backend/src/modules/auth/auth.module.ts:13-21.

## Plano de Correções
1. Unificar biblioteca de hash:
   - Alinhar criação de senha e verificação na mesma lib (migrar para `bcryptjs` ou manter `bcrypt` em ambos) para eliminar qualquer incompatibilidade.
2. Melhorar mensagens de erro no auth:
   - Diferenciar “usuário não encontrado” vs “senha inválida” para acelerar diagnóstico.
3. Garantir `.env` consistente:
   - Preencher `DATABASE_URL` com string de pooling do Supabase (pgbouncer) e `JWT_SECRET` no backend.
4. Adicionar endpoint/health do banco (opcional):
   - Rota pública simples retornando `PrismaService.connected` e host de `DATABASE_URL` para inspeção rápida.

## Validação
- Reexecutar login/signup com credenciais do seed e confirmar 200/201.
- Conferir criação de `refresh_tokens` ao logar — tabela no schema — backend/prisma/schema.prisma:142-152.
- Rodar scripts de verificação pós-correção e revisar logs de inicialização.

Confirma este plano? Após confirmar, executo o diagnóstico, aplico as correções e valido end-to-end.