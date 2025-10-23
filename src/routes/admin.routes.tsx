/**
 * Admin Routes (Empresa)
 * 
 * Routes for company administrators
 * Requires authentication with 'empresa' role
 */

import { lazy } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import { RequireAuth } from '../components/auth/RequireAuth';

// Lazy load admin pages
const StoreDashboard = lazy(() => import('../pages/admin/store/Dashboard'));
const Products = lazy(() => import('../pages/admin/store/Products'));
const Orders = lazy(() => import('../pages/admin/store/Orders'));
const Clients = lazy(() => import('../pages/admin/store/Clients'));
const StoreSettings = lazy(() => import('../pages/admin/store/Settings'));
const ClientEdit = lazy(() => import('../pages/admin/store/ClientEdit'));
const ProductEdit = lazy(() => import('../pages/admin/store/ProductEdit'));

// New admin layout and pages (FASE 3)
const AdminLayout = lazy(() => import('../layouts/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard').then(m => ({ default: m.Dashboard })));
const AdminPedidos = lazy(() => import('../pages/admin/Pedidos').then(m => ({ default: m.Pedidos })));
const AdminCupons = lazy(() => import('../pages/admin/Cupons').then(m => ({ default: m.Cupons })));

// FASE 4 - WhatsApp and Webhooks
const ConfiguracaoWhatsApp = lazy(() => import('../pages/admin/ConfiguracaoWhatsApp'));
const Webhooks = lazy(() => import('../pages/admin/Webhooks'));

// FASE 4 - Subscription pages
const CheckoutAssinatura = lazy(() => import('../pages/assinaturas/CheckoutAssinatura'));
const MinhaAssinatura = lazy(() => import('../pages/assinaturas/MinhaAssinatura'));

/**
 * Store Admin Routes (legacy structure)
 */
export const storeAdminRoutes: RouteObject[] = [
  {
    path: '/admin/store',
    element: (
      <RequireAuth role="empresa">
        <StoreDashboard />
      </RequireAuth>
    ),
  },
  {
    path: '/admin/store/products',
    element: (
      <RequireAuth role="empresa">
        <Products />
      </RequireAuth>
    ),
  },
  {
    path: '/admin/store/orders',
    element: (
      <RequireAuth role="empresa">
        <Orders />
      </RequireAuth>
    ),
  },
  {
    path: '/admin/store/clients',
    element: (
      <RequireAuth role="empresa">
        <Clients />
      </RequireAuth>
    ),
  },
  {
    path: '/admin/store/settings',
    element: (
      <RequireAuth role="empresa">
        <StoreSettings />
      </RequireAuth>
    ),
  },
  {
    path: '/admin/store/clients/:id/edit',
    element: (
      <RequireAuth role="empresa">
        <ClientEdit />
      </RequireAuth>
    ),
  },
  {
    path: '/admin/store/products/:id/edit',
    element: (
      <RequireAuth role="empresa">
        <ProductEdit />
      </RequireAuth>
    ),
  },
];

/**
 * New Admin Routes with Layout (FASE 3)
 */
export const adminLayoutRoutes: RouteObject = {
  path: '/admin',
  element: (
    <RequireAuth role="empresa">
      <AdminLayout />
    </RequireAuth>
  ),
  children: [
    {
      index: true,
      element: <Navigate to="dashboard" replace />,
    },
    {
      path: 'dashboard',
      element: <AdminDashboard />,
    },
    {
      path: 'pedidos',
      element: <AdminPedidos />,
    },
    {
      path: 'cupons',
      element: <AdminCupons />,
    },
  ],
};

/**
 * WhatsApp and Webhooks Routes (FASE 4)
 */
export const adminFeatureRoutes: RouteObject[] = [
  {
    path: '/admin/whatsapp',
    element: (
      <RequireAuth role="empresa">
        <ConfiguracaoWhatsApp />
      </RequireAuth>
    ),
  },
  {
    path: '/admin/webhooks',
    element: (
      <RequireAuth role="empresa">
        <Webhooks />
      </RequireAuth>
    ),
  },
];

/**
 * Subscription Routes (FASE 4)
 */
export const subscriptionRoutes: RouteObject[] = [
  {
    path: '/assinaturas/checkout/:planoId',
    element: (
      <RequireAuth role="empresa">
        <CheckoutAssinatura />
      </RequireAuth>
    ),
  },
  {
    path: '/assinaturas/minha',
    element: (
      <RequireAuth role="empresa">
        <MinhaAssinatura />
      </RequireAuth>
    ),
  },
];
