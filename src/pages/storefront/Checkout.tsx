import React, { useState } from "react";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";

export default function Checkout() {
  const [loading, setLoading] = useState(false);

  const confirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      window.location.href = "/storefront/order-confirmation?pedido=12345";
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-6">
      <div className="mx-auto max-w-4xl px-4">
        <h1 className="mb-4 text-2xl font-bold text-[#1F2937]">Checkout</h1>
        <div className="grid gap-6 md:grid-cols-5">
          <form onSubmit={confirm} className="md:col-span-3 space-y-4 rounded-md border border-[#E5E7EB] bg-white p-4">
            <div>
              <h2 className="mb-2 text-lg font-semibold text-[#1F2937]">Endereço de entrega</h2>
              <div className="grid gap-3 md:grid-cols-2">
                <Input placeholder="CEP" />
                <Input placeholder="Rua" />
                <Input placeholder="Número" />
                <Input placeholder="Bairro" />
                <Input placeholder="Cidade" />
                <Input placeholder="UF" />
              </div>
            </div>
            <div>
              <h2 className="mb-2 text-lg font-semibold text-[#1F2937]">Pagamento</h2>
              <div className="rounded-md border border-dashed border-[#E5E7EB] p-6 text-center text-[#4B5563]">
                Form de pagamento Asaas aqui
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input placeholder="Cupom de desconto" />
              <Button variant="ghost" type="button">Aplicar</Button>
            </div>
            <Button type="submit" loading={loading} variant="primary" className="w-full">
              Finalizar pedido
            </Button>
          </form>
          <aside className="md:col-span-2 space-y-3">
            <div className="rounded-md border border-[#E5E7EB] bg-white p-4">
              <h3 className="mb-2 font-semibold text-[#1F2937]">Resumo</h3>
              <div className="space-y-1 text-[#4B5563]">
                <div className="flex justify-between"><span>Subtotal</span><span>R$ 72,30</span></div>
                <div className="flex justify-between"><span>Entrega</span><span>R$ 7,90</span></div>
                <div className="flex justify-between font-semibold text-[#1F2937]">
                  <span>Total</span><span>R$ 80,20</span>
                </div>
              </div>
            </div>
            <div className="rounded-md border border-[#E5E7EB] bg-[#FFC107]/10 p-3 text-sm text-[#1F2937]">
              Pagamento realizado com segurança via Asaas.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
