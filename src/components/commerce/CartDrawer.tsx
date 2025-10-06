import React from "react";
import { Button } from "../common/Button";
import { X, Plus, Minus } from "lucide-react";

type CartItem = { id: string; title: string; qty: number; price: number };

export const CartDrawer: React.FC<{
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onQtyChange: (id: string, qty: number) => void;
  onCheckout: () => void;
}> = ({ open, items, onClose, onQtyChange, onCheckout }) => {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform bg-white shadow-2xl transition-transform duration-300 flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ height: "100dvh" }}
      >
        <div className="flex items-center justify-between border-b border-[#E5E7EB] p-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-[#1F2937]">Seu carrinho</h3>
          <button onClick={onClose} aria-label="Fechar" className="text-[#4B5563] hover:text-[#1F2937]">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center text-[#4B5563]">Seu carrinho está vazio.</div>
          ) : (
            items.map((it) => (
              <div key={it.id} className="mb-3 flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <div>
                  <div className="font-medium text-[#1F2937]">{it.title}</div>
                  <div className="text-sm text-[#4B5563]">R$ {it.price.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onQtyChange(it.id, Math.max(1, it.qty - 1))}
                    className="h-8 w-8 rounded border border-[#E5E7EB] flex items-center justify-center hover:bg-[#F9FAFB]"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center">{it.qty}</span>
                  <button
                    onClick={() => onQtyChange(it.id, it.qty + 1)}
                    className="h-8 w-8 rounded border border-[#E5E7EB] flex items-center justify-center hover:bg-[#F9FAFB]"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="sticky bottom-0 bg-white border-t border-[#E5E7EB] flex-shrink-0">
          <div className="p-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-[#4B5563]">Subtotal</span>
              <span className="font-semibold text-[#111827]">R$ {subtotal.toFixed(2)}</span>
            </div>
            <Button
              variant="primary"
              onClick={onCheckout}
              disabled={items.length === 0}
              className="w-full h-12"
            >
              Ir para checkout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
