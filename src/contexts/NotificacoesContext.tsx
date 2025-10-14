/**
 * Notifications Context
 * 
 * Manages notifications state with polling
 * 
 * @optimized Phase 2 - Added memoization and performance optimizations
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { notificacoesApi, Notificacao } from '../services/backendApi';
import { useAuth } from '../auth/AuthContext';

interface NotificacoesContextData {
  notificacoes: Notificacao[];
  naoLidas: number;
  loading: boolean;
  fetchNotificacoes: () => Promise<void>;
  marcarLida: (id: string) => Promise<void>;
  marcarTodasLidas: () => Promise<void>;
  deletarNotificacao: (id: string) => Promise<void>;
}

const NotificacoesContext = createContext<NotificacoesContextData>({} as NotificacoesContextData);

const POLLING_INTERVAL = 30000; // 30 seconds

/**
 * Notifications Provider Component
 * 
 * Provides notifications state and operations
 * Includes automatic polling for updates
 * Optimized with useCallback and useMemo
 */
export const NotificacoesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const { user } = useAuth();

  /**
   * Fetch notifications from API
   * Memoized to prevent recreation
   */
  const fetchNotificacoes = useCallback(async () => {
    if (!user || !backendAvailable) return;

    try {
      setLoading(true);
      const data = await notificacoesApi.listar();
      setNotificacoes(data);
      setBackendAvailable(true);
    } catch (error: any) {
      // Check if it's a connection error
      const isConnectionError =
        error?.message?.includes('ERR_CONNECTION_REFUSED') ||
        error?.message?.includes('Network Error') ||
        error?.message?.includes('Failed to fetch') ||
        error?.code === 'ERR_NETWORK';

      if (isConnectionError) {
        // Mark backend as unavailable to stop further attempts
        setBackendAvailable(false);
        // Silently fail - don't spam console
        if (process.env.NODE_ENV === 'development') {
          console.warn('Backend de notificações não disponível - requisições suspensas');
        }
      } else {
        // Log other types of errors
        if (process.env.NODE_ENV === 'development') {
          console.error('Erro ao buscar notificações:', error);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [user, backendAvailable]);

  /**
   * Mark notification as read
   * Memoized to prevent recreation
   */
  const marcarLida = useCallback(async (id: string) => {
    if (!backendAvailable) return;

    try {
      await notificacoesApi.marcarLida(id);
      setNotificacoes((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao marcar notificação como lida:', error);
      }
    }
  }, [backendAvailable]);

  /**
   * Mark all notifications as read
   * Memoized to prevent recreation
   */
  const marcarTodasLidas = useCallback(async () => {
    if (!backendAvailable) return;

    try {
      await notificacoesApi.marcarTodasLidas();
      setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao marcar todas como lidas:', error);
      }
    }
  }, [backendAvailable]);

  /**
   * Delete notification
   * Memoized to prevent recreation
   */
  const deletarNotificacao = useCallback(async (id: string) => {
    if (!backendAvailable) return;

    try {
      await notificacoesApi.deletar(id);
      setNotificacoes((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao deletar notificação:', error);
      }
    }
  }, [backendAvailable]);

  /**
   * Calculate unread count
   * Memoized to prevent recalculation on every render
   */
  const naoLidas = useMemo(() => {
    return notificacoes.filter((n) => !n.lida).length;
  }, [notificacoes]);

  /**
   * Polling effect - fetch notifications every 30 seconds
   */
  useEffect(() => {
    if (user && backendAvailable) {
      fetchNotificacoes();
      const interval = setInterval(fetchNotificacoes, POLLING_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [user, backendAvailable, fetchNotificacoes]);

  /**
   * Memoized context value to prevent unnecessary re-renders
   */
  const value = useMemo<NotificacoesContextData>(
    () => ({
      notificacoes,
      naoLidas,
      loading,
      fetchNotificacoes,
      marcarLida,
      marcarTodasLidas,
      deletarNotificacao,
    }),
    [notificacoes, naoLidas, loading, fetchNotificacoes, marcarLida, marcarTodasLidas, deletarNotificacao]
  );

  return <NotificacoesContext.Provider value={value}>{children}</NotificacoesContext.Provider>;
};

/**
 * Hook to use notifications context
 * 
 * @throws Error if used outside NotificacoesProvider
 */
export const useNotificacoes = () => {
  const context = useContext(NotificacoesContext);
  if (!context) {
    throw new Error('useNotificacoes deve ser usado dentro de NotificacoesProvider');
  }
  return context;
};
