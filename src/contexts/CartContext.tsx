/**
 * Cart Context
 * 
 * Global shopping cart state management
 * 
 * @optimized Phase 2 - Added memoization and performance optimizations
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { carrinhoApi, Carrinho, CarrinhoItem } from '../services/backendApi';
import { useToast } from '../ui/feedback/ToastContext';

interface CartContextType {
  cart: Carrinho | null;
  loading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItem: (produtoId: string, quantidade: number) => Promise<void>;
  updateItem: (itemId: string, quantidade: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: number;
  lastAddedItemId: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

/**
 * Cart Provider Component
 * 
 * Provides cart state and operations to child components
 * Optimized with useCallback and useMemo to prevent unnecessary re-renders
 */
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Carrinho | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAddedItemId, setLastAddedItemId] = useState<string | null>(null);
  const { push } = useToast();

  /**
   * Fetch current cart from API
   * Memoized to prevent recreation on every render
   */
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await carrinhoApi.obter();
      setCart(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erro ao carregar carrinho';
      setError(errorMsg);
      
      // Only log in development to avoid console spam
      if (process.env.NODE_ENV === 'development') {
        console.error('Erro ao buscar carrinho:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add item to cart
   */
  const addItem = useCallback(async (produtoId: string, quantidade: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await carrinhoApi.adicionarItem(produtoId, quantidade);
      setCart(data);
      
      // Find the added item
      const addedItem = data.itens.find(item => item.produtoId === produtoId);
      if (addedItem) {
        setLastAddedItemId(addedItem.id);
      }
      
      push({ message: 'Item adicionado ao carrinho!', tone: 'success' });
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erro ao adicionar item';
      setError(errorMsg);
      push({ message: errorMsg, tone: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [push]);

  /**
   * Update item quantity in cart
   */
  const updateItem = useCallback(async (itemId: string, quantidade: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await carrinhoApi.atualizarItem(itemId, quantidade);
      setCart(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erro ao atualizar item';
      setError(errorMsg);
      push({ message: errorMsg, tone: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [push]);

  /**
   * Remove item from cart
   */
  const removeItem = useCallback(async (itemId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await carrinhoApi.removerItem(itemId);
      setCart(data);
      push({ message: 'Item removido do carrinho', tone: 'success' });
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erro ao remover item';
      setError(errorMsg);
      push({ message: errorMsg, tone: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [push]);

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await carrinhoApi.limpar();
      setCart(null);
      push({ message: 'Carrinho limpo', tone: 'success' });
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Erro ao limpar carrinho';
      setError(errorMsg);
      push({ message: errorMsg, tone: 'error' });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [push]);

  /**
   * Calculate total item count
   * Memoized to prevent recalculation on every render
   */
  const itemCount = useMemo(() => {
    return cart?.itens.reduce((sum, item) => sum + item.quantidade, 0) || 0;
  }, [cart?.itens]);

  /**
   * Memoized context value to prevent unnecessary re-renders
   */
  const value = useMemo<CartContextType>(() => ({
    cart,
    loading,
    error,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    itemCount,
    lastAddedItemId,
  }), [
    cart,
    loading,
    error,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    itemCount,
    lastAddedItemId,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

/**
 * Hook to use cart context
 * 
 * @throws Error if used outside CartProvider
 */
export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within CartProvider');
  }
  return context;
};
