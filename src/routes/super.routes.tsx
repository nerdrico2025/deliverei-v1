/**
 * Super Admin Routes
 * 
 * Routes for super administrators
 * Requires authentication with 'superadmin' role
 */

import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import { RequireAuth } from '../components/auth/RequireAuth';

// Lazy load super admin pages
const SuperDashboard = lazy(() => import('../pages/admin/super/Dashboard'));
const Companies = lazy(() => import('../pages/admin/super/Companies'));
const Subscriptions = lazy(() => import('../pages/admin/super/Subscriptions'));
const Tickets = lazy(() => import('../pages/admin/super/Tickets'));
const SuperSettings = lazy(() => import('../pages/admin/super/Settings'));

export const superAdminRoutes: RouteObject[] = [
  {
    path: '/admin/super',
    element: (
      <RequireAuth role="superadmin">
        <SuperDashboard />
      </RequireAuth>
    ),
  },
  {
    path: '/admin/super/companies',
    element: (
      <RequireAuth role="superadmin">
        <Companies />
      </RequireAuth>
    ),
  },
  {
    path: '/admin/super/subscriptions',
    element: (
      <RequireAuth role="superadmin">
        <Subscriptions />
      </RequireAuth>
    ),
  },
  {
    path: '/admin/super/tickets',
    element: (
      <RequireAuth role="superadmin">
        <Tickets />
      </RequireAuth>
    ),
  },
  {
    path: '/admin/super/settings',
    element: (
      <RequireAuth role="superadmin">
        <SuperSettings />
      </RequireAuth>
    ),
  },
];
