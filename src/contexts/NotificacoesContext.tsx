
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

export const NotificacoesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const { user } = useAuth();

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
        console.error('Erro ao buscar notificações:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [user, backendAvailable]);

  const marcarLida = async (id: string) => {
    if (!backendAvailable) return;
    
    try {
      await notificacoesApi.marcarLida(id);
      setNotificacoes(prev =>
        prev.map(n => (n.id === id ? { ...n, lida: true } : n))
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const marcarTodasLidas = async () => {
    if (!backendAvailable) return;
    
    try {
      await notificacoesApi.marcarTodasLidas();
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const deletarNotificacao = async (id: string) => {
    if (!backendAvailable) return;
    
    try {
      await notificacoesApi.deletar(id);
      setNotificacoes(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
    }
  };

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  // Polling a cada 30 segundos - only if backend is available
  useEffect(() => {
    if (user && backendAvailable) {
      fetchNotificacoes();
      const interval = setInterval(fetchNotificacoes, 30000);
      return () => clearInterval(interval);
    }
  }, [user, backendAvailable, fetchNotificacoes]);

  return (
    <NotificacoesContext.Provider
      value={{
        notificacoes,
        naoLidas,
        loading,
        fetchNotificacoes,
        marcarLida,
        marcarTodasLidas,
        deletarNotificacao,
      }}
    >
      {children}
    </NotificacoesContext.Provider>
  );
};

export const useNotificacoes = () => {
  const context = useContext(NotificacoesContext);
  if (!context) {
    throw new Error('useNotificacoes deve ser usado dentro de NotificacoesProvider');
  }
  return context;
};
