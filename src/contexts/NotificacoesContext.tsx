
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
  const { user } = useAuth();

  const fetchNotificacoes = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await notificacoesApi.listar();
      setNotificacoes(data);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const marcarLida = async (id: string) => {
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
    try {
      await notificacoesApi.marcarTodasLidas();
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const deletarNotificacao = async (id: string) => {
    try {
      await notificacoesApi.deletar(id);
      setNotificacoes(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
    }
  };

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  // Polling a cada 30 segundos
  useEffect(() => {
    if (user) {
      fetchNotificacoes();
      const interval = setInterval(fetchNotificacoes, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchNotificacoes]);

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
