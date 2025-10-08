
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { whatsappApi, MensagemWhatsApp } from '../services/backendApi';
import { useToast } from '../ui/feedback/ToastContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const WhatsAppChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mensagens, setMensagens] = useState<MensagemWhatsApp[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { push } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchMensagens();
      // Polling para novas mensagens
      const interval = setInterval(fetchMensagens, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const fetchMensagens = async () => {
    try {
      setLoading(true);
      const { mensagens: data } = await whatsappApi.getMensagens({ limit: 50 });
      setMensagens(data);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMensagem.trim() || enviando) return;

    try {
      setEnviando(true);
      // TODO: Obter telefone do suporte/empresa
      const telefone = '+5511999999999';
      await whatsappApi.enviarMensagem({
        telefone,
        mensagem: novaMensagem,
      });
      setNovaMensagem('');
      fetchMensagens();
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      push({ type: 'error', message: error.response?.data?.message || 'Erro ao enviar mensagem' });
    } finally {
      setEnviando(false);
    }
  };

  const mensagensNaoLidas = mensagens.filter(m => m.tipo === 'RECEBIDA' && m.status !== 'LIDA').length;

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-all z-50"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6" />
            {mensagensNaoLidas > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {mensagensNaoLidas}
              </span>
            )}
          </div>
        )}
      </button>

      {/* Modal de Chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="bg-green-600 text-white p-4 rounded-t-lg">
            <h3 className="font-semibold">Chat WhatsApp</h3>
            <p className="text-sm text-green-100">Suporte Online</p>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {loading && mensagens.length === 0 ? (
              <div className="text-center text-gray-600">Carregando mensagens...</div>
            ) : mensagens.length === 0 ? (
              <div className="text-center text-gray-600">Nenhuma mensagem ainda</div>
            ) : (
              mensagens.map((mensagem) => (
                <div
                  key={mensagem.id}
                  className={`flex ${mensagem.tipo === 'ENVIADA' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      mensagem.tipo === 'ENVIADA'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm">{mensagem.mensagem}</p>
                    <p
                      className={`text-xs mt-1 ${
                        mensagem.tipo === 'ENVIADA' ? 'text-green-100' : 'text-gray-500'
                      }`}
                    >
                      {format(new Date(mensagem.criadoEm), 'HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleEnviar} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={enviando}
              />
              <button
                type="submit"
                disabled={enviando || !novaMensagem.trim()}
                className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
