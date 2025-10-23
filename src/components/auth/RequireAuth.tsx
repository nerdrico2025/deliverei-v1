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

  // Extra guard: admin areas must use real backend token
  const hasRealToken = Boolean(localStorage.getItem('deliverei_token') || localStorage.getItem('token'));
  const requiresBackendToken = Boolean(
    role && (
      Array.isArray(role)
        ? role.some((r) => r === 'empresa' || r === 'superadmin' || r === 'suporte')
        : role === 'empresa' || role === 'superadmin' || role === 'suporte'
    )
  );

  if (!isAuth || (requiresBackendToken && !hasRealToken)) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && !allowed) {
    // Instead of redirecting to home, redirect to the user's appropriate dashboard
    // This prevents the intermediate redirect issue
    let redirectPath = "/storefront"; // default for cliente
    
    if (user?.role === "superadmin") {
      redirectPath = "/admin/super";
    } else if (user?.role === "empresa") {
      redirectPath = "/admin/store";
    } else if (user?.role === "suporte") {
      redirectPath = "/support/tickets";
    } else if (user?.role === "cliente") {
      redirectPath = "/storefront";
    }
    
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};
