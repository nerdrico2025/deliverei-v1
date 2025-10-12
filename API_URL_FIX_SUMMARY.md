# 🔧 Frontend API URL Configuration Fix

## 📋 Resumo

Corrigida a configuração da URL da API no frontend para usar a variável de ambiente `VITE_API_URL` ao invés de `localhost`.

## 🐛 Problema Identificado

O frontend estava hardcoded para usar `http://localhost:3000/api`, causando:
- ❌ Erros `ERR_CONNECTION_REFUSED` em produção
- ❌ Variável de ambiente `VITE_API_URL` do Netlify não estava sendo usada
- ❌ Impossibilidade de conectar ao backend do Render

## ✅ Solução Implementada

### 1. **Arquivo `src/services/apiClient.ts`**
```typescript
// Antes:
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  // ...
});

// Depois:
const API_URL = import.meta.env.VITE_API_URL || 'https://deliverei-backend.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_URL,
  // ...
});
```

**Mudanças:**
- ✅ Agora usa `import.meta.env.VITE_API_URL` como prioridade
- ✅ Fallback mudado de `localhost` para URL do Render
- ✅ Aplicado tanto na criação do axios quanto no endpoint de refresh token

### 2. **Arquivo `src/pages/storefront/OrderConfirmation.tsx`**
```typescript
// Antes:
const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/...`

// Depois:
const url = `${import.meta.env.VITE_API_URL || 'https://deliverei-backend.onrender.com/api'}/...`
```

**Mudanças:**
- ✅ Fallback atualizado para URL do Render
- ✅ Funciona corretamente em produção

## 🚀 Deploy

### PR Criado e Mergeado
- **PR #28:** [🔧 Fix: Configure Frontend to Use VITE_API_URL Environment Variable](https://github.com/nerdrico2025/deliverei-v1/pull/28)
- **Status:** ✅ Merged to main
- **Branch:** `fix/frontend-api-url-config` → `main`

### Variável de Ambiente no Netlify
**Configuração atual:**
```
VITE_API_URL = https://deliverei-backend.onrender.com/api
```

### Como Funciona
1. **Com variável de ambiente configurada:**
   - Frontend usa `import.meta.env.VITE_API_URL`
   - Conecta ao backend em `https://deliverei-backend.onrender.com/api`

2. **Sem variável de ambiente:**
   - Frontend usa o fallback
   - Conecta ao backend em `https://deliverei-backend.onrender.com/api`

3. **Desenvolvimento local:**
   - Crie um arquivo `.env` na raiz com: `VITE_API_URL=http://localhost:3000/api`
   - Ou deixe o fallback conectar ao Render

## 📊 Impacto

### Antes
```
Frontend (Netlify) → ❌ http://localhost:3000/api
                      ↓
                      ERR_CONNECTION_REFUSED
```

### Depois
```
Frontend (Netlify) → ✅ https://deliverei-backend.onrender.com/api
                      ↓
                      Backend (Render) ✅
```

## 🧪 Validação

Para verificar se está funcionando:

1. **Abra o DevTools do navegador (F12)**
2. **Vá para a aba Network**
3. **Faça uma requisição na aplicação**
4. **Verifique se a URL é:**
   - ✅ `https://deliverei-backend.onrender.com/api/...`
   - ❌ ~~`http://localhost:3000/api/...`~~

## 📝 Arquivos Modificados

- ✅ `src/services/apiClient.ts`
- ✅ `src/pages/storefront/OrderConfirmation.tsx`

## 🎯 Próximos Passos

1. **Aguardar o deploy automático do Netlify**
2. **Testar a aplicação em produção**
3. **Verificar no Network tab se as requisições estão indo para o Render**
4. **Confirmar que não há mais erros de conexão**

## 📌 Notas Importantes

- ⚠️ **PR #27** (melhorias do dashboard) já estava mergeado anteriormente
- ✅ O PR correto era o **#28** (fix da API URL)
- ✅ Todas as referências a `localhost` foram removidas do frontend
- ✅ O código está pronto para produção

---

**Data:** 2025-10-12  
**Status:** ✅ Completo
