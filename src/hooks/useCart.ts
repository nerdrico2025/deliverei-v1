import { useCallback, useMemo, useState } from "react";

export type CartItem = { id: string; title: string; price: number; qty: number };

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((curr) => {
      const ex = curr.find((c) => c.id === item.id);
      if (ex) return curr.map((c) => (c.id === item.id ? { ...c, qty: c.qty + qty } : c));
      return [...curr, { ...item, qty }];
    });
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    setItems((curr) => curr.map((c) => (c.id === id ? { ...c, qty: Math.max(1, qty) } : c)));
  }, []);

  const remove = useCallback((id: string) => {
    setItems((curr) => curr.filter((c) => c.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);

  return { items, add, updateQty, remove, clear, count, subtotal };
}
