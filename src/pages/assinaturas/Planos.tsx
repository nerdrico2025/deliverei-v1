
import React, { useEffect, useState } from 'react';
import { Loading } from '../../components/common/Loading';
import { useNavigate } from 'react-router-dom';
import { Loading } from '../../components/common/Loading';
import { assinaturasApi, PlanoAssinatura } from '../../services/backendApi';
import { Loading } from '../../components/common/Loading';
import { Check, Zap } from 'lucide-react';
import { Loading } from '../../components/common/Loading';
import { useToast } from '../../ui/feedback/ToastContext';
import { Loading } from '../../components/common/Loading';

export const Planos: React.FC = () => {
  const [planos, setPlanos] = useState<PlanoAssinatura[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { push } = useToast();

  useEffect(() => {
    const fetchPlanos = async () => {
      try {
        const data = await assinaturasApi.getPlanos();
        setPlanos(data);
      } catch (error) {
        console.error('Erro ao carregar planos:', error);
        push({ type: 'error', message: 'Erro ao carregar planos de assinatura' });
      } finally {
        setLoading(false);
      }
    };

    fetchPlanos();
  }, [push]);

  const handleAssinar = (planoId: string) => {
    navigate(`/assinaturas/checkout/${planoId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loading size="md" />
          <p className="mt-4 text-gray-600">Carregando planos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha o Plano Ideal para Seu Negócio
          </h1>
          <p className="text-xl text-gray-600">
            Comece com 7 dias grátis. Cancele quando quiser.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {planos.map((plano, index) => {
            const isRecomendado = index === 1; // Plano do meio é recomendado
            
            return (
              <div
                key={plano.id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden transform transition-all hover:scale-105 ${
                  isRecomendado ? 'ring-2 ring-blue-600' : ''
                }`}
              >
                {isRecomendado && (
                  <div className="bg-blue-600 text-white text-center py-2 font-semibold flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    Mais Popular
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plano.nome}</h3>
                  <p className="text-gray-600 mb-6">{plano.descricao}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      R$ {plano.preco.toFixed(2)}
                    </span>
                    <span className="text-gray-600">/mês</span>
                  </div>

                  <button
                    onClick={() => handleAssinar(plano.id)}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                      isRecomendado
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Assinar Agora
                  </button>

                  <div className="mt-8 space-y-4">
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">
                        {plano.limitePedidos === -1 ? 'Pedidos ilimitados' : `${plano.limitePedidos} pedidos/mês`}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">
                        {plano.limiteProdutos === -1 ? 'Produtos ilimitados' : `${plano.limiteProdutos} produtos`}
                      </span>
                    </div>
                    {plano.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center text-gray-600">
          <p>Todos os planos incluem 7 dias de teste grátis</p>
          <p className="mt-2">Pagamento seguro via Stripe</p>
        </div>
      </div>
    </div>
  );
};
