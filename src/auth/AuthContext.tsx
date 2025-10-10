import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthUser, UserRole } from "./types";

type AuthState = {
  isAuth: boolean;
  user: AuthUser | null;
  token: string | null;
};

type ImpersonationState = {
  active: boolean;
  originalUser: AuthUser | null;
};

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setRole: (role: UserRole) => void;
  impersonate: (empresaId: string, empresaName?: string) => void;
  stopImpersonation: () => void;
  isImpersonating: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({ isAuth: false, user: null, token: null });
  const [impersonation, setImpersonation] = useState<ImpersonationState>({
    active: false,
    originalUser: null,
  });

  useEffect(() => {
    const raw = localStorage.getItem("deliverei_auth");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AuthState;
        setState(parsed);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (state.isAuth) {
      localStorage.setItem("deliverei_auth", JSON.stringify(state));
    } else {
      localStorage.removeItem("deliverei_auth");
    }
  }, [state]);

  const login = async (email: string, _password: string) => {
    // Determine role and company based on email
    let role: UserRole;
    let empresaId: string | null = null;
    let name: string;

    if (email === "admin@deliverei.com.br") {
      role = "superadmin";
      name = "Super Administrador";
    } else if (email === "admin@pizza-express.com") {
      role = "empresa";
      empresaId = "pizza-express";
      name = "Admin Pizza Express";
    } else if (email === "admin@burger-king.com") {
      role = "empresa";
      empresaId = "burger-king";
      name = "Admin Burger King";
    } else if (email === "cliente@exemplo.com") {
      role = "cliente";
      name = "João Silva";
    } else if (email.includes("+super")) {
      role = "superadmin";
      name = email.split("@")[0];
    } else if (email.includes("+suporte")) {
      role = "suporte";
      name = email.split("@")[0];
    } else if (email.includes("+cliente")) {
      role = "cliente";
      name = email.split("@")[0];
    } else {
      role = "empresa";
      empresaId = "default-company";
      name = email.split("@")[0];
    }

    const mockUser: AuthUser = {
      id: "u_" + Math.random().toString(36).slice(2),
      name,
      email,
      role,
      empresaId,
      lastLogin: new Date().toISOString(),
    };

    // Store company slug in localStorage for company admins
    if (role === "empresa" && empresaId) {
      localStorage.setItem("deliverei_store_slug", empresaId);
    }

    setState({ isAuth: true, user: mockUser, token: "mock-jwt-token" });
  };

  const logout = () => {
    setState({ isAuth: false, user: null, token: null });
    setImpersonation({ active: false, originalUser: null });
  };

  const setRole = (role: UserRole) => {
    setState((s) => (s.user ? { ...s, user: { ...s.user, role } } : s));
  };

  const impersonate = (empresaId: string, empresaName = "Empresa") => {
    if (!state.user) return;

    setImpersonation({
      active: true,
      originalUser: state.user,
    });

    const impersonatedUser: AuthUser = {
      id: "imp_" + empresaId,
      name: empresaName,
      email: `impersonate+${empresaId}@deliverei.com`,
      role: "empresa",
      empresaId,
      lastLogin: new Date().toISOString(),
    };

    setState({ ...state, user: impersonatedUser });
  };

  const stopImpersonation = () => {
    if (!impersonation.active || !impersonation.originalUser) return;

    setState({ ...state, user: impersonation.originalUser });
    setImpersonation({ active: false, originalUser: null });
  };

  const value = useMemo(
    () => ({
      ...state,
      login,
      logout,
      setRole,
      impersonate,
      stopImpersonation,
      isImpersonating: impersonation.active,
    }),
    [state, impersonation.active]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
