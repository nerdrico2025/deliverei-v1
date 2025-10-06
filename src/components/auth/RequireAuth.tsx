import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { UserRole } from "../../auth/types";
import { useRoleGuard } from "../../auth/useRoleGuard";

export const RequireAuth: React.FC<{
  children: React.ReactElement;
  role?: UserRole | UserRole[];
}> = ({ children, role }) => {
  const { isAuth, allowed } = useRoleGuard(role);
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (role && !allowed) {
    return <Navigate to="/" replace />;
  }

  return children;
};
