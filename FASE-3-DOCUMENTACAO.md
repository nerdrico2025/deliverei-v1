
# FASE 3 - Gestão de Pedidos, Dashboard e Funcionalidades Avançadas

## 📋 Visão Geral

A FASE 3 implementa funcionalidades avançadas de gestão administrativa, incluindo:
- Sistema completo de gestão de pedidos
- Dashboard administrativo com estatísticas
- Sistema de cupons de desconto
- Sistema de avaliações de produtos
- Sistema de notificações automáticas
- Cálculo de frete

## 🗄️ Novos Models

### Cupom
```prisma
model Cupom {
  id          String   @id @default(uuid())
  codigo      String   @unique
  descricao   String?
  tipo        String   // PERCENTUAL, VALOR_FIXO
  valor       Decimal
  valorMinimo Decimal?
  dataInicio  DateTime
  dataFim     DateTime
  ativo       Boolean  @default(true)
  usoMaximo   Int?
  usoAtual    Int      @default(0)
  empresaId   String
  empresa     Empresa  @relation(...)
}
```

**Tipos de Cupom:**
- `PERCENTUAL`: Desconto em porcentagem (ex: 10%)
- `VALOR_FIXO`: Desconto em valor fixo (ex: R$ 20,00)

### Avaliacao
```prisma
model Avaliacao {
  id         String   @id @default(uuid())
  nota       Int      // 1-5
  comentario String?
  produtoId  String
  usuarioId  String
  pedidoId   String?
  produto    Produto  @relation(...)
  usuario    Usuario  @relation(...)
  pedido     Pedido?  @relation(...)
}
```

**Notas:** De 1 a 5 estrelas

### Notificacao
```prisma
model Notificacao {
  id        String   @id @default(uuid())
  titulo    String
  mensagem  String
  tipo      String   // PEDIDO, SISTEMA, PROMOCAO
  lida      Boolean  @default(false)
  usuarioId String
  pedidoId  String?
  usuario   Usuario  @relation(...)
  pedido    Pedido?  @relation(...)
}
```

**Tipos de Notificação:**
- `PEDIDO`: Notificações relacionadas a pedidos
- `SISTEMA`: Notificações do sistema
- `PROMOCAO`: Notificações de promoções

## 🔌 Endpoints da API

### Cupons (`/api/cupons`)

#### Criar Cupom (ADMIN)
```http
POST /api/cupons
Authorization: Bearer {token}
Content-Type: application/json

{
  "codigo": "PRIMEIRACOMPRA",
  "descricao": "10% de desconto na primeira compra",
  "tipo": "PERCENTUAL",
  "valor": 10,
  "valorMinimo": 50,
  "dataInicio": "2024-01-01T00:00:00Z",
  "dataFim": "2025-12-31T23:59:59Z",
  "ativo": true,
  "usoMaximo": 100
}
```

#### Listar Cupons (ADMIN)
```http
GET /api/cupons
Authorization: Bearer {token}
```

#### Buscar Cupom (ADMIN)
```http
GET /api/cupons/:id
Authorization: Bearer {token}
```

#### Atualizar Cupom (ADMIN)
```http
PATCH /api/cupons/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "ativo": false
}
```

#### Deletar Cupom (ADMIN)
```http
DELETE /api/cupons/:id
Authorization: Bearer {token}
```

#### Validar Cupom (CLIENTE)
```http
POST /api/cupons/validar
Authorization: Bearer {token}
Content-Type: application/json

{
  "codigo": "PRIMEIRACOMPRA",
  "valorCompra": 100
}
```

**Resposta:**
```json
{
  "cupom": { ... },
  "desconto": 10,
  "valorFinal": 90
}
```

### Avaliações (`/api/avaliacoes`)

#### Criar Avaliação (CLIENTE)
```http
POST /api/avaliacoes
Authorization: Bearer {token}
Content-Type: application/json

{
  "nota": 5,
  "comentario": "Produto excelente!",
  "produtoId": "uuid",
  "pedidoId": "uuid" // opcional
}
```

#### Listar Avaliações de Produto
```http
GET /api/avaliacoes/produto/:produtoId
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "avaliacoes": [...],
  "estatisticas": {
    "total": 10,
    "media": 4.5
  }
}
```

#### Minhas Avaliações (CLIENTE)
```http
GET /api/avaliacoes/usuario
Authorization: Bearer {token}
```

#### Deletar Avaliação (próprio usuário)
```http
DELETE /api/avaliacoes/:id
Authorization: Bearer {token}
```

### Notificações (`/api/notificacoes`)

#### Listar Notificações
```http
GET /api/notificacoes
Authorization: Bearer {token}
```

#### Contar Não Lidas
```http
GET /api/notificacoes/nao-lidas
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "count": 5
}
```

#### Marcar Como Lida
```http
PATCH /api/notificacoes/:id/ler
Authorization: Bearer {token}
```

#### Marcar Todas Como Lidas
```http
PATCH /api/notificacoes/ler-todas
Authorization: Bearer {token}
```

#### Deletar Notificação
```http
DELETE /api/notificacoes/:id
Authorization: Bearer {token}
```

### Pedidos (`/api/pedidos`)

#### Listar Pedidos (ADMIN)
```http
GET /api/pedidos?status=PENDENTE&page=1&limit=10
Authorization: Bearer {token}
```

**Filtros disponíveis:**
- `status`: PENDENTE, CONFIRMADO, EM_PREPARO, SAIU_ENTREGA, ENTREGUE, CANCELADO
- `dataInicio`: Data inicial (ISO 8601)
- `dataFim`: Data final (ISO 8601)
- `usuarioId`: ID do usuário
- `page`: Página (padrão: 1)
- `limit`: Itens por página (padrão: 10)

**Resposta:**
```json
{
  "pedidos": [...],
  "paginacao": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

#### Meus Pedidos (CLIENTE)
```http
GET /api/pedidos/meus?page=1&limit=10
Authorization: Bearer {token}
```

#### Detalhes do Pedido
```http
GET /api/pedidos/:id
Authorization: Bearer {token}
```

#### Atualizar Status (ADMIN)
```http
PATCH /api/pedidos/:id/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "CONFIRMADO"
}
```

**Status disponíveis:**
- `PENDENTE`: Pedido criado, aguardando confirmação
- `CONFIRMADO`: Pedido confirmado pela empresa
- `EM_PREPARO`: Pedido sendo preparado
- `SAIU_ENTREGA`: Pedido saiu para entrega
- `ENTREGUE`: Pedido entregue ao cliente
- `CANCELADO`: Pedido cancelado

#### Cancelar Pedido
```http
DELETE /api/pedidos/:id
Authorization: Bearer {token}
```

**Regras:**
- ADMIN pode cancelar qualquer pedido (exceto ENTREGUE)
- CLIENTE pode cancelar apenas seus próprios pedidos (exceto ENTREGUE e CANCELADO)

### Dashboard (`/api/dashboard`)

#### Estatísticas Gerais (ADMIN)
```http
GET /api/dashboard/estatisticas
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "pedidos": {
    "hoje": 5,
    "semana": 25,
    "mes": 100
  },
  "vendas": {
    "hoje": 500.00,
    "semana": 2500.00,
    "mes": 10000.00
  },
  "ticketMedio": 100.00,
  "pedidosPorStatus": [
    { "status": "PENDENTE", "quantidade": 10 },
    { "status": "CONFIRMADO", "quantidade": 15 }
  ],
  "produtosMaisVendidos": [
    {
      "id": "uuid",
      "nome": "Produto X",
      "imagem": "url",
      "preco": 50.00,
      "quantidadeVendida": 100
    }
  ]
}
```

#### Gráfico de Vendas (ADMIN)
```http
GET /api/dashboard/vendas?periodo=dia
Authorization: Bearer {token}
```

**Períodos disponíveis:**
- `dia`: Últimos 30 dias
- `semana`: Últimas 12 semanas
- `mes`: Últimos 12 meses

**Resposta:**
```json
[
  { "data": "2024-01-01", "total": 500.00 },
  { "data": "2024-01-02", "total": 750.00 }
]
```

#### Produtos Populares (ADMIN)
```http
GET /api/dashboard/produtos-populares?limit=10
Authorization: Bearer {token}
```

**Resposta:**
```json
[
  {
    "id": "uuid",
    "nome": "Produto X",
    "imagem": "url",
    "preco": 50.00,
    "categoria": "Categoria X",
    "quantidadeVendida": 100,
    "totalVendido": 5000.00
  }
]
```

## 🔐 Permissões

### ADMIN (SUPER_ADMIN, ADMIN_EMPRESA)
- ✅ Criar, editar e deletar cupons
- ✅ Listar todos os pedidos com filtros
- ✅ Atualizar status de pedidos
- ✅ Cancelar qualquer pedido
- ✅ Acessar dashboard e estatísticas
- ✅ Ver gráficos de vendas
- ✅ Ver produtos populares

### CLIENTE
- ✅ Validar cupons
- ✅ Criar avaliações de produtos
- ✅ Ver avaliações de produtos
- ✅ Deletar próprias avaliações
- ✅ Ver próprias notificações
- ✅ Marcar notificações como lidas
- ✅ Ver próprios pedidos
- ✅ Cancelar próprios pedidos (com restrições)

## 🔔 Sistema de Notificações Automáticas

O sistema cria notificações automaticamente nos seguintes eventos:

### Novo Pedido
```
Título: "Pedido Realizado"
Mensagem: "Seu pedido #12345 foi realizado com sucesso!"
Tipo: PEDIDO
```

### Mudança de Status
```
Título: "Status do Pedido"
Mensagem: "Seu pedido #12345 foi confirmado!"
Tipo: PEDIDO
```

**Mensagens por status:**
- `CONFIRMADO`: "Seu pedido foi confirmado!"
- `EM_PREPARO`: "Seu pedido está sendo preparado!"
- `SAIU_ENTREGA`: "Seu pedido saiu para entrega!"
- `ENTREGUE`: "Seu pedido foi entregue!"
- `CANCELADO`: "Seu pedido foi cancelado."

## 📊 Fluxo de Pedidos

```
PENDENTE → CONFIRMADO → EM_PREPARO → SAIU_ENTREGA → ENTREGUE
    ↓           ↓            ↓              ↓
CANCELADO   CANCELADO    CANCELADO      CANCELADO
```

**Regras:**
- Pedidos ENTREGUE não podem ser cancelados
- Pedidos CANCELADO não podem mudar de status
- Notificações são criadas automaticamente em cada mudança

## 🧪 Testes

Execute o script de testes:

```bash
cd backend
chmod +x test-fase-3.sh
./test-fase-3.sh
```

O script testa:
1. ✅ Login de admin e cliente
2. ✅ Criação e validação de cupons
3. ✅ Criação e listagem de avaliações
4. ✅ Listagem e marcação de notificações
5. ✅ Gestão completa de pedidos
6. ✅ Dashboard e estatísticas

## 🚀 Próximos Passos

### Melhorias Futuras
- [ ] Integração com API de frete real (Correios, etc)
- [ ] Sistema de chat em tempo real
- [ ] Notificações push (Firebase)
- [ ] Relatórios em PDF
- [ ] Exportação de dados (CSV, Excel)
- [ ] Sistema de cashback
- [ ] Programa de fidelidade
- [ ] Integração com gateways de pagamento

## 📝 Notas Técnicas

### Multi-tenancy
- Todos os endpoints respeitam o isolamento por `empresaId`
- Cupons são específicos por empresa
- Dashboard mostra apenas dados da empresa do admin

### Performance
- Queries otimizadas com índices
- Paginação em listagens
- Agregações eficientes no dashboard

### Segurança
- Guards de autenticação em todos os endpoints
- Validação de permissões (ADMIN vs CLIENTE)
- Validação de DTOs com class-validator
- Proteção contra acesso não autorizado

## 🐛 Troubleshooting

### Erro ao criar cupom
- Verificar se o código já existe
- Validar datas (dataInicio < dataFim)
- Verificar permissões de admin

### Erro ao validar cupom
- Verificar se o cupom está ativo
- Verificar período de validade
- Verificar valor mínimo de compra
- Verificar limite de uso

### Erro ao atualizar status de pedido
- Verificar se o pedido existe
- Verificar permissões de admin
- Verificar se o status é válido

---

**Desenvolvido para o Projeto DELIVEREI**
**FASE 3 - Gestão Completa de Pedidos e Dashboard Administrativo**
