
import React, { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { useNotificacoes } from '../contexts/NotificacoesContext';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const NotificacoesDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notificacoes, naoLidas, marcarLida, marcarTodasLidas, deletarNotificacao } = useNotificacoes();

  const handleMarcarLida = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await marcarLida(id);
  };

  const handleDeletar = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deletarNotificacao(id);
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'PEDIDO':
        return 'bg-blue-100 text-blue-800';
      case 'PROMOCAO':
        return 'bg-green-100 text-green-800';
      case 'SISTEMA':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {naoLidas > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {naoLidas}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[600px] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Notificações
                {naoLidas > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({naoLidas} não {naoLidas === 1 ? 'lida' : 'lidas'})
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-2">
                {naoLidas > 0 && (
                  <button
                    onClick={marcarTodasLidas}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Marcar todas
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {notificacoes.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notificacoes.map(notificacao => (
                    <div
                      key={notificacao.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notificacao.lida ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${getTipoColor(
                                notificacao.tipo
                              )}`}
                            >
                              {notificacao.tipo}
                            </span>
                            {!notificacao.lida && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full" />
                            )}
                          </div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-1">
                            {notificacao.titulo}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {notificacao.mensagem}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(notificacao.createdAt), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {!notificacao.lida && (
                            <button
                              onClick={(e) => handleMarcarLida(notificacao.id, e)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Marcar como lida"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDeletar(notificacao.id, e)}
                            className="text-red-600 hover:text-red-800"
                            title="Deletar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
