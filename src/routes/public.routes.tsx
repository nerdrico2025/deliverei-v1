/**
 * Public Routes
 * 
 * Routes accessible without authentication
 */

import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

// Lazy load public pages
const Home = lazy(() => import('../pages/public/Home'));
const Login = lazy(() => import('../pages/public/Login'));
const LoginBackend = lazy(() => import('../pages/public/LoginBackend'));

// Subscription public pages
const Planos = lazy(() => import('../pages/assinaturas/Planos'));

export const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/login-backend',
    element: <LoginBackend />,
  },
  {
    path: '/assinaturas/planos',
    element: <Planos />,
  },
];
