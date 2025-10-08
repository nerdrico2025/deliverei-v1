
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StorefrontHeader } from "../../components/layout/StorefrontHeader";
import { ProductCard } from "../../components/commerce/ProductCard";
import { CartDrawerBackend } from "../../components/commerce/CartDrawerBackend";
import { useCartContext } from "../../contexts/CartContext";
import { produtosApi, Produto } from "../../services/backendApi";
import { useToast } from "../../ui/feedback/ToastContext";

export default function VitrineBackend() {
  const navigate = useNavigate();
  const { cart, addItem, fetchCart, itemCount, lastAddedItemId } = useCartContext();
  const { push } = useToast();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadProdutos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await produtosApi.listar({ disponivel: true });
      setProdutos(data);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Erro ao carregar produtos';
      push({ message: errorMsg, tone: 'error' });
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    loadProdutos();
    fetchCart();
  }, [loadProdutos, fetchCart]);

  const onAddFromCard = async (id: string) => {
    try {
      await addItem(id, 1);
      setCartOpen(true);
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
    }
  };

  const goCheckout = () => navigate("/storefront/checkout-backend");

  const produtosFiltrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Converter produtos do backend para formato do ProductCard
  const produtosFormatados = produtosFiltrados.map(p => ({
    id: p.id,
    title: p.nome,
    price: p.preco,
    image: p.imagemUrl || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    outOfStock: !p.disponivel,
    lowStock: p.estoque !== undefined && p.estoque < 5,
  }));

  return (
    <>
      <StorefrontHeader
        storeName={localStorage.getItem('deliverei_tenant_slug') === 'pizza-express' ? 'Pizza Express' : 'Burger King'}
        onCartClick={() => setCartOpen(true)}
        cartCount={itemCount}
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
              <ProductCard key={p.id} product={p} onAdd={onAddFromCard} />
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
