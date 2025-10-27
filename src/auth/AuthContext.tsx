import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthUser, UserRole } from "./types";
import { storefrontApi, authApi } from "../services/backendApi";

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
        const companyName = localStorage.getItem("deliverei_company_name");
        if (parsed.user && companyName && parsed.user.name === companyName && parsed.user.email) {
          const fallbackAdminName = parsed.user.email.split("@")[0];
          const sanitized = { ...parsed, user: { ...parsed.user, name: fallbackAdminName } };
          setState(sanitized);
          localStorage.setItem("deliverei_auth", JSON.stringify(sanitized));
        } else {
          setState(parsed);
        }
      } catch {}
    }
  }, []);

  // Hidratar nome da empresa em sessões pré-existentes (sem novo login)
  useEffect(() => {
    const companyName = localStorage.getItem("deliverei_company_name");
    const slug = localStorage.getItem("deliverei_tenant_slug") || localStorage.getItem("deliverei_store_slug");
    if (!slug || companyName) return;
    (async () => {
      try {
        const info = await storefrontApi.getLojaInfo(slug);
        if (info?.nome) {
          localStorage.setItem("deliverei_company_name", info.nome);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (state.isAuth) {
      localStorage.setItem("deliverei_auth", JSON.stringify(state));
    } else {
      localStorage.removeItem("deliverei_auth");
    }
  }, [state.isAuth, state.user?.id, state.token]);

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
      // Preferir dados já salvos do cadastro para evitar defaults incorretos
      const savedSlug = localStorage.getItem('deliverei_tenant_slug') || localStorage.getItem('deliverei_store_slug') || null;
      const savedName = localStorage.getItem('deliverei_company_name') || null;
      const slugFromName = savedName
        ? savedName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
        : null;
      empresaId = savedSlug || slugFromName || "default-company";
      name = email.split("@")[0];
    }

    // Removido short-circuit de hidratação: login sempre valida no backend

    try {
      const response = await authApi.login({ email, senha: _password });
      const accessToken = (response as any)?.accessToken;
      const refreshToken = (response as any)?.refreshToken;
      const resolvedUser = (response as any)?.user || (response as any)?.usuario || null;
      const resolvedEmpresa = (response as any)?.empresa || resolvedUser?.empresa || null;

      if (accessToken && resolvedUser) {
        localStorage.setItem("deliverei_token", accessToken);
        if (refreshToken) localStorage.setItem("deliverei_refresh_token", refreshToken);

        const slug = resolvedEmpresa?.slug || empresaId || null;
        if (slug) {
          localStorage.setItem("deliverei_store_slug", slug);
          localStorage.setItem("deliverei_tenant_slug", slug);
        }
        if (resolvedEmpresa?.nome) {
          localStorage.setItem("deliverei_company_name", resolvedEmpresa.nome);
        }
        if ((resolvedEmpresa as any)?.telefone) {
          localStorage.setItem("deliverei_company_phone", (resolvedEmpresa as any).telefone);
        }
        
        // Persistir dados do responsável a partir da tabela de usuários
        const responsavelNome = (resolvedUser as any)?.nome;
        const responsavelEmail = (resolvedUser as any)?.email;
        const responsavelTelefone = (resolvedUser as any)?.telefone;
        if (responsavelNome) localStorage.setItem("deliverei_responsavel_nome", responsavelNome);
        if (responsavelEmail) localStorage.setItem("deliverei_responsavel_email", responsavelEmail);
        if (responsavelTelefone) localStorage.setItem("deliverei_responsavel_telefone", responsavelTelefone);

        if ((resolvedEmpresa as any)?.endereco) {
          const addr = String((resolvedEmpresa as any).endereco || "");
          const parts = addr.split(",").map((s) => s.trim()).filter(Boolean);
          let street = "";
          let city = "";
          let state = "";
          let zip = "";
          // Suporta ambos formatos: "Rua, Cidade, UF, CEP" e "Rua, Número, Cidade, UF, CEP"
          if (parts.length >= 5) {
            street = [parts[0], parts[1]].filter(Boolean).join(", ");
            city = parts[2] || "";
            state = parts[3] || "";
            zip = parts[4] || "";
          } else if (parts.length >= 4) {
            street = parts[0] || "";
            city = parts[1] || "";
            state = parts[2] || "";
            zip = parts[3] || "";
          } else if (parts.length) {
            street = parts.join(", ");
          }
          if (street) localStorage.setItem("deliverei_company_address", street);
          if (city) localStorage.setItem("deliverei_company_city", city);
          if (state) localStorage.setItem("deliverei_company_state", state);
          if (zip) localStorage.setItem("deliverei_company_zip", zip);
        }

        const backendRole = (resolvedUser as any)?.role || (resolvedUser as any)?.tipo;
        const roleMap = (r?: string): UserRole => {
          if (!r) return resolvedEmpresa ? "empresa" : role;
          const s = r.toUpperCase();
          if (s.includes("SUPER")) return "superadmin";
          if (s.includes("ADMIN")) return "empresa";
          if (s.includes("SUPORTE")) return "suporte";
          if (s.includes("CLIENTE")) return "cliente";
          return resolvedEmpresa ? "empresa" : role;
        };
        const roleResolved: UserRole = roleMap(backendRole);

        const displayName = (resolvedUser as any)?.nome || name;

        const authUser: AuthUser = {
          id: (resolvedUser as any)?.id || "u_" + Math.random().toString(36).slice(2),
          name: displayName,
          email,
          role: roleResolved,
          empresaId: slug,
          lastLogin: new Date().toISOString(),
        };

        const newState = { isAuth: true, user: authUser, token: accessToken };
        setState(newState);
        localStorage.setItem("deliverei_auth", JSON.stringify(newState));
        return;
      }
    } catch (err) {
      // Propagar erro para caller (sem sessão mock)
      throw err;
    }

    // Removido fallback de sessão mock: exigir login real do backend
    // Antes: criava mockUser e setava estado.
    // Agora: sem sucesso no backend, não altera estado.
    // (bloco de sessão mock removido)
    // Sessão mock removida: exigir login real do backend
  };

  const logout = () => {
    setState({ isAuth: false, user: null, token: null });
    setImpersonation({ active: false, originalUser: null });
    localStorage.removeItem("deliverei_store_slug");
    localStorage.removeItem("deliverei_tenant_slug");
    localStorage.removeItem("deliverei_token");
    localStorage.removeItem("deliverei_refresh_token");
    localStorage.removeItem("deliverei_auth");
    localStorage.removeItem("deliverei_client_auth");
    localStorage.removeItem("token");
    // Limpar dados da empresa e responsável para evitar mapeamentos antigos
    localStorage.removeItem("deliverei_company_name");
    localStorage.removeItem("deliverei_company_phone");
    localStorage.removeItem("deliverei_responsavel_nome");
    localStorage.removeItem("deliverei_responsavel_email");
    localStorage.removeItem("deliverei_responsavel_telefone");
    localStorage.removeItem("deliverei_company_address");
    localStorage.removeItem("deliverei_company_city");
    localStorage.removeItem("deliverei_company_state");
    localStorage.removeItem("deliverei_company_zip");
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

    // Store the impersonated company slug for backend API calls
    localStorage.setItem("deliverei_store_slug", empresaId);

    setState({ ...state, user: impersonatedUser });
  };

  const stopImpersonation = () => {
    if (!impersonation.active || !impersonation.originalUser) return;

    setState({ ...state, user: impersonation.originalUser });
    setImpersonation({ active: false, originalUser: null });
    
    // Clear the store slug when stopping impersonation
    localStorage.removeItem("deliverei_store_slug");
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
    [state.isAuth, state.user?.id, state.token, impersonation.active, login, logout, setRole, impersonate, stopImpersonation]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
