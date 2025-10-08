
import React, { useEffect, useState } from 'react';
import { avaliacoesApi, Avaliacao } from '../services/backendApi';
import { Star, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AvaliacoesProdutoProps {
  produtoId: string;
}

export const AvaliacoesProduto: React.FC<AvaliacoesProdutoProps> = ({ produtoId }) => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvaliacoes = async () => {
      try {
        setLoading(true);
        const data = await avaliacoesApi.listarPorProduto(produtoId);
        setAvaliacoes(data);
      } catch (error) {
        console.error('Erro ao carregar avaliações:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvaliacoes();
  }, [produtoId]);

  const renderStars = (nota: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= nota ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const mediaAvaliacoes = avaliacoes.length > 0
    ? avaliacoes.reduce((acc, av) => acc + av.nota, 0) / avaliacoes.length
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {avaliacoes.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {mediaAvaliacoes.toFixed(1)}
              </div>
              <div className="flex items-center justify-center mt-2">
                {renderStars(Math.round(mediaAvaliacoes))}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {avaliacoes.length} {avaliacoes.length === 1 ? 'avaliação' : 'avaliações'}
              </p>
            </div>
          </div>
        </div>
      )}

      {avaliacoes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {avaliacoes.map(avaliacao => (
            <div key={avaliacao.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {avaliacao.usuario?.nome || 'Usuário'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(avaliacao.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    {renderStars(avaliacao.nota)}
                  </div>
                  {avaliacao.comentario && (
                    <p className="text-sm text-gray-700">{avaliacao.comentario}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
