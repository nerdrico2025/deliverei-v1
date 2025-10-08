
# FASE 4 - Documentação: Integrações Externas

## 📋 Visão Geral

A FASE 4 implementa integrações com serviços externos essenciais para o funcionamento completo da plataforma:

- **Stripe**: Sistema de assinaturas e cobranças recorrentes
- **Asaas**: Gateway de pagamento para pedidos (PIX, Cartão, Boleto)
- **WhatsApp Business API**: Notificações automáticas para clientes
- **Webhooks**: Recebimento de eventos das APIs externas

---

## 🔧 Configuração das APIs Externas

### 1. Stripe (Assinaturas)

#### Criar conta no Stripe
1. Acesse: https://dashboard.stripe.com/register
2. Complete o cadastro
3. Ative o modo de teste

#### Obter chaves de API
1. Acesse: https://dashboard.stripe.com/test/apikeys
2. Copie a **Secret Key** (sk_test_...)
3. Adicione no `.env`:
```env
STRIPE_SECRET_KEY=sk_test_sua_chave_aqui
```

#### Configurar Webhook
1. Acesse: https://dashboard.stripe.com/test/webhooks
2. Clique em "Add endpoint"
3. URL: `https://seu-dominio.com/api/webhooks/stripe`
4. Eventos a escutar:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copie o **Signing secret** (whsec_...)
6. Adicione no `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_sua_chave_aqui
```

#### Criar produtos e preços
1. Acesse: https://dashboard.stripe.com/test/products
2. Crie 3 produtos:
   - **Básico**: R$ 49,90/mês
   - **Profissional**: R$ 99,90/mês
   - **Enterprise**: R$ 199,90/mês
3. Copie os IDs dos preços (price_...)
4. Adicione no `.env`:
```env
STRIPE_PRICE_BASICO=price_id_basico
STRIPE_PRICE_PROFISSIONAL=price_id_profissional
STRIPE_PRICE_ENTERPRISE=price_id_enterprise
```

---

### 2. Asaas (Pagamentos)

#### Criar conta no Asaas
1. Acesse: https://www.asaas.com/cadastro
2. Complete o cadastro
3. Ative o ambiente Sandbox para testes

#### Obter chave de API
1. Acesse: https://sandbox.asaas.com/configuracoes/api
2. Copie a **API Key**
3. Adicione no `.env`:
```env
ASAAS_API_KEY=sua_chave_api_aqui
```

#### Configurar Webhook
1. Acesse: https://sandbox.asaas.com/configuracoes/webhook
2. URL: `https://seu-dominio.com/api/webhooks/asaas`
3. Eventos a escutar:
   - `PAYMENT_CREATED`
   - `PAYMENT_CONFIRMED`
   - `PAYMENT_RECEIVED`
   - `PAYMENT_OVERDUE`
4. Gere um token de autenticação
5. Adicione no `.env`:
```env
ASAAS_WEBHOOK_TOKEN=seu_token_webhook
```

---

### 3. WhatsApp Business API

#### Opção 1: Meta Business (Oficial)
1. Acesse: https://business.facebook.com/
2. Crie uma conta Business
3. Configure o WhatsApp Business API
4. Obtenha:
   - Phone Number ID
   - Access Token
5. Adicione no `.env`:
```env
WHATSAPP_API_URL=https://graph.facebook.com/v17.0
WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id
WHATSAPP_ACCESS_TOKEN=seu_access_token
```

#### Opção 2: Provedor Terceiro (Twilio, etc)
Consulte a documentação do provedor escolhido.

---

## 📡 Endpoints da API

### Assinaturas

#### Listar Planos
```http
GET /api/assinaturas/planos
Authorization: Bearer {token}
```

**Resposta:**
```json
[
  {
    "id": "BASICO",
    "nome": "Básico",
    "valor": 49.9,
    "pedidosMes": 100,
    "produtos": 50,
    "descricao": "Ideal para pequenos negócios"
  },
  {
    "id": "PROFISSIONAL",
    "nome": "Profissional",
    "valor": 99.9,
    "pedidosMes": 500,
    "produtos": 200,
    "descricao": "Para negócios em crescimento"
  },
  {
    "id": "ENTERPRISE",
    "nome": "Enterprise",
    "valor": 199.9,
    "pedidosMes": -1,
    "produtos": -1,
    "descricao": "Solução completa sem limites"
  }
]
```

#### Criar Checkout
```http
POST /api/assinaturas/checkout
Authorization: Bearer {token}
Content-Type: application/json

{
  "plano": "BASICO",
  "email": "empresa@email.com"
}
```

**Resposta:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

#### Buscar Minha Assinatura
```http
GET /api/assinaturas/minha
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "id": "uuid",
  "plano": "BASICO",
  "status": "ATIVA",
  "valorMensal": 49.9,
  "dataInicio": "2025-10-01T00:00:00.000Z",
  "proximaCobranca": "2025-11-01T00:00:00.000Z",
  "planoInfo": {
    "nome": "Básico",
    "pedidosMes": 100,
    "produtos": 50
  }
}
```

#### Cancelar Assinatura
```http
POST /api/assinaturas/cancelar
Authorization: Bearer {token}
```

#### Reativar Assinatura
```http
POST /api/assinaturas/reativar
Authorization: Bearer {token}
```

#### Histórico de Pagamentos
```http
GET /api/assinaturas/historico
Authorization: Bearer {token}
```

---

### Pagamentos

#### Criar Pagamento
```http
POST /api/pagamentos/criar
Authorization: Bearer {token}
Content-Type: application/json

{
  "pedidoId": "uuid-do-pedido",
  "metodo": "PIX",
  "valor": 150.00,
  "dataVencimento": "2025-10-15",
  "descricao": "Pagamento do pedido #12345",
  "clienteNome": "João Silva",
  "clienteEmail": "joao@email.com",
  "clienteCpfCnpj": "12345678900",
  "clienteTelefone": "11999999999"
}
```

**Métodos disponíveis:** `PIX`, `CARTAO`, `BOLETO`

**Resposta (PIX):**
```json
{
  "id": "uuid",
  "status": "PENDENTE",
  "valor": 150.00,
  "metodo": "PIX",
  "qrCode": "data:image/png;base64,...",
  "copyPaste": "00020126580014br.gov.bcb.pix...",
  "dataVencimento": "2025-10-15T00:00:00.000Z"
}
```

#### Buscar Pagamento
```http
GET /api/pagamentos/{id}
Authorization: Bearer {token}
```

#### Pagamentos de um Pedido
```http
GET /api/pagamentos/pedido/{pedidoId}
Authorization: Bearer {token}
```

#### Histórico de Pagamentos
```http
GET /api/pagamentos
Authorization: Bearer {token}
```

#### Cancelar Pagamento
```http
POST /api/pagamentos/{id}/cancelar
Authorization: Bearer {token}
```

---

### WhatsApp

#### Enviar Mensagem
```http
POST /api/whatsapp/enviar
Authorization: Bearer {token}
Content-Type: application/json

{
  "telefone": "5511999999999",
  "mensagem": "Olá! Seu pedido foi confirmado.",
  "pedidoId": "uuid-do-pedido"
}
```

#### Listar Mensagens
```http
GET /api/whatsapp/mensagens
Authorization: Bearer {token}
```

#### Mensagens de um Pedido
```http
GET /api/whatsapp/mensagens/pedido/{pedidoId}
Authorization: Bearer {token}
```

#### Configurar WhatsApp
```http
POST /api/whatsapp/configurar
Authorization: Bearer {token}
Content-Type: application/json

{
  "whatsappNumero": "5511999999999",
  "whatsappToken": "seu_token_aqui"
}
```

---

### Webhooks

#### Webhook Stripe
```http
POST /api/webhooks/stripe
Content-Type: application/json
stripe-signature: {assinatura}

{
  "type": "customer.subscription.created",
  "data": {
    "object": { ... }
  }
}
```

#### Webhook Asaas
```http
POST /api/webhooks/asaas
Content-Type: application/json
asaas-access-token: {token}

{
  "event": "PAYMENT_CONFIRMED",
  "payment": { ... }
}
```

#### Listar Logs (Admin)
```http
GET /api/webhooks/logs?origem=STRIPE&processado=true
Authorization: Bearer {token}
```

---

## 📱 Templates de Mensagens WhatsApp

### Novo Pedido (PENDENTE)
```
🔔 *Novo Pedido Recebido!*

Olá! Seu pedido #{numero} foi recebido com sucesso na {empresa}.

Estamos processando seu pedido e em breve você receberá uma confirmação.

Obrigado pela preferência! 🙏
```

### Pedido Confirmado
```
✅ *Pedido Confirmado!*

Seu pedido #{numero} foi confirmado pela {empresa}.

Agora vamos preparar tudo com muito carinho para você!

Em breve seu pedido estará pronto. 👨‍🍳
```

### Em Preparo
```
👨‍🍳 *Pedido em Preparo!*

Seu pedido #{numero} está sendo preparado pela {empresa}.

Estamos caprichando em cada detalhe!

Logo estará pronto para entrega. ⏰
```

### Saiu para Entrega
```
🚚 *Pedido Saiu para Entrega!*

Seu pedido #{numero} saiu para entrega!

O entregador está a caminho do seu endereço.

Fique atento! Em breve chegará. 📍
```

### Entregue
```
🎉 *Pedido Entregue!*

Seu pedido #{numero} foi entregue com sucesso!

Esperamos que você aproveite! 😋

Obrigado por escolher a {empresa}!
```

### Cancelado
```
❌ *Pedido Cancelado*

Seu pedido #{numero} foi cancelado.

Se você tiver alguma dúvida, entre em contato conosco.

Esperamos vê-lo novamente em breve! 🙏
```

---

## 🔒 Guards e Middlewares

### AssinaturaGuard
Verifica se a empresa possui assinatura ativa antes de permitir acesso.

**Uso:**
```typescript
@UseGuards(JwtAuthGuard, AssinaturaGuard)
@Get('endpoint-protegido')
async metodo() { ... }
```

### LimitesGuard
Verifica se a empresa não excedeu os limites do plano.

**Uso:**
```typescript
@UseGuards(JwtAuthGuard, LimitesGuard)
@SetMetadata('limite', 'pedidos')
@Post('criar-pedido')
async criarPedido() { ... }
```

**Tipos de limite:**
- `pedidos`: Limite de pedidos por mês
- `produtos`: Limite de produtos cadastrados

---

## 🧪 Testes

### Executar testes
```bash
cd backend
chmod +x test-fase-4.sh
./test-fase-4.sh
```

### Testes incluídos
1. ✅ Listar planos de assinatura
2. ✅ Criar checkout Stripe
3. ✅ Buscar assinatura da empresa
4. ✅ Criar pagamento PIX
5. ✅ Listar pagamentos
6. ✅ Enviar mensagem WhatsApp
7. ✅ Listar mensagens WhatsApp
8. ✅ Webhook Stripe (simulação)
9. ✅ Listar logs de webhooks

---

## 🔄 Fluxos de Integração

### Fluxo de Assinatura
1. Empresa escolhe plano
2. Sistema cria checkout no Stripe
3. Cliente paga no Stripe
4. Stripe envia webhook `invoice.payment_succeeded`
5. Sistema ativa assinatura
6. Sistema registra pagamento

### Fluxo de Pagamento de Pedido
1. Cliente finaliza pedido
2. Sistema cria cobrança no Asaas
3. Cliente paga (PIX/Cartão/Boleto)
4. Asaas envia webhook `PAYMENT_CONFIRMED`
5. Sistema atualiza status do pagamento
6. Sistema atualiza status do pedido

### Fluxo de Notificação WhatsApp
1. Status do pedido é atualizado
2. Sistema busca template de mensagem
3. Sistema envia mensagem via WhatsApp API
4. Sistema registra mensagem no banco
5. WhatsApp API retorna status de entrega

---

## 🐛 Troubleshooting

### Erro: "Stripe webhook signature invalid"
- Verifique se `STRIPE_WEBHOOK_SECRET` está correto
- Certifique-se de que o endpoint está acessível publicamente
- Use ngrok para testes locais: `ngrok http 3000`

### Erro: "Asaas API key invalid"
- Verifique se está usando a chave do ambiente correto (sandbox/production)
- Confirme que a chave está ativa no painel Asaas

### Erro: "WhatsApp message not sent"
- Verifique se o número está no formato internacional (+5511999999999)
- Confirme que o token de acesso está válido
- Verifique se o número está verificado no Meta Business

### Pagamentos não sendo processados
- Verifique logs de webhook: `GET /api/webhooks/logs`
- Confirme que os webhooks estão configurados corretamente
- Teste manualmente os endpoints de webhook

---

## 📊 Monitoramento

### Logs de Webhook
Todos os eventos de webhook são registrados na tabela `webhook_logs`:
- `origem`: STRIPE ou ASAAS
- `evento`: Tipo do evento
- `payload`: Dados completos do evento
- `processado`: Se foi processado com sucesso
- `erro`: Mensagem de erro (se houver)

### Mensagens WhatsApp
Todas as mensagens são registradas na tabela `mensagens_whatsapp`:
- `status`: PENDENTE, ENVIADA, ENTREGUE, LIDA, ERRO
- `erro`: Mensagem de erro (se houver)
- `whatsappId`: ID da mensagem no WhatsApp

---

## 🚀 Próximos Passos

1. **Frontend**: Implementar interfaces para:
   - Seleção e checkout de planos
   - Visualização de assinatura e pagamentos
   - Configuração do WhatsApp
   - Dashboard de mensagens

2. **Melhorias**:
   - Retry automático para mensagens WhatsApp falhadas
   - Dashboard de métricas de pagamentos
   - Relatórios de assinaturas
   - Notificações de vencimento de assinatura

3. **Segurança**:
   - Rate limiting nos webhooks
   - Validação adicional de assinaturas
   - Criptografia de tokens sensíveis

---

## 📝 Variáveis de Ambiente Completas

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_URL="postgresql://user:password@host:5432/database"

# JWT
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRES_IN="7d"

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_BASICO=price_...
STRIPE_PRICE_PROFISSIONAL=price_...
STRIPE_PRICE_ENTERPRISE=price_...

# Asaas
ASAAS_API_KEY=your_api_key
ASAAS_WEBHOOK_TOKEN=your_webhook_token

# WhatsApp Business API
WHATSAPP_API_URL=https://graph.facebook.com/v17.0
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token

# Frontend
FRONTEND_URL=http://localhost:5173
```

---

## ✅ Checklist de Implementação

- [x] Schema Prisma atualizado
- [x] Migrations criadas
- [x] Módulo de Assinaturas implementado
- [x] Módulo de Pagamentos implementado
- [x] Módulo de WhatsApp implementado
- [x] Módulo de Webhooks implementado
- [x] Guards de assinatura e limites
- [x] Integração com Pedidos
- [x] Templates de mensagens
- [x] Script de testes
- [x] Documentação completa
- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Deploy em produção

---

**Documentação criada em:** 08/10/2025  
**Versão:** 1.0  
**Autor:** Equipe Deliverei
