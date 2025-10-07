import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StorefrontHeader } from "../../components/layout/StorefrontHeader";
import { ProductCard } from "../../components/commerce/ProductCard";
import { CartDrawer } from "../../components/commerce/CartDrawer";
import { useCart } from "../../hooks/useCart";
import { Button } from "../../components/common/Button";

type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  lowStock?: boolean;
  outOfStock?: boolean;
};

const PAGE_SIZE = 12;

async function fetchProducts(page: number, pageSize: number): Promise<{ items: Product[]; total: number }> {
  await new Promise((r) => setTimeout(r, 400));

  const baseProducts: Product[] = [
    { id: "1", title: "Marmita Fitness", price: 24.9, image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400", lowStock: true },
    { id: "2", title: "Marmita Tradicional", price: 22.5, image: "https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { id: "3", title: "Marmita Vegana", price: 26.0, image: "https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=400", outOfStock: true },
    { id: "4", title: "Marmita Executiva", price: 28.5, image: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { id: "5", title: "Marmita Light", price: 23.9, image: "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400" },
    { id: "6", title: "Marmita Proteica", price: 29.9, image: "https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg?auto=compress&cs=tinysrgb&w=400", lowStock: true },
  ];

  const total = 60;
  const start = page * pageSize;
  const end = Math.min(start + pageSize, total);

  const items: Product[] = Array.from({ length: Math.max(0, end - start) }).map((_, idx) => {
    const baseIdx = (start + idx) % baseProducts.length;
    const n = start + idx + 1;
    return {
      ...baseProducts[baseIdx],
      id: `p${n}`,
      title: `${baseProducts[baseIdx].title} ${n}`,
    };
  });

  return { items, total };
}

export default function Vitrine() {
  const navigate = useNavigate();
  const { items: cartItems, add, updateQty, count, lastAddedId } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [useInfinite, setUseInfinite] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);

  const canLoadMore = useMemo(() => products.length < total, [products.length, total]);

  const loadPage = useCallback(async (pageIdx: number) => {
    setLoading(true);
    const res = await fetchProducts(pageIdx, PAGE_SIZE);
    setTotal(res.total);
    setProducts((prev) => (pageIdx === 0 ? res.items : [...prev, ...res.items]));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPage(page);
  }, [page, loadPage]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!useInfinite) return;
    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !loading && canLoadMore) {
            setPage((p) => p + 1);
          }
        });
      },
      { rootMargin: "600px 0px" }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [useInfinite, loading, canLoadMore]);

  const onAddFromCard = (id: string) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    add({ id: p.id, title: p.title, price: p.price }, 1);
    setCartOpen(true);
  };

  const goCheckout = () => navigate("/storefront/checkout");

  const resetAndSwitchMode = (modeInfinite: boolean) => {
    setUseInfinite(modeInfinite);
    setProducts([]);
    setPage(0);
  };

  return (
    <>
      <StorefrontHeader
        storeName="Loja Exemplo"
        onCartClick={() => setCartOpen(true)}
        cartCount={count}
      />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex flex-1 items-center gap-3">
            <input
              placeholder="Buscar marmitas..."
              className="h-10 flex-1 rounded-md border border-[#E5E7EB] px-3 focus:border-[#D22630] focus:ring-2 focus:ring-[#D22630]/20 outline-none"
            />
            <button className="rounded-md bg-[#FFC107] px-3 py-2 text-[#1F2937] hover:bg-[#E0A806]">
              Filtrar
            </button>
          </div>
          <div className="ml-4 flex items-center gap-2 text-sm">
            <span className="text-[#6B7280]">Modo:</span>
            <button
              onClick={() => resetAndSwitchMode(true)}
              className={`rounded px-3 py-1 border ${
                useInfinite ? "bg-[#D22630] text-white border-[#D22630]" : "border-[#E5E7EB] text-[#1F2937]"
              }`}
            >
              Infinite
            </button>
            <button
              onClick={() => resetAndSwitchMode(false)}
              className={`rounded px-3 py-1 border ${
                !useInfinite ? "bg-[#D22630] text-white border-[#D22630]" : "border-[#E5E7EB] text-[#1F2937]"
              }`}
            >
              Paginação
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={onAddFromCard} />
          ))}
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[280px] animate-pulse rounded-md border border-[#E5E7EB] bg-[#F3F4F6]"
              />
            ))}
        </div>

        {useInfinite && <div ref={sentinelRef} aria-hidden className="h-10 w-full" />}

        {!useInfinite && (
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="secondary"
              disabled={page === 0 || loading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              ← Anterior
            </Button>
            <div className="text-sm text-[#6B7280]">
              {products.length} de {total}
            </div>
            <Button disabled={!canLoadMore || loading} onClick={() => setPage((p) => p + 1)}>
              Próximo →
            </Button>
          </div>
        )}
      </div>

      <CartDrawer
        open={cartOpen}
        items={cartItems}
        onClose={() => setCartOpen(false)}
        onQtyChange={updateQty}
        onCheckout={goCheckout}
        lastAddedId={lastAddedId}
        onAddToCart={(p) => add({ id: p.id, title: p.title, price: p.price }, p.qty ?? 1)}
      />
    </>
  );
}
