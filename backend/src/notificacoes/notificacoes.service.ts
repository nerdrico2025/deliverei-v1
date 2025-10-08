
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateNotificacaoDto } from './dto/create-notificacao.dto';

@Injectable()
export class NotificacoesService {
  constructor(private prisma: PrismaService) {}

  async create(createNotificacaoDto: CreateNotificacaoDto) {
    return this.prisma.notificacao.create({
      data: createNotificacaoDto,
    });
  }

  async findByUsuario(usuarioId: string) {
    return this.prisma.notificacao.findMany({
      where: { usuarioId },
      include: {
        pedido: {
          select: {
            id: true,
            numero: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countNaoLidas(usuarioId: string) {
    const count = await this.prisma.notificacao.count({
      where: {
        usuarioId,
        lida: false,
      },
    });

    return { count };
  }

  async marcarComoLida(id: string, usuarioId: string) {
    const notificacao = await this.prisma.notificacao.findFirst({
      where: { id, usuarioId },
    });

    if (!notificacao) {
      throw new NotFoundException('Notificação não encontrada');
    }

    return this.prisma.notificacao.update({
      where: { id },
      data: { lida: true },
    });
  }

  async marcarTodasComoLidas(usuarioId: string) {
    return this.prisma.notificacao.updateMany({
      where: {
        usuarioId,
        lida: false,
      },
      data: { lida: true },
    });
  }

  async remove(id: string, usuarioId: string) {
    const notificacao = await this.prisma.notificacao.findFirst({
      where: { id, usuarioId },
    });

    if (!notificacao) {
      throw new NotFoundException('Notificação não encontrada');
    }

    return this.prisma.notificacao.delete({
      where: { id },
    });
  }

  // Métodos auxiliares para criar notificações automáticas
  async notificarNovoPedido(pedidoId: string, usuarioId: string, numeroPedido: string) {
    return this.create({
      titulo: 'Pedido Realizado',
      mensagem: `Seu pedido #${numeroPedido} foi realizado com sucesso!`,
      tipo: 'PEDIDO',
      usuarioId,
      pedidoId,
    });
  }

  async notificarMudancaStatus(
    pedidoId: string,
    usuarioId: string,
    numeroPedido: string,
    novoStatus: string,
  ) {
    const mensagens = {
      CONFIRMADO: `Seu pedido #${numeroPedido} foi confirmado!`,
      EM_PREPARO: `Seu pedido #${numeroPedido} está sendo preparado!`,
      SAIU_ENTREGA: `Seu pedido #${numeroPedido} saiu para entrega!`,
      ENTREGUE: `Seu pedido #${numeroPedido} foi entregue!`,
      CANCELADO: `Seu pedido #${numeroPedido} foi cancelado.`,
    };

    return this.create({
      titulo: 'Status do Pedido',
      mensagem: mensagens[novoStatus] || `Status do pedido #${numeroPedido} atualizado.`,
      tipo: 'PEDIDO',
      usuarioId,
      pedidoId,
    });
  }
}
