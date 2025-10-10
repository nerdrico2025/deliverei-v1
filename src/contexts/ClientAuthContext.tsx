import React, { createContext, useContext, useEffect, useState } from "react";

type Cliente = {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  endereco?: {
    cep: string;
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
  empresaId: string;
};

type ClientAuthState = {
  isAuthenticated: boolean;
  cliente: Cliente | null;
  token: string | null;
};

type ClientAuthContextType = ClientAuthState & {
  login: (email: string, password: string, empresaId: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Cliente>) => void;
};

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined);

export const ClientAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ClientAuthState>({
    isAuthenticated: false,
    cliente: null,
    token: null,
  });

  // Load authentication state from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem("deliverei_client_auth");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as ClientAuthState;
        setState(parsed);
      } catch (error) {
        console.error("Failed to parse client auth from localStorage", error);
      }
    }
  }, []);

  // Save authentication state to localStorage whenever it changes
  useEffect(() => {
    if (state.isAuthenticated) {
      localStorage.setItem("deliverei_client_auth", JSON.stringify(state));
    } else {
      localStorage.removeItem("deliverei_client_auth");
    }
  }, [state]);

  const login = async (email: string, _password: string, empresaId: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock client data based on email
    let mockCliente: Cliente;

    if (email === "cliente@exemplo.com") {
      mockCliente = {
        id: "c_joao_silva",
        nome: "João Silva",
        email: "cliente@exemplo.com",
        telefone: "(11) 98765-4321",
        endereco: {
          cep: "01310-100",
          rua: "Av. Paulista",
          numero: "1578",
          complemento: "Apto 42",
          bairro: "Bela Vista",
          cidade: "São Paulo",
          uf: "SP",
        },
        empresaId,
      };
    } else if (email === "maria@exemplo.com") {
      mockCliente = {
        id: "c_maria_santos",
        nome: "Maria Santos",
        email: "maria@exemplo.com",
        telefone: "(11) 91234-5678",
        endereco: {
          cep: "04538-133",
          rua: "Av. Brigadeiro Faria Lima",
          numero: "3477",
          bairro: "Itaim Bibi",
          cidade: "São Paulo",
          uf: "SP",
        },
        empresaId,
      };
    } else {
      // Default mock for any other email
      mockCliente = {
        id: "c_" + Math.random().toString(36).slice(2),
        nome: email.split("@")[0],
        email,
        empresaId,
      };
    }

    setState({
      isAuthenticated: true,
      cliente: mockCliente,
      token: "client-mock-jwt-" + Date.now(),
    });
  };

  const logout = () => {
    setState({
      isAuthenticated: false,
      cliente: null,
      token: null,
    });
  };

  const updateProfile = (data: Partial<Cliente>) => {
    if (!state.cliente) return;
    
    setState({
      ...state,
      cliente: {
        ...state.cliente,
        ...data,
      },
    });
  };

  const value: ClientAuthContextType = {
    ...state,
    login,
    logout,
    updateProfile,
  };

  return <ClientAuthContext.Provider value={value}>{children}</ClientAuthContext.Provider>;
};

export const useClientAuth = () => {
  const ctx = useContext(ClientAuthContext);
  if (!ctx) {
    throw new Error("useClientAuth must be used within ClientAuthProvider");
  }
  return ctx;
};
