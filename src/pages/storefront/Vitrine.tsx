import React, { useState } from "react";
import { StorefrontHeader } from "../../components/layout/StorefrontHeader";
import { ProductCard } from "../../components/commerce/ProductCard";
import { CartDrawer } from "../../components/commerce/CartDrawer";

type CartItem = { id: string; title: string; qty: number; price: number };

export default function Vitrine() {
  const [cartOpen, setCartOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);

  const products = [
    { id: "1", title: "Marmita Fitness", price: 24.9, image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400", lowStock: true },
    { id: "2", title: "Marmita Tradicional", price: 22.5, image: "https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { id: "3", title: "Marmita Vegana", price: 26.0, image: "https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=400", outOfStock: true },
    { id: "4", title: "Marmita Executiva", price: 28.5, image: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { id: "5", title: "Marmita Light", price: 23.9, image: "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { id: "6", title: "Marmita Proteica", price: 29.9, image: "https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg?auto=compress&cs=tinysrgb&w=400", lowStock: true },
  ];

  const add = (id: string) => {
    const p = products.find((x) => x.id === id)!;
    setItems((curr) => {
      const ex = curr.find((c) => c.id === id);
      if (ex) return curr.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c));
      return [...curr, { id, title: p.title, qty: 1, price: p.price }];
    });
    setCartOpen(true);
  };

  const qty = (id: string, q: number) =>
    setItems((curr) => curr.map((c) => (c.id === id ? { ...c, qty: q } : c)));

  const goCheckout = () => (window.location.href = "/storefront/checkout");

  return (
    <>
      <StorefrontHeader
        storeName="Loja Exemplo"
        onCartClick={() => setCartOpen(true)}
        cartCount={items.reduce((s, i) => s + i.qty, 0)}
      />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-center gap-3">
          <input
            placeholder="Buscar marmitas..."
            className="h-10 flex-1 rounded-md border border-[#E5E7EB] px-3 focus:border-[#D22630] focus:ring-2 focus:ring-[#D22630]/20 outline-none"
          />
          <button className="rounded-md bg-[#FFC107] px-3 py-2 text-[#1F2937] hover:bg-[#E0A806]">
            Filtrar
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={add} />
          ))}
        </div>
      </div>
      <CartDrawer
        open={cartOpen}
        items={items}
        onClose={() => setCartOpen(false)}
        onQtyChange={qty}
        onCheckout={goCheckout}
      />
    </>
  );
}
