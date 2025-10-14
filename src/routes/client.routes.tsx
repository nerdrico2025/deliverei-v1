/**
 * Client Routes
 * 
 * Routes for authenticated clients
 * Requires basic authentication (any authenticated user)
 */

import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { RequireAuth } from '../components/auth/RequireAuth';

// Lazy load client pages (FASE 3)
const MeusPedidos = lazy(() => import('../pages/cliente/MeusPedidos').then(m => ({ default: m.MeusPedidos })));
const MinhasAvaliacoes = lazy(() => import('../pages/cliente/MinhasAvaliacoes').then(m => ({ default: m.MinhasAvaliacoes })));

// FASE 4 - Payment pages
const HistoricoPagamentos = lazy(() => import('../pages/pagamentos/HistoricoPagamentos'));
const DetalhesPagamento = lazy(() => import('../pages/pagamentos/DetalhesPagamento'));

export const clientRoutes: RouteObject[] = [
  {
    path: '/meus-pedidos',
    element: (
      <RequireAuth>
        <MeusPedidos />
      </RequireAuth>
    ),
  },
  {
    path: '/minhas-avaliacoes',
    element: (
      <RequireAuth>
        <MinhasAvaliacoes />
      </RequireAuth>
    ),
  },
  {
    path: '/pagamentos',
    element: (
      <RequireAuth>
        <HistoricoPagamentos />
      </RequireAuth>
    ),
  },
  {
    path: '/pagamentos/:id',
    element: (
      <RequireAuth>
        <DetalhesPagamento />
      </RequireAuth>
    ),
  },
];
