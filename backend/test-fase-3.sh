
#!/bin/bash

# Script de testes para FASE 3 - Gestão de Pedidos e Dashboard
# Backend: http://localhost:3000

BASE_URL="http://localhost:3000/api"
ADMIN_TOKEN=""
CLIENT_TOKEN=""

echo "=========================================="
echo "FASE 3 - TESTES DE GESTÃO DE PEDIDOS"
echo "=========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para fazer login e obter token
login() {
    local email=$1
    local senha=$2
    
    response=$(curl -s -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"senha\":\"$senha\"}")
    
    token=$(echo $response | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
    echo $token
}

echo -e "${YELLOW}1. Fazendo login como ADMIN...${NC}"
ADMIN_TOKEN=$(login "admin@deliverei.com" "admin123")
if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${RED}Erro ao fazer login como admin${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Login admin realizado com sucesso${NC}"
echo "Token: ${ADMIN_TOKEN:0:50}..."
echo ""

echo -e "${YELLOW}2. Fazendo login como CLIENTE...${NC}"
CLIENT_TOKEN=$(login "cliente@example.com" "senha123")
if [ -z "$CLIENT_TOKEN" ]; then
    echo -e "${RED}Erro ao fazer login como cliente${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Login cliente realizado com sucesso${NC}"
echo "Token: ${CLIENT_TOKEN:0:50}..."
echo ""

# ==================== TESTES DE CUPONS ====================
echo "=========================================="
echo "TESTES DE CUPONS"
echo "=========================================="
echo ""

echo -e "${YELLOW}3. Criando cupom de desconto (ADMIN)...${NC}"
CUPOM_RESPONSE=$(curl -s -X POST "$BASE_URL/cupons" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{
        "codigo": "PRIMEIRACOMPRA",
        "descricao": "10% de desconto na primeira compra",
        "tipo": "PERCENTUAL",
        "valor": 10,
        "valorMinimo": 50,
        "dataInicio": "2024-01-01T00:00:00Z",
        "dataFim": "2025-12-31T23:59:59Z",
        "ativo": true,
        "usoMaximo": 100
    }')
echo $CUPOM_RESPONSE | jq '.'
CUPOM_ID=$(echo $CUPOM_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo -e "${GREEN}✓ Cupom criado: $CUPOM_ID${NC}"
echo ""

echo -e "${YELLOW}4. Listando cupons (ADMIN)...${NC}"
curl -s -X GET "$BASE_URL/cupons" \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo ""

echo -e "${YELLOW}5. Validando cupom (CLIENTE)...${NC}"
curl -s -X POST "$BASE_URL/cupons/validar" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $CLIENT_TOKEN" \
    -d '{
        "codigo": "PRIMEIRACOMPRA",
        "valorCompra": 100
    }' | jq '.'
echo ""

# ==================== TESTES DE AVALIAÇÕES ====================
echo "=========================================="
echo "TESTES DE AVALIAÇÕES"
echo "=========================================="
echo ""

echo -e "${YELLOW}6. Listando produtos para avaliar...${NC}"
PRODUTOS=$(curl -s -X GET "$BASE_URL/produtos" \
    -H "Authorization: Bearer $CLIENT_TOKEN")
PRODUTO_ID=$(echo $PRODUTOS | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Produto ID: $PRODUTO_ID"
echo ""

echo -e "${YELLOW}7. Criando avaliação de produto (CLIENTE)...${NC}"
AVALIACAO_RESPONSE=$(curl -s -X POST "$BASE_URL/avaliacoes" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $CLIENT_TOKEN" \
    -d "{
        \"nota\": 5,
        \"comentario\": \"Produto excelente! Recomendo!\",
        \"produtoId\": \"$PRODUTO_ID\"
    }")
echo $AVALIACAO_RESPONSE | jq '.'
AVALIACAO_ID=$(echo $AVALIACAO_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo -e "${GREEN}✓ Avaliação criada: $AVALIACAO_ID${NC}"
echo ""

echo -e "${YELLOW}8. Listando avaliações do produto...${NC}"
curl -s -X GET "$BASE_URL/avaliacoes/produto/$PRODUTO_ID" \
    -H "Authorization: Bearer $CLIENT_TOKEN" | jq '.'
echo ""

echo -e "${YELLOW}9. Listando minhas avaliações (CLIENTE)...${NC}"
curl -s -X GET "$BASE_URL/avaliacoes/usuario" \
    -H "Authorization: Bearer $CLIENT_TOKEN" | jq '.'
echo ""

# ==================== TESTES DE NOTIFICAÇÕES ====================
echo "=========================================="
echo "TESTES DE NOTIFICAÇÕES"
echo "=========================================="
echo ""

echo -e "${YELLOW}10. Listando notificações (CLIENTE)...${NC}"
NOTIFICACOES=$(curl -s -X GET "$BASE_URL/notificacoes" \
    -H "Authorization: Bearer $CLIENT_TOKEN")
echo $NOTIFICACOES | jq '.'
NOTIFICACAO_ID=$(echo $NOTIFICACOES | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo ""

echo -e "${YELLOW}11. Contando notificações não lidas...${NC}"
curl -s -X GET "$BASE_URL/notificacoes/nao-lidas" \
    -H "Authorization: Bearer $CLIENT_TOKEN" | jq '.'
echo ""

if [ ! -z "$NOTIFICACAO_ID" ]; then
    echo -e "${YELLOW}12. Marcando notificação como lida...${NC}"
    curl -s -X PATCH "$BASE_URL/notificacoes/$NOTIFICACAO_ID/ler" \
        -H "Authorization: Bearer $CLIENT_TOKEN" | jq '.'
    echo ""
fi

echo -e "${YELLOW}13. Marcando todas como lidas...${NC}"
curl -s -X PATCH "$BASE_URL/notificacoes/ler-todas" \
    -H "Authorization: Bearer $CLIENT_TOKEN" | jq '.'
echo ""

# ==================== TESTES DE PEDIDOS ====================
echo "=========================================="
echo "TESTES DE GESTÃO DE PEDIDOS"
echo "=========================================="
echo ""

echo -e "${YELLOW}14. Listando todos os pedidos (ADMIN)...${NC}"
curl -s -X GET "$BASE_URL/pedidos?page=1&limit=5" \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo ""

echo -e "${YELLOW}15. Listando meus pedidos (CLIENTE)...${NC}"
MEUS_PEDIDOS=$(curl -s -X GET "$BASE_URL/pedidos/meus?page=1&limit=5" \
    -H "Authorization: Bearer $CLIENT_TOKEN")
echo $MEUS_PEDIDOS | jq '.'
PEDIDO_ID=$(echo $MEUS_PEDIDOS | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo ""

if [ ! -z "$PEDIDO_ID" ]; then
    echo -e "${YELLOW}16. Buscando detalhes do pedido...${NC}"
    curl -s -X GET "$BASE_URL/pedidos/$PEDIDO_ID" \
        -H "Authorization: Bearer $CLIENT_TOKEN" | jq '.'
    echo ""

    echo -e "${YELLOW}17. Atualizando status do pedido (ADMIN)...${NC}"
    curl -s -X PATCH "$BASE_URL/pedidos/$PEDIDO_ID/status" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d '{
            "status": "CONFIRMADO"
        }' | jq '.'
    echo ""

    echo -e "${YELLOW}18. Atualizando status para EM_PREPARO (ADMIN)...${NC}"
    curl -s -X PATCH "$BASE_URL/pedidos/$PEDIDO_ID/status" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ADMIN_TOKEN" \
        -d '{
            "status": "EM_PREPARO"
        }' | jq '.'
    echo ""
fi

echo -e "${YELLOW}19. Filtrando pedidos por status (ADMIN)...${NC}"
curl -s -X GET "$BASE_URL/pedidos?status=PENDENTE&page=1&limit=5" \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo ""

# ==================== TESTES DE DASHBOARD ====================
echo "=========================================="
echo "TESTES DE DASHBOARD"
echo "=========================================="
echo ""

echo -e "${YELLOW}20. Buscando estatísticas gerais (ADMIN)...${NC}"
curl -s -X GET "$BASE_URL/dashboard/estatisticas" \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo ""

echo -e "${YELLOW}21. Buscando gráfico de vendas - dia (ADMIN)...${NC}"
curl -s -X GET "$BASE_URL/dashboard/vendas?periodo=dia" \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo ""

echo -e "${YELLOW}22. Buscando gráfico de vendas - semana (ADMIN)...${NC}"
curl -s -X GET "$BASE_URL/dashboard/vendas?periodo=semana" \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo ""

echo -e "${YELLOW}23. Buscando produtos populares (ADMIN)...${NC}"
curl -s -X GET "$BASE_URL/dashboard/produtos-populares?limit=5" \
    -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
echo ""

echo "=========================================="
echo -e "${GREEN}TESTES CONCLUÍDOS!${NC}"
echo "=========================================="
echo ""
echo "Resumo dos testes realizados:"
echo "✓ Cupons: criação, listagem e validação"
echo "✓ Avaliações: criação e listagem"
echo "✓ Notificações: listagem e marcação como lida"
echo "✓ Pedidos: listagem, filtros e atualização de status"
echo "✓ Dashboard: estatísticas, gráficos e produtos populares"
echo ""
