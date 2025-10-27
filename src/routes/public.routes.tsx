/**
 * Public Routes
 * 
 * Routes accessible without authentication
 */

import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

// Lazy load public pages
const Home = lazy(() => import('../pages/public/Home'));
const LoginBackend = lazy(() => import('../pages/public/LoginBackend'));
const Logout = lazy(() => import('../pages/public/Logout'));
const CadastroEmpresa = lazy(() => import('../pages/public/CadastroEmpresa'));

// Subscription public pages
const Planos = lazy(() => import('../pages/assinaturas/Planos').then(m => ({ default: m.Planos })));

export const publicRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <LoginBackend />,
  },
  {
    path: '/logout',
    element: <Logout />,
  },
  {
    path: '/cadastro-empresa',
    element: <CadastroEmpresa />,
  },
  {
    path: '/assinaturas/planos',
    element: <Planos />,
  },
];
