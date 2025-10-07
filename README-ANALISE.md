# DELIVEREI v1 - Análise do Frontend

## 📋 Visão Geral

Sistema multi-tenant de delivery desenvolvido em React + TypeScript + Vite, com foco em experiência de usuário otimizada para e-commerce de alimentos.

**Repositório:** https://github.com/nerdrico2025/deliverei-v1.git  
**Branch padrão:** main  
**Última atualização:** 2025-10-07

---

## 🏗️ Estrutura do Projeto

```
deliverei-v1/
├── src/
│   ├── App.tsx                      # Componente raiz da aplicação
│   ├── main.tsx                     # Entry point
│   ├── index.css                    # Estilos globais
│   ├── theme.ts                     # Tokens de tema
│   │
│   ├── auth/                        # Autenticação e autorização
│   │   ├── AuthContext.tsx          # Context de autenticação
│   │   ├── types.ts                 # Tipos de roles (empresa, superadmin, cliente)
│   │   └── useRoleGuard.ts          # Hook para proteção de rotas
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   └── RequireAuth.tsx      # HOC para rotas protegidas
│   │   ├── commerce/                # Componentes de e-commerce
│   │   │   ├── CartDrawer.tsx       # Drawer do carrinho (lateral)
│   │   │   ├── ProductCard.tsx      # Card de produto
│   │   │   └── UpsellStrip.tsx      # Strip de upsell/cross-sell
│   │   ├── common/                  # Componentes reutilizáveis
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Input.tsx
│   │   ├── layout/                  # Layouts e navegação
│   │   │   ├── DashboardShell.tsx
│   │   │   ├── PublicHeader.tsx
│   │   │   ├── StoreSidebar.tsx
│   │   │   ├── StoreTopbarActions.tsx
│   │   │   ├── StorefrontHeader.tsx
│   │   │   ├── SuperAdminSidebar.tsx
│   │   │   └── Topbar.tsx
│   │   └── system/
│   │       └── ImpersonationBanner.tsx
│   │
│   ├── hooks/
│   │   └── useCart.ts               # Hook principal do carrinho
│   │
│   ├── pages/
│   │   ├── public/                  # Páginas públicas
│   │   │   ├── Home.tsx
│   │   │   └── Login.tsx
│   │   ├── storefront/              # Vitrine e checkout
│   │   │   ├── Vitrine.tsx          # Listagem de produtos (infinite scroll)
│   │   │   ├── Checkout.tsx         # Página de checkout
│   │   │   └── OrderConfirmation.tsx
│   │   ├── admin/
│   │   │   ├── store/               # Admin da loja (empresa)
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Products.tsx
│   │   │   │   ├── ProductEdit.tsx
│   │   │   │   ├── Orders.tsx
│   │   │   │   ├── Clients.tsx
│   │   │   │   ├── ClientEdit.tsx
│   │   │   │   └── Settings.tsx
│   │   │   └── super/               # Admin superadmin
│   │   │       ├── Dashboard.tsx
│   │   │       ├── Companies.tsx
│   │   │       ├── Subscriptions.tsx
│   │   │       ├── Tickets.tsx
│   │   │       └── Settings.tsx
│   │   └── support/                 # Área de suporte
│   │       ├── Layout.tsx
│   │       └── Tickets.tsx
│   │
│   ├── routes/
│   │   └── AppRouter.tsx            # Configuração de rotas
│   │
│   ├── services/
│   │   └── api.ts                   # Camada de API (mock atual)
│   │
│   ├── ui/
│   │   ├── feedback/
│   │   │   └── ToastContext.tsx
│   │   └── theme/
│   │       └── tokens.ts
│   │
│   └── utils/
│       └── safeStorage.ts           # Wrapper seguro para localStorage
│
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 🎯 Funcionalidades Principais Implementadas

### 1. **Vitrine de Produtos (Storefront)**
- ✅ Infinite scroll com IntersectionObserver
- ✅ Paginação manual alternativa
- ✅ Busca e filtros (UI pronta, backend pendente)
- ✅ Cards de produto com badges (lowStock, outOfStock)
- ✅ Adicionar ao carrinho direto do card

### 2. **Carrinho de Compras (useCart Hook)**
- ✅ Gerenciamento de estado unificado
- ✅ Persistência em localStorage
- ✅ Operações: add, updateQty, remove, clear
- ✅ Cálculos: count, subtotal
- ✅ Tracking de último item adicionado (para upsell)

### 3. **CartDrawer**
- ✅ Drawer lateral responsivo
- ✅ Controle de quantidade (+/-)
- ✅ Upsell/Cross-sell integrado
- ✅ Navegação para checkout
- ✅ Acessibilidade (ARIA, keyboard navigation)

### 4. **Checkout**
- ✅ Formulário de endereço
- ✅ Resumo do pedido
- ✅ Upsell strip no resumo
- ✅ Integração com Asaas (placeholder)
- ✅ Campo de cupom de desconto

### 5. **Admin - Loja (Empresa)**
- ✅ Dashboard
- ✅ Gestão de produtos (CRUD)
- ✅ Gestão de pedidos (visualização, mudança de status)
- ✅ Gestão de clientes
- ✅ Configurações

### 6. **Admin - SuperAdmin**
- ✅ Dashboard
- ✅ Gestão de empresas
- ✅ Gestão de assinaturas
- ✅ Sistema de tickets
- ✅ Configurações

### 7. **Autenticação e Autorização**
- ✅ Context de autenticação
- ✅ Proteção de rotas por role (empresa, superadmin, cliente, suporte)
- ✅ Login/Logout

---

## 🔌 Endpoints de API Esperados pelo Frontend

> **IMPORTANTE:** Atualmente, todos os endpoints em `src/services/api.ts` são **mocks** com delays simulados. O backend real precisa implementar estes endpoints.

### **Base URL Esperada**
```
/api/v1
```

---

### **1. Autenticação**

#### `POST /api/v1/auth/login`
**Payload:**
```json
{
  "email": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "token": "string (JWT)",
  "role": "empresa" | "superadmin" | "cliente" | "suporte"
}
```

#### `POST /api/v1/auth/signup`
**Payload:**
```json
{
  "email": "string",
  "password": "string",
  "name": "string"
}
```
**Response:**
```json
{
  "success": true,
  "userId": "string"
}
```

#### `POST /api/v1/auth/logout`
**Response:**
```json
{
  "success": true
}
```

---

### **2. Produtos**

#### `GET /api/v1/products`
**Query Params:**
- `empresaId`: string (ID da empresa/loja)
- `page`: number (para paginação)
- `pageSize`: number (itens por página)
- `search`: string (opcional, busca)
- `category`: string (opcional, filtro)

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "title": "string",
      "price": number,
      "image": "string (URL)",
      "description": "string",
      "category": "string",
      "lowStock": boolean,
      "outOfStock": boolean,
      "stock": number
    }
  ],
  "total": number,
  "page": number,
  "pageSize": number
}
```

#### `POST /api/v1/products`
**Payload:**
```json
{
  "empresaId": "string",
  "title": "string",
  "price": number,
  "image": "string",
  "description": "string",
  "category": "string",
  "stock": number
}
```
**Response:**
```json
{
  "id": "string",
  "success": true
}
```

#### `PUT /api/v1/products/:id`
**Payload:** (mesmos campos do POST)
**Response:**
```json
{
  "success": true
}
```

#### `DELETE /api/v1/products/:id`
**Response:**
```json
{
  "success": true
}
```

---

### **3. Pedidos (Orders)**

#### `GET /api/v1/orders`
**Query Params:**
- `empresaId`: string
- `status`: string (opcional: "recebido" | "aprovado" | "em_preparo" | "saiu_entrega" | "entregue" | "cancelado")
- `page`: number
- `pageSize`: number

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "cliente": "string",
      "clienteId": "string",
      "total": number,
      "pagamento": "pendente" | "aprovado" | "recusado" | "estornado",
      "status": "recebido" | "aprovado" | "em_preparo" | "saiu_entrega" | "entregue" | "cancelado",
      "criadoEm": "string (ISO date)",
      "itens": [
        {
          "productId": "string",
          "nome": "string",
          "qtd": number,
          "preco": number
        }
      ],
      "endereco": {
        "cep": "string",
        "rua": "string",
        "numero": "string",
        "bairro": "string",
        "cidade": "string",
        "uf": "string"
      }
    }
  ],
  "total": number
}
```

#### `GET /api/v1/orders/:orderId`
**Response:** (mesmo formato do item acima)

#### `PUT /api/v1/orders/:orderId/status`
**Payload:**
```json
{
  "status": "recebido" | "aprovado" | "em_preparo" | "saiu_entrega" | "entregue" | "cancelado"
}
```
**Response:**
```json
{
  "ok": true
}
```

---

### **4. Checkout**

#### `POST /api/v1/checkout/create-order`
**Payload:**
```json
{
  "empresaId": "string",
  "clienteId": "string (opcional se não autenticado)",
  "clienteNome": "string",
  "clienteEmail": "string",
  "clienteTelefone": "string",
  "itens": [
    {
      "productId": "string",
      "nome": "string",
      "qtd": number,
      "preco": number
    }
  ],
  "endereco": {
    "cep": "string",
    "rua": "string",
    "numero": "string",
    "bairro": "string",
    "cidade": "string",
    "uf": "string"
  },
  "pagamento": {
    "metodo": "pix" | "cartao" | "boleto",
    "dadosCartao": {
      "numero": "string",
      "nome": "string",
      "validade": "string",
      "cvv": "string"
    }
  },
  "cupom": "string (opcional)"
}
```
**Response:**
```json
{
  "status": "aprovado" | "pendente" | "recusado",
  "orderId": "string",
  "paymentUrl": "string (para PIX/Boleto)",
  "qrCode": "string (para PIX)"
}
```

---

### **5. Clientes**

#### `GET /api/v1/clients`
**Query Params:**
- `empresaId`: string
- `search`: string (opcional)
- `page`: number
- `pageSize`: number

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "nome": "string",
      "email": "string",
      "telefone": "string",
      "cpf": "string",
      "criadoEm": "string"
    }
  ],
  "total": number
}
```

#### `POST /api/v1/clients`
**Payload:**
```json
{
  "empresaId": "string",
  "nome": "string",
  "email": "string",
  "telefone": "string",
  "cpf": "string"
}
```

#### `PUT /api/v1/clients/:id`
**Payload:** (mesmos campos do POST)

---

### **6. Empresas (SuperAdmin)**

#### `GET /api/v1/companies`
**Query Params:**
- `search`: string (opcional)
- `status`: string (opcional: "ativa" | "inativa" | "suspensa")
- `page`: number
- `pageSize`: number

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "nome": "string",
      "slug": "string",
      "email": "string",
      "telefone": "string",
      "cnpj": "string",
      "status": "ativa" | "inativa" | "suspensa",
      "plano": "string",
      "criadoEm": "string"
    }
  ],
  "total": number
}
```

#### `GET /api/v1/companies/:id`
**Response:** (mesmo formato do item acima)

#### `POST /api/v1/companies`
**Payload:**
```json
{
  "nome": "string",
  "slug": "string",
  "email": "string",
  "telefone": "string",
  "cnpj": "string",
  "plano": "string"
}
```

#### `PUT /api/v1/companies/:id`
**Payload:** (mesmos campos do POST + status)

---

### **7. Assinaturas (SuperAdmin)**

#### `GET /api/v1/subscriptions`
**Query Params:**
- `status`: string (opcional: "ativa" | "cancelada" | "suspensa")
- `page`: number
- `pageSize`: number

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "empresaId": "string",
      "empresaNome": "string",
      "plano": "string",
      "valor": number,
      "status": "ativa" | "cancelada" | "suspensa",
      "proximaCobranca": "string (ISO date)",
      "criadoEm": "string"
    }
  ],
  "total": number
}
```

#### `PUT /api/v1/subscriptions/:id`
**Payload:**
```json
{
  "status": "ativa" | "cancelada" | "suspensa",
  "plano": "string (opcional)"
}
```

---

### **8. Tickets (Suporte)**

#### `GET /api/v1/tickets`
**Query Params:**
- `status`: string (opcional: "aberto" | "em_andamento" | "resolvido" | "fechado")
- `prioridade`: string (opcional: "baixa" | "media" | "alta" | "urgente")
- `page`: number
- `pageSize`: number

**Response:**
```json
{
  "items": [
    {
      "id": "string",
      "empresaId": "string",
      "empresaNome": "string",
      "titulo": "string",
      "descricao": "string",
      "status": "aberto" | "em_andamento" | "resolvido" | "fechado",
      "prioridade": "baixa" | "media" | "alta" | "urgente",
      "criadoEm": "string",
      "atualizadoEm": "string",
      "mensagens": [
        {
          "id": "string",
          "autor": "string",
          "autorRole": "string",
          "mensagem": "string",
          "criadoEm": "string"
        }
      ]
    }
  ],
  "total": number
}
```

#### `GET /api/v1/tickets/:id`
**Response:** (mesmo formato do item acima)

#### `POST /api/v1/tickets`
**Payload:**
```json
{
  "empresaId": "string",
  "titulo": "string",
  "descricao": "string",
  "prioridade": "baixa" | "media" | "alta" | "urgente"
}
```

#### `PUT /api/v1/tickets/:id`
**Payload:**
```json
{
  "status": "aberto" | "em_andamento" | "resolvido" | "fechado",
  "prioridade": "baixa" | "media" | "alta" | "urgente"
}
```

#### `POST /api/v1/tickets/:id/messages`
**Payload:**
```json
{
  "mensagem": "string"
}
```

---

## 🛠️ Stack Tecnológica

### **Frontend**
- **React** 18.3.1
- **TypeScript** 5.5.3
- **Vite** 5.4.2 (build tool)
- **React Router DOM** 7.9.3 (roteamento)
- **Tailwind CSS** 3.4.1 (estilização)
- **Lucide React** 0.344.0 (ícones)
- **Supabase JS** 2.57.4 (cliente - não utilizado ainda)

### **Ferramentas de Desenvolvimento**
- ESLint 9.9.1
- PostCSS 8.4.35
- Autoprefixer 10.4.18

---

## 🎨 Design System

### **Cores Principais**
```javascript
// Definidas em src/theme.ts e tailwind.config.js
Primary: #D22630 (vermelho)
Secondary: #FFC107 (amarelo)
Background: #F9FAFB
Text: #1F2937
Text Secondary: #4B5563
Border: #E5E7EB
```

### **Componentes Reutilizáveis**
- `Button` (variants: primary, secondary, ghost)
- `Input`
- `Card`
- `Badge`

---

## 🔐 Autenticação e Roles

### **Roles Disponíveis**
1. **empresa** - Acesso ao admin da loja
2. **superadmin** - Acesso total ao sistema
3. **cliente** - Acesso à vitrine e checkout
4. **suporte** - Acesso ao sistema de tickets

### **Proteção de Rotas**
Implementada via `RequireAuth` component que verifica o role do usuário antes de renderizar a rota.

---

## 📦 Persistência Local

### **localStorage Keys**
- `deliverei:cart:v1` - Itens do carrinho
- `deliverei:lastAddedId:v1` - ID do último produto adicionado (para upsell)

### **Wrapper Seguro**
Utiliza `safeStorage.ts` para evitar erros em ambientes sem localStorage (SSR, testes).

---

## 🚀 Próximos Passos (Backend)

### **Prioridade Alta**
1. ✅ Implementar endpoints de autenticação (login, signup, logout)
2. ✅ Implementar endpoints de produtos (GET com paginação)
3. ✅ Implementar endpoint de checkout (POST /checkout/create-order)
4. ✅ Integração com gateway de pagamento (Asaas)

### **Prioridade Média**
5. ✅ Implementar endpoints de pedidos (GET, PUT status)
6. ✅ Implementar endpoints de clientes (CRUD)
7. ✅ Sistema de busca e filtros de produtos

### **Prioridade Baixa**
8. ✅ Endpoints de empresas (SuperAdmin)
9. ✅ Endpoints de assinaturas (SuperAdmin)
10. ✅ Sistema de tickets (Suporte)

---

## 📝 Observações Importantes

### **Multi-tenancy**
- O sistema suporta múltiplas lojas através do parâmetro `empresaId`
- Cada loja tem seu próprio slug: `/loja/:slug`
- Produtos, pedidos e clientes são isolados por empresa

### **Infinite Scroll**
- Implementado com IntersectionObserver
- Carrega mais produtos quando o usuário chega perto do fim da página
- Alternativa de paginação manual disponível

### **Upsell/Cross-sell**
- Produtos sugeridos aparecem no CartDrawer e no Checkout
- Baseado no último produto adicionado
- Filtra produtos já no carrinho

### **Responsividade**
- Design mobile-first
- Breakpoints: sm (640px), md (768px), lg (1024px)
- CartDrawer ocupa tela inteira em mobile

### **Acessibilidade**
- ARIA labels em componentes interativos
- Navegação por teclado (Escape fecha modais/drawers)
- Focus management

---

## 🐛 Issues Conhecidos

1. **API Mock** - Todos os endpoints são simulados, sem persistência real
2. **Integração Asaas** - Placeholder no checkout, precisa implementação real
3. **Upload de Imagens** - Não implementado, URLs são inseridas manualmente
4. **Validação de Formulários** - Básica, precisa melhorias
5. **Tratamento de Erros** - Não há feedback visual de erros de API

---

## 📚 Documentação Adicional

### **Como Rodar o Projeto**
```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Type checking
npm run typecheck

# Lint
npm run lint
```

### **Estrutura de Rotas**
```
/ - Home pública
/login - Login
/storefront - Vitrine (loja padrão)
/storefront/checkout - Checkout
/storefront/order-confirmation - Confirmação de pedido
/loja/:slug - Vitrine de loja específica
/loja/:slug/checkout - Checkout de loja específica

/admin/store/* - Admin da loja (role: empresa)
/admin/super/* - Admin superadmin (role: superadmin)
/support/* - Área de suporte (role: suporte)
```

---

## 🤝 Contribuindo

Para contribuir com o projeto:
1. Clone o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add: nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Projeto privado - Todos os direitos reservados.

---

**Última atualização:** 2025-10-07  
**Versão do documento:** 1.0  
**Autor:** Análise automatizada do repositório
