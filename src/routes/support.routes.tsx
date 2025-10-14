/**
 * Support Routes
 * 
 * Routes for support team members
 * Requires authentication with 'suporte' role
 */

import { lazy } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import { RequireAuth } from '../components/auth/RequireAuth';

// Lazy load support pages
const SupportLayout = lazy(() => import('../pages/support/Layout'));
const SupportTickets = lazy(() => import('../pages/support/Tickets'));

export const supportRoutes: RouteObject = {
  path: '/support',
  element: (
    <RequireAuth role="suporte">
      <SupportLayout />
    </RequireAuth>
  ),
  children: [
    {
      index: true,
      element: <Navigate to="tickets" replace />,
    },
    {
      path: 'tickets',
      element: <SupportTickets />,
    },
  ],
};
