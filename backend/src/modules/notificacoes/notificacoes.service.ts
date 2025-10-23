import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class NotificacoesService {
  private readonly logger = new Logger(NotificacoesService.name);

  constructor(private prisma: PrismaService) {}

  async enviarNotificacaoPedido(pedidoId: string, tipo: string, mensagem: string) {
    try {
      // Implementação básica para notificações de pedido
      this.logger.log(`Notificação enviada para pedido ${pedidoId}: ${mensagem}`);
      
      // Aqui você pode implementar a lógica de notificação
      // Por exemplo: salvar no banco, enviar push notification, etc.
      
      return { success: true, message: 'Notificação enviada com sucesso' };
    } catch (error) {
      this.logger.error(`Erro ao enviar notificação: ${error.message}`);
      throw error;
    }
  }

  async criarNotificacao(usuarioId: string, titulo: string, mensagem: string, tipo: string = 'SISTEMA', empresaId?: string) {
    try {
      const notificacao = await this.prisma.notificacao.create({
        data: {
          titulo,
          mensagem,
          tipo,
          usuario: {
            connect: { id: usuarioId }
          },
          lida: false,
        },
      });

      return notificacao;
    } catch (error) {
      this.logger.error(`Erro ao criar notificação: ${error.message}`);
      throw error;
    }
  }

  async findAll(usuarioId: string, page?: number, limit?: number, tipo?: string, lida?: boolean) {
    try {
      const where: any = {
        usuarioId,
      };

      if (tipo) {
        where.tipo = tipo;
      }

      if (lida !== undefined) {
        where.lida = lida;
      }

      const skip = page && limit ? (page - 1) * limit : undefined;
      const take = limit;

      return await this.prisma.notificacao.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      });
    } catch (error) {
      this.logger.error(`Erro ao buscar notificações: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: string, usuarioId: string) {
    try {
      return await this.prisma.notificacao.findFirst({
        where: {
          id,
          usuarioId,
        },
      });
    } catch (error) {
      this.logger.error(`Erro ao buscar notificação: ${error.message}`);
      throw error;
    }
  }

  async marcarComoLida(id: string, usuarioId: string) {
    try {
      return await this.prisma.notificacao.update({
        where: {
          id,
        },
        data: {
          lida: true,
        },
      });
    } catch (error) {
      this.logger.error(`Erro ao marcar notificação como lida: ${error.message}`);
      throw error;
    }
  }

  async marcarTodasComoLidas(usuarioId: string) {
    try {
      return await this.prisma.notificacao.updateMany({
        where: {
          usuarioId,
          lida: false,
        },
        data: {
          lida: true,
        },
      });
    } catch (error) {
      this.logger.error(`Erro ao marcar todas as notificações como lidas: ${error.message}`);
      throw error;
    }
  }

  async remove(id: string, usuarioId: string) {
    try {
      return await this.prisma.notificacao.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      this.logger.error(`Erro ao remover notificação: ${error.message}`);
      throw error;
    }
  }

  async create(createNotificacaoDto: any) {
    try {
      return await this.prisma.notificacao.create({
        data: {
          titulo: createNotificacaoDto.titulo,
          mensagem: createNotificacaoDto.mensagem,
          tipo: createNotificacaoDto.tipo || 'SISTEMA',
          usuario: {
            connect: { id: createNotificacaoDto.usuarioId }
          },
          lida: false,
        },
      });
    } catch (error) {
      this.logger.error(`Erro ao criar notificação: ${error.message}`);
      throw error;
    }
  }

  async countNaoLidas(usuarioId: string) {
    try {
      return await this.prisma.notificacao.count({
        where: {
          usuarioId,
          lida: false,
        },
      });
    } catch (error) {
      this.logger.error(`Erro ao contar notificações não lidas: ${error.message}`);
      throw error;
    }
  }

  async update(id: string, updateNotificacaoDto: any, usuarioId: string) {
    try {
      return await this.prisma.notificacao.update({
        where: {
          id,
          usuarioId,
        },
        data: updateNotificacaoDto,
      });
    } catch (error) {
      this.logger.error(`Erro ao atualizar notificação: ${error.message}`);
      throw error;
    }
  }
}