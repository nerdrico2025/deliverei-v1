
import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateStatusPedidoDto } from './dto/update-status-pedido.dto';
import { FiltrarPedidosDto } from './dto/filtrar-pedidos.dto';
import { NotificacoesService } from '../notificacoes/notificacoes.service';
import { WhatsappService } from '../modules/whatsapp/whatsapp.service';
import { 
  validateEntityExists, 
  validateOwnershipOrAdmin,
  paginatedResponse,
  calculatePagination,
} from '../utils';

@Injectable()
export class PedidosService {
  private readonly logger = new Logger(PedidosService.name);

  constructor(
    private prisma: PrismaService,
    private notificacoesService: NotificacoesService,
    private whatsappService: WhatsappService,
  ) {}

  async findAll(filtros: FiltrarPedidosDto, empresaId: string) {
    const { status, dataInicio, dataFim, usuarioId, page = 1, limit = 10 } = filtros;

    const where: any = { empresaId };

    if (status) {
      where.status = status;
    }

    if (dataInicio || dataFim) {
      where.createdAt = {};
      if (dataInicio) {
        where.createdAt.gte = new Date(dataInicio);
      }
      if (dataFim) {
        where.createdAt.lte = new Date(dataFim);
      }
    }

    if (usuarioId) {
      where.clienteId = usuarioId;
    }

    const skip = (page - 1) * limit;

    const [pedidos, total] = await Promise.all([
      this.prisma.pedido.findMany({
        where,
        include: {
          cliente: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
          itens: {
            include: {
              produto: {
                select: {
                  id: true,
                  nome: true,
                  imagem: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.pedido.count({ where }),
    ]);

    return paginatedResponse(pedidos, calculatePagination(total, page, limit));
  }

  async findMeusPedidos(usuarioId: string, empresaId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [pedidos, total] = await Promise.all([
      this.prisma.pedido.findMany({
        where: { 
          clienteId: usuarioId,
          empresaId
        },
        include: {
          itens: {
            include: {
              produto: {
                select: {
                  id: true,
                  nome: true,
                  imagem: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.pedido.count({ 
        where: { 
          clienteId: usuarioId,
          empresaId
        } 
      }),
    ]);

    return paginatedResponse(pedidos, calculatePagination(total, page, limit));
  }

  async findOne(id: string, empresaId: string, usuarioId?: string) {
    const pedido = await this.prisma.pedido.findFirst({
      where: { id, empresaId },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        itens: {
          include: {
            produto: {
              select: {
                id: true,
                nome: true,
                imagem: true,
                preco: true,
              },
            },
          },
        },
      },
    });

    validateEntityExists(pedido, 'Pedido');

    // Se for cliente, verificar se é o dono do pedido
    if (usuarioId) {
      validateOwnershipOrAdmin(pedido.clienteId, usuarioId, false, 'pedido');
    }

    return pedido;
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateStatusPedidoDto,
    empresaId: string,
  ) {
    const pedido = await this.findOne(id, empresaId);

    // Usar transação para garantir consistência
    const pedidoAtualizado = await this.prisma.$transaction(async (tx) => {
      // Atualizar pedido
      const updated = await tx.pedido.update({
        where: { id },
        data: { status: updateStatusDto.status as any },
        include: {
          cliente: {
            select: {
              id: true,
              nome: true,
              email: true,
            },
          },
          itens: {
            include: {
              produto: {
                select: {
                  id: true,
                  nome: true,
                  imagem: true,
                },
              },
            },
          },
        },
      });

      // Criar notificação de mudança de status dentro da transação
      await this.notificacoesService.notificarMudancaStatus(
        pedido.id,
        pedido.clienteId,
        pedido.numero,
        updateStatusDto.status,
      );

      return updated;
    });

    // Enviar notificação via WhatsApp (fora da transação, não crítico)
    try {
      // Buscar telefone do cliente (assumindo que está no endereço ou em outro campo)
      // Por enquanto, vamos usar um telefone de exemplo
      const telefone = '5511999999999'; // TODO: Buscar telefone real do cliente
      await this.whatsappService.enviarNotificacaoPedido(
        empresaId,
        pedido.id,
        updateStatusDto.status,
        telefone,
      );
    } catch (error) {
      // Não falhar se o WhatsApp não estiver configurado
      this.logger.warn('Erro ao enviar WhatsApp', error.message);
    }

    return pedidoAtualizado;
  }

  async cancel(id: string, empresaId: string, usuarioId: string, isAdmin: boolean) {
    const pedido = await this.findOne(id, empresaId);

    // Validar permissão de acesso
    validateOwnershipOrAdmin(pedido.clienteId, usuarioId, isAdmin, 'pedido');

    // Verificar se o pedido pode ser cancelado
    if (['ENTREGUE', 'CANCELADO'].includes(pedido.status)) {
      throw new ForbiddenException('Este pedido não pode ser cancelado');
    }

    // Usar transação para garantir consistência
    const pedidoCancelado = await this.prisma.$transaction(async (tx) => {
      // Cancelar pedido
      const cancelado = await tx.pedido.update({
        where: { id },
        data: { status: 'CANCELADO' },
      });

      // Criar notificação de cancelamento dentro da transação
      await this.notificacoesService.notificarMudancaStatus(
        pedido.id,
        pedido.clienteId,
        pedido.numero,
        'CANCELADO',
      );

      // Opcional: Restaurar estoque dos produtos (otimização: updates em paralelo)
      const itens = await tx.itemPedido.findMany({
        where: { pedidoId: id },
        select: { produtoId: true, quantidade: true },
      });

      await Promise.all(
        itens.map((item) =>
          tx.produto.update({
            where: { id: item.produtoId },
            data: {
              estoque: {
                increment: item.quantidade,
              },
            },
          }),
        ),
      );

      return cancelado;
    });

    return pedidoCancelado;
  }
}
