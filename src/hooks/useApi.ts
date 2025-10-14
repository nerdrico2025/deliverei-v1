
import { useState, useCallback } from 'react';

/**
 * Custom hook para gerenciar chamadas de API com loading e error state
 * 
 * @template T - Tipo dos dados retornados pela API
 * @returns objeto com { data, loading, error, execute, reset }
 * 
 * @example
 * const { data, loading, error, execute } = useApi<User[]>();
 * 
 * useEffect(() => {
 *   execute(() => userApi.getAll());
 * }, [execute]);
 */
export function useApi<T = unknown>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro desconhecido');
      setError(error);
      console.error('Erro na chamada da API:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

/**
 * Variação do useApi que executa automaticamente na montagem
 * 
 * @template T - Tipo dos dados retornados pela API
 * @param apiCall - Função que retorna uma Promise com os dados
 * @param dependencies - Array de dependências para re-executar
 * @returns objeto com { data, loading, error, refetch }
 * 
 * @example
 * const { data, loading, error, refetch } = useApiEffect(
 *   () => userApi.getAll(),
 *   []
 * );
 */
export function useApiEffect<T = unknown>(
  apiCall: () => Promise<T>,
  dependencies: React.DependencyList = []
) {
  const { data, loading, error, execute } = useApi<T>();

  // Execute on mount and when dependencies change
  const executeEffect = useCallback(() => {
    execute(apiCall);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  React.useEffect(() => {
    executeEffect();
  }, [executeEffect]);

  return { data, loading, error, refetch: executeEffect };
}

// Re-export React for useApiEffect
import * as React from 'react';

