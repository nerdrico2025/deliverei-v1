
import React, { useEffect, useState } from 'react';
import { pedidosApi, Pedido, PedidosFiltros } from '../../services/backendApi';
import { Search, Filter, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getStatusColor, STATUS_LABELS } from '../../utils/statusColors';
import { Loading } from '../../components/common';
import { useApi, usePagination } from '../../hooks';

interface PedidosResponse {
  pedidos: Pedido[];
  total: number;
}

export const Pedidos: React.FC = () => {
  const { data, loading, execute } = useApi<PedidosResponse>();
  const pagination = usePagination(1, 10);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [filtros, setFiltros] = useState<Omit<PedidosFiltros, 'page' | 'limit'>>({});

  const fetchPedidos = async () => {
    const result = await execute(() =>
      pedidosApi.listar({
        ...filtros,
        page: pagination.page,
        limit: pagination.limit,
      })
    );
    if (result) {
      pagination.setTotal(result.total);
    }
  };

  useEffect(() => {
    fetchPedidos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros, pagination.page, pagination.limit]);

  const handleStatusChange = async (pedidoId: string, novoStatus: string) => {
    try {
      await pedidosApi.atualizarStatus(pedidoId, novoStatus);
      fetchPedidos();
      setShowStatusModal(false);
      setSelectedPedido(null);
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const pedidos = data?.pedidos || [];

  const statusOptions = [
    'PENDENTE',
    'CONFIRMADO',
    'EM_PREPARO',
    'SAIU_ENTREGA',
    'ENTREGUE',
    'CANCELADO',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestão de Pedidos</h1>
        <p className="text-gray-500 mt-1">Gerencie todos os pedidos da sua empresa</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filtros.status || ''}
              onChange={(e) => {
                setFiltros({ ...filtros, status: e.target.value || undefined });
                pagination.goToPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Início
            </label>
            <input
              type="date"
              value={filtros.dataInicio || ''}
              onChange={(e) => {
                setFiltros({ ...filtros, dataInicio: e.target.value || undefined });
                pagination.goToPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Fim
            </label>
            <input
              type="date"
              value={filtros.dataFim || ''}
              onChange={(e) => {
                setFiltros({ ...filtros, dataFim: e.target.value || undefined });
                pagination.goToPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Cliente
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Nome do cliente..."
                value={filtros.clienteNome || ''}
                onChange={(e) => {
                  setFiltros({ ...filtros, clienteNome: e.target.value || undefined });
                  pagination.goToPage(1);
                }}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Pedidos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loading size="md" />
          </div>
        ) : pedidos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pedidos.map(pedido => {
                    const statusColor = getStatusColor(pedido.status);
                    return (
                      <tr key={pedido.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            #{pedido.numero}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{pedido.usuario?.nome}</div>
                          <div className="text-xs text-gray-500">{pedido.usuario?.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(pedido.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor.bg} ${statusColor.text}`}>
                            {STATUS_LABELS[pedido.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          R$ {pedido.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedPedido(pedido)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Ver detalhes"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPedido(pedido);
                                setShowStatusModal(true);
                              }}
                              className="text-green-600 hover:text-green-900"
                              title="Atualizar status"
                            >
                              <Filter className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Mostrando {(pagination.page - 1) * pagination.limit + 1} até{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} pedidos
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={pagination.previousPage}
                  disabled={!pagination.hasPreviousPage}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-700">
                  Página {pagination.page} de {pagination.totalPages}
                </span>
                <button
                  onClick={pagination.nextPage}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedPedido && !showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Pedido #{selectedPedido.numero}
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações do Cliente</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm"><span className="font-medium">Nome:</span> {selectedPedido.usuario?.nome}</p>
                  <p className="text-sm"><span className="font-medium">Email:</span> {selectedPedido.usuario?.email}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Endereço de Entrega</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm">
                    {selectedPedido.enderecoEntrega.rua}, {selectedPedido.enderecoEntrega.numero}
                    {selectedPedido.enderecoEntrega.complemento && ` - ${selectedPedido.enderecoEntrega.complemento}`}
                  </p>
                  <p className="text-sm">
                    {selectedPedido.enderecoEntrega.bairro}, {selectedPedido.enderecoEntrega.cidade} - {selectedPedido.enderecoEntrega.estado}
                  </p>
                  <p className="text-sm">CEP: {selectedPedido.enderecoEntrega.cep}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Itens do Pedido</h3>
                <div className="space-y-3">
                  {selectedPedido.itens.map(item => (
                    <div key={item.id} className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
                      {item.produto.imagemUrl && (
                        <img
                          src={item.produto.imagemUrl}
                          alt={item.produto.nome}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.produto.nome}</p>
                        <p className="text-sm text-gray-500">
                          {item.quantidade}x R$ {item.precoUnitario.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        R$ {(item.quantidade * item.precoUnitario).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">R$ {selectedPedido.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedPedido.desconto > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Desconto:</span>
                      <span className="text-green-600">- R$ {selectedPedido.desconto.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">R$ {selectedPedido.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedPedido(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Atualizar Status */}
      {showStatusModal && selectedPedido && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Atualizar Status - #{selectedPedido.numero}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Status atual: <span className="font-semibold">{STATUS_LABELS[selectedPedido.status]}</span>
              </p>
              <div className="space-y-2">
                {statusOptions.map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(selectedPedido.id, status)}
                    disabled={status === selectedPedido.status}
                    className={`w-full px-4 py-3 rounded-lg text-left font-medium transition-colors ${
                      status === selectedPedido.status
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedPedido(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
