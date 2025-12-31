# Mudanças Implementadas

## Variáveis de Ambiente
- `VITE_SENTRY_DSN` (frontend)
- `VITE_STRIPE_PUBLIC_KEY` (frontend)
- `SENTRY_DSN` (backend)
- `ASAAS_WEBHOOK_TOKEN` (backend)

## Arquivos Alterados
- `src/main.tsx`
- `src/components/common/ErrorBoundary.tsx:125-143`
- `src/components/PagamentoPix.tsx:46-56`
- `src/pages/storefront/Checkout.tsx`
- `src/pages/assinaturas/CheckoutAssinatura.tsx:15-17`
- `src/services/backendApi.ts:392-395`
- `backend/src/main.ts`
- `backend/src/filters/all-exceptions.filter.ts`
- `backend/src/modules/carrinho/dto/checkout.dto.ts`
- `backend/src/modules/carrinho/carrinho.service.ts`
- `package.json` (scripts e devDependencies)
- `backend/package.json` (dependências)

## Testes
- Frontend: `src/__tests__/ErrorBoundary.test.tsx`, `src/__tests__/Checkout.test.tsx`
- Backend: `backend/test/webhooks.controller.spec.ts`

## Scripts
- `npm run ci:check`
- `scripts/smoke-pix.js`
