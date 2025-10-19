import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateNotificacaoDto, UpdateNotificacaoDto } from './dto';
import { paginatedResponse, calculatePagination } from '../../utils';

@Injectable()
export class NotificacoesService {
  private readonly logger = new Logger(NotificacoesService.name);
  private readonly useMockData = process.env.USE_MOCK_NOTIFICACOES === 'true';

  // Dados mock para testes e desenvolvimento
  private mockNotificacoes = [
    {
      id: 'notif-1',
      titulo: 'Pedido Realizado',
      mensagem: 'Seu pedido #12345 foi realizado com sucesso!',
      tipo: 'PEDIDO',
      lida: false,
      usuarioId: 'user-1',
      empresaId: 'empresa-1',
      pedidoId: 'pedido-1',
      createdAt: new Date('2025-10-19T10:00:00'),
      updatedAt: new Date('2025-10-19T10:00:00'),
    },
    {
      id: 'notif-2',
      titulo: 'Status do Pedido',
      mensagem: 'Seu pedido #12345 está em preparo!',
      tipo: 'PEDIDO',
      lida: false,
      usuarioId: 'user-1',
      empresaId: 'empresa-1',
      pedidoId: 'pedido-1',
      createdAt: new Date('2025-10-19T10:30:00'),
      updatedAt: new Date('2025-10-19T10:30:00'),
    },
    {
      id: 'notif-3',
      titulo: 'Promoção Especial',
      mensagem: 'Pizza Margherita com 30% de desconto hoje!',
      tipo: 'PROMOCAO',
      lida: true,
      usuarioId: 'user-1',
      empresaId: 'empresa-1',
      pedidoId: null,
      createdAt: new Date('2025-10-18T15:00:00'),
      updatedAt: new Date('2025-10-18T16:00:00'),
    },
    {
      id: 'notif-4',
      titulo: 'Bem-vindo!',
      mensagem: 'Seja bem-vindo ao sistema de delivery!',
      tipo: 'SISTEMA',
      lida: true,
      usuarioId: 'user-1',
      empresaId: 'empresa-1',
      pedidoId: null,
      createdAt: new Date('2025-10-17T09:00:00'),
      updatedAt: new Date('2025-10-17T09:00:00'),
    },
    {
      id: 'notif-5',
      titulo: 'Status do Pedido',
      mensagem: 'Seu pedido #12345 saiu para entrega!',
      tipo: 'PEDIDO',
      lida: false,
      usuarioId: 'user-1',
      empresaId: 'empresa-1',
      pedidoId: 'pedido-1',
      createdAt: new Date('2025-10-19T11:00:00'),
      updatedAt: new Date('2025-10-19T11:00:00'),
    },
  ];

  constructor(private readonly prisma: PrismaService) {
    if (this.useMockData) {
      this.logger.warn(
        '⚠️  Usando dados MOCK para notificações (USE_MOCK_NOTIFICACOES=true)',
      );
    }
  }

  async create(createNotificacaoDto: CreateNotificacaoDto) {
    if (this.useMockData) {
      const newNotificacao = {
        id: `notif-${Date.now()}`,
        ...createNotificacaoDto,
        empresaId: createNotificacaoDto.empresaId || '',
        pedidoId: createNotificacaoDto.pedidoId || '',
        lida: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.mockNotificacoes.push(newNotificacao as any);
      this.logger.log(`[MOCK] Notificação criada: ${newNotificacao.id}`);
      return newNotificacao;
    }

    return this.prisma.notificacao.create({
      data: createNotificacaoDto,
    });
  }

  async findAll(
    usuarioId: string,
    page: number = 1,
    limit: number = 20,
    tipo?: string,
    lida?: boolean,
  ) {
    if (this.useMockData) {
      let filtered = this.mockNotificacoes.filter(
        (n) => n.usuarioId === usuarioId,
      );

      if (tipo) {
        filtered = filtered.filter((n) => n.tipo === tipo);
      }

      if (lida !== undefined) {
        filtered = filtered.filter((n) => n.lida === lida);
      }

      // Ordenar por data de criação (mais recente primeiro)
      filtered.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );

      const total = filtered.length;
      const skip = (page - 1) * limit;
      const paginatedData = filtered.slice(skip, skip + limit);

      this.logger.log(
        `[MOCK] Listando notificações do usuário ${usuarioId} (página ${page})`,
      );

      return paginatedResponse(paginatedData, calculatePagination(total, page, limit));
    }

    const where: any = { usuarioId };

    if (tipo) {
      where.tipo = tipo;
    }

    if (lida !== undefined) {
      where.lida = lida;
    }

    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.prisma.notificacao.findMany({
        where,
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
        skip,
        take: limit,
      }),
      this.prisma.notificacao.count({ where }),
    ]);

    return paginatedResponse(data, calculatePagination(total, page, limit));
  }

  async findOne(id: string, usuarioId: string) {
    if (this.useMockData) {
      const notificacao = this.mockNotificacoes.find(
        (n) => n.id === id && n.usuarioId === usuarioId,
      );

      if (!notificacao) {
        throw new NotFoundException('Notificação não encontrada');
      }

      this.logger.log(`[MOCK] Buscando notificação: ${id}`);
      return notificacao;
    }

    const notificacao = await this.prisma.notificacao.findFirst({
      where: { id, usuarioId },
      include: {
        pedido: {
          select: {
            id: true,
            numero: true,
            status: true,
          },
        },
      },
    });

    if (!notificacao) {
      throw new NotFoundException('Notificação não encontrada');
    }

    return notificacao;
  }

  async update(
    id: string,
    updateNotificacaoDto: UpdateNotificacaoDto,
    usuarioId: string,
  ) {
    if (this.useMockData) {
      const index = this.mockNotificacoes.findIndex(
        (n) => n.id === id && n.usuarioId === usuarioId,
      );

      if (index === -1) {
        throw new NotFoundException('Notificação não encontrada');
      }

      this.mockNotificacoes[index] = {
        ...this.mockNotificacoes[index],
        ...updateNotificacaoDto,
        updatedAt: new Date(),
      };

      this.logger.log(`[MOCK] Notificação atualizada: ${id}`);
      return this.mockNotificacoes[index];
    }

    const notificacao = await this.prisma.notificacao.findFirst({
      where: { id, usuarioId },
    });

    if (!notificacao) {
      throw new NotFoundException('Notificação não encontrada');
    }

    return this.prisma.notificacao.update({
      where: { id },
      data: updateNotificacaoDto,
    });
  }

  async marcarComoLida(id: string, usuarioId: string) {
    if (this.useMockData) {
      const index = this.mockNotificacoes.findIndex(
        (n) => n.id === id && n.usuarioId === usuarioId,
      );

      if (index === -1) {
        throw new NotFoundException('Notificação não encontrada');
      }

      this.mockNotificacoes[index].lida = true;
      this.mockNotificacoes[index].updatedAt = new Date();

      this.logger.log(`[MOCK] Notificação marcada como lida: ${id}`);
      return this.mockNotificacoes[index];
    }

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
    if (this.useMockData) {
      const userNotifications = this.mockNotificacoes.filter(
        (n) => n.usuarioId === usuarioId && !n.lida,
      );

      userNotifications.forEach((n) => {
        n.lida = true;
        n.updatedAt = new Date();
      });

      this.logger.log(
        `[MOCK] ${userNotifications.length} notificações marcadas como lidas para usuário ${usuarioId}`,
      );

      return { count: userNotifications.length };
    }

    const result = await this.prisma.notificacao.updateMany({
      where: {
        usuarioId,
        lida: false,
      },
      data: { lida: true },
    });

    return result;
  }

  async countNaoLidas(usuarioId: string) {
    if (this.useMockData) {
      const count = this.mockNotificacoes.filter(
        (n) => n.usuarioId === usuarioId && !n.lida,
      ).length;

      this.logger.log(
        `[MOCK] Contando notificações não lidas do usuário ${usuarioId}: ${count}`,
      );

      return { count };
    }

    const count = await this.prisma.notificacao.count({
      where: {
        usuarioId,
        lida: false,
      },
    });

    return { count };
  }

  async remove(id: string, usuarioId: string) {
    if (this.useMockData) {
      const index = this.mockNotificacoes.findIndex(
        (n) => n.id === id && n.usuarioId === usuarioId,
      );

      if (index === -1) {
        throw new NotFoundException('Notificação não encontrada');
      }

      const removed = this.mockNotificacoes.splice(index, 1)[0];
      this.logger.log(`[MOCK] Notificação deletada: ${id}`);
      return removed;
    }

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
  async notificarNovoPedido(
    pedidoId: string,
    usuarioId: string,
    empresaId: string,
    numeroPedido: string,
  ) {
    return this.create({
      titulo: 'Pedido Realizado',
      mensagem: `Seu pedido #${numeroPedido} foi realizado com sucesso!`,
      tipo: 'PEDIDO',
      usuarioId,
      empresaId,
      pedidoId,
    });
  }

  async notificarMudancaStatus(
    pedidoId: string,
    usuarioId: string,
    empresaId: string,
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
      mensagem:
        mensagens[novoStatus] ||
        `Status do pedido #${numeroPedido} atualizado.`,
      tipo: 'PEDIDO',
      usuarioId,
      empresaId,
      pedidoId,
    });
  }
}
