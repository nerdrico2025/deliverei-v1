
import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Copy, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '../ui/feedback/ToastContext';

interface PagamentoPixProps {
  qrCode: string;
  copiaECola: string;
  expiraEm?: string;
  onPagamentoConfirmado?: () => void;
}

export const PagamentoPix: React.FC<PagamentoPixProps> = ({
  qrCode,
  copiaECola,
  expiraEm,
  onPagamentoConfirmado,
}) => {
  const [copiado, setCopiado] = useState(false);
  const [tempoRestante, setTempoRestante] = useState<string>('');
  const { push } = useToast();

  useEffect(() => {
    if (!expiraEm) return;

    const interval = setInterval(() => {
      const agora = new Date().getTime();
      const expiracao = new Date(expiraEm).getTime();
      const diferenca = expiracao - agora;

      if (diferenca <= 0) {
        setTempoRestante('Expirado');
        clearInterval(interval);
        return;
      }

      const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((diferenca % (1000 * 60)) / 1000);
      setTempoRestante(`${minutos}:${segundos.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiraEm]);

  // Polling para verificar pagamento (simulado - em produção usar webhook)
  useEffect(() => {
    if (!onPagamentoConfirmado) return;

    const interval = setInterval(() => {
      // TODO: Implementar verificação real do pagamento
      // onPagamentoConfirmado();
    }, 5000);

    return () => clearInterval(interval);
  }, [onPagamentoConfirmado]);

  const handleCopiar = () => {
    navigator.clipboard.writeText(copiaECola);
    setCopiado(true);
    push({ type: 'success', message: 'Código PIX copiado!' });
    setTimeout(() => setCopiado(false), 3000);
  };

  return (
    <div className="mb-8 p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pagamento via PIX</h3>
      
      <div className="flex flex-col items-center mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <QRCode value={qrCode} size={200} />
        </div>
        
        {expiraEm && tempoRestante && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Clock className="w-4 h-4" />
            <span>
              {tempoRestante === 'Expirado' ? (
                <span className="text-red-600 font-semibold">QR Code expirado</span>
              ) : (
                <>Expira em: <span className="font-semibold">{tempoRestante}</span></>
              )}
            </span>
          </div>
        )}

        <p className="text-sm text-gray-600 text-center mb-4">
          Escaneie o QR Code com o app do seu banco ou copie o código abaixo
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Código PIX (Copia e Cola)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={copiaECola}
              readOnly
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm"
            />
            <button
              onClick={handleCopiar}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                copiado
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {copiado ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copiar
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Instruções:</strong>
          </p>
          <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
            <li>Abra o app do seu banco</li>
            <li>Escolha a opção PIX</li>
            <li>Escaneie o QR Code ou cole o código</li>
            <li>Confirme o pagamento</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
