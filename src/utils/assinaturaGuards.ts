
import { Assinatura } from '../services/backendApi';

export const verificarAssinaturaAtiva = (assinatura: Assinatura | null): boolean => {
  if (!assinatura) return false;
  return assinatura.status === 'ATIVA' || assinatura.status === 'TRIAL';
};

export const verificarLimitePedidos = (assinatura: Assinatura | null): boolean => {
  if (!assinatura) return false;
  if (assinatura.plano.limitePedidos === -1) return true; // Ilimitado
  return assinatura.usoPedidos < assinatura.plano.limitePedidos;
};

export const verificarLimiteProdutos = (assinatura: Assinatura | null): boolean => {
  if (!assinatura) return false;
  if (assinatura.plano.limiteProdutos === -1) return true; // Ilimitado
  return assinatura.usoProdutos < assinatura.plano.limiteProdutos;
};

export const getMensagemLimite = (assinatura: Assinatura | null, tipo: 'pedidos' | 'produtos'): string => {
  if (!assinatura) return 'Assinatura não encontrada';
  
  if (tipo === 'pedidos') {
    if (assinatura.plano.limitePedidos === -1) return 'Pedidos ilimitados';
    const restante = assinatura.plano.limitePedidos - assinatura.usoPedidos;
    return `${restante} pedidos restantes de ${assinatura.plano.limitePedidos}`;
  } else {
    if (assinatura.plano.limiteProdutos === -1) return 'Produtos ilimitados';
    const restante = assinatura.plano.limiteProdutos - assinatura.usoProdutos;
    return `${restante} produtos restantes de ${assinatura.plano.limiteProdutos}`;
  }
};
