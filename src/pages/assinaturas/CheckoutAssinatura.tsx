
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { assinaturasApi, PlanoAssinatura } from '../../services/backendApi';
import { CreditCard, FileText, ArrowLeft } from 'lucide-react';
import { useToast } from '../../ui/feedback/ToastContext';

// TODO: Substituir pela chave pública do Stripe (modo test)
const stripePromise = loadStripe('pk_test_YOUR_STRIPE_PUBLIC_KEY');

export const CheckoutAssinatura: React.FC = () => {
  const { planoId } = useParams<{ planoId: string }>();
  const [plano, setPlano] = useState<PlanoAssinatura | null>(null);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [metodoPagamento, setMetodoPagamento] = useState<'CARTAO' | 'BOLETO'>('CARTAO');
  const navigate = useNavigate();
  const { push } = useToast();

  useEffect(() => {
    const fetchPlano = async () => {
      try {
        const planos = await assinaturasApi.getPlanos();
        const planoSelecionado = planos.find(p => p.id === planoId);
        if (planoSelecionado) {
          setPlano(planoSelecionado);
        } else {
          push({ type: 'error', message: 'Plano não encontrado' });
          navigate('/assinaturas/planos');
        }
      } catch (error) {
        console.error('Erro ao carregar plano:', error);
        push({ type: 'error', message: 'Erro ao carregar plano' });
      } finally {
        setLoading(false);
      }
    };

    if (planoId) {
      fetchPlano();
    }
  }, [planoId, navigate, push]);

  const handleConfirmarAssinatura = async () => {
    if (!plano) return;

    try {
      setProcessando(true);
      const { sessionId, url } = await assinaturasApi.createCheckout({
        planoId: plano.id,
        metodoPagamento,
      });

      // Redirecionar para Stripe Checkout
      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          push({ type: 'error', message: error.message || 'Erro ao processar pagamento' });
        }
      } else {
        // Fallback: redirecionar via URL
        window.location.href = url;
      }
    } catch (error: any) {
      console.error('Erro ao criar checkout:', error);
      push({ type: 'error', message: error.response?.data?.message || 'Erro ao processar assinatura' });
    } finally {
      setProcessando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!plano) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/assinaturas/planos')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar para planos
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 text-white p-6">
            <h1 className="text-2xl font-bold">Finalizar Assinatura</h1>
            <p className="mt-2">Complete os dados para assinar o plano {plano.nome}</p>
          </div>

          <div className="p-6">
            {/* Resumo do Plano */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Resumo do Plano</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plano:</span>
                  <span className="font-semibold">{plano.nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor mensal:</span>
                  <span className="font-semibold">R$ {plano.preco.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Período de teste:</span>
                  <span className="font-semibold text-green-600">7 dias grátis</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-900 font-semibold">Total hoje:</span>
                  <span className="text-xl font-bold text-green-600">R$ 0,00</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Você será cobrado R$ {plano.preco.toFixed(2)} após o período de teste
                </p>
              </div>
            </div>

            {/* Método de Pagamento */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Método de Pagamento</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMetodoPagamento('CARTAO')}
                  className={`p-4 border-2 rounded-lg flex items-center gap-3 transition-colors ${
                    metodoPagamento === 'CARTAO'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="font-medium">Cartão de Crédito</span>
                </button>
                <button
                  onClick={() => setMetodoPagamento('BOLETO')}
                  className={`p-4 border-2 rounded-lg flex items-center gap-3 transition-colors ${
                    metodoPagamento === 'BOLETO'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className="w-6 h-6" />
                  <span className="font-medium">Boleto</span>
                </button>
              </div>
            </div>

            {/* Botão Confirmar */}
            <button
              onClick={handleConfirmarAssinatura}
              disabled={processando}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {processando ? 'Processando...' : 'Confirmar Assinatura'}
            </button>

            <p className="text-sm text-gray-500 text-center mt-4">
              Ao confirmar, você concorda com nossos Termos de Serviço e Política de Privacidade
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
