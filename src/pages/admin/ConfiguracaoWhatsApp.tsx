
import React, { useState } from 'react';
import { whatsappApi } from '../../services/backendApi';
import { MessageCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../../ui/feedback/ToastContext';

export const ConfiguracaoWhatsApp: React.FC = () => {
  const [numeroWhatsApp, setNumeroWhatsApp] = useState('');
  const [tokenApi, setTokenApi] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [testando, setTestando] = useState(false);
  const [statusConexao, setStatusConexao] = useState<'idle' | 'success' | 'error'>('idle');
  const { push } = useToast();

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSalvando(true);
      await whatsappApi.configurar({
        numeroWhatsApp,
        tokenApi,
      });
      push({ type: 'success', message: 'Configuração salva com sucesso!' });
      setStatusConexao('success');
    } catch (error: any) {
      console.error('Erro ao salvar configuração:', error);
      push({ type: 'error', message: error.response?.data?.message || 'Erro ao salvar configuração' });
      setStatusConexao('error');
    } finally {
      setSalvando(false);
    }
  };

  const handleTestarConexao = async () => {
    if (!numeroWhatsApp || !tokenApi) {
      push({ type: 'warning', message: 'Preencha todos os campos antes de testar' });
      return;
    }

    try {
      setTestando(true);
      // Enviar mensagem de teste
      await whatsappApi.enviarMensagem({
        telefone: numeroWhatsApp,
        mensagem: 'Teste de conexão - Deliverei',
      });
      push({ type: 'success', message: 'Mensagem de teste enviada com sucesso!' });
      setStatusConexao('success');
    } catch (error: any) {
      console.error('Erro ao testar conexão:', error);
      push({ type: 'error', message: error.response?.data?.message || 'Erro ao testar conexão' });
      setStatusConexao('error');
    } finally {
      setTestando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuração WhatsApp</h1>
          <p className="text-gray-600">Configure a integração com WhatsApp Business API</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <MessageCircle className="w-8 h-8 text-green-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">WhatsApp Business API</h2>
              <p className="text-sm text-gray-600">Conecte sua conta do WhatsApp Business</p>
            </div>
          </div>

          {/* Status da Conexão */}
          {statusConexao !== 'idle' && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                statusConexao === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {statusConexao === 'success' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800">Conexão estabelecida com sucesso!</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800">Erro na conexão. Verifique suas credenciais.</span>
                </>
              )}
            </div>
          )}

          <form onSubmit={handleSalvar} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número do WhatsApp Business
              </label>
              <input
                type="text"
                value={numeroWhatsApp}
                onChange={(e) => setNumeroWhatsApp(e.target.value)}
                placeholder="+5511999999999"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Formato: +55 (código do país) + DDD + número
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token da API
              </label>
              <input
                type="password"
                value={tokenApi}
                onChange={(e) => setTokenApi(e.target.value)}
                placeholder="Digite o token da API"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Token fornecido pelo WhatsApp Business API
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={salvando}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {salvando ? 'Salvando...' : 'Salvar Configuração'}
              </button>
              <button
                type="button"
                onClick={handleTestarConexao}
                disabled={testando || !numeroWhatsApp || !tokenApi}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {testando ? 'Testando...' : 'Testar Conexão'}
              </button>
            </div>
          </form>
        </div>

        {/* Instruções */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Como obter o Token da API</h3>
          <ol className="space-y-2 text-sm text-blue-800 list-decimal list-inside">
            <li>Acesse o <a href="https://business.facebook.com/" target="_blank" rel="noopener noreferrer" className="underline">Facebook Business Manager</a></li>
            <li>Vá em "Configurações do WhatsApp Business"</li>
            <li>Selecione sua conta do WhatsApp Business</li>
            <li>Clique em "API" no menu lateral</li>
            <li>Copie o Token de Acesso Permanente</li>
            <li>Cole o token no campo acima</li>
          </ol>
          <p className="mt-4 text-sm text-blue-700">
            <strong>Importante:</strong> Certifique-se de que sua conta do WhatsApp Business está verificada e aprovada para uso da API.
          </p>
        </div>
      </div>
    </div>
  );
};
