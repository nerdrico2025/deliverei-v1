# 🔧 Configuração de Portas - Sistema Deliverei

## 📋 Resumo das Portas

| Serviço | Porta Padrão | Porta Alternativa | Status |
|---------|--------------|-------------------|--------|
| Backend | 3002 | 3003-3012 (automático) | ✅ Configurado |
| Frontend | 5174 | 5173, 5175-5180 | ✅ Configurado |
| Mock Backend | 3003 | 3004-3013 | ✅ Configurado |

## 🚀 Configuração Atual

### Backend (NestJS)
- **Porta Principal**: 3002
- **Arquivo de Configuração**: `backend/.env`
- **Verificação Automática**: ✅ Implementada
- **Fallback Automático**: ✅ Portas 3003-3012

```env
# backend/.env
PORT=3002
CORS_ORIGIN=http://localhost:5174,http://localhost:5173
```

### Frontend (Vite + React)
- **Porta Principal**: 5174
- **Arquivo de Configuração**: `.env`
- **API URL**: http://localhost:3002/api

```env
# .env (raiz do projeto)
VITE_API_URL=http://localhost:3002/api
```

## 🔍 Verificação de Status

### Comando Rápido
```bash
# Verificar portas em uso
lsof -i :3002
lsof -i :5174

# Verificar se os serviços estão respondendo
curl http://localhost:3002/api
curl http://localhost:5174
```

### Script de Validação Automática
```bash
# Executar validação completa do sistema
node scripts/validate-system.js
```

## 🛠️ Resolução de Problemas

### Problema: Porta 3002 em uso
```bash
# Identificar processo
lsof -i :3002

# Parar processo específico
kill -9 <PID>

# Ou usar porta alternativa
PORT=3003 npm run start:dev
```

### Problema: Frontend não conecta ao Backend
1. Verificar se `VITE_API_URL` está correto no `.env`
2. Confirmar se CORS está configurado no backend
3. Reiniciar o frontend após mudanças no `.env`

```bash
# Reiniciar frontend
npm run dev
```

### Problema: CORS Error
Verificar configuração no `backend/.env`:
```env
CORS_ORIGIN=http://localhost:5174,http://localhost:5173
```

## 📝 Logs e Monitoramento

### Backend Logs
O backend agora fornece logs detalhados:
- ✅ Verificação de porta disponível
- ⚠️ Avisos sobre mudanças de porta
- 🔍 Sugestões para resolução de problemas
- 🌐 Configurações de CORS ativas

### Exemplo de Log Saudável
```
✅ Porta 3002 está disponível
🎉 Servidor inicializado com sucesso!
🚀 Servidor rodando em: http://localhost:3002
📚 API disponível em: http://localhost:3002/api
✨ Ambiente: development
🌐 CORS habilitado para: http://localhost:5174
```

### Exemplo de Log com Problema
```
⚠️  Porta 3002 está em uso. Considere usar uma porta diferente ou parar o processo que está usando esta porta.
🔍 Procurando porta disponível...
✅ Porta alternativa encontrada: 3003
⚠️  Porta alterada de 3002 para 3003
💡 Atualize sua configuração frontend se necessário
```

## 🔄 Processo de Inicialização Recomendado

### 1. Verificar Configurações
```bash
# Verificar arquivos de configuração
cat .env
cat backend/.env
```

### 2. Iniciar Backend
```bash
cd backend
npm run start:dev
```

### 3. Iniciar Frontend
```bash
npm run dev
```

### 4. Validar Sistema
```bash
node scripts/validate-system.js
```

## 🚨 Troubleshooting Avançado

### Reset Completo
```bash
# Parar todos os processos Node.js
pkill -f node

# Limpar cache do npm
npm cache clean --force

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install

# Reiniciar serviços
npm run dev &
cd backend && npm run start:dev
```

### Verificação de Rede
```bash
# Testar conectividade local
ping localhost

# Verificar se as portas estão abertas
netstat -an | grep LISTEN | grep -E "(3002|5174)"

# Testar endpoints manualmente
curl -X GET http://localhost:3002/api
curl -X POST http://localhost:3002/api/auth/cadastro-empresa \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste","email":"teste@teste.com","senha":"123456"}'
```

## 📞 Suporte

Se os problemas persistirem:

1. **Verificar logs detalhados** nos terminais do backend e frontend
2. **Executar script de validação** para diagnóstico automático
3. **Verificar configurações de firewall** local
4. **Confirmar versões** do Node.js e npm compatíveis

### Informações do Sistema
- Node.js: >= 18.0.0
- npm: >= 8.0.0
- Sistema: macOS, Linux, Windows

---

*Documentação atualizada em: $(date)*
*Versão do sistema: 1.0.0*