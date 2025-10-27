
import React, { useEffect, useState } from 'react';
import { Loading } from '../../components/common/Loading';
import { useParams, useNavigate } from 'react-router-dom';
import { Loading } from '../../components/common/Loading';
import { pagamentosApi, Pagamento } from '../../services/backendApi';
import { Loading } from '../../components/common/Loading';
import { ArrowLeft, Copy, Download, XCircle } from 'lucide-react';
import { Loading } from '../../components/common/Loading';
import { useToast } from '../../ui/feedback/ToastContext';
import { Loading } from '../../components/common/Loading';
import { format } from 'date-fns';
import { Loading } from '../../components/common/Loading';
import { ptBR } from 'date-fns/locale';
import { Loading } from '../../components/common/Loading';
import { PagamentoPix } from '../../components/PagamentoPix';
import { Loading } from '../../components/common/Loading';
import { formatCurrency } from '../../utils/formatters';

const STATUS_CONFIG = {
  PENDENTE: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  APROVADO: { label: 'Aprovado', color: 'bg-green-100 text-green-800' },
  RECUSADO: { label: 'Recusado', color: 'bg-red-100 text-red-800' },
  CANCELADO: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800' },
};

export const DetalhesPagamento: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [pagamento, setPagamento] = useState<Pagamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelando, setCancelando] = useState(false);
  const navigate = useNavigate();
  const { push } = useToast();

  useEffect(() => {
    if (id) {
      fetchPagamento();
    }
  }, [id]);

  const fetchPagamento = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await pagamentosApi.buscar(id);
      setPagamento(data);
    } catch (error) {
      console.error('Erro ao carregar pagamento:', error);
      push({ type: 'error', message: 'Erro ao carregar detalhes do pagamento' });
      navigate('/pagamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async () => {
    if (!pagamento || !confirm('Tem certeza que deseja cancelar este pagamento?')) return;

    try {
      setCancelando(true);
      await pagamentosApi.cancelar(pagamento.id);
      push({ type: 'success', message: 'Pagamento cancelado com sucesso' });
      fetchPagamento();
    } catch (error: any) {
      console.error('Erro ao cancelar pagamento:', error);
      push({ type: 'error', message: error.response?.data?.message || 'Erro ao cancelar pagamento' });
    } finally {
      setCancelando(false);
    }
  };

  const handleCopiarBoleto = () => {
    if (pagamento?.boletoCodigoBarras) {
      navigator.clipboard.writeText(pagamento.boletoCodigoBarras);
      push({ type: 'success', message: 'Código de barras copiado!' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loading size="md" />
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!pagamento) {
    return null;
  }

  const statusConfig = STATUS_CONFIG[pagamento.status];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/pagamentos')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar para histórico
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Detalhes do Pagamento</h1>
                <p className="mt-2 text-blue-100">ID: {pagamento.id}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>

          <div className="p-6">
            {/* Informações Gerais */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Tipo</h3>
                <p className="text-lg font-semibold text-gray-900">{pagamento.tipo}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Método de Pagamento</h3>
                <p className="text-lg font-semibold text-gray-900">{pagamento.metodoPagamento}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Valor</h3>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(pagamento.valor)}</p>

              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Data de Criação</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {format(new Date(pagamento.criadoEm), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>

            {/* PIX */}
            {pagamento.metodoPagamento === 'PIX' && pagamento.pixQrCode && pagamento.pixCopiaECola && (
              <PagamentoPix
                qrCode={pagamento.pixQrCode}
                copiaECola={pagamento.pixCopiaECola}
                expiraEm={pagamento.pixExpiraEm}
                onPagamentoConfirmado={fetchPagamento}
              />
            )}

            {/* Boleto */}
            {pagamento.metodoPagamento === 'BOLETO' && (
              <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Boleto</h3>
                <div className="space-y-4">
                  {pagamento.boletoVencimento && (
                    <div>
                      <p className="text-sm text-gray-600">Vencimento</p>
                      <p className="text-lg font-semibold">
                        {format(new Date(pagamento.boletoVencimento), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  )}
                  {pagamento.boletoCodigoBarras && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Código de Barras</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={pagamento.boletoCodigoBarras}
                          readOnly
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white"
                        />
                        <button
                          onClick={handleCopiarBoleto}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Copiar
                        </button>
                      </div>
                    </div>
                  )}
                  {pagamento.boletoUrl && (
                    <a
                      href={pagamento.boletoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Download className="w-5 h-5" />
                      Baixar Boleto
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Ações */}
            {pagamento.status === 'PENDENTE' && (
              <div className="flex justify-end">
                <button
                  onClick={handleCancelar}
                  disabled={cancelando}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  {cancelando ? 'Cancelando...' : 'Cancelar Pagamento'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
