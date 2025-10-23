# 🍕 DELIVEREI - Backend API

Backend multi-tenant para sistema de delivery desenvolvido com NestJS, Prisma e Supabase.

## 📋 Índice

- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação Rápida](#-instalação-rápida)
- [Configuração do Banco de Dados](#-configuração-do-banco-de-dados)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [API Endpoints](#-api-endpoints)
- [Autenticação](#-autenticação)
- [Multi-tenancy](#-multi-tenancy)
- [Desenvolvimento](#-desenvolvimento)

## 🚀 Tecnologias

- **NestJS** - Framework Node.js progressivo
- **Prisma** - ORM moderno para TypeScript
- **Supabase** - PostgreSQL gerenciado (banco de dados)
- **Redis** - Cache e sessões
- **JWT** - Autenticação stateless
- **Passport** - Estratégias de autenticação
- **TypeScript** - Tipagem estática

## 📦 Pré-requisitos

- Node.js 18+ e npm
- Conta no Supabase (gratuita)
- Docker e Docker Compose (para Redis)

## ⚡ Instalação Rápida

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env e configure sua DATABASE_URL do Supabase

# 3. Executar migrations
npm run migrate

# 4. Popular banco com dados iniciais
npm run seed

# 5. Iniciar Redis
docker-compose up -d redis

# 6. Iniciar servidor
npm run start:dev
```

Servidor rodando em: `http://localhost:3000`

## 🗄️ Configuração do Banco de Dados

Este projeto usa **Supabase** como banco de dados PostgreSQL gerenciado.

### Setup Completo

Consulte o guia detalhado: **[SUPABASE-SETUP.md](./SUPABASE-SETUP.md)**

### Resumo Rápido

1. Crie uma conta em https://supabase.com
2. Crie um novo projeto
3. Copie a **Connection String** (aba "Connection pooling")
4. Configure no arquivo `.env`:

```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[HOST]:6543/postgres?pgbouncer=true"
```

5. Execute as migrations:

```bash
npm run migrate
npm run seed
```

## 📁 Estrutura do Projeto

```
backend/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   ├── seed.ts                # Dados iniciais
│   └── migrations/            # Histórico de migrations
├── src/
│   ├── database/              # ✨ PrismaService e PrismaModule
│   │   ├── prisma.service.ts  # Serviço singleton do Prisma
│   │   └── prisma.module.ts   # Módulo global do Prisma
│   ├── modules/
│   │   ├── auth/              # Autenticação e autorização
│   │   ├── produtos/          # CRUD de produtos
│   │   └── public/            # Endpoints públicos
│   ├── middleware/
│   │   └── tenant.middleware.ts  # Multi-tenancy por subdomínio
│   ├── guards/                # Guards de autenticação e roles
│   ├── decorators/            # Decorators customizados
│   ├── filters/               # Exception filters
│   └── main.ts                # Entry point
├── scripts/
│   ├── migrate.sh             # Helper para migrations
│   └── seed.sh                # Helper para seed
├── .env.example               # Template de variáveis
├── docker-compose.yml         # Redis (PostgreSQL comentado)
├── SUPABASE-SETUP.md          # Guia completo do Supabase
└── package.json
```

## 🛠️ Scripts Disponíveis

### Desenvolvimento

```bash
npm run start:dev      # Inicia servidor em modo watch
npm run dev            # Alias para start:dev
npm run start:debug    # Inicia com debugger
```

### Banco de Dados

```bash
npm run migrate        # Executa migrations (helper com validações)
npm run seed           # Popula banco com dados iniciais
npx prisma studio      # Interface visual do banco
npx prisma generate    # Gera Prisma Client
```

### Build e Produção

```bash
npm run build          # Compila TypeScript
npm run start:prod     # Inicia servidor em produção
```

### Qualidade de Código

```bash
npm run lint           # ESLint
npm run format         # Prettier
npm run test           # Testes unitários
npm run test:e2e       # Testes end-to-end
```

## 🔌 API Endpoints

### Autenticação

```http
POST   /auth/signup          # Criar conta
POST   /auth/login           # Login
POST   /auth/refresh         # Renovar token
POST   /auth/logout          # Logout
```

### Produtos (Autenticado)

```http
GET    /produtos             # Listar produtos da empresa
POST   /produtos             # Criar produto
GET    /produtos/:id         # Buscar produto
PATCH  /produtos/:id         # Atualizar produto
DELETE /produtos/:id         # Remover produto (soft delete)
```

### Público (Sem autenticação)

```http
GET    /public/:slug                    # Info da loja
GET    /public/:slug/produtos           # Produtos da loja
GET    /public/:slug/produtos/:id       # Detalhes do produto
GET    /public/:slug/categorias         # Categorias disponíveis
```

## 🔐 Autenticação

### JWT Tokens

O sistema usa dois tipos de tokens:

- **Access Token**: Curta duração (15min), usado em todas as requisições
- **Refresh Token**: Longa duração (7 dias), usado para renovar access token

### Exemplo de Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@pizzaexpress.com",
    "senha": "admin123"
  }'
```

Resposta:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "user": {
    "id": "...",
    "email": "admin@pizzaexpress.com",
    "nome": "Admin",
    "role": "ADMIN",
    "empresaId": "..."
  }
}
```

### Usando o Token

```bash
curl http://localhost:3000/produtos \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

## 🏢 Multi-tenancy

O sistema suporta múltiplas empresas (tenants) através de:

### 1. Subdomínio

```
pizza-express.deliverei.com.br  → Empresa "Pizza Express"
burger-king.deliverei.com.br    → Empresa "Burger King"
```

O middleware `TenantMiddleware` extrai o subdomínio e injeta a empresa no request.

### 2. Slug na URL (Público)

```
/public/pizza-express/produtos  → Produtos da Pizza Express
/public/burger-king/produtos    → Produtos do Burger King
```

### 3. Isolamento de Dados

Todos os dados são filtrados por `empresaId`:

```typescript
// Exemplo: Listar produtos apenas da empresa do usuário
const produtos = await prisma.produto.findMany({
  where: { empresaId: user.empresaId }
});
```

## 👨‍💻 Desenvolvimento

### Adicionar Nova Migration

```bash
# 1. Edite prisma/schema.prisma
# 2. Crie a migration
npx prisma migrate dev --name nome_da_migration
```

### Adicionar Novo Módulo

```bash
nest g module modules/pedidos
nest g controller modules/pedidos
nest g service modules/pedidos
```

### Variáveis de Ambiente

Principais variáveis no `.env`:

```env
# Aplicação
NODE_ENV=development
PORT=3000

# Banco de Dados (Supabase)
DATABASE_URL="postgresql://..."

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=seu-secret-aqui
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3001

# Multi-tenant
BASE_DOMAIN=deliverei.com.br
```

## 🐛 Troubleshooting

### Erro de conexão com banco

```bash
# Verifique se a DATABASE_URL está correta
cat .env | grep DATABASE_URL

# Teste a conexão
npx prisma db pull
```

### Redis não conecta

```bash
# Verifique se o Redis está rodando
docker-compose ps

# Inicie o Redis
docker-compose up -d redis
```

### Migrations falhando

```bash
# Resete o banco (CUIDADO: apaga dados!)
npx prisma migrate reset

# Execute novamente
npm run migrate
npm run seed
```

## 📚 Recursos

- [Documentação NestJS](https://docs.nestjs.com)
- [Documentação Prisma](https://www.prisma.io/docs)
- [Documentação Supabase](https://supabase.com/docs)
- [Guia de Setup do Supabase](./SUPABASE-SETUP.md)

## 🤝 Contribuindo

1. Crie uma branch para sua feature: `git checkout -b feat/nova-feature`
2. Commit suas mudanças: `git commit -m 'feat: adiciona nova feature'`
3. Push para a branch: `git push origin feat/nova-feature`
4. Abra um Pull Request

## 📝 Licença

MIT

---

**Desenvolvido com ❤️ pela equipe DELIVEREI**
