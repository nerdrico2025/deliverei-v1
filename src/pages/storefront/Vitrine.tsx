import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { StorefrontHeader } from "../../components/layout/StorefrontHeader";
import { ProductCard } from "../../components/commerce/ProductCard";
import { CartDrawer } from "../../components/commerce/CartDrawer";
import { useCart } from "../../hooks/useCart";
import { Button } from "../../components/common/Button";
import { useToast } from "../../ui/feedback/ToastContext";
import { StorefrontThemeSettings, getThemeSettings, preloadImage } from "../../utils/themeSettings";
import { storefrontApi } from "../../services/backendApi";

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
  const { slug } = useParams<{ slug: string }>();
  const { items: cartItems, addItem, updateQuantity, totalItems } = useCart();
  const { success } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [useInfinite, setUseInfinite] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string>();
  const [theme, setTheme] = useState<StorefrontThemeSettings | null>(null);
  const [bgReady, setBgReady] = useState<boolean>(false);

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

  // Load theme settings (local first, then server) and listen via BroadcastChannel and custom event
  useEffect(() => {
    const s = slug || "storefront";
    const local = getThemeSettings(s);
    if (local) {
      setTheme(local);
      setBgReady(false);
      if (local?.backgroundImage) {
        preloadImage(local.backgroundImage)
          .then(() => setBgReady(true))
          .catch(() => setBgReady(false));
      }
    }
    (async () => {
      try {
        const res = await storefrontApi.getTheme(s);
        const settings = res?.settings || null;
        if (settings) {
          setTheme(settings);
          setBgReady(false);
          if (settings?.backgroundImage) {
            preloadImage(settings.backgroundImage)
              .then(() => setBgReady(true))
              .catch(() => setBgReady(false));
          }
        }
      } catch (err) {
        console.warn("Falha ao buscar tema público:", err);
      }
    })();
    const onThemeUpdated = (ev: any) => {
      try {
        if (ev?.detail?.slug !== s) return;
        const st = ev.detail.settings as StorefrontThemeSettings;
        setTheme(st);
        setBgReady(false);
        if (st?.backgroundImage) {
          preloadImage(st.backgroundImage)
            .then(() => setBgReady(true))
            .catch(() => setBgReady(false));
        }
      } catch {}
    };
    window.addEventListener("deliverei_theme_settings_updated", onThemeUpdated as EventListener);
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("deliverei_theme_settings");
      bc.onmessage = (msg: MessageEvent) => {
        const data: any = msg?.data;
        if (!data || data.slug !== s) return;
        const st = data.settings as StorefrontThemeSettings;
        setTheme(st);
        setBgReady(false);
        if (st?.backgroundImage) {
          preloadImage(st.backgroundImage)
            .then(() => setBgReady(true))
            .catch(() => setBgReady(false));
        }
      };
    } catch {}
    return () => {
      window.removeEventListener("deliverei_theme_settings_updated", onThemeUpdated as EventListener);
      try { bc?.close(); } catch {}
    };
  }, [slug]);

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

  const onAddFromCard = (product: { id: string; name: string; price: number; image?: string }) => {
    addItem({ id: product.id, name: product.name, price: product.price, image: product.image });
    setLastAddedId(product.id);
    setCartOpen(true);
    success(`${product.name} adicionado ao carrinho!`);
  };

  const goCheckout = () => navigate("/storefront/checkout");

  const resetAndSwitchMode = (modeInfinite: boolean) => {
    setUseInfinite(modeInfinite);
    setProducts([]);
    setPage(0);
  };

  // Convert cart items to CartDrawer format
  const cartDrawerItems = cartItems.map(item => ({
    id: item.id,
    title: item.name,
    qty: item.quantity,
    price: item.price
  }));

  // Convert products to ProductCard format
  const productCardItems = products.map(p => ({
    id: p.id,
    name: p.title,
    price: p.price,
    image: p.image
  }));

  return (
    <div
      className="min-h-screen"
      style={
        theme?.backgroundImage && bgReady
          ? {
              backgroundImage: `url(${theme.backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }
          : theme
          ? {
              backgroundImage: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`,
            }
          : undefined
      }
    >
      <StorefrontHeader
        storeName="Loja Exemplo"
        storeSlug={slug}
        onCartClick={() => setCartOpen(true)}
        cartItemsCount={totalItems}
        primaryColor={theme?.primaryColor}
        secondaryColor={theme?.secondaryColor}
        accentColor={theme?.accentColor}
      />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex flex-1 items-center gap-3">
            <input
              placeholder="Buscar marmitas..."
              className="h-10 flex-1 rounded-md border border-[#E5E7EB] px-3 focus:border-[#D22630] focus:ring-2 focus:ring-[#D22630]/20 outline-none"
            />
            <button
              className="rounded-md px-3 py-2 text-[#1F2937]"
              style={{ backgroundColor: theme?.secondaryColor || '#FFC107' }}
            >
              Filtrar
            </button>
          </div>
          <div className="ml-4 flex items-center gap-2 text-sm">
            <span className="text-[#6B7280]">Modo:</span>
            <button
              onClick={() => resetAndSwitchMode(true)}
              className={`rounded px-3 py-1 border ${
                useInfinite ? "text-white" : "border-[#E5E7EB] text-[#1F2937]"
              }`}
              style={useInfinite ? { backgroundColor: theme?.primaryColor || '#D22630', borderColor: theme?.primaryColor || '#D22630' } : undefined}
            >
              Infinite
            </button>
            <button
              onClick={() => resetAndSwitchMode(false)}
              className={`rounded px-3 py-1 border ${
                !useInfinite ? "text-white" : "border-[#E5E7EB] text-[#1F2937]"
              }`}
              style={!useInfinite ? { backgroundColor: theme?.primaryColor || '#D22630', borderColor: theme?.primaryColor || '#D22630' } : undefined}
            >
              Paginação
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {productCardItems.map((p) => (
            <ProductCard key={p.id} product={p} onAddToCart={onAddFromCard} />
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
        items={cartDrawerItems}
        onClose={() => setCartOpen(false)}
        onQtyChange={(id: string, qty: number) => updateQuantity(id, qty)}
        onCheckout={goCheckout}
        lastAddedId={lastAddedId}
        onAddToCart={(p) => addItem({ id: p.id, name: p.title, price: p.price })}
      />
    </div>
  );
}