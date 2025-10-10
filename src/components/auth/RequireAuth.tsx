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

  if (!isAuth) {
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
