import { useCallback, useEffect, useMemo, useState } from "react";

export type CartItem = { id: string; title: string; price: number; qty: number };

const CART_KEY = "deliverei:cart:v1";
const LAST_ADDED_KEY = "deliverei:lastAddedId:v1";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  const [lastAddedId, setLastAddedId] = useState<string | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    try {
      return localStorage.getItem(LAST_ADDED_KEY) || undefined;
    } catch {
      return undefined;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (lastAddedId) localStorage.setItem(LAST_ADDED_KEY, lastAddedId);
      else localStorage.removeItem(LAST_ADDED_KEY);
    } catch {}
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
