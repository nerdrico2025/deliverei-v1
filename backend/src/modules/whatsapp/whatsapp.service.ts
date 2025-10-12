
import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../database/prisma.service';
import { firstValueFrom } from 'rxjs';
import { TEMPLATES_MENSAGENS } from './templates/mensagens';

@Injectable()
export class WhatsappService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async enviarMensagem(
    empresaId: string,
    telefone: string,
    mensagem: string,
    pedidoId?: string,
  ) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id: empresaId },
    });

    if (!empresa) {
      throw new NotFoundException('Empresa não encontrada');
    }

    // Salvar mensagem no banco
    const mensagemDb = await this.prisma.mensagemWhatsApp.create({
      data: {
        empresaId,
        pedidoId,
        telefone,
        mensagem,
        tipo: 'NOTIFICACAO',
        direcao: 'ENVIADA',
        status: 'PENDENTE',
      },
    });

    try {
      // Enviar via WhatsApp Business API
      if (empresa.whatsappToken && empresa.whatsappNumero) {
        const response = await this.enviarViaApi(
          empresa.whatsappToken,
          empresa.whatsappNumero,
          telefone,
          mensagem,
        );

        await this.prisma.mensagemWhatsApp.update({
          where: { id: mensagemDb.id },
          data: {
            status: 'ENVIADA',
            whatsappId: response.messages?.[0]?.id,
          },
        });

        return { success: true, mensagemId: mensagemDb.id };
      } else {
        // WhatsApp não configurado
        await this.prisma.mensagemWhatsApp.update({
          where: { id: mensagemDb.id },
          data: {
            status: 'ERRO',
            erro: 'WhatsApp não configurado para esta empresa',
          },
        });

        return {
          success: false,
          error: 'WhatsApp não configurado',
          mensagemId: mensagemDb.id,
        };
      }
    } catch (error) {
      await this.prisma.mensagemWhatsApp.update({
        where: { id: mensagemDb.id },
        data: {
          status: 'ERRO',
          erro: error.message,
        },
      });

      throw error;
    }
  }

  async enviarNotificacaoPedido(
    empresaId: string,
    pedidoId: string,
    status: string,
    telefone: string,
  ) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: {
        empresa: true,
      },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado');
    }

    const template = TEMPLATES_MENSAGENS[status];
    if (!template) {
      return;
    }

    const mensagem = template
      .replace('{numero}', pedido.numero)
      .replace('{empresa}', pedido.empresa.nome);

    return this.enviarMensagem(empresaId, telefone, mensagem, pedidoId);
  }

  async listarMensagens(empresaId: string) {
    return this.prisma.mensagemWhatsApp.findMany({
      where: { empresaId },
      include: {
        pedido: {
          select: {
            numero: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async listarMensagensPorPedido(pedidoId: string, empresaId: string) {
    return this.prisma.mensagemWhatsApp.findMany({
      where: {
        pedidoId,
        empresaId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async configurarWhatsApp(
    empresaId: string,
    whatsappNumero: string,
    whatsappToken: string,
  ) {
    return this.prisma.empresa.update({
      where: { id: empresaId },
      data: {
        whatsappNumero,
        whatsappToken,
      },
    });
  }

  private async enviarViaApi(
    token: string,
    phoneNumberId: string,
    to: string,
    message: string,
  ) {
    const url = `${process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0'}/${phoneNumberId}/messages`;

    const response = await firstValueFrom(
      this.httpService.post(
        url,
        {
          messaging_product: 'whatsapp',
          to: to.replace(/\D/g, ''),
          type: 'text',
          text: { body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      ),
    );

    return response.data;
  }
}
