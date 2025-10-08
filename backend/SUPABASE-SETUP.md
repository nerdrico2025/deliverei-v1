
# 🚀 Configuração do Supabase para DELIVEREI

Este guia explica como configurar o Supabase como banco de dados PostgreSQL gerenciado para o projeto DELIVEREI.

## 📋 Pré-requisitos

- Conta no Supabase (gratuita): https://supabase.com
- Node.js e npm instalados
- Projeto DELIVEREI clonado

## 🎯 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse https://supabase.com e faça login
2. Clique em **"New Project"**
3. Preencha os dados:
   - **Name**: `deliverei` (ou nome de sua preferência)
   - **Database Password**: Crie uma senha forte e **GUARDE-A** (você vai precisar!)
   - **Region**: Escolha a região mais próxima (ex: South America - São Paulo)
   - **Pricing Plan**: Free (suficiente para desenvolvimento)
4. Clique em **"Create new project"**
5. Aguarde 1-2 minutos enquanto o projeto é provisionado

### 2. Obter a Connection String

1. No dashboard do seu projeto, vá em **Settings** (ícone de engrenagem no menu lateral)
2. Clique em **Database** no menu lateral
3. Role até a seção **"Connection string"**
4. Selecione a aba **"Connection pooling"** (IMPORTANTE!)
5. Copie a connection string que aparece (formato: `postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@...`)
6. **IMPORTANTE**: Substitua `[YOUR-PASSWORD]` pela senha que você criou no passo 1

**Exemplo de connection string:**
```
postgresql://postgres.abcdefghijklmnop:SuaSenhaAqui@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### 3. Configurar o Projeto

1. Na pasta `backend/`, copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```

2. Abra o arquivo `.env` e atualize a variável `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://postgres.abcdefghijklmnop:SuaSenhaAqui@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```

3. Verifique se as outras variáveis estão configuradas corretamente (JWT_SECRET, etc.)

### 4. Instalar Dependências

```bash
cd backend
npm install
```

### 5. Executar as Migrations

As migrations criarão todas as tabelas necessárias no banco de dados:

```bash
# Opção 1: Usando o script helper
npm run migrate

# Opção 2: Usando Prisma diretamente
npx prisma migrate deploy
```

**O que as migrations fazem:**
- Criam as tabelas: `Empresa`, `Usuario`, `Produto`, `RefreshToken`
- Configuram relacionamentos e constraints
- Criam índices para performance

### 6. Popular o Banco com Dados Iniciais (Seed)

```bash
# Opção 1: Usando o script helper
npm run seed

# Opção 2: Usando Prisma diretamente
npx prisma db seed
```

**O que o seed faz:**
- Cria uma empresa de exemplo
- Cria usuários de teste (admin e cliente)
- Cria produtos de exemplo

### 7. Verificar a Instalação

1. Acesse o Supabase Dashboard
2. Vá em **Table Editor** no menu lateral
3. Você deve ver as tabelas criadas: `Empresa`, `Usuario`, `Produto`, `RefreshToken`
4. Clique em cada tabela para ver os dados inseridos pelo seed

### 8. Iniciar o Servidor

```bash
# Iniciar Redis (necessário para cache)
docker-compose up -d redis

# Iniciar o servidor NestJS
npm run start:dev
```

O servidor estará rodando em `http://localhost:3000`

## 🔍 Verificação e Testes

### Testar a API

1. **Health Check:**
   ```bash
   curl http://localhost:3000
   ```

2. **Login (usuário admin):**
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@pizzaexpress.com",
       "senha": "admin123"
     }'
   ```

3. **Listar produtos públicos:**
   ```bash
   curl http://localhost:3000/public/pizza-express/produtos
   ```

### Visualizar o Banco no Supabase

1. Acesse o **Table Editor** no dashboard do Supabase
2. Explore as tabelas e dados
3. Use o **SQL Editor** para queries personalizadas

### Usar o Prisma Studio (Opcional)

```bash
npx prisma studio
```

Abre uma interface visual em `http://localhost:5555` para explorar o banco de dados.

## 🛠️ Comandos Úteis

```bash
# Ver status das migrations
npx prisma migrate status

# Criar nova migration (após alterar schema.prisma)
npx prisma migrate dev --name nome_da_migration

# Resetar banco (CUIDADO: apaga todos os dados!)
npx prisma migrate reset

# Gerar Prisma Client (após alterar schema.prisma)
npx prisma generate

# Formatar schema.prisma
npx prisma format
```

## 🔐 Segurança

### ⚠️ IMPORTANTE - Nunca commite credenciais!

- O arquivo `.env` está no `.gitignore`
- Nunca compartilhe sua `DATABASE_URL` publicamente
- Use senhas fortes para o banco de dados
- Em produção, use variáveis de ambiente do servidor

### Rotação de Senha

Se precisar trocar a senha do banco:

1. No Supabase Dashboard → Settings → Database
2. Clique em **"Reset database password"**
3. Atualize a `DATABASE_URL` no `.env` com a nova senha
4. Reinicie o servidor

## 📊 Limites do Plano Free

O plano gratuito do Supabase inclui:

- **500 MB** de espaço em banco de dados
- **1 GB** de transferência de dados por mês
- **2 GB** de armazenamento de arquivos
- **50 MB** de tamanho de arquivo
- Projetos pausam após 1 semana de inatividade (reativam automaticamente no próximo acesso)

Para desenvolvimento, isso é mais que suficiente!

## 🆘 Troubleshooting

### Erro: "Can't reach database server"

**Solução:**
- Verifique se a `DATABASE_URL` está correta
- Confirme que substituiu `[YOUR-PASSWORD]` pela senha real
- Verifique sua conexão com a internet
- Tente usar a connection string da aba "Session pooling" ao invés de "Connection pooling"

### Erro: "Authentication failed"

**Solução:**
- Senha incorreta na `DATABASE_URL`
- Resete a senha no dashboard do Supabase e atualize o `.env`

### Erro: "Migration failed"

**Solução:**
```bash
# Resetar e tentar novamente
npx prisma migrate reset
npm run migrate
npm run seed
```

### Projeto pausado no Supabase

**Solução:**
- Projetos free pausam após 1 semana sem uso
- Acesse o dashboard do Supabase
- Clique em "Restore" para reativar
- O projeto volta em alguns segundos

### Erro: "Too many connections"

**Solução:**
- Certifique-se de usar a connection string com `pgbouncer=true`
- Use a aba "Connection pooling" ao invés de "Direct connection"

## 🔄 Migração de PostgreSQL Local para Supabase

Se você já tinha um banco local e quer migrar:

1. **Exportar dados do banco local:**
   ```bash
   pg_dump -U deliverei -d deliverei > backup.sql
   ```

2. **Importar no Supabase:**
   - Use o SQL Editor no dashboard do Supabase
   - Cole o conteúdo do `backup.sql`
   - Execute

3. **Ou use Prisma:**
   ```bash
   # Com banco local rodando
   npx prisma db push
   
   # Trocar DATABASE_URL para Supabase
   # Executar migrations
   npx prisma migrate deploy
   ```

## 📚 Recursos Adicionais

- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do Prisma](https://www.prisma.io/docs)
- [Supabase + Prisma Guide](https://supabase.com/docs/guides/integrations/prisma)

## ✅ Checklist de Configuração

- [ ] Conta criada no Supabase
- [ ] Projeto criado no Supabase
- [ ] Connection string copiada (com senha)
- [ ] Arquivo `.env` configurado
- [ ] Dependências instaladas (`npm install`)
- [ ] Migrations executadas (`npm run migrate`)
- [ ] Seed executado (`npm run seed`)
- [ ] Redis iniciado (`docker-compose up -d redis`)
- [ ] Servidor rodando (`npm run start:dev`)
- [ ] API testada (login, produtos, etc.)

---

**Pronto! 🎉** Seu backend DELIVEREI está configurado com Supabase!

Se tiver dúvidas, consulte a documentação ou abra uma issue no repositório.
