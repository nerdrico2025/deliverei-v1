
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateStatusPedidoDto } from './dto/update-status-pedido.dto';
import { FiltrarPedidosDto } from './dto/filtrar-pedidos.dto';

@Injectable()
export class PedidosService {
  private readonly logger = new Logger(PedidosService.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll(filtros: FiltrarPedidosDto, empresaId?: string) {
    this.logger.log('Buscando pedidos com filtros:', filtros);
    
    // Implementação básica sem paginação por enquanto
    const pedidos = await this.prisma.pedido.findMany({
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
      orderBy: {
         createdAt: 'desc',
       },
    });

    return {
      data: pedidos,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: pedidos.length,
        itemsPerPage: pedidos.length,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  async findMeusPedidos(userId: string, empresaId: string, page: number = 1, limit: number = 10) {
    this.logger.log(`Buscando pedidos do usuário ${userId}`);
    
    const skip = (page - 1) * limit;
    
    const [pedidos, total] = await Promise.all([
      this.prisma.pedido.findMany({
        where: {
          clienteId: userId,
        },
        include: {
          itens: {
            include: {
              produto: {
                select: {
                  id: true,
                  nome: true,
                  preco: true,
                  imagem: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.pedido.count({
        where: {
          clienteId: userId,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: pedidos,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string, empresaId?: string, userId?: string) {
    this.logger.log(`Buscando pedido com ID: ${id}`);
    
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
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
                preco: true,
                imagem: true,
              },
            },
          },
        },
      },
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido com ID ${id} não encontrado`);
    }

    return pedido;
  }

  async updateStatus(id: string, updateStatusDto: UpdateStatusPedidoDto, empresaId?: string) {
    this.logger.log(`Atualizando status do pedido ${id} para: ${updateStatusDto.status}`);
    
    const pedido = await this.findOne(id);
    
    const pedidoAtualizado = await this.prisma.pedido.update({
      where: { id },
      data: {
         status: updateStatusDto.status as any,
         observacoes: updateStatusDto.observacoes,
         updatedAt: new Date(),
       },
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

    this.logger.log(`Status do pedido ${id} atualizado com sucesso`);
    
    return pedidoAtualizado;
  }

  async cancel(id: string, empresaId: string, userId: string, isAdmin: boolean) {
    this.logger.log(`Cancelando pedido ${id}`);
    
    const pedido = await this.findOne(id, empresaId, isAdmin ? undefined : userId);
    
    if (pedido.status === 'CANCELADO') {
      throw new Error('Pedido já está cancelado');
    }
    
    if (pedido.status === 'ENTREGUE') {
      throw new Error('Não é possível cancelar um pedido já entregue');
    }
    
    const pedidoCancelado = await this.prisma.pedido.update({
      where: { id },
      data: {
        status: 'CANCELADO',
        observacoes: 'Pedido cancelado',
        updatedAt: new Date(),
      },
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

    this.logger.log(`Pedido ${id} cancelado com sucesso`);
    
    return pedidoCancelado;
  }
}
