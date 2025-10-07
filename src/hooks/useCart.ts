import { useCallback, useEffect, useMemo, useState } from "react";
import { safeStorage } from "../utils/safeStorage";

export type CartItem = { id: string; title: string; price: number; qty: number };

const CART_KEY = "deliverei:cart:v1";
const LAST_ADDED_KEY = "deliverei:lastAddedId:v1";

function parseJSON<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() =>
    parseJSON<CartItem[]>(safeStorage.get(CART_KEY), [])
  );

  const [lastAddedId, setLastAddedId] = useState<string | undefined>(() => {
    const v = safeStorage.get(LAST_ADDED_KEY);
    return v || undefined;
  });

  useEffect(() => {
    safeStorage.set(CART_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (lastAddedId) safeStorage.set(LAST_ADDED_KEY, lastAddedId);
    else safeStorage.remove(LAST_ADDED_KEY);
  }, [lastAddedId]);

  const add = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((curr) => {
      const ex = curr.find((c) => c.id === item.id);
      if (ex) return curr.map((c) => (c.id === item.id ? { ...c, qty: c.qty + qty } : c));
      return [...curr, { ...item, qty }];
    });
    setLastAddedId(item.id);
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    setItems((curr) =>
      curr
        .map((c) => (c.id === id ? { ...c, qty } : c))
        .filter((c) => c.qty > 0)
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((curr) => curr.filter((c) => c.id !== id));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setLastAddedId(undefined);
  }, []);

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);

  return { items, add, updateQty, remove, clear, count, subtotal, lastAddedId, setLastAddedId };
}
