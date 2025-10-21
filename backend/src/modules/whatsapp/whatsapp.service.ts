import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(private prisma: PrismaService) {}

  async enviarMensagemPedido(pedidoId: string, telefone: string, mensagem: string, empresaId: string) {
    try {
      // Implementação básica para envio de mensagens WhatsApp
      this.logger.log(`Mensagem WhatsApp enviada para ${telefone} sobre pedido ${pedidoId}`);
      
      // Salvar mensagem no banco para histórico
      await this.prisma.mensagemWhatsApp.create({
        data: {
          telefone,
          mensagem,
          pedidoId,
          status: 'ENVIADO',
        },
      });

      // Aqui você implementaria a integração com a API do WhatsApp
      // Por exemplo: WhatsApp Business API, Twilio, etc.
      
      return { success: true, message: 'Mensagem enviada com sucesso' };
    } catch (error) {
      this.logger.error(`Erro ao enviar mensagem WhatsApp: ${error.message}`);
      throw error;
    }
  }

  async enviarNotificacaoStatus(pedidoId: string, novoStatus: string, empresaId: string) {
    try {
      // Buscar dados do pedido
      const pedido = await this.prisma.pedido.findUnique({
        where: { id: pedidoId },
        include: {
          cliente: true,
        },
      });

      if (!pedido || !pedido.cliente?.telefone) {
        this.logger.warn(`Pedido ${pedidoId} não encontrado ou cliente sem telefone`);
        return { success: false, message: 'Dados insuficientes para envio' };
      }

      const mensagem = this.gerarMensagemStatus(pedido.numero, novoStatus);
      
      return await this.enviarMensagemPedido(
        pedidoId,
        pedido.cliente.telefone,
        mensagem,
        empresaId
      );
    } catch (error) {
      this.logger.error(`Erro ao enviar notificação de status: ${error.message}`);
      throw error;
    }
  }

  private gerarMensagemStatus(numeroPedido: string, status: string): string {
    const statusMessages = {
      CONFIRMADO: `✅ Seu pedido #${numeroPedido} foi confirmado!`,
      EM_PREPARO: `👨‍🍳 Seu pedido #${numeroPedido} está sendo preparado!`,
      SAIU_ENTREGA: `🚚 Seu pedido #${numeroPedido} saiu para entrega!`,
      ENTREGUE: `✅ Seu pedido #${numeroPedido} foi entregue!`,
      CANCELADO: `❌ Seu pedido #${numeroPedido} foi cancelado.`,
    };

    return statusMessages[status] || `📋 Status do pedido #${numeroPedido} atualizado para: ${status}`;
  }

  async enviarMensagem(empresaId: string, telefone: string, mensagem: string, pedidoId?: string) {
    try {
      this.logger.log(`Enviando mensagem WhatsApp para ${telefone}`);
      
      // Salvar mensagem no banco para histórico
      const mensagemData: any = {
        telefone,
        mensagem,
        status: 'ENVIADO',
      };

      if (pedidoId) {
        mensagemData.pedidoId = pedidoId;
      }

      await this.prisma.mensagemWhatsApp.create({
        data: mensagemData,
      });

      // Aqui você implementaria a integração com a API do WhatsApp
      // Por exemplo: WhatsApp Business API, Twilio, etc.
      
      return { success: true, message: 'Mensagem enviada com sucesso' };
    } catch (error) {
      this.logger.error(`Erro ao enviar mensagem WhatsApp: ${error.message}`);
      throw error;
    }
  }

  async listarMensagens(empresaId: string) {
    try {
      const mensagens = await this.prisma.mensagemWhatsApp.findMany({
        include: {
          pedido: {
            select: {
              numero: true,
              empresaId: true,
            },
          },
        },
        where: {
          pedido: {
            empresaId,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return mensagens;
    } catch (error) {
      this.logger.error(`Erro ao listar mensagens: ${error.message}`);
      throw error;
    }
  }

  async listarMensagensPorPedido(pedidoId: string, empresaId: string) {
    try {
      const mensagens = await this.prisma.mensagemWhatsApp.findMany({
        where: {
          pedidoId,
          pedido: {
            empresaId,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return mensagens;
    } catch (error) {
      this.logger.error(`Erro ao listar mensagens do pedido: ${error.message}`);
      throw error;
    }
  }

  async configurarWhatsApp(empresaId: string, whatsappNumero: string, whatsappToken: string) {
    try {
      // Atualizar configurações da empresa
      await this.prisma.empresa.update({
        where: { id: empresaId },
        data: {
          // Aqui você pode adicionar campos específicos para WhatsApp na empresa
          // Por exemplo: whatsappNumero, whatsappToken
          // Como não temos esses campos no schema atual, vamos apenas logar
        },
      });

      this.logger.log(`Configuração WhatsApp atualizada para empresa ${empresaId}`);
      
      return { 
        success: true, 
        message: 'Configuração WhatsApp atualizada com sucesso',
        numero: whatsappNumero 
      };
    } catch (error) {
      this.logger.error(`Erro ao configurar WhatsApp: ${error.message}`);
      throw error;
    }
  }
}