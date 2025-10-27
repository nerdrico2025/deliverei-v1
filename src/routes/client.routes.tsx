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
const Dashboard = lazy(() => import('../pages/cliente/Dashboard'));
const MeusPedidos = lazy(() => import('../pages/cliente/MeusPedidos').then(m => ({ default: m.MeusPedidos })));
const MinhasAvaliacoes = lazy(() => import('../pages/cliente/MinhasAvaliacoes').then(m => ({ default: m.MinhasAvaliacoes })));

// Lazy load payment pages
const HistoricoPagamentos = lazy(() => import('../pages/pagamentos/HistoricoPagamentos').then(m => ({ default: m.HistoricoPagamentos })));
const DetalhesPagamento = lazy(() => import('../pages/pagamentos/DetalhesPagamento').then(m => ({ default: m.DetalhesPagamento })));

export const clientRoutes: RouteObject[] = [
  {
    path: '/dashboard',
    element: (
      <RequireAuth role="cliente">
        <Dashboard />
      </RequireAuth>
    ),
  },
  {
    path: '/meus-pedidos',
    element: (
      <RequireAuth role="cliente">
        <MeusPedidos />
      </RequireAuth>
    ),
  },
  {
    path: '/minhas-avaliacoes',
    element: (
      <RequireAuth role="cliente">
        <MinhasAvaliacoes />
      </RequireAuth>
    ),
  },
  {
    path: '/pagamentos',
    element: (
      <RequireAuth role="cliente">
        <HistoricoPagamentos />
      </RequireAuth>
    ),
  },
  {
    path: '/pagamentos/:id',
    element: (
      <RequireAuth role="cliente">
        <DetalhesPagamento />
      </RequireAuth>
    ),
  },
];
