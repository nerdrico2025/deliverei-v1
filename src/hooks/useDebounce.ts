
import { useEffect, useState } from 'react';

/**
 * Custom hook para debounce de valores
 * Útil para evitar chamadas excessivas de API durante digitação
 * 
 * @param value - Valor a ser "debounced"
 * @param delay - Delay em milissegundos (padrão: 500ms)
 * @returns valor com debounce aplicado
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   // Só executa após 500ms sem mudanças
 *   searchApi(debouncedSearchTerm);
 * }, [debouncedSearchTerm]);
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up timeout if value changes before delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para executar uma callback com debounce
 * 
 * @param callback - Função a ser executada com debounce
 * @param delay - Delay em milissegundos (padrão: 500ms)
 * @returns função debounced
 * 
 * @example
 * const debouncedSearch = useDebouncedCallback(
 *   (term: string) => searchApi(term),
 *   500
 * );
 * 
 * // Em um input
 * <input onChange={(e) => debouncedSearch(e.target.value)} />
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay = 500
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  return (...args: Parameters<T>) => {
    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout
    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };
}

