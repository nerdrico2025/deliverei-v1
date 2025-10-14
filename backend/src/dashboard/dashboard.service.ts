
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private prisma: PrismaService) {}

  async getEstatisticas(empresaId: string) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());

    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    // Pedidos de hoje
    const pedidosHoje = await this.prisma.pedido.count({
      where: {
        empresaId,
        createdAt: { gte: hoje },
      },
    });

    // Pedidos da semana
    const pedidosSemana = await this.prisma.pedido.count({
      where: {
        empresaId,
        createdAt: { gte: inicioSemana },
      },
    });

    // Pedidos do mês
    const pedidosMes = await this.prisma.pedido.count({
      where: {
        empresaId,
        createdAt: { gte: inicioMes },
      },
    });

    // Vendas de hoje
    const vendasHoje = await this.prisma.pedido.aggregate({
      where: {
        empresaId,
        createdAt: { gte: hoje },
        status: { notIn: ['CANCELADO'] },
      },
      _sum: { total: true },
    });

    // Vendas da semana
    const vendasSemana = await this.prisma.pedido.aggregate({
      where: {
        empresaId,
        createdAt: { gte: inicioSemana },
        status: { notIn: ['CANCELADO'] },
      },
      _sum: { total: true },
    });

    // Vendas do mês
    const vendasMes = await this.prisma.pedido.aggregate({
      where: {
        empresaId,
        createdAt: { gte: inicioMes },
        status: { notIn: ['CANCELADO'] },
      },
      _sum: { total: true },
    });

    // Ticket médio
    const ticketMedio = pedidosMes > 0 
      ? Number(vendasMes._sum.total || 0) / pedidosMes 
      : 0;

    // Pedidos por status
    const pedidosPorStatus = await this.prisma.pedido.groupBy({
      by: ['status'],
      where: { empresaId },
      _count: true,
    });

    // Produtos mais vendidos
    const produtosMaisVendidos = await this.prisma.itemPedido.groupBy({
      by: ['produtoId'],
      where: {
        pedido: {
          empresaId,
          status: { notIn: ['CANCELADO'] },
        },
      },
      _sum: { quantidade: true },
      orderBy: { _sum: { quantidade: 'desc' } },
      take: 10,
    });

    // Buscar todos os produtos de uma vez (otimização N+1)
    const produtoIds = produtosMaisVendidos.map((item) => item.produtoId);
    const produtos = await this.prisma.produto.findMany({
      where: { 
        id: { in: produtoIds },
        empresaId 
      },
      select: { id: true, nome: true, imagem: true, preco: true },
    });

    // Criar mapa para lookup rápido
    const produtosMap = new Map(produtos.map(p => [p.id, p]));

    const produtosDetalhes = produtosMaisVendidos.map((item) => {
      const produto = produtosMap.get(item.produtoId);
      return {
        ...produto,
        quantidadeVendida: item._sum.quantidade,
      };
    }).filter(p => p.id); // Filtrar produtos não encontrados

    return {
      pedidos: {
        hoje: pedidosHoje,
        semana: pedidosSemana,
        mes: pedidosMes,
      },
      vendas: {
        hoje: Number(vendasHoje._sum.total || 0),
        semana: Number(vendasSemana._sum.total || 0),
        mes: Number(vendasMes._sum.total || 0),
      },
      ticketMedio: Number(ticketMedio.toFixed(2)),
      pedidosPorStatus: pedidosPorStatus.map((item) => ({
        status: item.status,
        quantidade: item._count,
      })),
      produtosMaisVendidos: produtosDetalhes,
    };
  }

  async getGraficoVendas(
    empresaId: string, 
    periodo: 'dia' | 'semana' | 'mes' = 'dia',
    startDate?: Date,
    endDate?: Date,
  ) {
    try {
      const hoje = new Date();
      let dataInicio: Date;
      let dataFim: Date = hoje;
      let groupBy: string;

      // If custom date range is provided, use it
      if (startDate && endDate) {
        dataInicio = new Date(startDate);
        dataFim = new Date(endDate);
        groupBy = 'day';
      } else if (periodo === 'dia') {
        dataInicio = new Date(hoje);
        dataInicio.setDate(hoje.getDate() - 30);
        groupBy = 'day';
      } else if (periodo === 'semana') {
        dataInicio = new Date(hoje);
        dataInicio.setDate(hoje.getDate() - 90);
        groupBy = 'week';
      } else {
        dataInicio = new Date(hoje);
        dataInicio.setMonth(hoje.getMonth() - 12);
        groupBy = 'month';
      }

      const pedidos = await this.prisma.pedido.findMany({
        where: {
          empresaId,
          createdAt: { 
            gte: dataInicio,
            lte: dataFim,
          },
          status: { notIn: ['CANCELADO'] },
        },
        select: {
          createdAt: true,
          total: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      const vendas = pedidos.reduce((acc, pedido) => {
        try {
          let chave: string;
          const data = new Date(pedido.createdAt);

          if (groupBy === 'day') {
            chave = data.toISOString().split('T')[0];
          } else if (groupBy === 'week') {
            const inicioSemana = new Date(data);
            inicioSemana.setDate(data.getDate() - data.getDay());
            chave = inicioSemana.toISOString().split('T')[0];
          } else {
            chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
          }

          if (!acc[chave]) {
            acc[chave] = 0;
          }
          
          const total = Number(pedido.total);
          if (!isNaN(total) && isFinite(total)) {
            acc[chave] += total;
          }

          return acc;
        } catch (itemError) {
          this.logger.error(`Erro processando pedido: ${pedido?.createdAt}`, itemError);
          return acc;
        }
      }, {});

      return Object.entries(vendas).map(([data, total]) => ({
        data,
        total: Number(total),
      }));
    } catch (error) {
      this.logger.error('Erro em getGraficoVendas', error);
      throw new InternalServerErrorException('Erro ao buscar dados de vendas');
    }
  }

  async getProdutosPopulares(empresaId: string, limit: number = 10) {
    const produtosMaisVendidos = await this.prisma.itemPedido.groupBy({
      by: ['produtoId'],
      where: {
        pedido: {
          empresaId,
          status: { notIn: ['CANCELADO'] },
        },
      },
      _sum: { quantidade: true, subtotal: true },
      orderBy: { _sum: { quantidade: 'desc' } },
      take: limit,
    });

    // Buscar todos os produtos de uma vez (otimização N+1)
    const produtoIds = produtosMaisVendidos.map((item) => item.produtoId);
    const produtos = await this.prisma.produto.findMany({
      where: { 
        id: { in: produtoIds },
        empresaId 
      },
      select: { 
        id: true, 
        nome: true, 
        imagem: true, 
        preco: true,
        categoria: true,
      },
    });

    // Criar mapa para lookup rápido
    const produtosMap = new Map(produtos.map(p => [p.id, p]));

    const produtosDetalhes = produtosMaisVendidos.map((item) => {
      const produto = produtosMap.get(item.produtoId);
      return {
        ...produto,
        quantidadeVendida: item._sum.quantidade,
        totalVendido: Number(item._sum.subtotal || 0),
      };
    }).filter(p => p.id); // Filtrar produtos não encontrados

    return produtosDetalhes;
  }
}
