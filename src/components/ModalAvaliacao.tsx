
import React, { useState } from 'react';
import { avaliacoesApi, Pedido } from '../services/backendApi';
import { X, Star } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface ModalAvaliacaoProps {
  pedido: Pedido;
  onClose: () => void;
  onSuccess: () => void;
}

export const ModalAvaliacao: React.FC<ModalAvaliacaoProps> = ({ pedido, onClose, onSuccess }) => {
  const [avaliacoes, setAvaliacoes] = useState<Record<string, { nota: number; comentario: string }>>({});
  const [loading, setLoading] = useState(false);

  const handleNotaChange = (produtoId: string, nota: number) => {
    setAvaliacoes(prev => ({
      ...prev,
      [produtoId]: {
        ...prev[produtoId],
        nota,
      },
    }));
  };

  const handleComentarioChange = (produtoId: string, comentario: string) => {
    setAvaliacoes(prev => ({
      ...prev,
      [produtoId]: {
        ...prev[produtoId],
        comentario,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const promises = Object.entries(avaliacoes).map(([produtoId, data]) => {
        if (data.nota > 0) {
          return avaliacoesApi.criar({
            produtoId,
            pedidoId: pedido.id,
            nota: data.nota,
            comentario: data.comentario || undefined,
          });
        }
        return null;
      }).filter(Boolean);

      await Promise.all(promises);
      onSuccess();
    } catch (error) {
      console.error('Erro ao enviar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (produtoId: string, currentNota: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => handleNotaChange(produtoId, star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= currentNota
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-200'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Avaliar Produtos - Pedido #{pedido.numero}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {pedido.itens.map(item => {
            const avaliacao = avaliacoes[item.produto.id] || { nota: 0, comentario: '' };
            return (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-4 mb-4">
                  {item.produto.imagemUrl && (
                    <img
                      src={item.produto.imagemUrl}
                      alt={item.produto.nome}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.produto.nome}</h3>
                    <p className="text-sm text-gray-500">
                      {item.quantidade}x {formatCurrency(item.precoUnitario)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sua avaliação *
                    </label>
                    {renderStars(item.produto.id, avaliacao.nota)}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comentário (opcional)
                    </label>
                    <textarea
                      value={avaliacao.comentario}
                      onChange={(e) => handleComentarioChange(item.produto.id, e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Conte-nos sobre sua experiência com este produto..."
                    />
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || Object.values(avaliacoes).every(a => a.nota === 0)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Enviar Avaliações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
