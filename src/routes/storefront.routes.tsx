/**
 * Storefront Routes
 * 
 * Routes for customer-facing store pages
 * Includes both mock and backend-integrated versions
 */

import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

// Lazy load storefront pages
const Vitrine = lazy(() => import('../pages/storefront/Vitrine'));
const Checkout = lazy(() => import('../pages/storefront/Checkout'));
const OrderConfirmation = lazy(() => import('../pages/storefront/OrderConfirmation'));
const ClientLogin = lazy(() => import('../pages/storefront/ClientLogin'));

// Backend integrated versions
const VitrineBackend = lazy(() => import('../pages/storefront/VitrineBackend'));
const CheckoutBackend = lazy(() => import('../pages/storefront/CheckoutBackend'));
const OrderConfirmationBackend = lazy(() => import('../pages/storefront/OrderConfirmationBackend'));

export const storefrontRoutes: RouteObject[] = [
  // Mock routes (original)
  {
    path: '/storefront',
    element: <Vitrine />,
  },
  {
    path: '/storefront/checkout',
    element: <Checkout />,
  },
  {
    path: '/storefront/order-confirmation',
    element: <OrderConfirmation />,
  },
  
  // Backend integrated routes
  {
    path: '/storefront-backend',
    element: <VitrineBackend />,
  },
  {
    path: '/storefront/checkout-backend',
    element: <CheckoutBackend />,
  },
  {
    path: '/storefront/order-confirmation-backend',
    element: <OrderConfirmationBackend />,
  },
  
  // Dynamic store routes (use backend-integrated pages)
  {
    path: '/loja/:slug',
    element: <VitrineBackend />,
  },
  {
    path: '/loja/:slug/login',
    element: <ClientLogin />,
  },
  {
    path: '/loja/:slug/checkout',
    element: <CheckoutBackend />,
  },
];
