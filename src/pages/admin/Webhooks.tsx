
import React, { useEffect, useState } from 'react';
import { webhooksApi, WebhookLog } from '../../services/backendApi';
import { Webhook, CheckCircle, XCircle, Filter, Eye } from 'lucide-react';
import { useToast } from '../../ui/feedback/ToastContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Webhooks: React.FC = () => {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroOrigem, setFiltroOrigem] = useState<string>('');
  const [filtroProcessado, setFiltroProcessado] = useState<string>('');
  const [logSelecionado, setLogSelecionado] = useState<WebhookLog | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { push } = useToast();

  const limit = 20;

  useEffect(() => {
    fetchLogs();
  }, [page, filtroOrigem, filtroProcessado]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: any = {
        limit,
        offset: (page - 1) * limit,
      };
      if (filtroOrigem) params.origem = filtroOrigem;
      if (filtroProcessado !== '') params.processado = filtroProcessado === 'true';

      const { logs: data, total: totalCount } = await webhooksApi.getLogs(params);
      setLogs(data);
      setTotal(totalCount);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      push({ type: 'error', message: 'Erro ao carregar logs de webhooks' });
    } finally {
      setLoading(false);
    }
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
        <div className="flex items-center gap-3 mb-8">
          <Webhook className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Logs de Webhooks</h1>
            <p className="text-gray-600">Monitore eventos recebidos do Stripe e Asaas</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Origem</label>
              <select
                value={filtroOrigem}
                onChange={(e) => { setFiltroOrigem(e.target.value); setPage(1); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas</option>
                <option value="STRIPE">Stripe</option>
                <option value="ASAAS">Asaas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filtroProcessado}
                onChange={(e) => { setFiltroProcessado(e.target.value); setPage(1); }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="true">Processado</option>
                <option value="false">Não Processado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela de Logs */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Nenhum log de webhook encontrado</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Data/Hora</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Origem</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Evento</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">
                          {format(new Date(log.criadoEm), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              log.origem === 'STRIPE'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {log.origem}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm font-mono">{log.evento}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {log.processado ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-600">Processado</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-red-600" />
                                <span className="text-sm text-red-600">Erro</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setLogSelecionado(log)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Ver Detalhes
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <p className="text-sm text-gray-600">
                    Mostrando {(page - 1) * limit + 1} a {Math.min(page * limit, total)} de {total} logs
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

      {/* Modal de Detalhes */}
      {logSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="bg-blue-600 text-white p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Detalhes do Webhook</h2>
                <p className="text-blue-100 text-sm mt-1">ID: {logSelecionado.id}</p>
              </div>
              <button
                onClick={() => setLogSelecionado(null)}
                className="text-white hover:text-gray-200"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Origem</h3>
                  <p className="text-lg font-semibold">{logSelecionado.origem}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Evento</h3>
                  <p className="text-lg font-semibold font-mono">{logSelecionado.evento}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Data/Hora</h3>
                  <p className="text-lg font-semibold">
                    {format(new Date(logSelecionado.criadoEm), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Status</h3>
                  <div className="flex items-center gap-2">
                    {logSelecionado.processado ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-lg font-semibold text-green-600">Processado</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span className="text-lg font-semibold text-red-600">Erro</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {logSelecionado.erro && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="text-sm font-medium text-red-800 mb-2">Erro</h3>
                  <p className="text-sm text-red-700 font-mono">{logSelecionado.erro}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">Payload</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(logSelecionado.payload, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end">
              <button
                onClick={() => setLogSelecionado(null)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
