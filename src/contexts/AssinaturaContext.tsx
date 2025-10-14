/**
 * Subscription Context
 * 
 * Manages subscription (assinatura) state
 * 
 * @optimized Phase 2 - Added memoization and performance optimizations
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
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

/**
 * Subscription Provider Component
 * 
 * Provides subscription state and operations
 * Optimized with useCallback and useMemo
 */
export const AssinaturaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [assinatura, setAssinatura] = useState<Assinatura | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  /**
   * Fetch subscription data
   * Memoized to prevent recreation
   */
  const fetchAssinatura = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await assinaturasApi.getMinha();
      setAssinatura(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erro ao carregar assinatura';
      setError(errorMsg);
      
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao buscar assinatura:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check subscription limits
   * Memoized to prevent recreation
   */
  const verificarLimites = useCallback(() => {
    if (!assinatura) {
      return { pedidosDisponivel: false, produtosDisponivel: false };
    }

    const pedidosDisponivel =
      assinatura.plano.limitePedidos === -1 ||
      assinatura.usoPedidos < assinatura.plano.limitePedidos;
    const produtosDisponivel =
      assinatura.plano.limiteProdutos === -1 ||
      assinatura.usoProdutos < assinatura.plano.limiteProdutos;

    return { pedidosDisponivel, produtosDisponivel };
  }, [assinatura]);

  /**
   * Calculate usage percentages
   * Memoized to prevent recalculation on every render
   */
  const usoPedidosPercentual = useMemo(() => {
    if (!assinatura || assinatura.plano.limitePedidos === -1) return 0;
    return (assinatura.usoPedidos / assinatura.plano.limitePedidos) * 100;
  }, [assinatura]);

  const usoProdutosPercentual = useMemo(() => {
    if (!assinatura || assinatura.plano.limiteProdutos === -1) return 0;
    return (assinatura.usoProdutos / assinatura.plano.limiteProdutos) * 100;
  }, [assinatura]);

  /**
   * Fetch subscription on mount
   */
  useEffect(() => {
    fetchAssinatura();
  }, [fetchAssinatura]);

  /**
   * Memoized context value to prevent unnecessary re-renders
   */
  const value = useMemo<AssinaturaContextType>(
    () => ({
      assinatura,
      loading,
      error,
      fetchAssinatura,
      verificarLimites,
      usoPedidosPercentual,
      usoProdutosPercentual,
    }),
    [
      assinatura,
      loading,
      error,
      fetchAssinatura,
      verificarLimites,
      usoPedidosPercentual,
      usoProdutosPercentual,
    ]
  );

  return <AssinaturaContext.Provider value={value}>{children}</AssinaturaContext.Provider>;
};

/**
 * Hook to use subscription context
 * 
 * @throws Error if used outside AssinaturaProvider
 */
export const useAssinatura = () => {
  const context = useContext(AssinaturaContext);
  if (context === undefined) {
    throw new Error('useAssinatura must be used within an AssinaturaProvider');
  }
  return context;
};
