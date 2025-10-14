
import React, { useEffect, useState } from 'react';
import { pedidosApi, Pedido } from '../../services/backendApi';
import { Package, Eye, X, XCircle, Star } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getStatusColor, STATUS_LABELS } from '../../utils/statusColors';
import { ModalAvaliacao } from '../../components/ModalAvaliacao';
import { Loading } from '../../components/common/Loading';

export const MeusPedidos: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [showAvaliacaoModal, setShowAvaliacaoModal] = useState(false);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      const data = await pedidosApi.meusPedidos();
      setPedidos(data);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const handleCancelar = async (pedidoId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este pedido?')) return;
    try {
      await pedidosApi.cancelar(pedidoId);
      fetchPedidos();
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meus Pedidos</h1>
          <p className="text-gray-500 mt-1">Acompanhe o status dos seus pedidos</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loading size="md" />
          </div>
        ) : pedidos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Você ainda não fez nenhum pedido</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map(pedido => {
              const statusColor = getStatusColor(pedido.status);
              const podeCancelar = pedido.status === 'PENDENTE';
              const podeAvaliar = pedido.status === 'ENTREGUE';

              return (
                <div key={pedido.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Pedido #{pedido.numero}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {format(new Date(pedido.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColor.bg} ${statusColor.text}`}>
                        {STATUS_LABELS[pedido.status]}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      {pedido.itens.map(item => (
                        <div key={item.id} className="flex items-center gap-3">
                          {item.produto.imagemUrl && (
                            <img
                              src={item.produto.imagemUrl}
                              alt={item.produto.nome}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{item.produto.nome}</p>
                            <p className="text-xs text-gray-500">
                              {item.quantidade}x R$ {item.precoUnitario.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-lg font-bold text-gray-900">
                        Total: R$ {pedido.total.toFixed(2)}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedPedido(pedido)}
                          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Ver Detalhes
                        </button>
                        {podeAvaliar && (
                          <button
                            onClick={() => {
                              setSelectedPedido(pedido);
                              setShowAvaliacaoModal(true);
                            }}
                            className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-800 flex items-center gap-2"
                          >
                            <Star className="w-4 h-4" />
                            Avaliar
                          </button>
                        )}
                        {podeCancelar && (
                          <button
                            onClick={() => handleCancelar(pedido.id)}
                            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 flex items-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de Detalhes */}
        {selectedPedido && !showAvaliacaoModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Pedido #{selectedPedido.numero}
                </h2>
                <button
                  onClick={() => setSelectedPedido(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-6">
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
              </div>
            </div>
          </div>
        )}

        {/* Modal de Avaliação */}
        {showAvaliacaoModal && selectedPedido && (
          <ModalAvaliacao
            pedido={selectedPedido}
            onClose={() => {
              setShowAvaliacaoModal(false);
              setSelectedPedido(null);
            }}
            onSuccess={() => {
              setShowAvaliacaoModal(false);
              setSelectedPedido(null);
              fetchPedidos();
            }}
          />
        )}
      </div>
    </div>
  );
};
