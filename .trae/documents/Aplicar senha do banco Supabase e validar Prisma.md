## Senha necessária
- A "Database password" do projeto no Supabase para o usuário `postgres`.
- Não é a anon key nem a service role key; é a senha do banco usada nas connection strings.
- Se contiver caracteres especiais (`@`, `#`, `:`, `/`, `%`, `?`, `&`), eu aplico URL-encoding corretamente na connection string.

## Como fornecer
- Envie apenas a senha em texto puro (sem a URL inteira). Eu monto as duas URLs:
  - Pooler: `postgresql://postgres:<SENHA>@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require&schema=public`
  - Direta: `postgresql://postgres:<SENHA>@db.wfdrirodxfcjlfopwggb.supabase.co:5432/postgres?sslmode=require&schema=public`

## Passos após receber a senha
1) Atualizar `backend/.env` nos campos `DATABASE_URL` e `DIRECT_URL` com a senha (codificada se necessário).
2) Confirmar `prisma/schema.prisma` já usa `directUrl`.
3) Reiniciar o backend e validar no log: conexão Prisma bem-sucedida.
4) Testes de verificação:
- `GET /api/health` deve retornar 200.
- Login em `/login` com conta de empresa deve emitir tokens reais.
- `GET /api/produtos` e página `/admin/store/products` devem listar produtos reais.

## Segurança
- A senha será mantida apenas em `.env` local. Não será commitada nem exibida em logs.