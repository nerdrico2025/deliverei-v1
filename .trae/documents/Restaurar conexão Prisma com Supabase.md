## Motivo
- O backend registra: "PrismaClientInitializationError: Authentication failed ... provided database credentials for `postgres` are not valid".
- Em `backend/.env`, o `DATABASE_URL` usa usuário `postgres.<project-ref>` no host pooler (`aws-1-us-east-1.pooler.supabase.com:6543`). No Supabase, o usuário é apenas `postgres`. Com usuário incorreto (e/ou senha desatualizada), a autenticação falha.

## Confirmações (read-only)
- `backend/.env` contém:
  - `DATABASE_URL=postgresql://postgres.wfdrirodxfcjlfopwggb:...@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&schema=public`
  - `DIRECT_URL=postgresql://postgres:...@db.wfdrirodxfcjlfopwggb.supabase.co:5432/postgres?schema=public`
- `prisma/schema.prisma` usa `env("DATABASE_URL")` e não define `directUrl`.
- `PrismaService` carrega `backend/.env` e usa `DATABASE_URL` no runtime.

## Correções
1) Ajustar `DATABASE_URL` (pooler) para o formato oficial:
- `postgresql://postgres:<DB_PASSWORD>@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require&schema=public`
- Substituir `<DB_PASSWORD>` pela "Database password" do projeto no Supabase (Settings → Database → Connection string). Se a senha tiver caracteres especiais (ex.: `@`, `#`, `:`), aplicar URL-encoding.

2) Confirmar/atualizar `DIRECT_URL` (conexão direta):
- `postgresql://postgres:<DB_PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres?sslmode=require&schema=public`

3) Atualizar `prisma/schema.prisma` para usar `directUrl`:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

4) Verificar `SUPABASE_PROJECT_REF` em `backend/.env` (deve ser `wfdrirodxfcjlfopwggb`) — já está correto.

## Validação
- Reiniciar o backend e observar no log: "Prisma conectado".
- Acessar `GET http://localhost:3002/api/health`.
- Listar produtos em `GET http://localhost:3002/api/produtos` e via frontend em `/admin/store/products`.
- Opcional: executar `prisma db pull` e/ou `prisma migrate status` para confirmar acesso ao schema (quando apropriado no ambiente).

## Considerações de Segurança
- Não commitar senhas de banco em repositório público; manter em `.env` local e sistemas de secrets.
- Forçar `sslmode=require` nas URLs.

## Entregáveis
- `.env` atualizado com URLs corretas.
- `schema.prisma` com `directUrl`.
- Backend reiniciado e conectado; páginas do app utilizando dados reais.

## Observação
- Caso sua senha atual (`T39PcxxRThL3BdOv`) esteja desatualizada, gere uma nova no Supabase (Settings → Database → Reset password) e aplique nas duas URLs acima antes do restart.