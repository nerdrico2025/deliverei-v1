
import React, { useEffect, useState } from 'react';
import { avaliacoesApi, Avaliacao } from '../../services/backendApi';
import { Star, Trash2, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loading } from '../../components/common/Loading';

export const MinhasAvaliacoes: React.FC = () => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAvaliacoes = async () => {
    try {
      setLoading(true);
      const data = await avaliacoesApi.minhasAvaliacoes();
      setAvaliacoes(data);
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvaliacoes();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta avaliação?')) return;
    try {
      await avaliacoesApi.deletar(id);
      fetchAvaliacoes();
    } catch (error) {
      console.error('Erro ao deletar avaliação:', error);
    }
  };

  const renderStars = (nota: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= nota ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Minhas Avaliações</h1>
          <p className="text-gray-500 mt-1">Veja todas as avaliações que você fez</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loading size="md" />
          </div>
        ) : avaliacoes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Você ainda não fez nenhuma avaliação</p>
          </div>
        ) : (
          <div className="space-y-4">
            {avaliacoes.map(avaliacao => (
              <div key={avaliacao.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
                <div className="flex items-start gap-4">
                  {avaliacao.produto?.imagemUrl && (
                    <img
                      src={avaliacao.produto.imagemUrl}
                      alt={avaliacao.produto.nome}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {avaliacao.produto?.nome}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {format(new Date(avaliacao.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(avaliacao.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Deletar avaliação"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="mb-3">
                      {renderStars(avaliacao.nota)}
                    </div>

                    {avaliacao.comentario && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700">{avaliacao.comentario}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
