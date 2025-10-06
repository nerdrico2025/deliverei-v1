import React from "react";
import { Navigate } from "react-router-dom";

type Role = "empresa" | "superadmin" | "suporte" | "cliente";

interface AuthContextType {
  isAuthenticated: boolean;
  role: Role | null;
  user: { name: string; email: string } | null;
}

const AuthContext = React.createContext<AuthContextType>({
  isAuthenticated: false,
  role: null,
  user: null,
});

export const useAuth = () => React.useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth] = React.useState<AuthContextType>({
    isAuthenticated: true,
    role: "empresa",
    user: { name: "João Silva", email: "joao@example.com" },
  });

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const RequireAuth: React.FC<{
  children: React.ReactElement;
  role?: Role;
}> = ({ children, role }) => {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && auth.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};
