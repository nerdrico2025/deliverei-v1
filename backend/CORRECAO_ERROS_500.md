# 🔧 Correção dos Erros 500 nas APIs

## 📋 Resumo do Problema

Você estava recebendo erros 500 (Internal Server Error) nas seguintes rotas:
1. `GET /api/notificacoes` - Erro repetido várias vezes
2. `GET /api/dashboard/vendas?startDate=...&endDate=...` - Erro ao buscar dados de vendas

## 🔍 Análise do Problema

Após analisar o código do backend, identifiquei o seguinte problema principal:

### **Problema: Inconsistência no objeto `req.user`**

**Localização:** `backend/src/modules/auth/strategies/jwt.strategy.ts`

**Descrição:**
- Os controllers de `notificacoes` e `dashboard` usam `req.user.sub` para acessar o ID do usuário
- Porém, a estratégia JWT (JwtStrategy) retornava um objeto com apenas `id`, sem o campo `sub`
- Isso causava erro quando o código tentava acessar `req.user.sub`, pois esse campo era `undefined`

**Código Problemático:**
```typescript
// jwt.strategy.ts - ANTES (PROBLEMA)
return {
  id: usuario.id,
  email: usuario.email,
  nome: usuario.nome,
  role: usuario.role,
  empresaId: usuario.empresaId,
  empresa: usuario.empresa,
};
```

**Uso nos Controllers:**
```typescript
// notificacoes.controller.ts
@Get()
findByUsuario(@Request() req) {
  return this.notificacoesService.findByUsuario(req.user.sub); // ❌ sub era undefined
}

// dashboard.controller.ts
@Get('vendas')
getGraficoVendas(@Request() req, ...) {
  return this.dashboardService.getGraficoVendas(req.user.empresaId, ...); // ✅ empresaId estava OK
}
```

## ✅ Solução Implementada

### 1. Correção da Estratégia JWT

**Arquivo:** `backend/src/modules/auth/strategies/jwt.strategy.ts`

**Mudança:**
```typescript
// jwt.strategy.ts - DEPOIS (CORRIGIDO)
return {
  sub: usuario.id, // ✅ Adicionar sub para compatibilidade com controllers
  id: usuario.id,
  email: usuario.email,
  nome: usuario.nome,
  role: usuario.role,
  empresaId: usuario.empresaId,
  empresa: usuario.empresa,
};
```

### 2. Melhoria no DashboardModule

**Arquivo:** `backend/src/dashboard/dashboard.module.ts`

**Mudança:** Adicionado import explícito do PrismaModule (boa prática)
```typescript
import { PrismaModule } from '../database/prisma.module';

@Module({
  imports: [PrismaModule], // ✅ Adicionado
  controllers: [DashboardController],
  providers: [DashboardService]
})
```

## 📝 Estrutura Verificada

### ✅ Schema do Prisma
- Tabela `notificacoes` existe ✓
- Tabela `pedidos` existe ✓
- Todas as relações estão corretas ✓

### ✅ Migrations
- Migration da Fase 3 inclui tabela `notificacoes` ✓
- Todas as foreign keys estão configuradas ✓

### ✅ Controllers e Services
- `NotificacoesController` configurado corretamente ✓
- `NotificacoesService` com métodos corretos ✓
- `DashboardController` configurado corretamente ✓
- `DashboardService` com queries otimizadas ✓

### ✅ Autenticação
- `JwtAuthGuard` funcionando corretamente ✓
- `RolesGuard` funcionando corretamente ✓
- Estratégia JWT agora retorna `sub` corretamente ✓

## 🚀 Próximos Passos

### 1. Deploy das Correções

Para aplicar essas correções no Render, você precisa:

```bash
# 1. Fazer push das mudanças
cd /caminho/para/deliverei-v1
git add .
git commit -m "fix: correção dos erros 500 nas APIs de notificações e dashboard"
git push origin fix/api-errors-500

# 2. Criar Pull Request e fazer merge para main
# (Ou fazer push direto para main, se preferir)

# 3. O Render vai fazer deploy automático após o push para main
```

### 2. Verificar Logs no Render

Para verificar os logs e confirmar que não há mais erros:

1. Acesse o Dashboard do Render: https://dashboard.render.com
2. Selecione seu serviço `deliverei-backend`
3. Clique na aba **"Logs"**
4. Procure por:
   - ✅ Logs de sucesso: `GET /api/notificacoes 200`
   - ✅ Logs de sucesso: `GET /api/dashboard/vendas 200`
   - ❌ Erros (não devem mais aparecer): `GET /api/notificacoes 500`

### 3. Testar Localmente (Opcional)

Se quiser testar localmente antes do deploy:

```bash
# Instalar dependências
cd backend
npm install

# Gerar cliente Prisma
npx prisma generate

# Rodar o servidor
npm run start:dev

# Testar a API (em outro terminal)
curl -H "Authorization: Bearer SEU_TOKEN_JWT" \
     http://localhost:3000/api/notificacoes
```

### 4. Verificar no Frontend

Após o deploy, acesse o frontend e verifique:
1. O console do navegador não deve mais mostrar erros 500
2. As notificações devem carregar corretamente
3. O dashboard deve mostrar os gráficos de vendas

## 🔐 Importante sobre Autenticação

As rotas `/api/notificacoes` e `/api/dashboard/vendas` requerem autenticação. Certifique-se de que:

1. **O usuário está logado** no frontend
2. **O token JWT está sendo enviado** no header `Authorization: Bearer <token>`
3. **O token não expirou** (duração configurada no backend)

### Como Verificar o Token

No console do navegador (DevTools):
```javascript
// Verificar se o token existe
localStorage.getItem('token') // ou onde você armazena o token

// Verificar headers da requisição
// Ir em Network > selecionar uma requisição > Headers
// Procurar por: Authorization: Bearer <token>
```

## 🐛 Problemas Potenciais Adicionais

Se ainda houver erros após essas correções, verifique:

### 1. Variáveis de Ambiente no Render

Certifique-se de que estas variáveis estão configuradas:
- `DATABASE_URL` - URL do Supabase
- `JWT_SECRET` - Secret para tokens JWT
- `NODE_ENV=production`

### 2. Migrations no Render

Verifique se as migrations foram executadas:
```bash
# No Render, adicionar no "Build Command":
npm install && npx prisma generate && npx prisma migrate deploy
```

### 3. Prisma Client

Se houver erro relacionado ao Prisma Client:
```bash
# Adicionar no "Build Command":
npx prisma generate
```

## 📞 Verificando os Logs no Render

Para entender melhor qualquer erro que ainda possa ocorrer:

1. **Acessar Logs:**
   - Dashboard do Render > Seu serviço > Logs
   
2. **Procurar por:**
   - `[Nest]` - Logs do NestJS
   - `ERROR` - Qualquer erro
   - `prisma:query` - Queries do Prisma (se habilitado)
   
3. **Logs Úteis:**
   - Erros de conexão com banco: `Error: Can't reach database server`
   - Erros de autenticação: `UnauthorizedException`
   - Erros do Prisma: `PrismaClientKnownRequestError`

## 📊 Monitoramento

Após o deploy, monitore por alguns minutos:
- Status HTTP das requisições (devem ser 200, não 500)
- Tempo de resposta das APIs
- Logs de erro no Render

## ✨ Resultado Esperado

Após aplicar essas correções:
- ✅ `/api/notificacoes` deve retornar 200 OK
- ✅ `/api/dashboard/vendas` deve retornar 200 OK
- ✅ Notificações carregam no frontend
- ✅ Dashboard mostra gráficos de vendas
- ✅ Sem erros 500 no console do navegador

---

## 📝 Observações Técnicas

### Estrutura do Banco de Dados

A tabela `notificacoes` tem a seguinte estrutura:
```sql
CREATE TABLE "notificacoes" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "tipo" TEXT NOT NULL, -- PEDIDO, SISTEMA, PROMOCAO
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "usuario_id" TEXT NOT NULL,
    "pedido_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);
```

### Endpoints Disponíveis

#### Notificações
- `GET /api/notificacoes` - Listar notificações do usuário
- `GET /api/notificacoes/nao-lidas` - Contar notificações não lidas
- `PATCH /api/notificacoes/:id/ler` - Marcar como lida
- `PATCH /api/notificacoes/ler-todas` - Marcar todas como lidas
- `DELETE /api/notificacoes/:id` - Deletar notificação

#### Dashboard
- `GET /api/dashboard/estatisticas` - Estatísticas gerais
- `GET /api/dashboard/vendas?periodo=dia&startDate=...&endDate=...` - Gráfico de vendas
- `GET /api/dashboard/produtos-populares?limit=10` - Produtos mais vendidos

---

**Data da Correção:** 2025-10-12  
**Status:** ✅ Corrigido e pronto para deploy  
**Branch:** `fix/api-errors-500`
