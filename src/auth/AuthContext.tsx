import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthUser, UserRole } from "./types";

type AuthState = {
  isAuth: boolean;
  user: AuthUser | null;
  token: string | null;
};

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setRole: (role: UserRole) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({ isAuth: false, user: null, token: null });

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
    const role: UserRole = email.includes("+super")
      ? "superadmin"
      : email.includes("+suporte")
      ? "suporte"
      : email.includes("+cliente")
      ? "cliente"
      : "empresa";

    const mockUser: AuthUser = {
      id: "u_" + Math.random().toString(36).slice(2),
      name: email.split("@")[0],
      email,
      role,
      empresaId: role === "empresa" ? "emp_123" : null,
      lastLogin: new Date().toISOString(),
    };

    setState({ isAuth: true, user: mockUser, token: "mock-jwt-token" });
  };

  const logout = () => setState({ isAuth: false, user: null, token: null });

  const setRole = (role: UserRole) => {
    setState((s) => (s.user ? { ...s, user: { ...s.user, role } } : s));
  };

  const value = useMemo(() => ({ ...state, login, logout, setRole }), [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
