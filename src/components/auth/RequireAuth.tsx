import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { UserRole } from "../../auth/types";
import { useRoleGuard } from "../../auth/useRoleGuard";
import { useAuth } from "../../auth/AuthContext";

export const RequireAuth: React.FC<{
  children: React.ReactElement;
  role?: UserRole | UserRole[];
}> = ({ children, role }) => {
  const { isAuth, allowed } = useRoleGuard(role);
  const { user } = useAuth();
  const location = useLocation();

  const isDev = Boolean((import.meta as any)?.env?.DEV);
  const hasRealToken = Boolean(localStorage.getItem('deliverei_token') || localStorage.getItem('token'));
  const hasTenantSlug = Boolean(
    localStorage.getItem('deliverei_tenant_slug') ||
    localStorage.getItem('deliverei_store_slug') ||
    localStorage.getItem('tenantSlug')
  );
  const requiresBackendToken = Boolean(
    role && (
      Array.isArray(role)
        ? role.some((r) => r === 'empresa' || r === 'superadmin' || r === 'suporte')
        : role === 'empresa' || role === 'superadmin' || role === 'suporte'
    )
  );

  // Em desenvolvimento: só exige autenticação básica; ignora token real
  if (isDev) {
    if (!isAuth) {
      return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }
    if (role && !allowed) {
      let redirectPath = "/storefront"; // default para cliente
      if (user?.role === "superadmin") redirectPath = "/admin/super";
      else if (user?.role === "empresa") redirectPath = "/admin/store";
      else if (user?.role === "suporte") redirectPath = "/support/tickets";
      else if (user?.role === "cliente") redirectPath = "/storefront";
      return <Navigate to={redirectPath} replace />;
    }
    return children;
  }

  // Produção: aplica regra de token real para áreas administrativas
  const mustRedirectToLogin =
    !isAuth ||
    (requiresBackendToken && !hasRealToken && !hasTenantSlug);

  if (mustRedirectToLogin) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && !allowed) {
    let redirectPath = "/storefront"; // default para cliente
    if (user?.role === "superadmin") redirectPath = "/admin/super";
    else if (user?.role === "empresa") redirectPath = "/admin/store";
    else if (user?.role === "suporte") redirectPath = "/support/tickets";
    else if (user?.role === "cliente") redirectPath = "/storefront";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};
