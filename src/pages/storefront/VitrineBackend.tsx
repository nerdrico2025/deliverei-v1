
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { StorefrontHeader } from "../../components/layout/StorefrontHeader";
import { ProductCard } from "../../components/commerce/ProductCard";
import { CartDrawerBackend } from "../../components/commerce/CartDrawerBackend";
import { useCartContext } from "../../contexts/CartContext";
import { Produto, storefrontApi } from "../../services/backendApi";
import { useToast } from "../../ui/feedback/ToastContext";
import { useClientAuth } from "../../contexts/ClientAuthContext";

export default function VitrineBackend() {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { cart, addItem, fetchCart, itemCount } = useCartContext();
  const { push } = useToast();
  const { isAuthenticated, cliente } = useClientAuth();

  const [storeName, setStoreName] = useState<string>(slug || "Loja");
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Persistir o slug atual no localStorage para headers (X-Tenant-Slug)
  useEffect(() => {
    if (slug) {
      localStorage.setItem("deliverei_store_slug", slug);
    }
  }, [slug]);

  const loadProdutos = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      // Buscar info da loja para exibir o nome correto
      try {
        const loja = await storefrontApi.getLojaInfo(slug);
        if (loja?.nome) setStoreName(loja.nome);
      } catch (e) {
        // ignora erro de info e continua com slug como nome
      }
      // Buscar produtos públicos por slug (apenas ativos)
      const data = await storefrontApi.getProdutos(slug, { page: 1, limit: 100 });
      setProdutos(data);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Erro ao carregar produtos';
      push({ message: errorMsg, tone: 'error' });
      if (import.meta.env.DEV) console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  }, [push, slug]);

  useEffect(() => {
    loadProdutos();
    // Buscar carrinho apenas se o cliente estiver autenticado
    if (isAuthenticated) {
      fetchCart();
    }
  }, [loadProdutos, fetchCart, isAuthenticated]);

  const onAddFromCard = async (product: { id: string; name: string; price: number; image?: string }) => {
    try {
      // Se o cliente não estiver autenticado, direciona para login da vitrine
      if (!isAuthenticated) {
        navigate(`/loja/${slug}/login`, { state: { from: `/loja/${slug}` } });
        return;
      }
      await addItem(product.id, 1);
      setCartOpen(true);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Erro ao adicionar item:', error);
    }
  };

  const goCheckout = () => navigate(`/loja/${slug}/checkout`);

  const produtosFiltrados = useMemo(() => (
    produtos.filter(p => 
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  ), [produtos, searchTerm]);

  // Converter produtos do backend para formato do ProductCard
  const produtosFormatados = useMemo(() => (
    produtosFiltrados.map(p => ({
      id: p.id,
      name: p.nome,
      price: p.preco,
      image: p.imagemUrl || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      outOfStock: !p.disponivel,
      lowStock: p.estoque !== undefined && p.estoque < 5,
      promo_tag: p.promo_tag,
      bestseller_tag: p.bestseller_tag,
      new_tag: p.new_tag,
    }))
  ), [produtosFiltrados]);

  return (
    <>
      <StorefrontHeader
        storeName={storeName}
        storeSlug={slug}
        onCartClick={() => setCartOpen(true)}
        cartItemsCount={itemCount}
        isAuthenticated={isAuthenticated}
        cliente={cliente ? { nome: cliente.nome, email: cliente.email } : undefined}
      />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex flex-1 items-center gap-3">
            <input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 flex-1 rounded-md border border-[#E5E7EB] px-3 focus:border-[#D22630] focus:ring-2 focus:ring-[#D22630]/20 outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[280px] animate-pulse rounded-md border border-[#E5E7EB] bg-[#F3F4F6]"
              />
            ))}
          </div>
        ) : produtosFormatados.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#6B7280] text-lg">
              {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {produtosFormatados.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={onAddFromCard} />
            ))}
          </div>
        )}
      </div>

      <CartDrawerBackend
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={goCheckout}
      />
    </>
  );
}
