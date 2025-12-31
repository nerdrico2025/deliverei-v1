import { PrismaService } from '../database/prisma.service';
export declare class DashboardService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getEstatisticas(empresaId: string): Promise<{
        pedidos: {
            hoje: number;
            semana: number;
            mes: number;
        };
        vendas: {
            hoje: number;
            semana: number;
            mes: number;
        };
        ticketMedio: number;
        pedidosPorStatus: {
            status: string;
            quantidade: number;
        }[];
        produtosMaisVendidos: {
            quantidadeVendida: number;
            id: string;
            nome: string;
            preco: number;
            imagem: string;
        }[];
    }>;
    getGraficoVendas(empresaId: string, periodo?: 'dia' | 'semana' | 'mes', startDate?: Date, endDate?: Date): Promise<{
        data: string;
        total: number;
    }[]>;
    getProdutosPopulares(empresaId: string, limit?: number): Promise<{
        quantidadeVendida: number;
        totalVendido: number;
        id: string;
        nome: string;
        preco: number;
        imagem: string;
        categoria: string;
    }[]>;
}
