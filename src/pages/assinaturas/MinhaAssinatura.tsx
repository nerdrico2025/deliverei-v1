
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assinaturasApi, Assinatura, HistoricoPagamentoAssinatura } from '../../services/backendApi';
import { CreditCard, Calendar, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '../../ui/feedback/ToastContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_CONFIG = {
  ATIVA: { label: 'Ativa', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  CANCELADA: { label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: XCircle },
  SUSPENSA: { label: 'Suspensa', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  TRIAL: { label: 'Período de Teste', color: 'bg-blue-100 text-blue-800', icon: Clock },
};

export const MinhaAssinatura: React.FC = () => {
  const [assinatura, setAssinatura] = useState<Assinatura | null>(null);
  const [historico, setHistorico] = useState<HistoricoPagamentoAssinatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [processando, setProcessando] = useState(false);
  const navigate = useNavigate();
  const { push } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assinaturaData, historicoData] = await Promise.all([
        assinaturasApi.getMinha(),
        assinaturasApi.getHistorico(),
      ]);
      setAssinatura(assinaturaData);
      setHistorico(historicoData);
    } catch (error: any) {
      console.error('Erro ao carregar assinatura:', error);
      if (error.response?.status === 404) {
        push({ type: 'info', message: 'Você ainda não possui uma assinatura' });
        navigate('/assinaturas/planos');
      } else {
        push({ type: 'error', message: 'Erro ao carregar assinatura' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura?')) return;

    try {
      setProcessando(true);
      await assinaturasApi.cancelar();
      push({ type: 'success', message: 'Assinatura cancelada com sucesso' });
      fetchData();
    } catch (error: any) {
      console.error('Erro ao cancelar assinatura:', error);
      push({ type: 'error', message: error.response?.data?.message || 'Erro ao cancelar assinatura' });
    } finally {
      setProcessando(false);
    }
  };

  const handleReativar = async () => {
    try {
      setProcessando(true);
      await assinaturasApi.reativar();
      push({ type: 'success', message: 'Assinatura reativada com sucesso' });
      fetchData();
    } catch (error: any) {
      console.error('Erro ao reativar assinatura:', error);
      push({ type: 'error', message: error.response?.data?.message || 'Erro ao reativar assinatura' });
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

  if (!assinatura) {
    return null;
  }

  const statusConfig = STATUS_CONFIG[assinatura.status];
  const StatusIcon = statusConfig.icon;
  const usoPedidosPercentual = assinatura.plano.limitePedidos !== -1
    ? (assinatura.usoPedidos / assinatura.plano.limitePedidos) * 100
    : 0;
  const usoProdutosPercentual = assinatura.plano.limiteProdutos !== -1
    ? (assinatura.usoProdutos / assinatura.plano.limiteProdutos) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Minha Assinatura</h1>

        {/* Card da Assinatura */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{assinatura.plano.nome}</h2>
              <p className="text-gray-600 mt-1">{assinatura.plano.descricao}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${statusConfig.color}`}>
              <StatusIcon className="w-4 h-4" />
              {statusConfig.label}
            </span>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-start gap-3">
              <CreditCard className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Valor Mensal</p>
                <p className="text-xl font-bold text-gray-900">R$ {assinatura.valorMensal.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Próxima Cobrança</p>
                <p className="text-xl font-bold text-gray-900">
                  {assinatura.proximaCobranca
                    ? format(new Date(assinatura.proximaCobranca), 'dd/MM/yyyy', { locale: ptBR })
                    : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">Membro desde</p>
                <p className="text-xl font-bold text-gray-900">
                  {format(new Date(assinatura.dataInicio), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            </div>
          </div>

          {/* Uso dos Limites */}
          <div className="space-y-4 mb-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Pedidos</span>
                <span className="font-semibold">
                  {assinatura.usoPedidos} / {assinatura.plano.limitePedidos === -1 ? '∞' : assinatura.plano.limitePedidos}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${usoPedidosPercentual > 80 ? 'bg-red-600' : 'bg-blue-600'}`}
                  style={{ width: `${Math.min(usoPedidosPercentual, 100)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Produtos</span>
                <span className="font-semibold">
                  {assinatura.usoProdutos} / {assinatura.plano.limiteProdutos === -1 ? '∞' : assinatura.plano.limiteProdutos}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${usoProdutosPercentual > 80 ? 'bg-red-600' : 'bg-blue-600'}`}
                  style={{ width: `${Math.min(usoProdutosPercentual, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-4">
            {assinatura.status === 'ATIVA' || assinatura.status === 'TRIAL' ? (
              <>
                <button
                  onClick={() => navigate('/assinaturas/planos')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Mudar Plano
                </button>
                <button
                  onClick={handleCancelar}
                  disabled={processando}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  {processando ? 'Processando...' : 'Cancelar Assinatura'}
                </button>
              </>
            ) : assinatura.status === 'CANCELADA' ? (
              <button
                onClick={handleReativar}
                disabled={processando}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {processando ? 'Processando...' : 'Reativar Assinatura'}
              </button>
            ) : null}
          </div>
        </div>

        {/* Histórico de Pagamentos */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Histórico de Pagamentos</h2>
          
          {historico.length === 0 ? (
            <p className="text-gray-600 text-center py-8">Nenhum pagamento registrado ainda</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Data</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Valor</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Método</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.map((pagamento) => (
                    <tr key={pagamento.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {format(new Date(pagamento.dataPagamento), 'dd/MM/yyyy', { locale: ptBR })}
                      </td>
                      <td className="py-3 px-4 font-semibold">R$ {pagamento.valor.toFixed(2)}</td>
                      <td className="py-3 px-4">{pagamento.metodoPagamento}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            pagamento.status === 'APROVADO'
                              ? 'bg-green-100 text-green-800'
                              : pagamento.status === 'PENDENTE'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {pagamento.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {pagamento.faturaUrl && (
                          <a
                            href={pagamento.faturaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Ver Fatura
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
