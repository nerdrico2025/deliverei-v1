## Objetivo
- Subir backend e frontend localmente e abrir a URL de preview para navegação.

## Passos
- Instalar dependências no frontend (raiz) e backend.
- Iniciar backend NestJS em `http://localhost:3002/api`.
- Iniciar frontend Vite em `http://localhost:5173/`.
- Abrir o preview usando a URL fornecida pelo dev server.

## Pré-requisitos de ambiente
- Frontend: `VITE_API_URL` (opcional; há fallback `http://localhost:3002/api`), `VITE_SENTRY_DSN` (opcional), `VITE_STRIPE_PUBLIC_KEY` (opcional para página de assinaturas).
- Backend: `SENTRY_DSN` (opcional), `ASAAS_WEBHOOK_TOKEN` (opcional para webhooks).

## Validações
- Acessar home e páginas principais (loja/checkout/assinaturas).
- Se o backend ocupar a porta, o bootstrap escolhe porta alternativa automaticamente.
- Em caso de falha do backend, usar `mock:api` como fallback temporário.