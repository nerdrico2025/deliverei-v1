import React from "react";
import { Button } from "../../components/common/Button";
import { CheckCircle } from "lucide-react";

export default function OrderConfirmation() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] py-12">
      <div className="mx-auto max-w-2xl px-4">
        <div className="rounded-md border border-[#E5E7EB] bg-white p-8 text-center shadow-sm">
          <div className="mb-4 flex justify-center">
            <CheckCircle className="text-[#16A34A]" size={64} />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-[#1F2937]">Pedido confirmado!</h1>
          <p className="mb-6 text-[#4B5563]">
            Seu pedido foi recebido com sucesso. Em breve você receberá uma confirmação no WhatsApp.
          </p>
          <div className="mb-6 rounded bg-[#F9FAFB] p-4">
            <div className="mb-1 text-sm text-[#4B5563]">Número do pedido</div>
            <div className="text-xl font-bold text-[#1F2937]">#12345</div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a href="/storefront">
              <Button variant="secondary">Voltar à loja</Button>
            </a>
            <Button variant="primary">Acompanhar pedido</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
