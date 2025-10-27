/**
 * Client Authentication Context
 * 
 * Manages client (customer) authentication state
 * 
 * @optimized Phase 2 - Added memoization and performance optimizations
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import apiClient from '../services/apiClient';

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

const STORAGE_KEY = 'deliverei_client_auth';

/**
 * Client Auth Provider Component
 * 
 * Provides client authentication state and operations
 * Optimized with useCallback and useMemo
 */
export const ClientAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ClientAuthState>({
    isAuthenticated: false,
    cliente: null,
    token: null,
  });

  /**
   * Load authentication state from localStorage on mount
   */
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const token = localStorage.getItem('deliverei_token');

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as ClientAuthState;
        // Only hydrate if we also have a valid token persisted
        if (token) {
          setState({
            isAuthenticated: !!parsed.isAuthenticated && !!token,
            cliente: parsed.cliente || null,
            token,
          });
        } else {
          // Stale mock session without a real token: clear it
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Failed to parse client auth from localStorage', error);
        }
        // Clear corrupted data
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  /**
   * Save authentication state to localStorage whenever it changes
   */
  useEffect(() => {
    if (state.isAuthenticated && state.token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [state.isAuthenticated, state.cliente?.id, state.token]);

  /**
   * Login function
   * Memoized to prevent recreation
   */
  const login = useCallback(async (email: string, password: string, empresaSlug: string) => {
    try {
      // Persistir slug para headers X-Tenant-Slug
      if (empresaSlug) {
        localStorage.setItem('deliverei_store_slug', empresaSlug);
        localStorage.setItem('deliverei_tenant_slug', empresaSlug);
      }

      const res = await apiClient.post('/auth/login', {
        email,
        senha: password,
        empresaSlug,
      });

      const { accessToken, refreshToken, usuario, empresa } = res.data || {};

      if (!accessToken || !usuario || !empresa) {
        throw new Error('Resposta de login inválida');
      }

      // Persistir tokens padrão do app
      localStorage.setItem('deliverei_token', accessToken);
      if (refreshToken) localStorage.setItem('deliverei_refresh_token', refreshToken);
      if (empresa?.slug) {
        localStorage.setItem('deliverei_tenant_slug', empresa.slug);
        localStorage.setItem('deliverei_store_slug', empresa.slug);
      }

      const cliente: Cliente = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        empresaId: usuario.empresaId,
      };

      setState({
        isAuthenticated: true,
        cliente,
        token: accessToken,
      });
    } catch (err) {
      // Limpa qualquer estado parcial
      localStorage.removeItem('deliverei_token');
      localStorage.removeItem('deliverei_refresh_token');
      throw err;
    }
  }, []);

  /**
   * Logout function
   * Memoized to prevent recreation
   */
  const logout = useCallback(() => {
    try {
      // Tenta notificar o backend (ignora falha no mock)
      const token = localStorage.getItem('deliverei_token');
      if (token) {
        // fire-and-forget
        fetch((import.meta as any).env?.VITE_API_URL ? `${(import.meta as any).env.VITE_API_URL}/auth/logout` : 'http://localhost:3002/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    } catch {}

    setState({
      isAuthenticated: false,
      cliente: null,
      token: null,
    });

    // Limpar tokens e chaves relacionadas
    localStorage.removeItem('token');
    localStorage.removeItem('deliverei_token');
    localStorage.removeItem('deliverei_refresh_token');
    localStorage.removeItem('deliverei_client_auth');
    localStorage.removeItem('deliverei_store_slug');
    localStorage.removeItem('deliverei_tenant_slug');
  }, []);

  /**
   * Update client profile
   * Memoized to prevent recreation
   */
  const updateProfile = useCallback((data: Partial<Cliente>) => {
    setState((prevState) => {
      if (!prevState.cliente) return prevState;
      
      return {
        ...prevState,
        cliente: {
          ...prevState.cliente,
          ...data,
        },
      };
    });
  }, []);

  /**
   * Memoized context value to prevent unnecessary re-renders
   */
  const value = useMemo<ClientAuthContextType>(() => ({
    ...state,
    login,
    logout,
    updateProfile,
  }), [state.isAuthenticated, state.cliente?.id, state.token, login, logout, updateProfile]);

  return <ClientAuthContext.Provider value={value}>{children}</ClientAuthContext.Provider>;
};

/**
 * Hook to use client auth context
 * 
 * @throws Error if used outside ClientAuthProvider
 */
export const useClientAuth = () => {
  const ctx = useContext(ClientAuthContext);
  if (!ctx) {
    throw new Error('useClientAuth must be used within ClientAuthProvider');
  }
  return ctx;
};
