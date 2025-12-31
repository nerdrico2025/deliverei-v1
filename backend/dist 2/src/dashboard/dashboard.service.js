"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DashboardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let DashboardService = DashboardService_1 = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DashboardService_1.name);
    }
    async getEstatisticas(empresaId) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const [pedidosHoje, pedidosSemana, pedidosMes, vendasHoje, vendasSemana, vendasMes, pedidosPorStatus,] = await Promise.all([
            this.prisma.pedido.count({
                where: {
                    empresaId,
                    createdAt: { gte: hoje },
                },
            }),
            this.prisma.pedido.count({
                where: {
                    empresaId,
                    createdAt: { gte: inicioSemana },
                },
            }),
            this.prisma.pedido.count({
                where: {
                    empresaId,
                    createdAt: { gte: inicioMes },
                },
            }),
            this.prisma.pedido.aggregate({
                where: {
                    empresaId,
                    createdAt: { gte: hoje },
                    status: { notIn: ['CANCELADO'] },
                },
                _sum: { total: true },
            }),
            this.prisma.pedido.aggregate({
                where: {
                    empresaId,
                    createdAt: { gte: inicioSemana },
                    status: { notIn: ['CANCELADO'] },
                },
                _sum: { total: true },
            }),
            this.prisma.pedido.aggregate({
                where: {
                    empresaId,
                    createdAt: { gte: inicioMes },
                    status: { notIn: ['CANCELADO'] },
                },
                _sum: { total: true },
            }),
            this.prisma.pedido.groupBy({
                by: ['status'],
                where: { empresaId },
                _count: true,
            }),
        ]);
        const ticketMedio = pedidosMes > 0
            ? Number(vendasMes._sum.total || 0) / pedidosMes
            : 0;
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
        const produtoIds = produtosMaisVendidos.map((item) => item.produtoId);
        const produtos = await this.prisma.produto.findMany({
            where: {
                id: { in: produtoIds },
                empresaId
            },
            select: { id: true, nome: true, imagem: true, preco: true },
        });
        const produtosMap = new Map(produtos.map(p => [p.id, p]));
        const produtosDetalhes = produtosMaisVendidos.map((item) => {
            const produto = produtosMap.get(item.produtoId);
            return {
                ...produto,
                quantidadeVendida: item._sum.quantidade,
            };
        }).filter(p => p.id);
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
    async getGraficoVendas(empresaId, periodo = 'dia', startDate, endDate) {
        try {
            const hoje = new Date();
            let dataInicio;
            let dataFim = hoje;
            let groupBy;
            if (startDate && endDate) {
                dataInicio = new Date(startDate);
                dataFim = new Date(endDate);
                groupBy = 'day';
            }
            else if (periodo === 'dia') {
                dataInicio = new Date(hoje);
                dataInicio.setDate(hoje.getDate() - 30);
                groupBy = 'day';
            }
            else if (periodo === 'semana') {
                dataInicio = new Date(hoje);
                dataInicio.setDate(hoje.getDate() - 90);
                groupBy = 'week';
            }
            else {
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
                    let chave;
                    const data = new Date(pedido.createdAt);
                    if (groupBy === 'day') {
                        chave = data.toISOString().split('T')[0];
                    }
                    else if (groupBy === 'week') {
                        const inicioSemana = new Date(data);
                        inicioSemana.setDate(data.getDate() - data.getDay());
                        chave = inicioSemana.toISOString().split('T')[0];
                    }
                    else {
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
                }
                catch (itemError) {
                    this.logger.error(`Erro processando pedido: ${pedido?.createdAt}`, itemError);
                    return acc;
                }
            }, {});
            return Object.entries(vendas).map(([data, total]) => ({
                data,
                total: Number(total),
            }));
        }
        catch (error) {
            this.logger.error('Erro em getGraficoVendas', error);
            throw new common_1.InternalServerErrorException('Erro ao buscar dados de vendas');
        }
    }
    async getProdutosPopulares(empresaId, limit = 10) {
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
        const produtosMap = new Map(produtos.map(p => [p.id, p]));
        const produtosDetalhes = produtosMaisVendidos.map((item) => {
            const produto = produtosMap.get(item.produtoId);
            return {
                ...produto,
                quantidadeVendida: item._sum.quantidade,
                totalVendido: Number(item._sum.subtotal || 0),
            };
        }).filter(p => p.id);
        return produtosDetalhes;
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = DashboardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map