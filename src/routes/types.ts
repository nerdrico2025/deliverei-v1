/**
 * Route Type Definitions
 * 
 * Defines types and interfaces for route configurations
 * to ensure type safety across the routing system.
 */

export type UserRole = 'empresa' | 'superadmin' | 'suporte' | 'cliente';

export interface RouteConfig {
  path: string;
  element: React.LazyExoticComponent<React.ComponentType<any>>;
  requireAuth?: boolean;
  requiredRole?: UserRole;
  children?: RouteConfig[];
}

export interface RouteModule {
  public: RouteConfig[];
  admin: RouteConfig[];
  storefront: RouteConfig[];
  client: RouteConfig[];
  super: RouteConfig[];
  support: RouteConfig[];
}
