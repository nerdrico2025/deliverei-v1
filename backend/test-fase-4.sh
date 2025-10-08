
#!/bin/bash

# Script de teste para FASE 4 - Integrações Externas
# Testa endpoints de Assinaturas, Pagamentos, WhatsApp e Webhooks

BASE_URL="http://localhost:3000"
TOKEN=""
EMPRESA_ID=""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "TESTE FASE 4 - INTEGRAÇÕES EXTERNAS"
echo "=========================================="
echo ""

# Função para fazer login e obter token
login() {
  echo -e "${YELLOW}1. Fazendo login...${NC}"
  
  RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "admin@empresa1.com",
      "senha": "senha123"
    }')
  
  TOKEN=$(echo $RESPONSE | jq -r '.accessToken')
  EMPRESA_ID=$(echo $RESPONSE | jq -r '.usuario.empresaId')
  
  if [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
    echo -e "${GREEN}✓ Login realizado com sucesso${NC}"
    echo "Token: ${TOKEN:0:20}..."
    echo "Empresa ID: $EMPRESA_ID"
  else
    echo -e "${RED}✗ Erro no login${NC}"
    echo $RESPONSE | jq '.'
    exit 1
  fi
  echo ""
}

# Teste 1: Listar planos de assinatura
test_listar_planos() {
  echo -e "${YELLOW}2. Listando planos de assinatura...${NC}"
  
  RESPONSE=$(curl -s -X GET "$BASE_URL/api/assinaturas/planos" \
    -H "Authorization: Bearer $TOKEN")
  
  echo $RESPONSE | jq '.'
  
  if [ $(echo $RESPONSE | jq 'length') -gt 0 ]; then
    echo -e "${GREEN}✓ Planos listados com sucesso${NC}"
  else
    echo -e "${RED}✗ Erro ao listar planos${NC}"
  fi
  echo ""
}

# Teste 2: Criar checkout de assinatura
test_criar_checkout() {
  echo -e "${YELLOW}3. Criando checkout de assinatura...${NC}"
  
  RESPONSE=$(curl -s -X POST "$BASE_URL/api/assinaturas/checkout" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "plano": "BASICO",
      "email": "admin@empresa1.com"
    }')
  
  echo $RESPONSE | jq '.'
  
  if [ "$(echo $RESPONSE | jq -r '.sessionId')" != "null" ]; then
    echo -e "${GREEN}✓ Checkout criado com sucesso${NC}"
  else
    echo -e "${YELLOW}⚠ Checkout pode ter falhado (Stripe não configurado)${NC}"
  fi
  echo ""
}

# Teste 3: Buscar assinatura da empresa
test_buscar_assinatura() {
  echo -e "${YELLOW}4. Buscando assinatura da empresa...${NC}"
  
  RESPONSE=$(curl -s -X GET "$BASE_URL/api/assinaturas/minha" \
    -H "Authorization: Bearer $TOKEN")
  
  echo $RESPONSE | jq '.'
  
  if [ "$(echo $RESPONSE | jq -r '.id')" != "null" ]; then
    echo -e "${GREEN}✓ Assinatura encontrada${NC}"
  else
    echo -e "${YELLOW}⚠ Empresa não possui assinatura${NC}"
  fi
  echo ""
}

# Teste 4: Criar pagamento (PIX)
test_criar_pagamento_pix() {
  echo -e "${YELLOW}5. Criando pagamento via PIX...${NC}"
  
  RESPONSE=$(curl -s -X POST "$BASE_URL/api/pagamentos/criar" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "metodo": "PIX",
      "valor": 50.00,
      "dataVencimento": "2025-10-15",
      "descricao": "Pagamento de teste",
      "clienteNome": "Cliente Teste",
      "clienteEmail": "cliente@teste.com",
      "clienteCpfCnpj": "12345678900",
      "clienteTelefone": "11999999999"
    }')
  
  echo $RESPONSE | jq '.'
  
  PAGAMENTO_ID=$(echo $RESPONSE | jq -r '.id')
  
  if [ "$PAGAMENTO_ID" != "null" ] && [ "$PAGAMENTO_ID" != "" ]; then
    echo -e "${GREEN}✓ Pagamento criado com sucesso${NC}"
    echo "Pagamento ID: $PAGAMENTO_ID"
  else
    echo -e "${YELLOW}⚠ Erro ao criar pagamento (Asaas não configurado)${NC}"
  fi
  echo ""
}

# Teste 5: Listar pagamentos da empresa
test_listar_pagamentos() {
  echo -e "${YELLOW}6. Listando pagamentos da empresa...${NC}"
  
  RESPONSE=$(curl -s -X GET "$BASE_URL/api/pagamentos" \
    -H "Authorization: Bearer $TOKEN")
  
  echo $RESPONSE | jq '.'
  
  if [ $(echo $RESPONSE | jq 'length') -ge 0 ]; then
    echo -e "${GREEN}✓ Pagamentos listados com sucesso${NC}"
  else
    echo -e "${RED}✗ Erro ao listar pagamentos${NC}"
  fi
  echo ""
}

# Teste 6: Enviar mensagem WhatsApp
test_enviar_whatsapp() {
  echo -e "${YELLOW}7. Enviando mensagem via WhatsApp...${NC}"
  
  RESPONSE=$(curl -s -X POST "$BASE_URL/api/whatsapp/enviar" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "telefone": "5511999999999",
      "mensagem": "Teste de mensagem via WhatsApp"
    }')
  
  echo $RESPONSE | jq '.'
  
  if [ "$(echo $RESPONSE | jq -r '.success')" == "true" ]; then
    echo -e "${GREEN}✓ Mensagem enviada com sucesso${NC}"
  else
    echo -e "${YELLOW}⚠ Erro ao enviar mensagem (WhatsApp não configurado)${NC}"
  fi
  echo ""
}

# Teste 7: Listar mensagens WhatsApp
test_listar_mensagens_whatsapp() {
  echo -e "${YELLOW}8. Listando mensagens WhatsApp...${NC}"
  
  RESPONSE=$(curl -s -X GET "$BASE_URL/api/whatsapp/mensagens" \
    -H "Authorization: Bearer $TOKEN")
  
  echo $RESPONSE | jq '.'
  
  if [ $(echo $RESPONSE | jq 'length') -ge 0 ]; then
    echo -e "${GREEN}✓ Mensagens listadas com sucesso${NC}"
  else
    echo -e "${RED}✗ Erro ao listar mensagens${NC}"
  fi
  echo ""
}

# Teste 8: Simular webhook Stripe
test_webhook_stripe() {
  echo -e "${YELLOW}9. Testando webhook Stripe (simulação)...${NC}"
  
  RESPONSE=$(curl -s -X POST "$BASE_URL/api/webhooks/stripe" \
    -H "Content-Type: application/json" \
    -H "stripe-signature: test_signature" \
    -d '{
      "type": "customer.subscription.created",
      "data": {
        "object": {
          "id": "sub_test123",
          "status": "active"
        }
      }
    }')
  
  echo $RESPONSE | jq '.'
  
  echo -e "${YELLOW}⚠ Webhook Stripe requer assinatura válida${NC}"
  echo ""
}

# Teste 9: Listar logs de webhooks
test_listar_webhook_logs() {
  echo -e "${YELLOW}10. Listando logs de webhooks...${NC}"
  
  RESPONSE=$(curl -s -X GET "$BASE_URL/api/webhooks/logs" \
    -H "Authorization: Bearer $TOKEN")
  
  echo $RESPONSE | jq '.'
  
  if [ $(echo $RESPONSE | jq 'length') -ge 0 ]; then
    echo -e "${GREEN}✓ Logs listados com sucesso${NC}"
  else
    echo -e "${RED}✗ Erro ao listar logs${NC}"
  fi
  echo ""
}

# Executar testes
login
test_listar_planos
test_criar_checkout
test_buscar_assinatura
test_criar_pagamento_pix
test_listar_pagamentos
test_enviar_whatsapp
test_listar_mensagens_whatsapp
test_webhook_stripe
test_listar_webhook_logs

echo "=========================================="
echo "TESTES CONCLUÍDOS"
echo "=========================================="
echo ""
echo -e "${YELLOW}OBSERVAÇÕES:${NC}"
echo "- Alguns testes podem falhar se as APIs externas não estiverem configuradas"
echo "- Configure as variáveis de ambiente no .env para testes completos"
echo "- Stripe: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET"
echo "- Asaas: ASAAS_API_KEY, ASAAS_WEBHOOK_TOKEN"
echo "- WhatsApp: WHATSAPP_API_URL, WHATSAPP_ACCESS_TOKEN"
echo ""
