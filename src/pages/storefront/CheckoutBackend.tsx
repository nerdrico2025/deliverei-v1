
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StorefrontHeader } from "../../components/layout/StorefrontHeader";
import { Input } from "../../components/common/Input";
import { Button } from "../../components/common/Button";
import { useCartContext } from "../../contexts/CartContext";
import { carrinhoApi } from "../../services/backendApi";
import { useToast } from "../../ui/feedback/ToastContext";

const FORMAS_PAGAMENTO = [
  { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'CARTAO_CREDITO', label: 'Cartão de Crédito' },
  { value: 'CARTAO_DEBITO', label: 'Cartão de Débito' },
  { value: 'PIX', label: 'PIX' },
];

export default function CheckoutBackend() {
  const navigate = useNavigate();
  const { cart, clearCart, itemCount } = useCartContext();
  const { push } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    formaPagamento: 'PIX' as 'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX',
    cupomDesconto: '',
    observacoes: '',
  });

  useEffect(() => {
    if (!cart || cart.itens.length === 0) {
      push({ message: 'Carrinho vazio. Adicione produtos antes de finalizar.', tone: 'warning' });
      navigate('/storefront-backend');
    }
  }, [cart, navigate, push]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await carrinhoApi.checkout({
        enderecoEntrega: {
          rua: formData.rua,
          numero: formData.numero,
          complemento: formData.complemento,
          bairro: formData.bairro,
          cidade: formData.cidade,
          estado: formData.estado,
          cep: formData.cep,
        },
        formaPagamento: formData.formaPagamento,
        cupomDesconto: formData.cupomDesconto || undefined,
        observacoes: formData.observacoes || undefined,
      });

      push({ message: response.mensagem || 'Pedido realizado com sucesso!', tone: 'success' });
      
      // Limpar carrinho local
      await clearCart();
      
      // Redirecionar para página de confirmação
      navigate('/storefront/order-confirmation-backend', {
        state: { pedidoId: response.pedidoId, total: response.total }
      });
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Erro ao finalizar pedido';
      push({ message: errorMsg, tone: 'error' });
      console.error('Erro no checkout:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!cart) return null;

  return (
    <>
      <StorefrontHeader
        storeName={localStorage.getItem('deliverei_tenant_slug') === 'pizza-express' ? 'Pizza Express' : 'Burger King'}
        onCartClick={() => {}}
        cartCount={itemCount}
      />
      <div className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="text-2xl font-bold text-[#1F2937] mb-6">Finalizar Pedido</h1>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Endereço de Entrega */}
              <div className="rounded-md border border-[#E5E7EB] bg-white p-6">
                <h2 className="text-lg font-semibold text-[#1F2937] mb-4">
                  Endereço de Entrega
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm text-[#4B5563]">CEP</label>
                    <Input
                      name="cep"
                      value={formData.cep}
                      onChange={handleChange}
                      placeholder="00000-000"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm text-[#4B5563]">Rua</label>
                    <Input
                      name="rua"
                      value={formData.rua}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-[#4B5563]">Número</label>
                    <Input
                      name="numero"
                      value={formData.numero}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-[#4B5563]">Complemento</label>
                    <Input
                      name="complemento"
                      value={formData.complemento}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-[#4B5563]">Bairro</label>
                    <Input
                      name="bairro"
                      value={formData.bairro}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-[#4B5563]">Cidade</label>
                    <Input
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-[#4B5563]">Estado</label>
                    <Input
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      placeholder="SP"
                      maxLength={2}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Pagamento */}
              <div className="rounded-md border border-[#E5E7EB] bg-white p-6">
                <h2 className="text-lg font-semibold text-[#1F2937] mb-4">
                  Forma de Pagamento
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm text-[#4B5563]">
                      Selecione a forma de pagamento
                    </label>
                    <select
                      name="formaPagamento"
                      value={formData.formaPagamento}
                      onChange={handleChange}
                      className="w-full rounded-md border border-[#E5E7EB] px-3 py-2 focus:border-[#D22630] focus:ring-2 focus:ring-[#D22630]/20 outline-none"
                      required
                    >
                      {FORMAS_PAGAMENTO.map(forma => (
                        <option key={forma.value} value={forma.value}>
                          {forma.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-[#4B5563]">
                      Cupom de Desconto (opcional)
                    </label>
                    <Input
                      name="cupomDesconto"
                      value={formData.cupomDesconto}
                      onChange={handleChange}
                      placeholder="Digite o código do cupom"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-[#4B5563]">
                      Observações (opcional)
                    </label>
                    <textarea
                      name="observacoes"
                      value={formData.observacoes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded-md border border-[#E5E7EB] px-3 py-2 focus:border-[#D22630] focus:ring-2 focus:ring-[#D22630]/20 outline-none"
                      placeholder="Ex: Sem cebola, tirar o tomate..."
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                loading={loading}
              >
                Confirmar Pedido
              </Button>
            </form>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <div className="rounded-md border border-[#E5E7EB] bg-white p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-[#1F2937] mb-4">
                Resumo do Pedido
              </h2>
              <div className="space-y-3 mb-4">
                {cart.itens.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">
                      {item.quantidade}x {item.produto.nome}
                    </span>
                    <span className="font-medium">
                      R$ {(item.precoUnitario * item.quantidade).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#E5E7EB] pt-3 space-y-2">
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
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-[#E5E7EB]">
                  <span>Total</span>
                  <span className="text-[#D22630]">R$ {cart.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
