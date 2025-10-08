
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { StorefrontHeader } from "../../components/layout/StorefrontHeader";
import { Button } from "../../components/common/Button";

export default function OrderConfirmationBackend() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { pedidoId?: string; total?: number } | null;

  const pedidoId = state?.pedidoId || 'N/A';
  const total = state?.total || 0;

  return (
    <>
      <StorefrontHeader
        storeName={localStorage.getItem('deliverei_tenant_slug') === 'pizza-express' ? 'Pizza Express' : 'Burger King'}
        onCartClick={() => {}}
        cartCount={0}
      />
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-md border border-[#E5E7EB] bg-white p-8 text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-[#1F2937] mb-2">
            Pedido Confirmado!
          </h1>
          
          <p className="text-[#6B7280] mb-6">
            Seu pedido foi realizado com sucesso e está sendo preparado.
          </p>

          <div className="rounded-md bg-[#F3F4F6] p-4 mb-6">
            <div className="text-sm text-[#6B7280] mb-1">Número do Pedido</div>
            <div className="text-xl font-bold text-[#1F2937] mb-3">
              #{pedidoId}
            </div>
            <div className="text-sm text-[#6B7280] mb-1">Valor Total</div>
            <div className="text-2xl font-bold text-[#D22630]">
              R$ {total.toFixed(2)}
            </div>
          </div>

          <p className="text-sm text-[#6B7280] mb-6">
            Você receberá atualizações sobre o status do seu pedido por e-mail.
          </p>

          <div className="flex gap-3 justify-center">
            <Button
              variant="secondary"
              onClick={() => navigate('/storefront-backend')}
            >
              Voltar para Loja
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/admin/store/orders')}
            >
              Ver Meus Pedidos
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
