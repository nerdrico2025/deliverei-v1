/**
 * App Router
 * 
 * Main routing configuration with lazy loading support
 * Routes are organized by feature/module for better maintainability
 * 
 * @refactored Phase 2 - Simplified structure with lazy loading
 */

import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import organized route configurations
import { publicRoutes } from './public.routes';
import { storefrontRoutes } from './storefront.routes';
import {
  storeAdminRoutes,
  adminLayoutRoutes,
  // adminFeatureRoutes, // Temporarily disabled to avoid runtime import error
  subscriptionRoutes,
} from './admin.routes';
import { clientRoutes } from './client.routes';
import { superAdminRoutes } from './super.routes';
import { supportRoutes } from './support.routes';

// Loading fallback component
const LoadingFallback = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontSize: '1.2rem',
      color: '#666',
    }}
  >
    Carregando...
  </div>
);

/**
 * Renders a route configuration object
 */
const renderRoutes = (routes: any[]) => {
  return routes.map((route, index) => {
    const { path, element, children, ...rest } = route;
    
    if (children) {
      return (
        <Route key={path || index} path={path} element={element} {...rest}>
          {children.map((child: any, childIndex: number) => (
            <Route
              key={child.path || childIndex}
              index={child.index}
              path={child.path}
              element={child.element}
            />
          ))}
        </Route>
      );
    }
    
    return <Route key={path || index} path={path} element={element} {...rest} />;
  });
};

/**
 * Main App Router
 * 
 * All routes are lazy-loaded for optimal performance
 * and wrapped in Suspense for loading states
 */
export default function AppRouter() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Routes */}
        {renderRoutes(publicRoutes)}
        
        {/* Storefront Routes */}
        {renderRoutes(storefrontRoutes)}
        
        {/* Admin Routes (Store - Legacy) */}
        {renderRoutes(storeAdminRoutes)}
        
        {/* Admin Routes (New Layout) */}
        <Route path={adminLayoutRoutes.path} element={adminLayoutRoutes.element}>
          {adminLayoutRoutes.children?.map((child, index) => (
            <Route
              key={child.path || index}
              index={child.index}
              path={child.path}
              element={child.element}
            />
          ))}
        </Route>
        
        {/* Admin Feature Routes (WhatsApp, Webhooks) */}
        {/* {renderRoutes(adminFeatureRoutes)} */}
        
        {/* Subscription Routes */}
        {renderRoutes(subscriptionRoutes)}
        
        {/* Client Routes */}
        {renderRoutes(clientRoutes)}
        
        {/* Super Admin Routes */}
        {renderRoutes(superAdminRoutes)}
        
        {/* Support Routes */}
        <Route path={supportRoutes.path} element={supportRoutes.element}>
          {supportRoutes.children?.map((child, index) => (
            <Route
              key={child.path || index}
              index={child.index}
              path={child.path}
              element={child.element}
            />
          ))}
        </Route>
        
        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
