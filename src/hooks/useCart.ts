import { useState, useCallback, useEffect } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface UseCartReturn {
  items: CartItem[];
  addItem: (product: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

export const useCart = (): UseCartReturn => {
  const [items, setItems] = useState<CartItem[]>([]);
  const storageKey = (() => {
    try {
      const slug =
        (typeof window !== 'undefined' &&
          (window.localStorage.getItem('deliverei_tenant_slug') ||
            window.localStorage.getItem('deliverei_store_slug') ||
            window.localStorage.getItem('tenantSlug'))) ||
        'default';
      return `deliverei_cart_${slug}`;
    } catch {
      return 'deliverei_cart_default';
    }
  })();

  useEffect(() => {
    try {
      const raw = (typeof window !== 'undefined') ? window.localStorage.getItem(storageKey) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) {
          setItems(parsed.filter((i) => i && typeof i.id === 'string' && typeof i.price === 'number' && typeof i.quantity === 'number'));
        }
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, JSON.stringify(items));
      }
    } catch {
      // ignore
    }
  }, [items, storageKey]);

  const addItem = useCallback((product: Omit<CartItem, 'quantity'>) => {
    setItems((currentItems: CartItem[]) => {
      const existingItem = currentItems.find((item: CartItem) => item.id === product.id);
      
      if (existingItem) {
        return currentItems.map((item: CartItem) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...currentItems, { ...product, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((currentItems: CartItem[]) => currentItems.filter((item: CartItem) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setItems((currentItems: CartItem[]) =>
      currentItems.map((item: CartItem) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((total: number, item: CartItem) => total + item.quantity, 0);
  const totalPrice = items.reduce((total: number, item: CartItem) => total + (item.price * item.quantity), 0);

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };
};
