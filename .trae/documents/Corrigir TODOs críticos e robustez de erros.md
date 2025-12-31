## Objetivo
- Resolver TODOs críticos no frontend e fortalecer tratamento de erros no backend.
- Implementar verificação real de pagamento (PIX) e finalizar criação de pedidos no checkout.
- Padronizar configuração de chaves (Stripe) e adicionar testes básicos.

## Correções Prioritárias
- Logging de erros: integrar serviço de observabilidade no `src/components/common/ErrorBoundary.tsx:141` e backend.
- Verificação PIX: implementar confirmação real (webhook no backend + polling no frontend) em `src/components/PagamentoPix.tsx:51`.
- Checkout de pedidos: completar chamada de API de criação de pedido em `src/pages/storefront/Checkout.tsx:147`.
- Stripe: substituir chave hardcoded por env em `src/pages/assinaturas/CheckoutAssinatura.tsx:15`.
- Tratamento de erros backend: revisar `backend/src/filters/all-exceptions.filter.ts` para mapear erros e respostas consistentes.

## Implementação Técnica
- Error logging:
  - Adicionar `@sentry/react` e `@sentry/node` (ou equivalente) com DSN via env.
  - Inicializar no app e backend; sanitizar payloads via `beforeSend` e whitelists.
  - Enviar erros capturados pelo `ErrorBoundary` e pontos críticos (ex.: checkout).
- PIX:
  - Backend: criar endpoint de webhook (ex.: `POST /payments/pix/webhook`) para provider usado; validar assinatura.
  - Persistir status do pagamento no pedido; emitir eventos.
  - Frontend: polling com timeout/backoff para status do pedido; UI de estados (pendente, confirmado, expirado).
- Checkout:
  - Definir DTO `CreateOrder` e validar no backend; endpoint `POST /orders` com retorno do `orderId`.
  - Frontend: substituir TODO por chamada Axios tipada; tratar erros e exibir toasts.
- Stripe:
  - Usar `VITE_STRIPE_PUBLIC_KEY` no frontend e `.env`/`.env.production`.
  - Carregar via `import.meta.env` e remover chave in-line.
- Backend erros:
  - Expandir mapeamento Prisma (P2002, P2025 etc.), adicionar correlation-id em respostas.
  - Logger estruturado e níveis por ambiente; mascarar dados sensíveis.

## Testes e Validação
- Backend: adicionar Jest com testes de `orders` e webhook PIX (mocks do provider).
- Frontend: adicionar Vitest/RTL com testes de `ErrorBoundary` e fluxos de checkout.
- Smoke manual: fluxo completo (criar pedido → iniciar PIX → confirmar → exibir status).
- Lint e typecheck nos pipelines; garantir que TODOs citados estejam resolvidos.

## Entregáveis
- Diff com mudanças, instruções de env (DSN Sentry, Stripe key), e relatório de testes.
- Lista de arquivos tocados com referências: `ErrorBoundary.tsx:141`, `PagamentoPix.tsx:51`, `Checkout.tsx:147`, `CheckoutAssinatura.tsx:15`, filtros do backend.
