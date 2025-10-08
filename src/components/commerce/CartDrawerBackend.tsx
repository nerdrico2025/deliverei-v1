
import React, { useEffect, useState } from "react";
import { X, ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { useCartContext } from "../../contexts/CartContext";
import { carrinhoApi, Recomendacao } from "../../services/backendApi";
import { Button } from "../common/Button";

type Props = {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
};

export function CartDrawerBackend({ open, onClose, onCheckout }: Props) {
  const { cart, updateItem, removeItem, loading } = useCartContext();
  const [recomendacoes, setRecomendacoes] = useState<Recomendacao[]>([]);
  const [loadingRecomendacoes, setLoadingRecomendacoes] = useState(false);

  useEffect(() => {
    if (open && cart && cart.itens.length > 0) {
      loadRecomendacoes();
    }
  }, [open, cart]);

  const loadRecomendacoes = async () => {
    setLoadingRecomendacoes(true);
    try {
      const data = await carrinhoApi.obterRecomendacoes();
      setRecomendacoes(data);
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error);
    } finally {
      setLoadingRecomendacoes(false);
    }
  };

  const handleUpdateQty = async (itemId: string, delta: number) => {
    const item = cart?.itens.find(i => i.id === itemId);
    if (!item) return;
    
    const newQty = item.quantidade + delta;
    if (newQty < 1) return;
    
    await updateItem(itemId, newQty);
  };

  const handleRemove = async (itemId: string) => {
    await removeItem(itemId);
  };

  if (!open) return null;

  const isEmpty = !cart || cart.itens.length === 0;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] p-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-[#D22630]" />
            <h2 className="text-lg font-semibold text-[#1F2937]">
              Carrinho ({cart?.itens.length || 0})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-[#F3F4F6] transition-colors"
          >
            <X className="h-5 w-5 text-[#6B7280]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className="h-16 w-16 text-[#D1D5DB] mb-4" />
              <p className="text-[#6B7280]">Seu carrinho está vazio</p>
            </div>
          ) : (
            <>
              {/* Items */}
              <div className="space-y-4 mb-6">
                {cart.itens.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-md border border-[#E5E7EB] p-3"
                  >
                    <img
                      src={item.produto.imagemUrl || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=100'}
                      alt={item.produto.nome}
                      className="h-20 w-20 rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-[#1F2937] mb-1">
                        {item.produto.nome}
                      </h3>
                      <p className="text-sm text-[#D22630] font-semibold mb-2">
                        R$ {item.precoUnitario.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQty(item.id, -1)}
                          disabled={loading || item.quantidade <= 1}
                          className="rounded-md border border-[#E5E7EB] p-1 hover:bg-[#F3F4F6] disabled:opacity-50"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantidade}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(item.id, 1)}
                          disabled={loading}
                          className="rounded-md border border-[#E5E7EB] p-1 hover:bg-[#F3F4F6] disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRemove(item.id)}
                          disabled={loading}
                          className="ml-auto rounded-md p-1 text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recomendações */}
              {recomendacoes.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-[#1F2937] mb-3">
                    Você também pode gostar
                  </h3>
                  <div className="space-y-2">
                    {recomendacoes.map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-center gap-3 rounded-md border border-[#E5E7EB] p-2 hover:bg-[#F9FAFB]"
                      >
                        <img
                          src={rec.imagemUrl || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=60'}
                          alt={rec.nome}
                          className="h-12 w-12 rounded object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#1F2937]">
                            {rec.nome}
                          </p>
                          <p className="text-xs text-[#6B7280]">{rec.motivo}</p>
                        </div>
                        <p className="text-sm font-semibold text-[#D22630]">
                          R$ {rec.preco.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!isEmpty && (
          <div className="border-t border-[#E5E7EB] p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#6B7280]">Subtotal</span>
              <span className="font-medium">R$ {cart.subtotal.toFixed(2)}</span>
            </div>
            {cart.desconto && cart.desconto > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Desconto</span>
                <span className="font-medium text-green-600">
                  -R$ {cart.desconto.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span className="text-[#D22630]">R$ {cart.total.toFixed(2)}</span>
            </div>
            <Button
              onClick={onCheckout}
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              Finalizar Pedido
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
