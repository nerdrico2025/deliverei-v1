
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getEstatisticas(empresaId: string) {
    try {
      console.log('getEstatisticas called for empresa:', empresaId);

      // Validate empresaId
      if (!empresaId) {
        throw new Error('empresaId is required');
      }

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

      const produtosDetalhes = await Promise.all(
        produtosMaisVendidos.map(async (item) => {
          const produto = await this.prisma.produto.findUnique({
            where: { id: item.produtoId },
            select: { id: true, nome: true, imagem: true, preco: true },
          });
          return {
            ...produto,
            quantidadeVendida: item._sum.quantidade,
          };
        }),
      );

      const result = {
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

      console.log('Returning statistics:', JSON.stringify(result, null, 2));

      return result;
    } catch (error) {
      console.error('Error in getEstatisticas:', error);
      throw error;
    }
  }

  async getGraficoVendas(
    empresaId: string, 
    periodo: 'dia' | 'semana' | 'mes' = 'dia',
    startDate?: Date,
    endDate?: Date,
  ) {
    try {
      console.log('getGraficoVendas called with:', { 
        empresaId, 
        periodo, 
        startDate, 
        endDate 
      });

      // Validate empresaId
      if (!empresaId) {
        throw new Error('empresaId is required');
      }

      const hoje = new Date();
      let dataInicio: Date;
      let dataFim: Date = hoje;
      let groupBy: string;

      // If custom date range is provided, use it
      if (startDate && endDate) {
        dataInicio = new Date(startDate);
        dataFim = new Date(endDate);
        groupBy = 'day';
      } else {
        // Default to last 7 days if no date range provided
        dataInicio = new Date(hoje);
        dataInicio.setDate(hoje.getDate() - 6); // Last 7 days (including today)
        dataInicio.setHours(0, 0, 0, 0);
        dataFim.setHours(23, 59, 59, 999);
        groupBy = 'day';
      }

      console.log('Date range for query:', { 
        dataInicio: dataInicio.toISOString(), 
        dataFim: dataFim.toISOString() 
      });

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

      console.log(`Found ${pedidos.length} orders for empresa ${empresaId}`);

      // Create a map with all dates in the range initialized to 0
      const vendas: { [key: string]: number } = {};
      
      if (groupBy === 'day') {
        const currentDate = new Date(dataInicio);
        while (currentDate <= dataFim) {
          const key = currentDate.toISOString().split('T')[0];
          vendas[key] = 0;
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      // Fill in actual sales data
      pedidos.forEach((pedido) => {
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

        if (!vendas[chave]) {
          vendas[chave] = 0;
        }
        vendas[chave] += Number(pedido.total);
      });

      const result = Object.entries(vendas)
        .map(([data, total]) => ({
          data,
          total: Number(total.toFixed(2)),
        }))
        .sort((a, b) => a.data.localeCompare(b.data));

      console.log('Returning sales data:', result);

      return result;
    } catch (error) {
      console.error('Error in getGraficoVendas:', error);
      throw error;
    }
  }

  async getProdutosPopulares(empresaId: string, limit: number = 10) {
    try {
      console.log('getProdutosPopulares called for empresa:', empresaId, 'limit:', limit);

      // Validate empresaId
      if (!empresaId) {
        throw new Error('empresaId is required');
      }

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

      const produtosDetalhes = await Promise.all(
        produtosMaisVendidos.map(async (item) => {
          const produto = await this.prisma.produto.findUnique({
            where: { id: item.produtoId },
            select: { 
              id: true, 
              nome: true, 
              imagem: true, 
              preco: true,
              categoria: true,
            },
          });
          return {
            ...produto,
            quantidadeVendida: item._sum.quantidade,
            totalVendido: Number(item._sum.subtotal || 0),
          };
        }),
      );

      console.log(`Returning ${produtosDetalhes.length} popular products`);

      return produtosDetalhes;
    } catch (error) {
      console.error('Error in getProdutosPopulares:', error);
      throw error;
    }
  }
}
