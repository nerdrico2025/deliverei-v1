
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { assinaturasApi, Assinatura } from '../services/backendApi';
import { useToast } from '../ui/feedback/ToastContext';

interface AssinaturaContextType {
  assinatura: Assinatura | null;
  loading: boolean;
  error: string | null;
  fetchAssinatura: () => Promise<void>;
  verificarLimites: () => { pedidosDisponivel: boolean; produtosDisponivel: boolean };
  usoPedidosPercentual: number;
  usoProdutosPercentual: number;
}

const AssinaturaContext = createContext<AssinaturaContextType | undefined>(undefined);

export const AssinaturaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assinatura, setAssinatura] = useState<Assinatura | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  const fetchAssinatura = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await assinaturasApi.getMinha();
      setAssinatura(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erro ao carregar assinatura';
      setError(errorMsg);
      console.error('Erro ao buscar assinatura:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const verificarLimites = useCallback(() => {
    if (!assinatura) {
      return { pedidosDisponivel: false, produtosDisponivel: false };
    }

    const pedidosDisponivel = assinatura.plano.limitePedidos === -1 || 
                              assinatura.usoPedidos < assinatura.plano.limitePedidos;
    const produtosDisponivel = assinatura.plano.limiteProdutos === -1 || 
                               assinatura.usoProdutos < assinatura.plano.limiteProdutos;

    return { pedidosDisponivel, produtosDisponivel };
  }, [assinatura]);

  const usoPedidosPercentual = assinatura && assinatura.plano.limitePedidos !== -1
    ? (assinatura.usoPedidos / assinatura.plano.limitePedidos) * 100
    : 0;

  const usoProdutosPercentual = assinatura && assinatura.plano.limiteProdutos !== -1
    ? (assinatura.usoProdutos / assinatura.plano.limiteProdutos) * 100
    : 0;

  useEffect(() => {
    fetchAssinatura();
  }, [fetchAssinatura]);

  return (
    <AssinaturaContext.Provider
      value={{
        assinatura,
        loading,
        error,
        fetchAssinatura,
        verificarLimites,
        usoPedidosPercentual,
        usoProdutosPercentual,
      }}
    >
      {children}
    </AssinaturaContext.Provider>
  );
};

export const useAssinatura = () => {
  const context = useContext(AssinaturaContext);
  if (context === undefined) {
    throw new Error('useAssinatura must be used within an AssinaturaProvider');
  }
  return context;
};
