
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pagamentosApi, Pagamento } from '../../services/backendApi';
import { CreditCard, FileText, QrCode, Filter, Download } from 'lucide-react';
import { useToast } from '../../ui/feedback/ToastContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const STATUS_CONFIG = {
  PENDENTE: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  APROVADO: { label: 'Aprovado', color: 'bg-green-100 text-green-800' },
  RECUSADO: { label: 'Recusado', color: 'bg-red-100 text-red-800' },
  CANCELADO: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800' },
};

const METODO_ICONS = {
  PIX: QrCode,
  CARTAO: CreditCard,
  BOLETO: FileText,
};

export const HistoricoPagamentos: React.FC = () => {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroMetodo, setFiltroMetodo] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const { push } = useToast();

  const limit = 10;

  useEffect(() => {
    fetchPagamentos();
  }, [page, filtroTipo, filtroMetodo, filtroStatus]);

  const fetchPagamentos = async () => {
    try {
      setLoading(true);
      const params: any = {
        limit,
        offset: (page - 1) * limit,
      };
      if (filtroTipo) params.tipo = filtroTipo;
      if (filtroMetodo) params.metodoPagamento = filtroMetodo;
      if (filtroStatus) params.status = filtroStatus;

      const { pagamentos: data, total: totalCount } = await pagamentosApi.listar(params);
      setPagamentos(data);
      setTotal(totalCount);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      push({ type: 'error', message: 'Erro ao carregar histórico de pagamentos' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalhes = (id: string) => {
    navigate(`/pagamentos/${id}`);
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Histórico de Pagamentos</h1>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select
                value={filtroTipo}
                onChange={(e) => { setFiltroTipo(e.target.value); setPage(1); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="ASSINATURA">Assinatura</option>
                <option value="PEDIDO">Pedido</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Método</label>
              <select
                value={filtroMetodo}
                onChange={(e) => { setFiltroMetodo(e.target.value); setPage(1); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="PIX">PIX</option>
                <option value="CARTAO">Cartão</option>
                <option value="BOLETO">Boleto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filtroStatus}
                onChange={(e) => { setFiltroStatus(e.target.value); setPage(1); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="PENDENTE">Pendente</option>
                <option value="APROVADO">Aprovado</option>
                <option value="RECUSADO">Recusado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela de Pagamentos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {pagamentos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Nenhum pagamento encontrado</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Data</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Tipo</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Método</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Valor</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagamentos.map((pagamento) => {
                      const MetodoIcon = METODO_ICONS[pagamento.metodoPagamento];
                      const statusConfig = STATUS_CONFIG[pagamento.status];
                      
                      return (
                        <tr key={pagamento.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            {format(new Date(pagamento.criadoEm), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm">{pagamento.tipo}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <MetodoIcon className="w-4 h-4 text-gray-600" />
                              <span className="text-sm">{pagamento.metodoPagamento}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-semibold">
                            R$ {pagamento.valor.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleVerDetalhes(pagamento.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Ver Detalhes
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <p className="text-sm text-gray-600">
                    Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, total)} de {total} pagamentos
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
