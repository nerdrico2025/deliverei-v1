# 📚 Instruções para Configuração do Render

## 🎯 Objetivo
Este documento contém as instruções para configurar corretamente o deploy do backend DELIVEREI no Render, garantindo que as migrations do Prisma sejam executadas automaticamente.

---

## 🚨 PROBLEMA IDENTIFICADO E RESOLVIDO

### O que estava acontecendo:
- **Erro 500** em todos os endpoints
- Mensagem: `"The table 'public.empresas' does not exist in the current database"`
- **Causa Raiz**: As migrations do Prisma NUNCA foram executadas no banco de produção

### O que foi corrigido:
1. ✅ Migrations geradas e aplicadas manualmente
2. ✅ 16 tabelas criadas no banco de produção
3. ✅ Endpoints agora funcionando corretamente (401 para endpoints protegidos)
4. ✅ Migrations versionadas no Git

---

## 🔧 CONFIGURAÇÃO OBRIGATÓRIA NO RENDER

### 1. Atualizar o Build Command

No painel do Render (https://dashboard.render.com), acesse o serviço **deliverei-backend** e configure:

#### Build Command:
```bash
npm install && npx prisma generate && npx prisma migrate deploy
```

#### Explicação dos comandos:
- `npm install` → Instala todas as dependências do projeto
- `npx prisma generate` → Gera o Prisma Client com base no schema
- `npx prisma migrate deploy` → Aplica as migrations pendentes no banco de produção

### 2. Variáveis de Ambiente Necessárias

Certifique-se de que as seguintes variáveis estão configuradas:

```env
DATABASE_URL=postgresql://deliverei_db_user:gfFKgRSrw4h9R0qKUSCSYVbBlHqpD4KL@dpg-d3lgmgjipnbc73a02o50-a.ohio-postgres.render.com/deliverei_db
JWT_SECRET=<seu-jwt-secret-aqui>
NODE_ENV=production
PORT=10000
CORS_ORIGIN=https://deliverei-app.com,https://www.deliverei-app.com
```

### 3. Start Command

```bash
node dist/main.js
```

---

## 📊 Validação da Configuração

Após aplicar as configurações e fazer o deploy, valide que tudo está funcionando:

### 1. Verificar logs do Render
```
✅ "Running prisma migrate deploy..."
✅ "Applying migration 20251013124033_initial_schema"
✅ "Database is now in sync with your schema"
✅ "Servidor rodando em: http://localhost:10000"
```

### 2. Testar endpoints
```bash
# Teste 1: Verificar se o servidor está respondendo
curl https://deliverei-backend.onrender.com/

# Teste 2: Verificar endpoint protegido (deve retornar 401)
curl -H "x-tenant-slug: pizza-express" \
     https://deliverei-backend.onrender.com/api/api/notificacoes

# Resultado esperado: HTTP 401 Unauthorized (não mais 500!)
```

---

## 🔄 Fluxo de Deploy Automático

Com a configuração acima, cada push para a branch `main` irá:

1. **Trigger do Render** → Detecta novo commit
2. **Build** → Executa `npm install && npx prisma generate && npx prisma migrate deploy`
3. **Migrations** → Aplica automaticamente novas migrations no banco
4. **Deploy** → Inicia o servidor com a nova versão

---

## 📝 Manutenção de Migrations

### Criar nova migration localmente:
```bash
cd backend/
npx prisma migrate dev --name nome_da_migration
```

### Aplicar migrations em produção (automático via Render):
O Render irá aplicar automaticamente durante o build se configurado corretamente.

### Aplicar migrations manualmente (se necessário):
```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

---

## ⚠️ AVISOS IMPORTANTES

### 1. NUNCA ignore migrations no .gitignore
❌ **ERRADO**:
```gitignore
prisma/migrations/*
!prisma/migrations/.gitkeep
```

✅ **CORRETO**:
```gitignore
# Migrations devem ser versionadas, não ignorar!
```

### 2. SEMPRE versione migrations no Git
```bash
git add backend/prisma/migrations/
git commit -m "feat: Adiciona migration para nova funcionalidade"
git push origin main
```

### 3. Ordem de execução é CRÍTICA
O build command deve executar nesta ordem:
1. `npm install` (dependências)
2. `npx prisma generate` (gera o cliente)
3. `npx prisma migrate deploy` (aplica migrations)
4. `npm run build` (compila TypeScript) - se necessário

---

## 🐛 Troubleshooting

### Problema: Erro "The table X does not exist"
**Solução**: Verifique se o build command inclui `npx prisma migrate deploy`

### Problema: Migrations não são aplicadas
**Solução**: 
1. Verifique logs do Render
2. Confirme que DATABASE_URL está correta
3. Execute manualmente: `npx prisma migrate deploy`

### Problema: Erro durante migration
**Solução**: 
1. Verifique a integridade do schema.prisma
2. Revise a migration SQL em `prisma/migrations/*/migration.sql`
3. Considere rollback se necessário

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique logs do Render em https://dashboard.render.com
2. Consulte documentação do Prisma: https://www.prisma.io/docs
3. Revise o arquivo TESTE_ENDPOINTS_RESULTADO.md neste repositório

---

## ✅ Checklist de Deploy

Antes de cada deploy, certifique-se:

- [ ] Migrations estão versionadas no Git
- [ ] Build command inclui `npx prisma migrate deploy`
- [ ] DATABASE_URL está configurada no Render
- [ ] Todas as variáveis de ambiente necessárias estão configuradas
- [ ] Logs do Render mostram migrations sendo aplicadas
- [ ] Endpoints retornam códigos HTTP corretos (401, não 500)

---

**Última atualização**: 2025-10-13  
**Autor**: DeepAgent - Abacus.AI  
**Status**: ✅ Migrations aplicadas e funcionando
